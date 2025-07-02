# Meds-Go Medical Marketplace - PHP Version

## Overview
This is a PHP conversion of the Node.js medical marketplace application, designed to work on traditional cPanel hosting with MySQL database.

## Requirements
- PHP 7.4 or higher
- MySQL 5.7 or higher
- Apache web server with mod_rewrite
- Email functionality (PHP mail or SMTP)

## Installation
1. Upload all files to your web hosting directory
2. Import the database schema from `database/schema.sql`
3. Configure database connection in `config/database.php`
4. Set up email configuration in `config/email.php`
5. Ensure `uploads/` directory has write permissions (755)

## File Structure
```
/
├── index.php                 # Homepage  
├── login.php                # Login page
├── register.php             # Registration page
├── products.php             # Product listing
├── product.php              # Single product view
├── cart.php                 # Shopping cart
├── checkout.php             # Checkout process
├── admin/                   # Admin panel
│   ├── index.php           # Admin dashboard
│   ├── products.php        # Product management
│   ├── orders.php          # Order management
│   └── users.php           # User management
├── includes/               # PHP includes
│   ├── header.php          # Common header
│   ├── footer.php          # Common footer
│   └── functions.php       # Utility functions
├── config/                 # Configuration files
│   ├── database.php        # Database connection
│   └── email.php           # Email settings
├── database/               # Database files
│   └── schema.sql          # MySQL schema
├── uploads/                # File uploads
├── assets/                 # CSS, JS, images
│   ├── css/
│   ├── js/
│   └── images/
└── api/                    # AJAX endpoints
    ├── auth.php
    ├── products.php
    └── cart.php
```

## Features Converted
- User registration and authentication
- Medical license verification
- Product catalog with categories
- Shopping cart functionality
- Bulk pricing system
- Admin panel for product/order management
- File upload for product images
- Email notifications
- Responsive design

## Database
Uses MySQL instead of PostgreSQL with equivalent schema and relationships.