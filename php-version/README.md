# 🏥 Meds-Go Medical Marketplace - PHP Version

## 🚀 Complete Node.js to PHP/MySQL Migration

This is a **production-ready PHP conversion** of your Node.js/Express medical marketplace application, specifically designed for **cPanel hosting compatibility**.

## ✅ What's Been Converted

### 🔄 **Express Routes → PHP API Endpoints**

| Original Express Route | New PHP Endpoint | Description |
|----------------------|------------------|-------------|
| `GET /api/products` | `/api/products.php` | Product listing with filters |
| `POST /api/products` | `/api/products.php` | Create product (admin) |
| `PUT /api/products/:id` | `/api/products.php?id=:id` | Update product (admin) |
| `DELETE /api/products/:id` | `/api/products.php?id=:id` | Delete product (admin) |
| `GET /api/cart` | `/api/cart.php` | Get cart items |
| `POST /api/cart` | `/api/cart.php` | Add to cart |
| `PUT /api/cart` | `/api/cart.php` | Update cart item |
| `DELETE /api/cart` | `/api/cart.php` | Remove from cart |
| `GET /api/orders` | `/api/orders.php` | Get orders |
| `POST /api/orders` | `/api/orders.php` | Create order |
| `PUT /api/orders/:id` | `/api/orders.php?id=:id` | Update order (admin) |
| `POST /api/auth/login` | `/api/users.php` | User/admin login |
| `POST /api/auth/register` | `/api/users.php` | User registration |
| `GET /api/auth/user` | `/api/users.php` | Get current user |

### 🗄️ **Database Migration: PostgreSQL → MySQL**

```sql
-- Original PostgreSQL tables converted to MySQL equivalents
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    -- ... all fields preserved
);

CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    bulk_discounts JSON, -- Preserves bulk pricing system
    image_urls JSON,     -- Preserves multiple images
    -- ... all original functionality
);
```

### 🔧 **Backend Architecture Conversion**

| Node.js/Express Feature | PHP Equivalent | Implementation |
|-------------------------|----------------|----------------|
| `express.Router()` | Individual PHP files | `/api/products.php`, `/api/cart.php` |
| `passport.js` authentication | Session-based auth | `$_SESSION` with bcrypt |
| `multer` file uploads | PHP `$_FILES` | Secure image handling |
| `nodemailer` emails | PHP `mail()` / SMTP | Gmail integration |
| `express-session` | PHP sessions | Secure session config |
| JSON responses | `header('Content-Type: application/json')` | Consistent API format |

## 📂 **Folder Structure for cPanel**

```
public_html/                 # Your cPanel root directory
├── api/                     # RESTful API endpoints
│   ├── products.php         # Product CRUD operations
│   ├── cart.php            # Shopping cart management
│   ├── orders.php          # Order processing
│   └── users.php           # Authentication & user management
├── config/                  # Configuration files
│   ├── database.php        # MySQL PDO connection
│   └── email.php           # SMTP settings
├── includes/               # Shared PHP functions
│   ├── functions.php       # Core business logic
│   ├── header.php          # Site header with navigation
│   └── footer.php          # Site footer
├── admin/                  # Admin panel
│   ├── index.php          # Dashboard with statistics
│   ├── products.php       # Product management
│   ├── orders.php         # Order approval system
│   └── users.php          # User approval workflow
├── assets/                 # Frontend assets
│   ├── css/               # Stylesheets
│   ├── js/                # JavaScript (including API client)
│   └── images/            # Static images
├── uploads/               # User-uploaded files
├── database/              # Database schema
│   └── schema.sql         # Complete MySQL setup
├── .htaccess             # Apache URL rewriting & security
├── index.php             # Homepage with carousel
├── products.php          # Product catalog page
├── cart.php              # Shopping cart page
├── login.php             # User/admin login
└── INSTALLATION.md       # Deployment guide
```

## 🔌 **Database Connection (PDO)**

```php
// config/database.php
class Database {
    private $host = 'localhost';
    private $db_name = 'your_database';
    private $username = 'your_username';
    private $password = 'your_password';
    private $pdo;

    public function getConnection() {
        $dsn = "mysql:host={$this->host};dbname={$this->db_name};charset=utf8mb4";
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ];
        
        $this->pdo = new PDO($dsn, $this->username, $this->password, $options);
        return $this->pdo;
    }
}
```

## 🌐 **Frontend JavaScript API Client**

