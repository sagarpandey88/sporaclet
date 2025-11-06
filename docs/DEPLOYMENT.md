# Deployment Guide - Sporaclet Sports Prediction Portal

## Prerequisites

- Node.js 18+ installed
- PostgreSQL 14+ database
- Redis 6+ server
- Domain with SSL certificate
- Server with at least 2GB RAM

## Environment Setup

### 1. Server Environment

```bash
cd server
cp .env.production.example .env.production
# Edit .env.production with your production values
```

Required environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`: Redis configuration
- `THESPORTSDB_API_KEY`: Sports data API key
- `OPENAI_API_KEY`: OpenAI API key for predictions
- `CLIENT_URL`: Frontend domain URL

### 2. Client Environment

```bash
cd client
cp .env.production.example .env.production
# Edit .env.production with your production values
```

Required environment variables:
- `NEXT_PUBLIC_API_URL`: Backend API URL
- `NEXT_PUBLIC_SITE_URL`: Frontend domain URL

## Database Setup

### 1. Create Production Database

```bash
createdb sporaclet_prod
```

### 2. Run Migrations

```bash
cd server
npx prisma migrate deploy
```

### 3. Seed Initial Data

```bash
npm run seed
```

## Build Process

### 1. Build Server

```bash
cd server
npm install --production=false
npm run build
```

### 2. Build Client

```bash
cd client
npm install --production=false
npm run build
```

## Deployment Options

### Option 1: Docker Deployment (Recommended)

```bash
# From project root
docker-compose -f docker-compose.prod.yml up -d
```

### Option 2: PM2 Deployment

#### Install PM2

```bash
npm install -g pm2
```

#### Start Server

```bash
cd server
pm2 start npm --name "sporaclet-api" -- run start
pm2 start npm --name "sporaclet-worker" -- run worker:start
```

#### Start Client

```bash
cd client
pm2 start npm --name "sporaclet-client" -- run start
```

#### Save PM2 Configuration

```bash
pm2 save
pm2 startup
```

### Option 3: systemd Services

Create service files in `/etc/systemd/system/`:

#### sporaclet-api.service

```ini
[Unit]
Description=Sporaclet API Server
After=network.target postgresql.service redis.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/sporaclet/server
Environment=NODE_ENV=production
ExecStart=/usr/bin/node dist/index.js
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

#### sporaclet-worker.service

```ini
[Unit]
Description=Sporaclet Worker Process
After=network.target postgresql.service redis.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/sporaclet/server
Environment=NODE_ENV=production
ExecStart=/usr/bin/node dist/workers/index.js
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

#### sporaclet-client.service

```ini
[Unit]
Description=Sporaclet Frontend
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/sporaclet/client
Environment=NODE_ENV=production
ExecStart=/usr/bin/npm start
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Enable and start services:

```bash
systemctl enable sporaclet-api sporaclet-worker sporaclet-client
systemctl start sporaclet-api sporaclet-worker sporaclet-client
```

## Nginx Configuration

### API Server Reverse Proxy

```nginx
server {
    listen 80;
    server_name api.your-domain.com;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Frontend Reverse Proxy

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### SSL Configuration with Let's Encrypt

```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificates
sudo certbot --nginx -d your-domain.com -d api.your-domain.com

# Auto-renewal
sudo certbot renew --dry-run
```

## Monitoring & Logging

### Logs Location

- **PM2 Logs**: `~/.pm2/logs/`
- **systemd Logs**: `journalctl -u sporaclet-api -f`
- **Application Logs**: `server/logs/`

### Health Checks

```bash
# API Health
curl https://api.your-domain.com/api/health

# Check all services
pm2 status
# or
systemctl status sporaclet-*
```

### Performance Monitoring

Monitor key metrics:
- API response times (should be < 1s)
- Database connection pool
- Redis cache hit rate
- Memory usage
- Worker job queue length

## Backup Strategy

### Database Backups

#### Automated Daily Backups

```bash
# Create backup script: /usr/local/bin/backup-sporaclet-db.sh
#!/bin/bash
BACKUP_DIR="/var/backups/sporaclet"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
pg_dump sporaclet_prod | gzip > $BACKUP_DIR/sporaclet_$DATE.sql.gz

# Keep only last 30 days
find $BACKUP_DIR -name "sporaclet_*.sql.gz" -mtime +30 -delete
```

#### Add to crontab

```bash
# Run daily at 2 AM
0 2 * * * /usr/local/bin/backup-sporaclet-db.sh
```

### Redis Persistence

Configure in `redis.conf`:
```
save 900 1
save 300 10
save 60 10000
```

## Scaling Considerations

### Horizontal Scaling

- Use load balancer (nginx, HAProxy) for multiple API instances
- Shared Redis for centralized caching
- Single PostgreSQL primary with read replicas

### Vertical Scaling

- Increase server resources (CPU, RAM)
- Optimize database queries with EXPLAIN ANALYZE
- Increase Redis memory allocation

## Troubleshooting

### Common Issues

#### 1. Database Connection Errors
```bash
# Check PostgreSQL status
systemctl status postgresql
# Check connection string in .env.production
```

#### 2. Redis Connection Errors
```bash
# Check Redis status
systemctl status redis
# Test connection
redis-cli ping
```

#### 3. Worker Jobs Not Processing
```bash
# Check worker logs
pm2 logs sporaclet-worker
# Restart worker
pm2 restart sporaclet-worker
```

#### 4. High Memory Usage
```bash
# Monitor memory
pm2 monit
# Clear Redis cache if needed
redis-cli FLUSHDB
```

## Security Checklist

- [ ] Change all default passwords
- [ ] Enable firewall (ufw or iptables)
- [ ] Set up SSL certificates
- [ ] Configure rate limiting
- [ ] Enable security headers
- [ ] Regular security updates (`apt-get update && apt-get upgrade`)
- [ ] Restrict database access to localhost
- [ ] Use environment variables for secrets (never commit .env files)
- [ ] Set up fail2ban for SSH protection
- [ ] Regular backup testing

## Maintenance

### Update Process

```bash
# 1. Backup database
/usr/local/bin/backup-sporaclet-db.sh

# 2. Pull latest code
git pull origin main

# 3. Install dependencies
cd server && npm install
cd ../client && npm install

# 4. Run migrations
cd server && npx prisma migrate deploy

# 5. Rebuild applications
cd server && npm run build
cd ../client && npm run build

# 6. Restart services
pm2 restart all
# or
systemctl restart sporaclet-*
```

### Database Maintenance

```bash
# Vacuum and analyze
psql sporaclet_prod -c "VACUUM ANALYZE;"

# Check database size
psql sporaclet_prod -c "SELECT pg_size_pretty(pg_database_size('sporaclet_prod'));"
```

## Support

For issues or questions:
- Check logs first
- Review this documentation
- Contact development team

---

**Last Updated**: November 2025
**Version**: 1.0.0
