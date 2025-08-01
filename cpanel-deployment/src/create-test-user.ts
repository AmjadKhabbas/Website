
import { storage } from "./storage";
import { hashPassword } from "./auth";

async function createTestUser() {
  try {
    // Check if test user already exists
    const existingUser = await storage.getUserByEmail("testdoctor@example.com");
    
    if (existingUser) {
      console.log("Test user already exists:");
      console.log("Email: testdoctor@example.com");
      console.log("Password: TestPassword123!");
      return;
    }

    // Create test user
    const hashedPassword = await hashPassword("TestPassword123!");
    
    const testUser = await storage.createUser({
      email: "testdoctor@example.com",
      password: hashedPassword,
      fullName: "Dr. Test User",
      licenseNumber: "TEST123456",
      collegeName: "Test Medical College",
      provinceState: "CA",
      practiceName: "Test Medical Practice",
      practiceAddress: "123 Test Street, Test City, CA 12345",
      isApproved: true, // Pre-approved for testing
      isLicenseVerified: true
    });

    console.log("Test user created successfully:");
    console.log("Email: testdoctor@example.com");
    console.log("Password: TestPassword123!");
    console.log("User ID:", testUser.id);
    
  } catch (error) {
    console.error("Error creating test user:", error);
  }
}

// Run if called directly
if (require.main === module) {
  createTestUser().then(() => process.exit(0));
}

export { createTestUser };
