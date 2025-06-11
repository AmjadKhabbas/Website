
import bcrypt from 'bcryptjs';
import { storage } from './storage';

async function resetAdminPassword() {
  try {
    console.log('Resetting admin password...');
    
    const adminEmail = 'amjadkhabbas2002@gmail.com';
    const newPassword = 'akramsnotcool!';
    
    // Find the admin user
    const admin = await storage.getAdminByEmail(adminEmail);
    
    if (!admin) {
      console.log('❌ Admin user not found. Creating new admin user...');
      
      // Hash the password with bcrypt
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(newPassword, saltRounds);
      
      // Create new admin user
      const newAdmin = await storage.createAdminUser({
        email: adminEmail,
        passwordHash,
        name: 'Amjad Khabbas',
        role: 'admin',
        isActive: true
      });
      
      console.log('✅ New admin user created:', {
        id: newAdmin.id,
        email: newAdmin.email,
        name: newAdmin.name,
        role: newAdmin.role
      });
    } else {
      console.log('✅ Admin user found:', {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role
      });
      
      // Hash the new password
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(newPassword, saltRounds);
      
      // Update password in database using direct DB query
      const { db } = await import('./db');
      const { adminUsers } = await import('@shared/schema');
      const { eq } = await import('drizzle-orm');
      
      await db
        .update(adminUsers)
        .set({ passwordHash })
        .where(eq(adminUsers.id, admin.id));
      
      console.log('✅ Admin password updated successfully');
    }
    
    // Verify the password works
    console.log('\nTesting password verification...');
    const testAdmin = await storage.getAdminByEmail(adminEmail);
    
    if (testAdmin) {
      const isValid = await bcrypt.compare(newPassword, testAdmin.passwordHash);
      console.log('Password verification test:', isValid ? '✅ VALID' : '❌ INVALID');
      
      if (isValid) {
        console.log('\n🎉 Admin password reset successful!');
        console.log('You can now login with:');
        console.log(`Email: ${adminEmail}`);
        console.log(`Password: ${newPassword}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error resetting admin password:', error);
  }
}

// Run if called directly
if (require.main === module) {
  resetAdminPassword().then(() => process.exit(0));
}

export { resetAdminPassword };
