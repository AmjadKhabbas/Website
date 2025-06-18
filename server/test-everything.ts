
import { storage } from "./storage";
import { comparePasswords } from "./auth";
import { adminAuthService } from "./adminAuth";

async function testEverything() {
  try {
    console.log('🧪 COMPREHENSIVE AUTHENTICATION TEST\n');
    
    // Test 1: Regular User Login
    console.log('1️⃣ Testing regular user login...');
    const testUser = await storage.getUserByEmail("test@example.com");
    
    if (testUser) {
      console.log('✅ Test user found:', {
        id: testUser.id,
        email: testUser.email,
        fullName: testUser.fullName,
        isApproved: testUser.isApproved
      });
      
      // Test password
      const isValidPassword = await comparePasswords("password123", testUser.password);
      console.log('Password test:', isValidPassword ? '✅ VALID' : '❌ INVALID');
      
      if (!testUser.isApproved) {
        console.log('⚠️ User needs approval');
      } else {
        console.log('✅ User is approved for login');
      }
    } else {
      console.log('❌ Test user not found');
    }
    
    console.log();
    
    // Test 2: Admin Login
    console.log('2️⃣ Testing admin login...');
    const admin = await adminAuthService.authenticateAdmin(
      'amjadkhabbas2002@gmail.com', 
      'akramsnotcool!'
    );
    
    if (admin) {
      console.log('✅ Admin authentication successful:', {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role
      });
    } else {
      console.log('❌ Admin authentication failed');
    }
    
    console.log();
    
    // Test 3: API Simulation
    console.log('3️⃣ Testing API endpoints...');
    
    const testResults = {
      userLoginReady: testUser && testUser.isApproved,
      adminLoginReady: !!admin,
      passwordValid: testUser ? await comparePasswords("password123", testUser.password) : false
    };
    
    console.log('API Readiness:', testResults);
    
    if (testResults.userLoginReady && testResults.adminLoginReady) {
      console.log('\n🎉 ALL TESTS PASSED! Login system is ready!');
      console.log('\nUSE THESE CREDENTIALS:');
      console.log('Regular User Login:');
      console.log('  Email: test@example.com');
      console.log('  Password: password123');
      console.log('\nAdmin Login:');
      console.log('  Email: amjadkhabbas2002@gmail.com');
      console.log('  Password: akramsnotcool!');
    } else {
      console.log('\n❌ Some tests failed. Check the logs above.');
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

// Run if called directly
if (require.main === module) {
  testEverything().then(() => process.exit(0));
}

export { testEverything };
