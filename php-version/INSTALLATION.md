# Meds-Go Medical Marketplace - PHP Installation Guide

## 🚀 Complete PHP Version for cPanel Hosting

This is a fully converted PHP version of the Node.js medical marketplace application, designed specifically for traditional cPanel hosting environments.

## 📋 Requirements

- **PHP**: 7.4 or higher (8.0+ recommended)
- **MySQL**: 5.7 or higher (8.0+ recommended)
- **Apache**: with mod_rewrite enabled
- **Storage**: At least 500MB disk space
- **Memory**: 128MB PHP memory limit (256MB recommended)

## 📁 What's Included

### ✅ Core Features Converted
- ✅ **User Authentication**: Login/registration with medical license verification
- ✅ **Product Catalog**: Full product browsing with categories and search
- ✅ **Shopping Cart**: Session-based cart with bulk pricing calculations
- ✅ **Bulk Pricing System**: Product-specific discount tiers
- ✅ **Admin Panel**: Complete dashboard for product/order/user management
- ✅ **File Uploads**: Product image management with multiple images
- ✅ **Email Notifications**: Registration confirmations and admin alerts
- ✅ **Responsive Design**: Mobile-friendly Tailwind CSS interface
- ✅ **Carousel Management**: Dynamic homepage banner system

### 📊 Database
- **MySQL Schema**: Complete conversion from PostgreSQL
- **Sample Data**: Categories, products, and admin user included
- **JSON Support**: Bulk discounts and additional images stored as JSON

## 🛠️ Installation Steps

### 1. Upload Files
1. Download/extract the `php-version` folder
2. Upload all contents to your web hosting directory (usually `public_html`)
3. Ensure proper file permissions:
   ```bash
   chmod 755 uploads/
   chmod 644 *.php
   ```

### 2. Database Setup
1. **Create MySQL Database** in cPanel
2. **Import Schema**: Run `database/schema.sql` in phpMyAdmin
3. **Configure Connection**: Edit `config/database.php`:
   ```php
   define('DB_HOST', 'localhost');
   define('DB_NAME', 'your_database_name');
   define('DB_USER', 'your_username');  
   define('DB_PASS', 'your_password');
   ```

### 3. Email Configuration
Edit `config/email.php` with your SMTP settings:
```php
define('SMTP_HOST', 'smtp.gmail.com');
define('SMTP_USERNAME', 'your-email@gmail.com');
define('SMTP_PASSWORD', 'your-app-password');
define('ADMIN_EMAIL', 'admin@yourdomain.com');
```

### 4. File Permissions
Ensure the uploads directory is writable:
```bash
chmod 755 uploads/
```

### 5. Default Admin Account
The system creates a default admin account:
- **Email**: `admin@medsgo.com`
- **Password**: `admin123`
- **⚠️ Change this immediately after first login**

## 🔧 Configuration Options

### Security Settings
- Update admin credentials in `/admin/`
- Configure secure session settings
- Enable HTTPS in production
- Set strong database passwords

### Email Setup Options
1. **Gmail SMTP** (recommended)
   - Create Gmail app password
   - Configure in `config/email.php`

2. **cPanel Email**
   - Use hosting provider's SMTP
   - Configure server settings

3. **Basic PHP Mail**
   - Uses server's mail function
   - May have deliverability issues

## 🌐 URL Structure

```
/                     - Homepage with carousel
/products.php         - Product catalog
/product.php?id=1     - Single product view
/cart.php            - Shopping cart
/login.php           - User/admin login
/register.php        - Doctor registration
/admin/              - Admin dashboard
/admin/products.php  - Product management
/admin/orders.php    - Order management
/admin/users.php     - User approval
```

## 📱 Mobile Compatibility

- Fully responsive design using Tailwind CSS
- Touch-friendly navigation and forms
- Optimized for tablets and smartphones
- Progressive enhancement approach

## 🔒 Security Features

- **Password Hashing**: PHP password_hash() with bcrypt
- **SQL Injection Protection**: PDO prepared statements
- **XSS Prevention**: Input sanitization and output escaping
- **Session Security**: Secure session configuration
- **File Upload Validation**: Type and size restrictions
- **Admin Authorization**: Role-based access control

## 📊 Admin Features

### Dashboard
- Order statistics and revenue tracking
- Recent orders overview
- Pending user approvals
- Quick action buttons

### Product Management
- Create/edit/delete products
- Multiple image upload
- Bulk pricing configuration
- Category management
- Featured product settings

### Order Management
- View pending orders
- Access doctor banking information
- Approve/decline orders with notes
- Order status tracking

### User Management
- Review doctor registrations
- Verify medical licenses
- Approve/reject applications
- Send notification emails

## 🚨 Important Notes

### Data Migration
If converting from the Node.js version:
1. Export data from PostgreSQL
2. Convert to MySQL format
3. Import using provided schema
4. Update image paths if needed

### Performance Tips
1. **Enable OpCache** in PHP
2. **Use MySQL query cache**
3. **Optimize images** before upload
4. **Enable Gzip compression**
5. **Use CDN** for static assets

### Backup Strategy
1. **Database**: Regular MySQL dumps
2. **Files**: Backup uploads directory
3. **Config**: Secure config files
4. **Testing**: Test restore procedures

## 🛠️ Troubleshooting

### Common Issues

**Database Connection Errors**
- Verify credentials in `config/database.php`
- Check MySQL server status
- Ensure database exists

**File Upload Issues**
- Check `uploads/` directory permissions (755)
- Verify PHP upload limits
- Ensure disk space available

**Email Not Sending**
- Test SMTP credentials
- Check spam folders
- Verify email configuration
- Try alternative SMTP provider

**Admin Access Issues**
- Reset admin password in database
- Check admin_users table
- Verify session configuration

### PHP Error Debugging
Enable error reporting for development:
```php
ini_set('display_errors', 1);
error_reporting(E_ALL);
```

## 📈 Scaling Considerations

### For High Traffic
1. **Database Optimization**
   - Add indexes to frequently queried columns
   - Use MySQL query optimization
   - Consider read replicas

2. **Caching Strategy**
   - Implement Redis/Memcached
   - Use file-based caching
   - Enable browser caching

3. **Load Balancing**
   - Multiple server instances
   - Shared file storage
   - Database clustering

## 📞 Support

### Self-Help Resources
- Check error logs in cPanel
- Review PHP error logs
- Test database connectivity
- Verify file permissions

### Professional Support
For complex installations or customizations:
- Consult PHP/MySQL developers
- Contact hosting provider support
- Consider managed hosting solutions

## 🎯 Next Steps

After installation:
1. **Test all functionality**
2. **Configure email settings**
3. **Add your products**
4. **Set up user registration flow**
5. **Train admin users**
6. **Plan marketing launch**

## 📄 License & Credits

This PHP conversion maintains the same functionality as the original Node.js version while being compatible with traditional web hosting environments.

**Original Features Converted:**
- Complete user authentication system
- Product catalog with search and filtering
- Shopping cart with bulk pricing
- Admin panel with full management capabilities
- Email notification system
- File upload functionality
- Responsive design

**Ready for Production Use on Any cPanel Hosting Provider**