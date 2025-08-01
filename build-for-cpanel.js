#!/usr/bin/env node

/**
 * Build script for cPanel deployment
 * Compiles TypeScript to JavaScript and creates a deployment-ready package
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BUILD_DIR = 'cpanel-build';
const COMPILED_DIR = 'dist-compiled';

console.log('🚀 Starting cPanel build process...\n');

// Clean previous builds
console.log('🧹 Cleaning previous builds...');
if (fs.existsSync(BUILD_DIR)) {
  fs.rmSync(BUILD_DIR, { recursive: true, force: true });
}
if (fs.existsSync(COMPILED_DIR)) {
  fs.rmSync(COMPILED_DIR, { recursive: true, force: true });
}

// Compile TypeScript
console.log('📦 Compiling TypeScript files...');
try {
  execSync('npx tsc --project tsconfig.build.json', { stdio: 'inherit' });
  console.log('✅ TypeScript compilation completed\n');
} catch (error) {
  console.error('❌ TypeScript compilation failed:', error.message);
  process.exit(1);
}

// Create build directory structure
console.log('📁 Creating build directory structure...');
fs.mkdirSync(BUILD_DIR, { recursive: true });
fs.mkdirSync(path.join(BUILD_DIR, 'public'), { recursive: true });
fs.mkdirSync(path.join(BUILD_DIR, 'uploads'), { recursive: true });

// Build frontend with Vite
console.log('🏗️  Building frontend with Vite...');
try {
  execSync('npx vite build --outDir ' + path.join(BUILD_DIR, 'public'), { stdio: 'inherit' });
  console.log('✅ Frontend build completed\n');
} catch (error) {
  console.error('❌ Frontend build failed:', error.message);
  process.exit(1);
}

// Copy compiled server files
console.log('📋 Copying compiled server files...');
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

if (fs.existsSync(COMPILED_DIR)) {
  copyRecursive(COMPILED_DIR, BUILD_DIR);
}

// Transform imports in compiled files
console.log('🔧 Transforming imports for Node.js compatibility...');
function transformFile(filePath) {
  if (!filePath.endsWith('.js')) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Transform @shared/* imports to relative paths
  content = content.replace(/require\(['"]@shared\/([^'"]+)['"]\)/g, (match, modulePath) => {
    const relativePath = path.relative(path.dirname(filePath), path.join(BUILD_DIR, 'shared', modulePath));
    return `require('${relativePath}')`;
  });
  
  // Transform import statements to require for remaining ES modules
  content = content.replace(/import\s+(.+?)\s+from\s+['"]([^'"]+)['"];?/g, (match, imports, module) => {
    if (module.startsWith('.') || module.startsWith('@shared')) {
      return match; // Keep relative imports as-is
    }
    
    // Handle default imports
    if (imports.includes('default') || !imports.includes('{')) {
      const cleanImports = imports.replace(/^\s*{\s*default\s*as\s*/, '').replace(/\s*}\s*$/, '').trim();
      return `const ${cleanImports} = require('${module}');`;
    }
    
    // Handle named imports
    return `const ${imports} = require('${module}');`;
  });
  
  fs.writeFileSync(filePath, content);
}

function transformDirectory(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  files.forEach(file => {
    const fullPath = path.join(dir, file.name);
    if (file.isDirectory()) {
      transformDirectory(fullPath);
    } else {
      transformFile(fullPath);
    }
  });
}

transformDirectory(BUILD_DIR);

// Create package.json for deployment
console.log('📄 Creating deployment package.json...');
const originalPackage = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));

const deploymentPackage = {
  name: originalPackage.name || 'medical-marketplace',
  version: originalPackage.version || '1.0.0',
  type: 'commonjs',
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

fs.writeFileSync(path.join(BUILD_DIR, 'package.json'), JSON.stringify(deploymentPackage, null, 2));

// Create environment template
console.log('🌐 Creating environment configuration template...');
const envTemplate = `# Database Configuration
DATABASE_URL=postgresql://username:password@host:port/database
# OR use individual variables:
# DB_HOST=localhost
# DB_PORT=5432
# DB_USER=your_username
# DB_PASSWORD=your_password
# DB_NAME=your_database

# Application Configuration
NODE_ENV=production
PORT=3000
SESSION_SECRET=your_secure_session_secret_here

# Email Configuration (SendGrid)
SENDGRID_API_KEY=your_sendgrid_api_key
FROM_EMAIL=noreply@yourdomain.com

# Stripe Configuration
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
`;

fs.writeFileSync(path.join(BUILD_DIR, '.env.example'), envTemplate);

// Create README for deployment
console.log('📖 Creating deployment README...');
const deploymentReadme = `# Medical Marketplace - cPanel Deployment

This is the compiled JavaScript version of the medical marketplace application, ready for deployment on cPanel hosting.

## Installation Instructions

1. **Upload Files**
   - Upload all files from this directory to your cPanel public_html folder
   - Ensure the uploads/ directory has write permissions (755 or 777)

2. **Install Dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Configure Environment**
   - Copy \`.env.example\` to \`.env\`
   - Update all environment variables with your actual values
   - Ensure your PostgreSQL database is accessible

4. **Database Setup**
   - Import your database schema using the provided SQL files
   - Update DATABASE_URL or individual DB_* variables in .env

5. **Start Application**
   \`\`\`bash
   npm start
   \`\`\`

## File Structure

- \`index.js\` - Main application entry point
- \`public/\` - Static frontend files (HTML, CSS, JS)
- \`uploads/\` - File upload directory (needs write permissions)
- \`shared/\` - Shared schemas and types
- \`server/\` - Compiled server-side code
- \`.env.example\` - Environment variables template

## Environment Variables

All required environment variables are documented in \`.env.example\`. 
Key variables include:
- Database connection details
- Session secret for security
- Email service configuration
- Payment processing keys

## Support

This application requires:
- Node.js 18.0.0 or higher
- PostgreSQL database
- cPanel with Node.js support enabled

## Security Notes

- Change the SESSION_SECRET to a secure random string
- Use strong database credentials
- Keep your .env file secure and never commit it to version control
- Ensure uploads/ directory permissions are properly configured
`;

fs.writeFileSync(path.join(BUILD_DIR, 'README.md'), deploymentReadme);

// Create .gitignore for the build
fs.writeFileSync(path.join(BUILD_DIR, '.gitignore'), `node_modules/
.env
uploads/*.png
uploads/*.jpg
uploads/*.jpeg
uploads/*.gif
logs/
*.log
.DS_Store
Thumbs.db
`);

// Clean up temporary compilation directory
console.log('🧹 Cleaning up temporary files...');
if (fs.existsSync(COMPILED_DIR)) {
  fs.rmSync(COMPILED_DIR, { recursive: true, force: true });
}

console.log('\n✅ Build completed successfully!');
console.log(`📦 Deployment package created in: ${BUILD_DIR}/`);
console.log('\n📋 Next steps:');
console.log('1. Upload all files from ' + BUILD_DIR + '/ to your cPanel public_html directory');
console.log('2. Run "npm install" in your cPanel terminal');
console.log('3. Configure your .env file with proper database and service credentials');
console.log('4. Start your application with "npm start"');
console.log('\n🎉 Your TypeScript application is now ready for cPanel deployment!');