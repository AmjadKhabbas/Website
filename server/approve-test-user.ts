
import { storage } from "./storage";

async function approveTestUser() {
  try {
    const user = await storage.getUserByEmail("testdoctor@example.com");
    
    if (!user) {
      console.log("❌ Test user does not exist. Run create-test-user.ts first.");
      return;
    }
    
    if (user.isApproved) {
      console.log("✅ Test user is already approved");
      return;
    }
    
    console.log("Approving test user...");
    const approvedUser = await storage.approveUser(user.id, "system-auto-approval");
    
    if (approvedUser) {
      console.log("✅ Test user approved successfully:", {
        id: approvedUser.id,
        email: approvedUser.email,
        fullName: approvedUser.fullName,
        isApproved: approvedUser.isApproved
      });
    }
    
  } catch (error) {
    console.error("❌ Error approving test user:", error);
  }
}

// Run if called directly
if (require.main === module) {
  approveTestUser().then(() => process.exit(0));
}

export { approveTestUser };
