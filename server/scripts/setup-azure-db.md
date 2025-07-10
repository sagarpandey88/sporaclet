# Azure PostgreSQL Setup Guide

## 1. Create Azure PostgreSQL Database

### Using Azure Portal:
1. Go to Azure Portal (portal.azure.com)
2. Click "Create a resource"
3. Search for "Azure Database for PostgreSQL"
4. Select "Flexible Server" (recommended)
5. Configure:
   - **Resource Group**: Create new or use existing
   - **Server Name**: your-sports-db-server (must be globally unique)
   - **Region**: Choose closest to your users
   - **PostgreSQL Version**: 14 or 15
   - **Compute + Storage**: 
     - Compute tier: Burstable (for development) or General Purpose (for production)
     - Compute size: B1ms (1 vCore, 2 GB RAM) for development
     - Storage: 32 GB (minimum)
   - **Authentication**: 
     - Admin username: `sportsadmin`
     - Password: Create a strong password
   - **Networking**:
     - Connectivity method: Public access
     - Allow access from Azure services: Yes
     - Add current client IP address: Yes

### Using Azure CLI:
```bash
# Login to Azure
az login

# Create resource group
az group create --name sports-prediction-rg --location eastus

# Create PostgreSQL server
az postgres flexible-server create \
  --resource-group sports-prediction-rg \
  --name your-sports-db-server \
  --location eastus \
  --admin-user sportsadmin \
  --admin-password YourStrongPassword123! \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --storage-size 32 \
  --version 14

# Create database
az postgres flexible-server db create \
  --resource-group sports-prediction-rg \
  --server-name your-sports-db-server \
  --database-name sports_predictions

# Configure firewall (allow all Azure services)
az postgres flexible-server firewall-rule create \
  --resource-group sports-prediction-rg \
  --name your-sports-db-server \
  --rule-name AllowAllAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0

# Add your IP address
az postgres flexible-server firewall-rule create \
  --resource-group sports-prediction-rg \
  --name your-sports-db-server \
  --rule-name AllowMyIP \
  --start-ip-address YOUR_IP_ADDRESS \
  --end-ip-address YOUR_IP_ADDRESS
```

## 2. Connection String Format

Your connection string will look like:
```
postgresql://sportsadmin:YourStrongPassword123!@your-sports-db-server.postgres.database.azure.com:5432/sports_predictions?sslmode=require
```

## 3. Security Best Practices

1. **Use SSL**: Always include `sslmode=require` in your connection string
2. **Firewall Rules**: Only allow necessary IP addresses
3. **Strong Passwords**: Use complex passwords with special characters
4. **Environment Variables**: Never commit credentials to version control
5. **Connection Pooling**: Use connection pooling in production

## 4. Monitoring and Maintenance

- Enable **Query Performance Insight** in Azure Portal
- Set up **Alerts** for high CPU/memory usage
- Configure **Automated Backups** (enabled by default)
- Monitor **Connection Limits** and **Storage Usage**

## 5. Cost Optimization

- Use **Burstable** tier for development/testing
- **Stop/Start** server when not in use (Flexible Server only)
- Monitor **Storage Growth** and adjust as needed
- Consider **Reserved Capacity** for production workloads