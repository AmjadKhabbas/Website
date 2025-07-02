# 🚀 cPanel Deployment Guide - Meds-Go Medical Marketplace

## 📦 Ready-to-Upload Package

This folder contains your **complete, production-ready** medical marketplace application with both React frontend and PHP backend integrated.

## 🎯 What You're Deploying

**Hybrid Application Architecture:**
- **React SPA**: Modern, interactive frontend (your current working version)
- **PHP Backend**: All API endpoints and admin functionality
- **Smart Routing**: Automatically serves the best experience for each user
- **SEO Friendly**: Search engines get PHP version, users get React experience

## 📋 Pre-Deployment Checklist

### ✅ **Files Ready for Upload**
- ✅ React app built and integrated (`/assets/index-*.js`, `/assets/index-*.css`)
- ✅ PHP backend with your cPanel database credentials configured
- ✅ All API endpoints functional (`/api/products.php`, `/api/cart.php`, etc.)
- ✅ Admin panel complete (`/admin/`)
- ✅ Database schema ready (`/database/schema.sql`)
- ✅ Clean URLs configured (`.htaccess`)
- ✅ Security headers and file protection enabled
- ✅ Upload directory with proper permissions

### 🗄️ **Database Configuration**
Your database is already configured for cPanel:
```php
Database: medsgo_NPDB
Username: medsgo_AK
Password: 28hZV72o1zU[
Host: localhost
```

## 🚀 **Upload Instructions**

### 1. **Upload to cPanel**
1. Compress this entire `php-version` folder
2. Upload to cPanel File Manager
3. Extract to `public_html/` directory
4. **DO NOT** upload to a subfolder - extract directly to public_html root

### 2. **Database Setup**
1. Open phpMyAdmin in cPanel
2. Select your `medsgo_NPDB` database
3. Import `database/schema.sql`
4. Verify tables are created successfully

### 3. **File Permissions**
```bash
chmod 755 uploads/
chmod 644 .htaccess
chmod 644 *.php
```

### 4. **Test Your Deployment**

**Homepage Test:**
- Visit `https://yourdomain.com/` → Should load React app
- Visit `https://yourdomain.com/?php=1` → Should load PHP version

**API Test:**
- Visit `https://yourdomain.com/api/products.php` → Should return JSON

**Admin Test:**
- Visit `https://yourdomain.com/admin/`
- Login: `admin@medsgo.com` / `admin123`
- **Change these credentials immediately!**

## 🎨 **How the Hybrid System Works**

### **Smart Routing Logic:**
```php
// Homepage automatically detects best experience:
if (modern_browser && javascript_enabled) {
    serve_react_app();  // Your current working version
} else {
    serve_php_version(); // Fallback for compatibility
}
```

### **URL Structure:**
- `/` → React SPA (your working app)
- `/products.php` → PHP product catalog
- `/admin/` → PHP admin panel
- `/api/` → PHP REST endpoints
- `/?php=1` → Force PHP version

## 🔧 **Configuration Files**

### **Database** (`config/database.php`)
✅ Pre-configured with your cPanel credentials

### **Email** (`config/email.php`)
Update with your SMTP settings for notifications:
```php
define('SMTP_HOST', 'mail.yourdomain.com');
define('SMTP_USERNAME', 'noreply@yourdomain.com');
define('SMTP_PASSWORD', 'your_email_password');
```

### **Security** (`.htaccess`)
✅ Pre-configured with:
- Clean URL routing
- Security headers
- File protection
- Gzip compression
- Browser caching

## 🎯 **Expected Results After Deployment**

### **For Regular Users:**
1. Visit your domain → See the **exact same React app** you're using now
2. Full shopping cart functionality with bulk pricing
3. User registration and login
4. Order placement and tracking

### **For Admins:**
1. Visit `/admin/` → Full management dashboard
2. Product management with image uploads
3. Order approval system
4. User management and approvals
5. Email notifications

### **For Search Engines:**
1. Get PHP-rendered pages for SEO
2. Proper meta tags and structured data
3. Fast loading times

## 🚨 **Important Post-Deployment Steps**

### 1. **Change Admin Password**
```sql
-- In phpMyAdmin, run:
UPDATE admin_users 
SET password_hash = '$2y$10$your_new_bcrypt_hash_here'
WHERE email = 'admin@medsgo.com';
```

### 2. **Update Admin Email**
```sql
-- Change admin email to yours:
UPDATE admin_users 
SET email = 'youremail@yourdomain.com'
WHERE id = 1;
```

### 3. **Configure Email Notifications**
Edit `config/email.php` with your hosting provider's SMTP settings.

### 4. **SSL Certificate**
Enable SSL in cPanel for `https://` access.

## 🔄 **Fallback Options**

If React app doesn't load:
- Users can access `/?php=1` for full PHP version
- All functionality available in both versions
- Admin panel always uses PHP for reliability

## 📞 **Troubleshooting**

### **React App Not Loading:**
1. Check browser console for JavaScript errors
2. Verify `/assets/` files uploaded correctly
3. Check server error logs in cPanel

### **Database Connection Issues:**
1. Verify database name in cPanel matches config
2. Test connection in phpMyAdmin
3. Check error logs

### **Admin Panel Issues:**
1. Clear browser cache
2. Check session configuration
3. Verify database tables imported

### **Email Not Working:**
1. Test SMTP settings in config
2. Check hosting provider email limits
3. Verify sender domain authentication

## ✅ **Success Indicators**

Your deployment is successful when:
- ✅ Homepage loads the React app
- ✅ Products display correctly
- ✅ Shopping cart functions work
- ✅ User registration/login works
- ✅ Admin panel accessible at `/admin/`
- ✅ Orders can be placed and approved
- ✅ Email notifications sent

## 🎉 **You're Ready to Go Live!**

This package contains everything you need for a production medical marketplace. Your React frontend will provide the modern user experience while the PHP backend ensures compatibility and SEO optimization.

**Your app will work exactly like it does now, but hosted on cPanel!**