
import { db } from './db';
import { ehriAccounts } from '@shared/schema';
import { eq } from 'drizzle-orm';

async function approveEhriAccount() {
  try {
    console.log('Approving EHRI account...');
    
    const email = 'Amjadkhabbas200002@gmail.com';
    const ehriId = `ehri_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Check if account already exists
    const existingAccount = await db
      .select()
      .from(ehriAccounts)
      .where(eq(ehriAccounts.email, email))
      .limit(1);
    
    if (existingAccount.length > 0) {
      console.log('✅ EHRI account already exists:', {
        id: existingAccount[0].id,
        ehriId: existingAccount[0].ehriId,
        email: existingAccount[0].email,
        isVerified: existingAccount[0].isVerified,
        linkedAt: existingAccount[0].linkedAt
      });
      
      // Update to verified if not already
      if (!existingAccount[0].isVerified) {
        const [updatedAccount] = await db
          .update(ehriAccounts)
          .set({
            isVerified: true,
            linkedAt: new Date(),
            verificationToken: null
          })
          .where(eq(ehriAccounts.id, existingAccount[0].id))
          .returning();
        
        console.log('✅ Account updated to verified status');
      }
      
      return;
    }
    
    // Create new EHRI account
    const [newAccount] = await db
      .insert(ehriAccounts)
      .values({
        ehriId,
        email,
        isVerified: true,
        linkedAt: new Date(),
        verificationToken: null
      })
      .returning();
    
    console.log('✅ New EHRI account created successfully:', {
      id: newAccount.id,
      ehriId: newAccount.ehriId,
      email: newAccount.email,
      isVerified: newAccount.isVerified,
      linkedAt: newAccount.linkedAt,
      createdAt: newAccount.createdAt
    });
    
    console.log('\n🎉 EHRI account approval complete!');
    console.log(`Email: ${email}`);
    console.log(`EHRI ID: ${ehriId}`);
    console.log('Status: Verified and Active');
    
  } catch (error) {
    console.error('❌ Error approving EHRI account:', error);
  }
}

// Run if called directly
if (require.main === module) {
  approveEhriAccount().then(() => process.exit(0));
}

export { approveEhriAccount };
