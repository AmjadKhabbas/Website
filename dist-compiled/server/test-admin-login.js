"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testAdminLogin = testAdminLogin;
const adminAuth_1 = require("./adminAuth");
async function testAdminLogin() {
    try {
        console.log('🧪 Testing Admin Login Flow...\n');
        const testEmail = 'amjadkhabbas2002@gmail.com';
        const testPassword = 'akramsnotcool!';
        // Test 1: Database Authentication
        console.log('1️⃣ Testing database authentication...');
        const admin = await adminAuth_1.adminAuthService.authenticateAdmin(testEmail, testPassword);
        if (admin) {
            console.log('✅ Database authentication successful!');
            console.log('Admin details:', {
                id: admin.id,
                email: admin.email,
                name: admin.name,
                role: admin.role,
                isActive: admin.isActive
            });
        }
        else {
            console.log('❌ Database authentication failed!');
            return;
        }
        // Test 2: Admin Verification
        console.log('\n2️⃣ Testing admin verification...');
        const verifiedAdmin = await adminAuth_1.adminAuthService.verifyAdmin(admin.id);
        if (verifiedAdmin) {
            console.log('✅ Admin verification successful!');
        }
        else {
            console.log('❌ Admin verification failed!');
            return;
        }
        // Test 3: Simulate Login API Call
        console.log('\n3️⃣ Testing login API simulation...');
        try {
            const loginResponse = await fetch('http://localhost:5000/api/admin/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: testEmail,
                    password: testPassword
                }),
            });
            const responseData = await loginResponse.json();
            if (loginResponse.ok) {
                console.log('✅ Login API test successful!');
                console.log('Response:', responseData);
            }
            else {
                console.log('❌ Login API test failed!');
                console.log('Status:', loginResponse.status);
                console.log('Response:', responseData);
            }
        }
        catch (fetchError) {
            console.log('⚠️ Could not test login API (server may not be running)');
            console.log('Error:', fetchError.message);
        }
        console.log('\n🎉 Admin login testing complete!');
        console.log('\nTo test manually:');
        console.log('1. Go to /admin/login');
        console.log(`2. Use email: ${testEmail}`);
        console.log(`3. Use password: ${testPassword}`);
    }
    catch (error) {
        console.error('❌ Admin login test error:', error);
    }
}
// Run if called directly
if (require.main === module) {
    testAdminLogin().then(() => process.exit(0));
}
//# sourceMappingURL=test-admin-login.js.map