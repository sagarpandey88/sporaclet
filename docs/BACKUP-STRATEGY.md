# Backup and Recovery Strategy - Sporaclet

## Overview

This document outlines the backup and recovery procedures for the Sporaclet Sports Prediction Portal, ensuring data integrity and business continuity.

## Backup Components

### 1. PostgreSQL Database
- **What**: All application data including events, predictions, teams, players, injuries
- **Frequency**: Daily automated backups + continuous WAL archiving
- **Retention**: 30 days of daily backups, 12 months of weekly backups
- **Recovery Time Objective (RTO)**: < 1 hour
- **Recovery Point Objective (RPO)**: < 5 minutes

### 2. Redis Cache
- **What**: Cache data and session information
- **Frequency**: RDB snapshots every 15 minutes if changes exist
- **Retention**: 7 days
- **Note**: Can be rebuilt from database if lost

### 3. Application Code
- **What**: Source code and configuration
- **Frequency**: Version controlled in Git
- **Retention**: Indefinite
- **Note**: Not backed up separately - use Git repository

### 4. Environment Configuration
- **What**: `.env` files and secrets
- **Frequency**: Manual backup after changes
- **Retention**: Securely stored in password manager
- **Note**: Never commit to version control

## PostgreSQL Backup Strategy

### Automated Daily Backups

#### 1. Create Backup Script

```bash
#!/bin/bash
# /usr/local/bin/backup-sporaclet-db.sh

set -e

# Configuration
BACKUP_DIR="/var/backups/sporaclet"
LOG_FILE="/var/log/sporaclet-backup.log"
RETENTION_DAYS=30
DB_NAME="sporaclet_prod"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/sporaclet_$TIMESTAMP.sql.gz"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Log start
echo "[$(date)] Starting backup..." >> $LOG_FILE

# Perform backup with pg_dump
if pg_dump $DB_NAME | gzip > $BACKUP_FILE; then
    echo "[$(date)] Backup completed: $BACKUP_FILE" >> $LOG_FILE
    
    # Calculate size
    SIZE=$(du -h $BACKUP_FILE | cut -f1)
    echo "[$(date)] Backup size: $SIZE" >> $LOG_FILE
    
    # Verify backup integrity
    if gunzip -t $BACKUP_FILE 2>/dev/null; then
        echo "[$(date)] Backup integrity verified" >> $LOG_FILE
    else
        echo "[$(date)] ERROR: Backup integrity check failed!" >> $LOG_FILE
        exit 1
    fi
else
    echo "[$(date)] ERROR: Backup failed!" >> $LOG_FILE
    exit 1
fi

# Clean up old backups
find $BACKUP_DIR -name "sporaclet_*.sql.gz" -mtime +$RETENTION_DAYS -delete
echo "[$(date)] Cleanup completed" >> $LOG_FILE

# Optional: Upload to S3 or remote storage
# aws s3 cp $BACKUP_FILE s3://your-bucket/backups/

echo "[$(date)] Backup process completed successfully" >> $LOG_FILE
```

#### 2. Make Script Executable

```bash
chmod +x /usr/local/bin/backup-sporaclet-db.sh
```

#### 3. Schedule with Cron

```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /usr/local/bin/backup-sporaclet-db.sh

# Add weekly backup on Sunday at 3 AM (kept for 1 year)
0 3 * * 0 /usr/local/bin/backup-sporaclet-db.sh && cp /var/backups/sporaclet/sporaclet_$(date +\%Y\%m\%d_\%H\%M\%S).sql.gz /var/backups/sporaclet/weekly/
```

### Continuous WAL Archiving (Point-in-Time Recovery)

#### 1. Configure PostgreSQL

Edit `/etc/postgresql/14/main/postgresql.conf`:

```
# WAL Configuration
wal_level = replica
archive_mode = on
archive_command = 'cp %p /var/backups/sporaclet/wal/%f'
archive_timeout = 300  # Force archive every 5 minutes

# Replication settings (for future read replicas)
max_wal_senders = 3
wal_keep_size = 1GB
```

#### 2. Create WAL Archive Directory

```bash
mkdir -p /var/backups/sporaclet/wal
chown postgres:postgres /var/backups/sporaclet/wal
chmod 700 /var/backups/sporaclet/wal
```

#### 3. Restart PostgreSQL

```bash
systemctl restart postgresql
```

### Incremental Backups with pgBackRest (Advanced)

For larger databases, consider pgBackRest:

```bash
# Install
sudo apt-get install pgbackrest

# Configure /etc/pgbackrest.conf
[global]
repo1-path=/var/lib/pgbackrest
repo1-retention-full=30
repo1-retention-diff=7

[sporaclet]
pg1-path=/var/lib/postgresql/14/main
pg1-port=5432

# Full backup
pgbackrest --stanza=sporaclet --type=full backup

# Differential backup (daily)
pgbackrest --stanza=sporaclet --type=diff backup
```

