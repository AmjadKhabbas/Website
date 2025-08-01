# Medical Marketplace - cPanel Deployment Package

This is a production-ready JavaScript application compiled from TypeScript, optimized for cPanel hosting environments.

## 🚀 Quick Setup

### 1. Upload Files
- Upload all files from this directory to your cPanel `public_html` folder
- Ensure Node.js is enabled in your cPanel hosting

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment
```bash
cp .env.example .env
nano .env
```

Update the environment variables with your actual values:
- **Database**: PostgreSQL connection details
- **Session Secret**: Generate a secure random string
- **Email**: SendGrid API key for notifications
- **Payments**: Stripe keys for payment processing

### 4. Set Permissions
```bash
chmod 755 uploads/
chmod 644 index.js
```

### 5. Start Application
```bash
npm start
```

## 📁 File Structure

```
cpanel-deployment-final/
├── index.js              # Main application server (compiled from TypeScript)
├── package.json          # Node.js dependencies
├── .env.example          # Environment variables template
├── public/               # Frontend static files
│   ├── index.html        # Main HTML file
│   └── assets/           # CSS, JS, and other assets
├── shared/               # Shared schemas and types
├── uploads/              # File upload directory (needs write permissions)
└── README.md            # This file
```

## 🔧 Requirements

- **Node.js**: Version 18.0.0 or higher
- **Database**: PostgreSQL (local or remote)
- **cPanel**: With Node.js app support enabled
- **Memory**: At least 512MB RAM recommended

## 🗄️ Database Setup

1. Create a PostgreSQL database in your hosting control panel
2. Import your database schema (contact administrator for SQL files)
3. Update the `DATABASE_URL` in your `.env` file

## 🔒 Security Configuration

### Session Secret
Generate a secure session secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### File Permissions
- `uploads/` directory: 755 (writable)
- `.env` file: 600 (secure)
- Application files: 644 (readable)

## 🌐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `SESSION_SECRET` | Secure random string for sessions | Yes |
| `PORT` | Server port (usually 3000) | Yes |
| `NODE_ENV` | Set to `production` | Yes |
| `SENDGRID_API_KEY` | Email service API key | No |
| `STRIPE_SECRET_KEY` | Payment processing | No |

## 🚨 Troubleshooting

### Common Issues

**Application won't start:**
- Check Node.js version: `node --version`
- Verify environment variables in `.env`
- Check database connectivity

**Database connection failed:**
- Verify PostgreSQL credentials
- Ensure database server is accessible
- Check firewall settings

**File upload not working:**
- Verify `uploads/` directory permissions
- Check available disk space
- Review file size limits

### Log Files
Application logs can be viewed with:
```bash
pm2 logs  # If using PM2
# or check cPanel error logs
```

## 📞 Support

For technical support:
1. Check the troubleshooting section above
2. Verify all requirements are met
3. Review error logs for specific issues
4. Contact your hosting provider for cPanel-specific issues

## 🔄 Updates

To update the application:
1. Stop the current process
2. Replace files with new deployment package
3. Run `npm install` to update dependencies
4. Restart the application

---

**Note**: This is a compiled JavaScript application. All TypeScript source code has been transpiled to JavaScript for optimal performance and compatibility with cPanel hosting environments.
