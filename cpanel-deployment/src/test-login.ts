
import { storage } from "./storage";
import { comparePasswords } from "./auth";

async function testLogin() {
  try {
    console.log("Testing login functionality...");
    
    // Test if user exists
    const user = await storage.getUserByEmail("testdoctor@example.com");
    if (!user) {
      console.log("❌ Test user does not exist");
      return;
    }
    
    console.log("✅ Test user found:", {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      isApproved: user.isApproved,
      isLicenseVerified: user.isLicenseVerified
    });
    
    // Test password comparison
    const testPassword = "TestPassword123!";
    const isValidPassword = await comparePasswords(testPassword, user.password);
    
    console.log("Password test result:", isValidPassword ? "✅ VALID" : "❌ INVALID");
    
    if (!user.isApproved) {
      console.log("⚠️  User is not approved for login");
    }
    
  } catch (error) {
    console.error("❌ Login test error:", error);
  }
}

// Run if called directly
if (require.main === module) {
  testLogin().then(() => process.exit(0));
}

export { testLogin };