## Redis Backup Strategy

### Configure Redis Persistence

Edit `/etc/redis/redis.conf`:

```
# RDB Snapshots
save 900 1      # After 900 sec if at least 1 key changed
save 300 10     # After 300 sec if at least 10 keys changed
save 60 10000   # After 60 sec if at least 10000 keys changed

# File location
dir /var/lib/redis
dbfilename dump.rdb

# AOF (Append Only File) - optional for durability
appendonly yes
appendfilename "appendonly.aof"
appendfsync everysec
```

### Automated Redis Backup

```bash
#!/bin/bash
# /usr/local/bin/backup-redis.sh

BACKUP_DIR="/var/backups/sporaclet/redis"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Trigger BGSAVE
redis-cli BGSAVE

# Wait for save to complete
while [ $(redis-cli LASTSAVE) -eq $(redis-cli LASTSAVE) ]; do
    sleep 1
done

# Copy RDB file
cp /var/lib/redis/dump.rdb $BACKUP_DIR/redis_$TIMESTAMP.rdb

# Retention: 7 days
find $BACKUP_DIR -name "redis_*.rdb" -mtime +7 -delete
```

Schedule with cron:

```bash
# Daily at 3 AM
0 3 * * * /usr/local/bin/backup-redis.sh
```

## Backup Verification

### Automated Integrity Checks

```bash
#!/bin/bash
# /usr/local/bin/verify-backup.sh

BACKUP_FILE=$1

echo "Verifying backup: $BACKUP_FILE"

# Check if file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo "ERROR: Backup file not found"
    exit 1
fi

# Check compression integrity
if ! gunzip -t $BACKUP_FILE 2>/dev/null; then
    echo "ERROR: Backup file is corrupted"
    exit 1
fi

# Test restore to temporary database
TEMP_DB="sporaclet_verify_$(date +%s)"

createdb $TEMP_DB
if gunzip -c $BACKUP_FILE | psql $TEMP_DB > /dev/null 2>&1; then
    echo "SUCCESS: Backup is valid and restorable"
    dropdb $TEMP_DB
    exit 0
else
    echo "ERROR: Backup restore failed"
    dropdb $TEMP_DB 2>/dev/null
    exit 1
fi
```

### Monthly Restore Tests

Schedule a monthly test restore to ensure backups are functional:

```bash
# First Sunday of each month at 4 AM
0 4 1-7 * 0 /usr/local/bin/verify-backup.sh /var/backups/sporaclet/sporaclet_*.sql.gz | tail -1
```

## Recovery Procedures

### Full Database Restore

#### From Daily Backup

```bash
# Stop application servers
pm2 stop all
# or
systemctl stop sporaclet-api sporaclet-worker sporaclet-client

# Drop existing database (careful!)
dropdb sporaclet_prod

# Create new database
createdb sporaclet_prod

# Restore from backup
gunzip -c /var/backups/sporaclet/sporaclet_YYYYMMDD_HHMMSS.sql.gz | psql sporaclet_prod

# Verify restoration
psql sporaclet_prod -c "SELECT COUNT(*) FROM events;"

# Restart applications
pm2 start all
# or
systemctl start sporaclet-api sporaclet-worker sporaclet-client
```

#### Point-in-Time Recovery (PITR)

```bash
# Stop PostgreSQL
systemctl stop postgresql

# Restore base backup
tar -xzf /var/backups/sporaclet/base_backup.tar.gz -C /var/lib/postgresql/14/main/

# Create recovery.conf
cat > /var/lib/postgresql/14/main/recovery.conf << EOF
restore_command = 'cp /var/backups/sporaclet/wal/%f %p'
recovery_target_time = '2025-11-04 14:30:00'  # Restore to this point
EOF

# Start PostgreSQL (will enter recovery mode)
systemctl start postgresql

# Monitor recovery
tail -f /var/log/postgresql/postgresql-14-main.log

# Once recovery completes, verify data
psql sporaclet_prod -c "SELECT NOW(), COUNT(*) FROM events;"
```

### Partial Data Recovery

#### Recover Specific Tables

```bash
# Extract specific table from backup
pg_restore -t events /var/backups/sporaclet/sporaclet_YYYYMMDD_HHMMSS.sql.gz

# Or with pg_dump format
gunzip -c backup.sql.gz | grep -A 10000 "CREATE TABLE events" | psql sporaclet_prod
```

#### Recover Deleted Records

If accidentally deleted and WAL archiving is enabled:

```bash
# Use PITR to restore to just before deletion
# Follow PITR steps above with appropriate recovery_target_time
```

### Redis Recovery

```bash
# Stop Redis
systemctl stop redis

# Restore RDB file
cp /var/backups/sporaclet/redis/redis_YYYYMMDD_HHMMSS.rdb /var/lib/redis/dump.rdb
chown redis:redis /var/lib/redis/dump.rdb

# Start Redis (will load from dump.rdb)
systemctl start redis

# Verify
redis-cli DBSIZE
```

