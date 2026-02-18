// Check specific community
// Run this with: node --env-file=.env.local test_specific_community.js

const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function checkCommunity() {
    try {
        const communityId = '2bf6bc8a-899c-4e29-8ee7-f2038c804260';

        console.log(`\nChecking community: ${communityId}\n`);

        const result = await pool.query(`
      SELECT 
        id, 
        name, 
        hoa_dues_amount, 
        hoa_dues_frequency, 
        hoa_dues_date, 
        hoa_contact_email 
      FROM communities
      WHERE id = $1
    `, [communityId]);

        if (result.rows.length === 0) {
            console.log('❌ Community NOT FOUND in database!');
        } else {
            const row = result.rows[0];
            console.log('✅ Community found:');
            console.log(`  Name: ${row.name}`);
            console.log(`  hoa_dues_amount: "${row.hoa_dues_amount}" (Type: ${typeof row.hoa_dues_amount})`);
            console.log(`  hoa_dues_frequency: "${row.hoa_dues_frequency}"`);
            console.log(`  hoa_dues_date: "${row.hoa_dues_date}"`);
            console.log(`  hoa_contact_email: "${row.hoa_contact_email}"`);
        }

        await pool.end();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        await pool.end();
        process.exit(1);
    }
}

checkCommunity();
