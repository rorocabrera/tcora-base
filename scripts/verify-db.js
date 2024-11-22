const { Pool } = require('pg');

const pool = new Pool({
  user: 'user',
  host: 'localhost',
  database: 'tcora_db',
  password: 'password',
  port: 5432,
});

async function verifyDatabase() {
  const client = await pool.connect();
  try {
    console.log('🔍 Starting database verification...\n');

    // Check UUID extension
    const extensionResult = await client.query(
      "SELECT * FROM pg_extension WHERE extname = 'uuid-ossp'"
    );
    console.log('UUID Extension:', extensionResult.rows.length > 0 ? '✅ Installed' : '❌ Missing');

    // Check tables
    const tables = ['tenants', 'users'];
    for (const table of tables) {
      const tableResult = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        )
      `, [table]);
      console.log(`${table} table:`, tableResult.rows[0].exists ? '✅ Exists' : '❌ Missing');
    }

    // Check indexes
    const indexes = [
      'idx_tenants_domain',
      'idx_users_tenant_email',
      'idx_users_tenant_role'
    ];
    for (const index of indexes) {
      const indexResult = await client.query(`
        SELECT EXISTS (
          SELECT FROM pg_indexes 
          WHERE schemaname = 'public' 
          AND indexname = $1
        )
      `, [index]);
      console.log(`${index}:`, indexResult.rows[0].exists ? '✅ Exists' : '❌ Missing');
    }

    // Check admin tenant
    const tenantResult = await client.query(
      "SELECT * FROM tenants WHERE domain = 'admin.localhost'"
    );
    console.log('Admin tenant:', tenantResult.rows.length > 0 ? '✅ Exists' : '❌ Missing');

    // Check triggers
    const triggers = [
      'update_tenant_updated_at',
      'update_user_updated_at'
    ];
    for (const trigger of triggers) {
      const triggerResult = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.triggers 
          WHERE trigger_name = $1
        )
      `, [trigger]);
      console.log(`${trigger}:`, triggerResult.rows[0].exists ? '✅ Exists' : '❌ Missing');
    }

  } catch (err) {
    console.error('Error during verification:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

verifyDatabase();