const { Pool } = require('pg');

async function testDatabaseConnection() {
    const pool = new Pool({
        host: 'localhost',
        port: 5432,
        user: 'postgres',
        password: '0H4N4VNG',
        database: 'gestao_requisicoes_db'
    });

    try {
        console.log('🔍 Testing database connection...');
        const result = await pool.query('SELECT COUNT(*) as count FROM "user"');
        console.log(`✅ Database connected! Found ${result.rows[0].count} users`);
        
        // Test a few users
        const users = await pool.query('SELECT username, role FROM "user" LIMIT 5');
        console.log('📋 Sample users:');
        console.table(users.rows);
        
        await pool.end();
        return true;
    } catch (error) {
        console.log(`❌ Database connection failed: ${error.message}`);
        return false;
    }
}

testDatabaseConnection();