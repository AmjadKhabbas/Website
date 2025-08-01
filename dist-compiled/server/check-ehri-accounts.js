"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkEhriAccounts = checkEhriAccounts;
const db_1 = require("./db");
const schema_1 = require("@shared/schema");
async function checkEhriAccounts() {
    try {
        console.log('Checking EHRI accounts in database...\n');
        const accounts = await db_1.db
            .select()
            .from(schema_1.ehriAccounts)
            .orderBy(schema_1.ehriAccounts.createdAt);
        if (accounts.length === 0) {
            console.log('No EHRI accounts found in database.');
            return;
        }
        console.log(`Found ${accounts.length} EHRI account(s):\n`);
        accounts.forEach((account, index) => {
            console.log(`${index + 1}. EHRI Account:`);
            console.log(`   ID: ${account.id}`);
            console.log(`   EHRI ID: ${account.ehriId}`);
            console.log(`   Email: ${account.email}`);
            console.log(`   Verified: ${account.isVerified ? '✅ Yes' : '❌ No'}`);
            console.log(`   Linked At: ${account.linkedAt || 'Not linked'}`);
            console.log(`   Created At: ${account.createdAt}`);
            console.log(`   Verification Token: ${account.verificationToken || 'None'}`);
            console.log('');
        });
        // Check specifically for the requested email
        const targetAccount = accounts.find(acc => acc.email === 'Amjadkhabbas200002@gmail.com');
        if (targetAccount) {
            console.log('🎯 Target account found and approved:');
            console.log(`   Email: ${targetAccount.email}`);
            console.log(`   Status: ${targetAccount.isVerified ? 'Verified ✅' : 'Pending ⏳'}`);
        }
        else {
            console.log('❌ Target account (Amjadkhabbas200002@gmail.com) not found');
        }
    }
    catch (error) {
        console.error('❌ Error checking EHRI accounts:', error);
    }
}
// Run if called directly
if (require.main === module) {
    checkEhriAccounts().then(() => process.exit(0));
}
//# sourceMappingURL=check-ehri-accounts.js.map