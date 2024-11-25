import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

async function seedDatabase() {
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'tcora_db',
    user: process.env.DB_USER || 'user',
    password: process.env.DB_PASSWORD || 'password'
  });

  try {
    // Generate password hash
    const plainPassword = 'admin123';
    console.log('Generating hash for password:', plainPassword);
    
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(plainPassword, saltRounds);
    
    console.log('Generated hash:', passwordHash);
    
    // Verify the hash works
    const verifyHash = await bcrypt.compare(plainPassword, passwordHash);
    console.log('Hash verification:', verifyHash);

    // Insert platform admin
    const result = await pool.query(`
      INSERT INTO platform_schema.platform_admins (
        email,
        password_hash,
        first_name,
        last_name
      ) VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) DO UPDATE
      SET password_hash = $2
      RETURNING id, email;
    `, [
      'admin@tcora.com',
      passwordHash,
      'System',
      'Administrator'
    ]);

    console.log('Seeded platform admin:', result.rows[0]);

    // Test the stored hash
    const { rows: [admin] } = await pool.query(
      'SELECT password_hash FROM platform_schema.platform_admins WHERE email = $1',
      ['admin@tcora.com']
    );

    const verifyStored = await bcrypt.compare(plainPassword, admin.password_hash);
    console.log('Stored hash verification:', verifyStored);

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await pool.end();
  }
}

// Run seeder
seedDatabase().catch(console.error);