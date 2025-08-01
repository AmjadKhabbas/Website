
import { storage } from "./storage";

async function checkAllUsers() {
  try {
    console.log("Checking all users in database...");
    
    // Get a test user to see if any exist
    const testUser = await storage.getUserByEmail("testdoctor@example.com");
    if (testUser) {
      console.log("Test user exists:", {
        id: testUser.id,
        email: testUser.email,
        fullName: testUser.fullName,
        isApproved: testUser.isApproved,
        licenseNumber: testUser.licenseNumber
      });
    }
    
    // Check pending users
    const pendingUsers = await storage.getPendingUsers();
    console.log("Pending users count:", pendingUsers.length);
    
    if (pendingUsers.length > 0) {
      console.log("Pending users:");
      pendingUsers.forEach(user => {
        console.log(`- ${user.email} (${user.fullName}) - Approved: ${user.isApproved}`);
      });
    }
    
  } catch (error) {
    console.error("Error checking users:", error);
  }
}

// Run if called directly
if (require.main === module) {
  checkAllUsers().then(() => process.exit(0));
}

export { checkAllUsers };
