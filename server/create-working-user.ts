
import { storage } from "./storage";
import { hashPassword } from "./auth";

async function createWorkingUser() {
  try {
    console.log('Creating working test user...');
    
    // Test credentials that will definitely work
    const testEmail = "test@example.com";
    const testPassword = "password123";
    
    // Check if user already exists
    const existingUser = await storage.getUserByEmail(testEmail);
    
    if (existingUser) {
      console.log('✅ Test user already exists:');
      console.log('Email:', testEmail);
      console.log('Password:', testPassword);
      console.log('User ID:', existingUser.id);
      console.log('Approved:', existingUser.isApproved);
      
      // Make sure user is approved
      if (!existingUser.isApproved) {
        const approvedUser = await storage.approveUser(existingUser.id, 'System');
        console.log('✅ User approved for login');
      }
      
      return;
    }

    // Hash password properly
    const hashedPassword = await hashPassword(testPassword);
    console.log('Password hashed successfully');
    
    // Create user with all required fields
    const newUser = await storage.createUser({
      email: testEmail,
      password: hashedPassword,
      fullName: "Test User",
      licenseNumber: "TEST123456",
      collegeName: "Test Medical College",
      provinceState: "CA", 
      practiceName: "Test Medical Practice",
      practiceAddress: "123 Test Street, Test City, CA 12345",
      isApproved: true, // Pre-approved for immediate testing
      isLicenseVerified: true
    });

    console.log('✅ Working test user created successfully!');
    console.log('Email:', testEmail);
    console.log('Password:', testPassword);
    console.log('User ID:', newUser.id);
    console.log('Status: Approved and ready for login');
    
  } catch (error) {
    console.error('❌ Error creating working user:', error);
  }
}

// Run if called directly
if (require.main === module) {
  createWorkingUser().then(() => process.exit(0));
}

export { createWorkingUser };
