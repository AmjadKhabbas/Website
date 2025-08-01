#!/usr/bin/env node

/**
 * Create a complete cPanel deployment package from built files
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEPLOYMENT_DIR = 'cpanel-deployment-final';

console.log('🚀 Creating cPanel deployment package...\n');

// Clean previous deployment
if (fs.existsSync(DEPLOYMENT_DIR)) {
  fs.rmSync(DEPLOYMENT_DIR, { recursive: true, force: true });
}

// Create deployment directory structure
fs.mkdirSync(DEPLOYMENT_DIR, { recursive: true });
fs.mkdirSync(path.join(DEPLOYMENT_DIR, 'public'), { recursive: true });
fs.mkdirSync(path.join(DEPLOYMENT_DIR, 'uploads'), { recursive: true });

console.log('📁 Creating directory structure...');

// Copy built server file
console.log('📋 Copying compiled server...');
if (fs.existsSync('dist/index.js')) {
  fs.copyFileSync('dist/index.js', path.join(DEPLOYMENT_DIR, 'index.js'));
}

// Copy built frontend
console.log('📋 Copying frontend build...');
function copyRecursive(src, dest) {
  const stats = fs.statSync(src);
  if (stats.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    const files = fs.readdirSync(src);
    files.forEach(file => {
      copyRecursive(path.join(src, file), path.join(dest, file));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

if (fs.existsSync('dist/public')) {
  copyRecursive('dist/public', path.join(DEPLOYMENT_DIR, 'public'));
}

// Copy shared schema files (needed for server)
console.log('📋 Copying shared files...');
if (fs.existsSync('shared')) {
  copyRecursive('shared', path.join(DEPLOYMENT_DIR, 'shared'));
}

// Read original package.json to get dependencies
const originalPackage = JSON.parse(fs.readFileSync('package.json', 'utf8'));

// Create deployment package.json
console.log('📄 Creating deployment package.json...');
const deploymentPackage = {
  name: originalPackage.name || 'medical-marketplace',
  version: originalPackage.version || '1.0.0',
  type: 'module',
  description: 'Medical marketplace for healthcare professionals',
  main: 'index.js',
  scripts: {
    start: 'node index.js',
    dev: 'NODE_ENV=development node index.js'
  },
  engines: {
    node: '>=18.0.0'
  },
  dependencies: {
    // Core server dependencies
    express: originalPackage.dependencies.express,
    'express-session': originalPackage.dependencies['express-session'],
    'connect-pg-simple': originalPackage.dependencies['connect-pg-simple'],
    bcryptjs: originalPackage.dependencies.bcryptjs,
    
    // Database
    'drizzle-orm': originalPackage.dependencies['drizzle-orm'],
    postgres: originalPackage.dependencies.postgres,
    'drizzle-zod': originalPackage.dependencies['drizzle-zod'],
    zod: originalPackage.dependencies.zod,
    'zod-validation-error': originalPackage.dependencies['zod-validation-error'],
    
    // Authentication
    passport: originalPackage.dependencies.passport,
    'passport-local': originalPackage.dependencies['passport-local'],
    'openid-client': originalPackage.dependencies['openid-client'],
    
    // File upload
    multer: originalPackage.dependencies.multer,
    
    // Email
    '@sendgrid/mail': originalPackage.dependencies['@sendgrid/mail'],
    nodemailer: originalPackage.dependencies.nodemailer,
    
    // Payment
    stripe: originalPackage.dependencies.stripe,
    
    // Utilities
    'date-fns': originalPackage.dependencies['date-fns'],
    memoizee: originalPackage.dependencies.memoizee,
    memorystore: originalPackage.dependencies.memorystore
  }
};

fs.writeFileSync(path.join(DEPLOYMENT_DIR, 'package.json'), JSON.stringify(deploymentPackage, null, 2));

// Create environment template
console.log('🌐 Creating environment configuration...');
const envTemplate = `# Database Configuration (PostgreSQL)
DATABASE_URL=postgresql://username:password@host:port/database

# Application Configuration
NODE_ENV=production
PORT=3000
SESSION_SECRET=your_secure_session_secret_here_change_this

# Email Configuration (SendGrid)
SENDGRID_API_KEY=your_sendgrid_api_key
FROM_EMAIL=noreply@yourdomain.com

# Stripe Payment Configuration
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...

# Replit OAuth (optional)
REPLIT_APP_ID=your_replit_app_id
REPLIT_APP_SECRET=your_replit_app_secret

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
`;

fs.writeFileSync(path.join(DEPLOYMENT_DIR, '.env.example'), envTemplate);

// Create deployment README
console.log('📖 Creating deployment README...');
const readmeContent = `# Medical Marketplace - cPanel Deployment Package

This is a production-ready JavaScript application compiled from TypeScript, optimized for cPanel hosting environments.

## 🚀 Quick Setup

### 1. Upload Files
- Upload all files from this directory to your cPanel \`public_html\` folder
- Ensure Node.js is enabled in your cPanel hosting

### 2. Install Dependencies
\`\`\`bash
npm install
\`\`\`

### 3. Configure Environment
\`\`\`bash
cp .env.example .env
nano .env
\`\`\`

Update the environment variables with your actual values:
- **Database**: PostgreSQL connection details
- **Session Secret**: Generate a secure random string
- **Email**: SendGrid API key for notifications
- **Payments**: Stripe keys for payment processing

### 4. Set Permissions
\`\`\`bash
chmod 755 uploads/
chmod 644 index.js
\`\`\`

### 5. Start Application
\`\`\`bash
npm start
\`\`\`

## 📁 File Structure

\`\`\`
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
\`\`\`

## 🔧 Requirements

- **Node.js**: Version 18.0.0 or higher
- **Database**: PostgreSQL (local or remote)
- **cPanel**: With Node.js app support enabled
- **Memory**: At least 512MB RAM recommended

## 🗄️ Database Setup

1. Create a PostgreSQL database in your hosting control panel
2. Import your database schema (contact administrator for SQL files)
3. Update the \`DATABASE_URL\` in your \`.env\` file

## 🔒 Security Configuration

### Session Secret
Generate a secure session secret:
\`\`\`bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
\`\`\`

### File Permissions
- \`uploads/\` directory: 755 (writable)
- \`.env\` file: 600 (secure)
- Application files: 644 (readable)

## 🌐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| \`DATABASE_URL\` | PostgreSQL connection string | Yes |
| \`SESSION_SECRET\` | Secure random string for sessions | Yes |
| \`PORT\` | Server port (usually 3000) | Yes |
| \`NODE_ENV\` | Set to \`production\` | Yes |
| \`SENDGRID_API_KEY\` | Email service API key | No |
| \`STRIPE_SECRET_KEY\` | Payment processing | No |

## 🚨 Troubleshooting

### Common Issues

**Application won't start:**
- Check Node.js version: \`node --version\`
- Verify environment variables in \`.env\`
- Check database connectivity

**Database connection failed:**
- Verify PostgreSQL credentials
- Ensure database server is accessible
- Check firewall settings

**File upload not working:**
- Verify \`uploads/\` directory permissions
- Check available disk space
- Review file size limits

### Log Files
Application logs can be viewed with:
\`\`\`bash
pm2 logs  # If using PM2
# or check cPanel error logs
\`\`\`

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
3. Run \`npm install\` to update dependencies
4. Restart the application

---

**Note**: This is a compiled JavaScript application. All TypeScript source code has been transpiled to JavaScript for optimal performance and compatibility with cPanel hosting environments.
`;

fs.writeFileSync(path.join(DEPLOYMENT_DIR, 'README.md'), readmeContent);

// Create .gitignore
fs.writeFileSync(path.join(DEPLOYMENT_DIR, '.gitignore'), `node_modules/
.env
uploads/*.png
uploads/*.jpg
uploads/*.jpeg
uploads/*.gif
uploads/*.pdf
logs/
*.log
.DS_Store
Thumbs.db
npm-debug.log*
`);

// Create a start script for easier deployment
console.log('⚙️  Creating start script...');
const startScript = `#!/bin/bash

# cPanel deployment start script
echo "🚀 Starting Medical Marketplace Application..."

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ in cPanel."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version must be 18 or higher. Current version: $(node --version)"
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Creating from template..."
    cp .env.example .env
    echo "📝 Please edit .env file with your configuration before starting."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Create uploads directory if it doesn't exist
if [ ! -d "uploads" ]; then
    mkdir -p uploads
    chmod 755 uploads
fi

# Start the application
echo "✅ Starting application..."
npm start
`;

fs.writeFileSync(path.join(DEPLOYMENT_DIR, 'start.sh'), startScript);
fs.chmodSync(path.join(DEPLOYMENT_DIR, 'start.sh'), '755');

console.log('\n✅ cPanel deployment package created successfully!');
console.log(`📦 Package location: ${DEPLOYMENT_DIR}/`);
console.log('\n📋 Deployment Instructions:');
console.log('1. Upload all files to your cPanel public_html directory');
console.log('2. Enable Node.js in cPanel (version 18+)');
console.log('3. Run: npm install');
console.log('4. Configure .env file with your database and service credentials');
console.log('5. Run: chmod +x start.sh && ./start.sh');
console.log('\n🎉 Your TypeScript application is ready for cPanel deployment!');

// Create deployment summary
const summaryContent = `# Deployment Summary

**Package Created**: ${new Date().toISOString()}
**Source**: TypeScript compiled to JavaScript using esbuild
**Target**: cPanel with Node.js support

## Included Files
- ✅ Compiled server code (index.js)
- ✅ Built frontend (public/ directory)
- ✅ Shared schemas and types
- ✅ Production package.json
- ✅ Environment template
- ✅ Deployment documentation
- ✅ Startup script

## Dependencies Included
- Express.js server framework
- PostgreSQL database integration
- Authentication system
- File upload functionality
- Email notifications
- Payment processing
- All necessary utilities

## Next Steps
1. Upload to cPanel
2. Configure environment variables
3. Install dependencies
4. Start application

## Technical Notes
- Source TypeScript compiled with esbuild
- ES modules format for modern Node.js
- All Replit-specific dependencies removed
- Optimized for production hosting
`;

fs.writeFileSync(path.join(DEPLOYMENT_DIR, 'DEPLOYMENT_SUMMARY.md'), summaryContent);