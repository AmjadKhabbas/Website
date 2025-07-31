# cPanel Installation Checklist

## ✅ Pre-Installation Requirements
- [ ] cPanel hosting with Node.js 18+ support
- [ ] PostgreSQL database access
- [ ] File upload permissions (755 or 777 on uploads folder)

## ✅ Database Setup (CRITICAL - MUST BE DONE FIRST)

### Step 1: Create PostgreSQL Database
1. Login to cPanel → PostgreSQL Databases
2. Create new database (e.g., `medsgo_db`)
3. Create database user (e.g., `medsgo_user`)
4. Add user to database with ALL PRIVILEGES
5. Note connection details:
   - Host: usually `localhost`
   - Port: usually `5432` 
   - Database name: `medsgo_db`
   - Username: `medsgo_user`
   - Password: [your password]

### Step 2: Import Database Schema
1. Go to cPanel → phpPgAdmin (or database management tool)
2. Select your database
3. Import/Execute the `database-schema.sql` file
4. Verify 15 tables were created successfully

## ✅ Application Configuration

### Step 3: Update config.js
```javascript
DATABASE_URL: "postgresql://medsgo_user:yourpassword@localhost:5432/medsgo_db"
SESSION_SECRET: "your-random-secret-key-here"
GMAIL_USER: "your-email@gmail.com"              // Optional
GMAIL_APP_PASSWORD: "your-app-password"         // Optional  
STRIPE_SECRET_KEY: "sk_live_your_key"           // Optional
DEFAULT_ADMIN_PASSWORD: "your-admin-password"   // Change from default
```

## ✅ File Upload and Deployment

### Step 4: Upload Files
1. Zip the entire `cpanel-deployment` folder
2. Upload to your domain's public_html folder (or subdomain folder)
3. Extract all files
4. Set permissions on `uploads/` folder to 755 or 777

### Step 5: Install Dependencies
In cPanel Terminal or File Manager:
```bash
cd /path/to/your/app
npm install
```

### Step 6: Configure Node.js App
1. Go to cPanel → Node.js Selector
2. Create new Node.js app:
   - Node.js version: 18 or higher
   - Application root: /public_html (or your folder)
   - Application URL: your domain
   - Application startup file: `index.js`
3. Start the application

## ✅ Security Configuration

### Step 7: Change Default Passwords
1. Update `config.js` → `DEFAULT_ADMIN_PASSWORD`
2. Login to admin panel: `https://yourdomain.com/admin`
3. Change admin password immediately

### Step 8: Test Application
- [ ] Homepage loads successfully
- [ ] Product catalog displays
- [ ] User registration works
- [ ] Admin login works
- [ ] File uploads work
- [ ] Database connections stable

## ✅ Production Optimization

### Step 9: Optional Services Setup
- [ ] Gmail SMTP for email notifications
- [ ] Stripe for payment processing
- [ ] SSL certificate (usually automatic in cPanel)
- [ ] Domain/subdomain configuration

### Step 10: Monitoring
- [ ] Check cPanel error logs for issues
- [ ] Monitor application performance
- [ ] Verify all features work correctly

## 🔧 Troubleshooting

### Common Issues:
1. **"Database connection failed"**
   - Check DATABASE_URL format
   - Verify database credentials
   - Ensure database exists and user has permissions

2. **"Module not found" errors**
   - Run `npm install` in application directory
   - Check Node.js version is 18+

3. **"Cannot write to uploads folder"**
   - Set folder permissions to 755 or 777
   - Ensure path is correct

4. **Application won't start**
   - Check cPanel error logs
   - Verify index.js is set as startup file
   - Ensure all required environment variables are set

### Support Files:
- `src/db.js` - Database connection configuration
- `src/schema.js` - Database table definitions  
- `src/storage.js` - Database operations
- `config.js` - All environment variables
- `.env.example` - Alternative configuration template

## 🎯 Success Indicators:
- Application starts without errors
- Database connection established
- All 15 database tables created
- Admin panel accessible
- File uploads working
- User registration functional