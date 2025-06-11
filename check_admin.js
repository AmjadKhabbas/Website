
const { Pool } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');

async function checkAdminData() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    // Check if admin_users table exists and has data
    const result = await pool.query('SELECT * FROM admin_users');
    console.log('Admin users in database:', result.rows);
    
    // Check if the specific admin exists
    const adminCheck = await pool.query('SELECT * FROM admin_users WHERE email = $1', ['amjadkhabbas2002@gmail.com']);
    console.log('Specific admin check:', adminCheck.rows);
    
    if (adminCheck.rows.length > 0) {
      const admin = adminCheck.rows[0];
      console.log('Admin found:', {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        isActive: admin.is_active,
        hasPasswordHash: !!admin.password_hash,
        passwordHashLength: admin.password_hash ? admin.password_hash.length : 0
      });
      
      // Test password verification
      const testPassword = 'akramsnotcool!';
      const isValid = await bcrypt.compare(testPassword, admin.password_hash);
      console.log('Password verification test:', isValid);
    }
    
  } catch (error) {
    console.error('Database check error:', error);
  } finally {
    await pool.end();
  }
}

checkAdminData();
