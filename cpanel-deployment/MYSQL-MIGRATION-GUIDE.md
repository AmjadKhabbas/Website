# MySQL Migration Guide - Meds-Go Medical Marketplace

## Overview
This project has been successfully migrated from PostgreSQL to MySQL for cPanel deployment. All database schemas, queries, and connection code have been converted to MySQL-compatible syntax.

## What Changed

### ✅ Database Engine Migration
- **From**: PostgreSQL (Neon serverless)
- **To**: MySQL 5.7+ (cPanel standard)
- **Driver**: Changed from `@neondatabase/serverless` to `mysql2`

### ✅ Schema Conversions
- `SERIAL` → `INT AUTO_INCREMENT`
- `JSONB` → `JSON`
- `TEXT[]` arrays → `JSON` arrays
- `BOOLEAN` → `TINYINT(1)`
- `VARCHAR` length specifications added
- `CURRENT_TIMESTAMP` → MySQL equivalent
- Index syntax updated for MySQL

### ✅ Connection Configuration
**Multiple connection methods supported:**

1. **DATABASE_URL format**:
   ```javascript
   DATABASE_URL: "mysql://user:password@host:port/database"
   ```

2. **Individual credentials** (cPanel style):
   ```javascript
   DB_HOST: "localhost"
   DB_PORT: "3306"
   DB_USER: "cpanel_db_user"
   DB_PASSWORD: "cpanel_db_password"
   DB_NAME: "cpanel_db_name"
   ```

### ✅ Files Modified
- `server/db.ts` - MySQL connection setup
- `shared/schema.ts` - All table definitions converted
- `cpanel-deployment/src/db.js` - MySQL configuration
- `cpanel-deployment/src/schema.js` - MySQL schema definitions
- `cpanel-deployment/package.json` - Updated dependencies

## Database Import Instructions

### Step 1: Create MySQL Database in cPanel
1. Login to cPanel
2. Go to "MySQL Databases"
3. Create new database (e.g., `medsgo_marketplace`)
4. Create database user with strong password
5. Add user to database with ALL PRIVILEGES

### Step 2: Import Schema via phpMyAdmin
1. Go to phpMyAdmin in cPanel
2. Select your database
3. Click "Import" tab
4. Upload `database-schema-mysql.sql`
5. Click "Go" to execute

### Step 3: Verify Tables
After import, you should see 15 tables:
- admin_users
- brands  
- carousel_items
- cart_items
- categories
- ehri_accounts
- featured_carousel
- newsletters
- order_items
- orders
- products
- referrals
- sessions
- users

## Configuration Examples

### cPanel MySQL Credentials
```javascript
// config.js
module.exports = {
  // Individual credentials (most common for cPanel)
  DB_HOST: "localhost",
  DB_PORT: "3306",
  DB_USER: "medsgo_dbuser",      // Your cPanel DB username
  DB_PASSWORD: "your_password",   // Your cPanel DB password  
  DB_NAME: "medsgo_marketplace",  // Your cPanel DB name
  
  // Session and other settings
  SESSION_SECRET: "your-random-secret-key",
  // ... other configuration
}
```

### Alternative URL Format
```javascript
// If your host supports DATABASE_URL
DATABASE_URL: "mysql://medsgo_dbuser:your_password@localhost:3306/medsgo_marketplace"
```

## Key Differences from PostgreSQL

### Data Types
| PostgreSQL | MySQL | Notes |
|------------|-------|--------|
| SERIAL | INT AUTO_INCREMENT | Primary key auto-increment |
| JSONB | JSON | JSON data storage |
| TEXT[] | JSON | Arrays stored as JSON |
| BOOLEAN | TINYINT(1) | Boolean values |
| VARCHAR | VARCHAR(length) | Length required |

### Query Syntax
- **Timestamps**: Uses `CURRENT_TIMESTAMP` instead of `NOW()`
- **JSON**: Uses MySQL JSON functions
- **Arrays**: Stored and queried as JSON arrays
- **Indexes**: MySQL-specific index syntax

## Testing Connection

You can test your MySQL connection:

```javascript
// Test script
const mysql = require('mysql2/promise');

const config = {
  host: 'localhost',
  port: 3306,
  user: 'your_db_user',
  password: 'your_db_password',
  database: 'your_db_name'
};

async function testConnection() {
  try {
    const connection = await mysql.createConnection(config);
    console.log('✅ MySQL connection successful!');
    await connection.end();
  } catch (error) {
    console.error('❌ MySQL connection failed:', error.message);
  }
}

testConnection();
```

## Common cPanel MySQL Settings

### Default Values
- **Host**: `localhost`
- **Port**: `3306`
- **Engine**: InnoDB (recommended)
- **Charset**: utf8mb4_unicode_ci

### Security Notes
- Use strong database passwords
- Limit database user privileges to necessary operations only
- Keep database credentials secure in config.js
- Change default admin password after import

## Troubleshooting

### Connection Issues
1. **"Access denied"**: Check username/password in cPanel
2. **"Unknown database"**: Verify database name exists
3. **"Connection timeout"**: Check host/port settings
4. **"Too many connections"**: Contact hosting provider

### Schema Issues
1. **Import failed**: Check MySQL version (5.7+ required)
2. **Foreign key errors**: Ensure tables created in correct order
3. **JSON column errors**: Update to MySQL 5.7+ for JSON support

## Production Checklist
- [ ] MySQL database created in cPanel
- [ ] Schema imported successfully (15 tables)
- [ ] config.js updated with correct credentials
- [ ] Connection tested successfully
- [ ] Default admin password changed
- [ ] All application features tested

The migration is complete and ready for cPanel deployment with MySQL!