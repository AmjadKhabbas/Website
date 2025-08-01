# Meds-Go Medical Marketplace - cPanel Deployment Guide

## Overview
This package contains the complete Meds-Go Medical Marketplace application converted from PostgreSQL to MySQL for cPanel hosting compatibility.

## Package Contents
- `index.js` - Main application server file
- `config.js` - Configuration management
- `package.json` - Complete dependency list
- `database-schema-mysql.sql` - MySQL database schema
- `.env.example` - Environment variables template
- `src/` - Server-side source code (converted to MySQL)
- `shared/` - Shared schema and types
- `public/` - Built frontend files
- `uploads/` - File upload directory

## Deployment Steps

### 1. Upload Files
1. Extract this entire package to your cPanel `public_html` directory
2. Ensure all files maintain their directory structure

### 2. Database Setup
1. Create a new MySQL database in cPanel
2. Import the `database-schema-mysql.sql` file using phpMyAdmin
3. Note your database credentials:
   - Database name
   - Database username  
   - Database password
   - Database host (usually localhost)

### 3. Environment Configuration
1. Copy `.env.example` to `.env`
2. Fill in your database credentials:
   ```
   DB_HOST=localhost
   DB_USER=your_db_username
   DB_PASSWORD=your_db_password
   DB_NAME=your_db_name
   ```
3. Set other required variables:
   ```
   NODE_ENV=production
   SESSION_SECRET=your-super-secret-key-here
   ```

### 4. Install Dependencies
1. SSH into your cPanel or use Terminal
2. Navigate to your application directory
3. Run: `npm install`

### 5. Start Application
```bash
npm start
```

## Default Admin Account
- Email: admin@medsgo.com
- Password: admin123
- **Change this immediately after first login**

## Features Included
- ✅ Complete medical marketplace with 92+ products
- ✅ User registration and authentication
- ✅ Admin dashboard for managing users and orders
- ✅ Shopping cart and checkout system
- ✅ Product catalog with categories and search
- ✅ Image upload and management
- ✅ Email notifications
- ✅ Responsive design for all devices

## Technical Details
- **Backend**: Node.js + Express
- **Frontend**: React + Vite (pre-built)
- **Database**: MySQL 5.7+ (converted from PostgreSQL)
- **ORM**: Drizzle with MySQL adapter
- **File Size**: ~1.1MB (optimized for cPanel)

## Support
For deployment assistance, check the logs in cPanel or contact support with the error details.

## Security Notes
1. Change default admin password immediately
2. Use strong SESSION_SECRET in production
3. Enable HTTPS in production
4. Regularly backup your database