## Off-Site Backup Storage

### AWS S3 Integration

```bash
# Install AWS CLI
sudo apt-get install awscli

# Configure AWS credentials
aws configure

# Modify backup script to upload to S3
#!/bin/bash
# Add to backup-sporaclet-db.sh

# Upload to S3
aws s3 cp $BACKUP_FILE s3://your-bucket/sporaclet-backups/$(basename $BACKUP_FILE) \
    --storage-class STANDARD_IA

# Upload WAL archives
aws s3 sync /var/backups/sporaclet/wal/ s3://your-bucket/sporaclet-wal/
```

### Alternative: Rsync to Remote Server

```bash
# Sync backups to remote server
rsync -avz --delete \
    /var/backups/sporaclet/ \
    user@remote-server:/backups/sporaclet/
```

## Disaster Recovery Plan

### Scenario 1: Database Corruption

1. Identify corruption extent
2. Stop all application services
3. Restore from most recent verified backup
4. Apply WAL archives if available (PITR)
5. Verify data integrity
6. Restart services

**Estimated Recovery Time**: 30-60 minutes

### Scenario 2: Complete Server Failure

1. Provision new server
2. Install all dependencies (PostgreSQL, Redis, Node.js)
3. Restore database from off-site backup
4. Restore Redis from backup (or rebuild cache)
5. Deploy application code from Git
6. Configure environment variables
7. Update DNS records
8. Test thoroughly before switching traffic

**Estimated Recovery Time**: 2-4 hours

### Scenario 3: Data Center Outage

1. Failover to backup region (if multi-region setup)
2. Or follow Scenario 2 steps in new data center
3. Restore from off-site backups
4. Update DNS to point to new location

**Estimated Recovery Time**: 4-8 hours

## Monitoring and Alerts

### Backup Monitoring

```bash
#!/bin/bash
# /usr/local/bin/check-backup-status.sh

LATEST_BACKUP=$(ls -t /var/backups/sporaclet/sporaclet_*.sql.gz | head -1)
BACKUP_AGE=$(( $(date +%s) - $(stat -c %Y $LATEST_BACKUP) ))
MAX_AGE=$((48 * 3600))  # 48 hours

if [ $BACKUP_AGE -gt $MAX_AGE ]; then
    echo "ALERT: Latest backup is older than 48 hours!"
    # Send alert (email, Slack, PagerDuty, etc.)
    curl -X POST https://hooks.slack.com/services/YOUR/WEBHOOK/URL \
        -H 'Content-Type: application/json' \
        -d "{\"text\": \"❌ Sporaclet backup is stale! Last backup: $(date -r $LATEST_BACKUP)\"}"
    exit 1
fi

echo "OK: Backup is current (age: $((BACKUP_AGE / 3600)) hours)"
```

### Health Checks

- Monitor backup job completion
- Check backup file sizes (detect anomalies)
- Verify backup integrity weekly
- Alert on failed backups
- Monitor disk space in backup directory

## Security Considerations

1. **Encryption at Rest**: Encrypt backup files
   ```bash
   # Encrypt backup
   gpg --encrypt --recipient admin@example.com backup.sql.gz
   ```

2. **Access Control**: Restrict backup file permissions
   ```bash
   chmod 600 /var/backups/sporaclet/*
   chown postgres:postgres /var/backups/sporaclet/*
   ```

3. **Secure Transfer**: Use encrypted channels (SSH, HTTPS) for remote backups

4. **Backup Testing**: Regular restore tests in isolated environment

5. **Audit Logging**: Log all backup and restore operations

## Compliance and Retention

- **Daily backups**: Retained for 30 days
- **Weekly backups**: Retained for 12 months
- **Off-site copies**: Maintained in different geographic location
- **Documentation**: Keep restore procedures up-to-date
- **Access logs**: Maintain audit trail of backup access

## Checklist

### Daily Tasks
- [ ] Verify backup completion
- [ ] Check backup file size
- [ ] Monitor disk space

### Weekly Tasks
- [ ] Verify backup integrity
- [ ] Review backup logs
- [ ] Check off-site sync status

### Monthly Tasks
- [ ] Perform test restore
- [ ] Review and update procedures
- [ ] Audit backup access logs

### Quarterly Tasks
- [ ] Full disaster recovery drill
- [ ] Review retention policies
- [ ] Update runbooks

## Contact Information

**Database Administrator**: [Your Name]  
**Email**: [admin@example.com]  
**Phone**: [Emergency Contact]  

**Backup Storage Location**: `/var/backups/sporaclet/`  
**Off-Site Storage**: `s3://your-bucket/sporaclet-backups/`

---

**Last Updated**: November 2025  
**Version**: 1.0.0  
**Next Review**: February 2026

