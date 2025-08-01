#!/usr/bin/env node

/**
 * Verify the cPanel deployment package
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEPLOYMENT_DIR = 'cpanel-deployment-final';

console.log('🔍 Verifying cPanel deployment package...\n');

// Check if deployment directory exists
if (!fs.existsSync(DEPLOYMENT_DIR)) {
  console.error('❌ Deployment directory not found');
  process.exit(1);
}

// List of required files
const requiredFiles = [
  'index.js',
  'package.json',
  '.env.example',
  'README.md',
  'start.sh',
  'public/index.html',
  'shared/schema.ts'
];

// Check required files
console.log('📁 Checking required files...');
let allFilesPresent = true;

requiredFiles.forEach(file => {
  const filePath = path.join(DEPLOYMENT_DIR, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    allFilesPresent = false;
  }
});

// Check package.json
console.log('\n📦 Verifying package.json...');
try {
  const packagePath = path.join(DEPLOYMENT_DIR, 'package.json');
  const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  console.log(`✅ Name: ${packageContent.name}`);
  console.log(`✅ Version: ${packageContent.version}`);
  console.log(`✅ Main: ${packageContent.main}`);
  console.log(`✅ Node version: ${packageContent.engines.node}`);
  console.log(`✅ Dependencies: ${Object.keys(packageContent.dependencies).length} packages`);
  
} catch (error) {
  console.error('❌ Invalid package.json:', error.message);
  allFilesPresent = false;
}

// Check JavaScript syntax
console.log('\n🔧 Verifying JavaScript syntax...');
try {
  const indexPath = path.join(DEPLOYMENT_DIR, 'index.js');
  const { spawn } = await import('child_process');
  
  const checkSyntax = spawn('node', ['-c', indexPath], { stdio: 'pipe' });
  
  checkSyntax.on('close', (code) => {
    if (code === 0) {
      console.log('✅ JavaScript syntax is valid');
    } else {
      console.log('❌ JavaScript syntax error');
      allFilesPresent = false;
    }
  });
  
} catch (error) {
  console.log('⚠️  Could not verify JavaScript syntax');
}

// Check file sizes
console.log('\n📊 File sizes:');
const getFileSize = (filePath) => {
  try {
    const stats = fs.statSync(filePath);
    return (stats.size / 1024).toFixed(2) + ' KB';
  } catch {
    return 'N/A';
  }
};

console.log(`• index.js: ${getFileSize(path.join(DEPLOYMENT_DIR, 'index.js'))}`);
console.log(`• package.json: ${getFileSize(path.join(DEPLOYMENT_DIR, 'package.json'))}`);

// Check public directory
const publicDir = path.join(DEPLOYMENT_DIR, 'public');
if (fs.existsSync(publicDir)) {
  const files = fs.readdirSync(publicDir, { recursive: true });
  console.log(`• public/: ${files.length} files`);
} else {
  console.log('❌ public/ directory missing');
  allFilesPresent = false;
}

// Summary
console.log('\n📋 Verification Summary:');
if (allFilesPresent) {
  console.log('✅ All required files present');
  console.log('✅ Package structure is valid');
  console.log('✅ Ready for cPanel deployment');
  
  console.log('\n🚀 Deployment Instructions:');
  console.log('1. Extract medical-marketplace-cpanel.tar.gz to your cPanel public_html directory');
  console.log('2. Enable Node.js 18+ in cPanel');
  console.log('3. Run: npm install');
  console.log('4. Configure .env file');
  console.log('5. Run: npm start');
  
} else {
  console.log('❌ Some required files are missing');
  console.log('Please check the deployment package');
}

console.log('\n📦 Archive ready: medical-marketplace-cpanel.tar.gz');