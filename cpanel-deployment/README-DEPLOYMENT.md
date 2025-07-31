# Meds-Go Medical Marketplace - cPanel Deployment Guide

## Overview
This is a Node.js/Express medical marketplace application that requires PostgreSQL database and Node.js support on your cPanel hosting.

## Prerequisites
Your cPanel hosting must support:
- Node.js (version 18 or higher)
- PostgreSQL database
- File upload permissions

## Database Requirements
⚠️ **IMPORTANT**: This project REQUIRES a PostgreSQL database. It cannot run without one.

### Database Tables
The application uses the following tables:
- `users` - Healthcare professionals
- `admin_users` - Admin accounts
- `products` - Medical products catalog
- `categories` - Product categories
- `brands` - Product brands
- `orders` - Customer orders
- `cart_items` - Shopping cart items
- `featured_carousel` - Homepage featured products
- `carousel_items` - Homepage banners
- `newsletters` - Email subscriptions
- `sessions` - User sessions
- And more...

## Deployment Steps

### 1. Database Setup
1. Create a PostgreSQL database in cPanel
2. Run the SQL script `database-schema.sql` in your database
3. Note down your database connection details:
   - Host
   - Port
   - Database name
   - Username
   - Password

### 2. Configuration
1. Open `config.js` and update ALL values:
   ```javascript
   DATABASE_URL: "postgresql://username:password@host:port/database_name"
   SESSION_SECRET: "your-unique-secret-key"
   GMAIL_USER: "your-email@gmail.com"
   GMAIL_APP_PASSWORD: "your-gmail-app-password"
   STRIPE_SECRET_KEY: "sk_live_your_stripe_key"
   // ... other settings
   ```

### 3. Upload Files
1. Zip the entire `cpanel-deployment` folder
2. Upload to your `public_html` directory (or subdomain folder)
3. Extract the files
4. Ensure the `uploads` folder has write permissions (755 or 777)

### 4. Install Dependencies
In cPanel File Manager or SSH:
```bash
cd /path/to/your/app
npm install
```

### 5. Start the Application
In cPanel Node.js Selector:
1. Set the startup file to: `index.js`
2. Set Node.js version to 18 or higher
3. Start the application

## Environment Variables (Alternative to config.js)
If your cPanel supports .env files, you can create one instead of using config.js:

```env
DATABASE_URL=postgresql://username:password@host:port/database_name
SESSION_SECRET=your-unique-secret-key
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-gmail-app-password
STRIPE_SECRET_KEY=sk_live_your_stripe_key
VITE_STRIPE_PUBLIC_KEY=pk_live_your_stripe_key
NODE_ENV=production
PORT=3000
```

## Security Checklist
- [ ] Change default admin password in database
- [ ] Update SESSION_SECRET to a unique value
- [ ] Use production Stripe keys
- [ ] Verify DATABASE_URL uses SSL connection
- [ ] Set proper file permissions on uploads folder
- [ ] Test all payment flows before going live

## File Structure
```
cpanel-deployment/
├── index.js           # Main entry point
├── config.js          # Configuration file
├── package.json       # Dependencies
├── database-schema.sql # Database setup
├── dist/              # Built application
│   ├── index.js       # Server bundle
│   └── public/        # Static assets
└── uploads/           # File upload directory
```

## Troubleshooting

### Common Issues:
1. **Database Connection Error**: Verify DATABASE_URL format and credentials
2. **Module Not Found**: Run `npm install` in the application directory
3. **Permission Denied**: Check file permissions on uploads folder
4. **Port Already in Use**: Change PORT in config.js
5. **WebAssembly Errors**: The app includes WebAssembly disable configuration

### Logs:
Check cPanel error logs for detailed error messages.

## Support
For technical support with this deployment, ensure you have:
- Access to cPanel with Node.js support
- PostgreSQL database access
- Domain/subdomain configured properly

## Production Notes
- The application serves both API endpoints and frontend assets
- File uploads are stored in the `uploads` directory
- Session data is stored in PostgreSQL
- Email notifications require Gmail SMTP configuration
- Payment processing requires valid Stripe configuration