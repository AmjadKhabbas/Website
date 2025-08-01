"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTestUser = createTestUser;
const storage_1 = require("./storage");
const auth_1 = require("./auth");
async function createTestUser() {
    try {
        // Check if test user already exists
        const existingUser = await storage_1.storage.getUserByEmail("testdoctor@example.com");
        if (existingUser) {
            console.log("Test user already exists:");
            console.log("Email: testdoctor@example.com");
            console.log("Password: TestPassword123!");
            return;
        }
        // Create test user
        const hashedPassword = await (0, auth_1.hashPassword)("TestPassword123!");
        const testUser = await storage_1.storage.createUser({
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
    }
    catch (error) {
        console.error("Error creating test user:", error);
    }
}
// Run if called directly
if (require.main === module) {
    createTestUser().then(() => process.exit(0));
}
//# sourceMappingURL=create-test-user.js.map