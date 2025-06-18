
import bcrypt from 'bcryptjs';
import { db } from './db';
import { adminUsers } from '@shared/schema';
import { eq } from 'drizzle-orm';

async function fixAdminAuth() {
  try {
    console.log('🔧 Fixing admin authentication...');
    
    const adminEmail = 'amjadkhabbas2002@gmail.com';
    const adminPassword = 'akramsnotcool!';
    
    // Generate a fresh password hash
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(adminPassword, saltRounds);
    
    console.log('Generated new password hash');
    
    // Check if admin exists
    const existingAdmin = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.email, adminEmail))
      .limit(1);
    
    if (existingAdmin.length > 0) {
      // Update existing admin
      await db
        .update(adminUsers)
        .set({
          passwordHash,
          isActive: true,
          lastLoginAt: null
        })
        .where(eq(adminUsers.email, adminEmail));
      
      console.log('✅ Admin password updated successfully');
    } else {
      // Create new admin
      await db
        .insert(adminUsers)
        .values({
          email: adminEmail,
          passwordHash,
          name: 'Amjad Khabbas',
          role: 'admin',
          isActive: true
        });
      
      console.log('✅ New admin created successfully');
    }
    
    // Test the password immediately
    console.log('🧪 Testing password verification...');
    const isValid = await bcrypt.compare(adminPassword, passwordHash);
    console.log('Password test result:', isValid ? '✅ VALID' : '❌ INVALID');
    
    console.log('\n🎉 Admin authentication fixed!');
    console.log('Email:', adminEmail);
    console.log('Password:', adminPassword);
    
  } catch (error) {
    console.error('❌ Error fixing admin auth:', error);
  }
}

// Run if called directly
if (require.main === module) {
  fixAdminAuth().then(() => process.exit(0));
}

export { fixAdminAuth };
