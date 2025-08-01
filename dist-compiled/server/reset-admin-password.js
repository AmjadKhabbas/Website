"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetAdminPassword = resetAdminPassword;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const storage_1 = require("./storage");
async function resetAdminPassword() {
    try {
        console.log('Resetting admin password...');
        const adminEmail = 'amjadkhabbas2002@gmail.com';
        const newPassword = 'akramsnotcool!';
        // Find the admin user
        const admin = await storage_1.storage.getAdminByEmail(adminEmail);
        if (!admin) {
            console.log('❌ Admin user not found. Creating new admin user...');
            // Hash the password with bcrypt
            const saltRounds = 12;
            const passwordHash = await bcryptjs_1.default.hash(newPassword, saltRounds);
            // Create new admin user
            const newAdmin = await storage_1.storage.createAdminUser({
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
        }
        else {
            console.log('✅ Admin user found:', {
                id: admin.id,
                email: admin.email,
                name: admin.name,
                role: admin.role
            });
            // Hash the new password
            const saltRounds = 12;
            const passwordHash = await bcryptjs_1.default.hash(newPassword, saltRounds);
            // Update password in database using direct DB query
            const { db } = await Promise.resolve().then(() => __importStar(require('./db')));
            const { adminUsers } = await Promise.resolve().then(() => __importStar(require('@shared/schema')));
            const { eq } = await Promise.resolve().then(() => __importStar(require('drizzle-orm')));
            await db
                .update(adminUsers)
                .set({ passwordHash })
                .where(eq(adminUsers.id, admin.id));
            console.log('✅ Admin password updated successfully');
        }
        // Verify the password works
        console.log('\nTesting password verification...');
        const testAdmin = await storage_1.storage.getAdminByEmail(adminEmail);
        if (testAdmin) {
            const isValid = await bcryptjs_1.default.compare(newPassword, testAdmin.passwordHash);
            console.log('Password verification test:', isValid ? '✅ VALID' : '❌ INVALID');
            if (isValid) {
                console.log('\n🎉 Admin password reset successful!');
                console.log('You can now login with:');
                console.log(`Email: ${adminEmail}`);
                console.log(`Password: ${newPassword}`);
            }
        }
    }
    catch (error) {
        console.error('❌ Error resetting admin password:', error);
    }
}
// Run if called directly
if (require.main === module) {
    resetAdminPassword().then(() => process.exit(0));
}
//# sourceMappingURL=reset-admin-password.js.map