// Simple test to check HOA dues in database
// Run this with: node --env-file=.env.local test_hoa.js

const { drizzle } = require('drizzle-orm/node-postgres');
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

async function checkHoaDues() {
    try {
        const result = await pool.query(`
      SELECT 
        id, 
        name, 
        hoa_dues_amount, 
        hoa_dues_frequency, 
        hoa_dues_date, 
        hoa_contact_email 
      FROM communities
    `);

        console.log('\n=== HOA Dues Database Check ===\n');

        for (const row of result.rows) {
            console.log(`Community: ${row.name}`);
            console.log(`  ID: ${row.id}`);
            console.log(`  hoa_dues_amount: "${row.hoa_dues_amount}" (Type: ${typeof row.hoa_dues_amount})`);
            console.log(`  hoa_dues_frequency: "${row.hoa_dues_frequency}"`);
            console.log(`  hoa_dues_date: "${row.hoa_dues_date}"`);
            console.log(`  hoa_contact_email: "${row.hoa_contact_email}"`);
            console.log('---\n');
        }

        await pool.end();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        await pool.end();
        process.exit(1);
    }
}

checkHoaDues();
