"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testLogin = testLogin;
const storage_1 = require("./storage");
const auth_1 = require("./auth");
async function testLogin() {
    try {
        console.log("Testing login functionality...");
        // Test if user exists
        const user = await storage_1.storage.getUserByEmail("testdoctor@example.com");
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
        const isValidPassword = await (0, auth_1.comparePasswords)(testPassword, user.password);
        console.log("Password test result:", isValidPassword ? "✅ VALID" : "❌ INVALID");
        if (!user.isApproved) {
            console.log("⚠️  User is not approved for login");
        }
    }
    catch (error) {
        console.error("❌ Login test error:", error);
    }
}
// Run if called directly
if (require.main === module) {
    testLogin().then(() => process.exit(0));
}
//# sourceMappingURL=test-login.js.map