```javascript
// assets/js/api.js - Drop-in replacement for your fetch() calls
class MedsGoAPI {
    constructor() {
        this.baseURL = window.location.origin;
    }

    // Login (replaces your original login function)
    async login(email, password) {
        const response = await fetch('/api/users.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        return response.json();
    }

    // Get products (replaces your product fetching)
    async getProducts(filters = {}) {
        const params = new URLSearchParams(filters);
        const response = await fetch(`/api/products.php?${params}`);
        return response.json();
    }

    // Add to cart (preserves your cart functionality)
    async addToCart(productId, quantity = 1) {
        const response = await fetch('/api/cart.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `product_id=${productId}&quantity=${quantity}`
        });
        return response.json();
    }
}

// Global instance - use exactly like your original API calls
const api = new MedsGoAPI();
```

## 📋 **Quick Deployment Checklist**

### 1. **Upload Files**
```bash
# Upload entire php-version/ contents to your cPanel public_html/
- All PHP files
- .htaccess file (for clean URLs)
- uploads/ directory (with write permissions)
```

### 2. **Database Setup**
```sql
-- In cPanel phpMyAdmin:
1. Create new MySQL database
2. Import database/schema.sql
3. Update config/database.php with your credentials
```

### 3. **Configuration**
```php
// config/database.php
define('DB_HOST', 'localhost');
define('DB_NAME', 'your_cpanel_database_name');
define('DB_USER', 'your_cpanel_username');
define('DB_PASS', 'your_database_password');

// config/email.php (optional)
define('SMTP_HOST', 'smtp.gmail.com');
define('SMTP_USERNAME', 'your-email@gmail.com');
define('SMTP_PASSWORD', 'your-gmail-app-password');
```

### 4. **File Permissions**
```bash
chmod 755 uploads/
chmod 644 *.php
chmod 644 .htaccess
```

### 5. **Default Admin Access**
```
Email: admin@medsgo.com
Password: admin123
URL: https://yourdomain.com/admin/

⚠️ Change these credentials immediately!
```

## 🔄 **API Usage Examples**

### Frontend JavaScript (unchanged from your original code):

```javascript
// Your existing frontend code works with minimal changes

// Original: fetch('/api/products')
// New: fetch('/api/products.php') - or use clean URLs with .htaccess

// Login form (works exactly the same)
async function handleLogin(email, password) {
    try {
        const response = await api.login(email, password);
        if (response.user) {
            window.location.href = response.user.role === 'admin' ? '/admin/' : '/';
        }
    } catch (error) {
        showToast(error.message, 'error');
    }
}

// Add to cart (preserves all your bulk pricing logic)
async function addToCart(productId, quantity) {
    try {
        await api.addToCart(productId, quantity);
        showToast('Added to cart!', 'success');
        updateCartBadge();
    } catch (error) {
        showToast(error.message, 'error');
    }
}
```

## 🔒 **Security Features Preserved**

- ✅ **Password Hashing**: bcrypt (same as your Node.js version)
- ✅ **SQL Injection Protection**: PDO prepared statements
- ✅ **XSS Prevention**: Input sanitization and output escaping
- ✅ **Session Security**: Secure session configuration
- ✅ **File Upload Validation**: Type and size restrictions
- ✅ **Admin Authorization**: Role-based access control
- ✅ **CSRF Protection**: Session-based validation

## 🚀 **Performance & Hosting**

### **Perfect for cPanel because:**
- ✅ No Node.js server required
- ✅ Standard Apache/PHP hosting
- ✅ MySQL database (included in most hosting plans)
- ✅ .htaccess for clean URLs and security
- ✅ Optimized for shared hosting environments

### **Optimizations included:**
- ✅ Gzip compression in .htaccess
- ✅ Browser caching headers
- ✅ Secure file upload handling
- ✅ Database query optimization
- ✅ Session management

## 🔧 **Troubleshooting**

### **Common Issues:**

1. **Database Connection Failed**
   ```php
   // Check config/database.php credentials
   // Verify database exists in cPanel
   ```

2. **File Upload Issues**
   ```bash
   chmod 755 uploads/
   # Check PHP upload_max_filesize setting
   ```

3. **Clean URLs Not Working**
   ```apache
   # Ensure .htaccess is uploaded
   # Verify mod_rewrite is enabled
   ```

4. **Email Not Sending**
   ```php
   // Check config/email.php settings
   // Verify SMTP credentials
   ```

## 🎯 **What You Get**

This PHP version gives you **100% feature parity** with your Node.js application:

- ✅ **Complete user authentication system**
- ✅ **Product catalog with search and filtering**
- ✅ **Shopping cart with bulk pricing calculations**
- ✅ **Admin panel with full management capabilities**
- ✅ **Order processing and approval workflow**
- ✅ **Email notification system**
- ✅ **File upload functionality**
- ✅ **Responsive design with Tailwind CSS**
- ✅ **SEO-friendly URLs**
- ✅ **Production-ready security**

**Ready to deploy on any cPanel hosting provider immediately!**