// Test updating HOA dues
// Run this with: node --env-file=.env.local test_update_hoa.js

const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function testUpdate() {
    try {
        // First, get the community ID
        const communities = await pool.query('SELECT id, name FROM communities LIMIT 1');

        if (communities.rows.length === 0) {
            console.log('No communities found');
            await pool.end();
            return;
        }

        const communityId = communities.rows[0].id;
        const communityName = communities.rows[0].name;

        console.log(`\nTesting HOA dues update for: ${communityName} (${communityId})\n`);

        // Test update with a decimal value
        const testAmount = '250.00';

        console.log(`Updating hoa_dues_amount to: "${testAmount}"`);

        await pool.query(`
      UPDATE communities 
      SET hoa_dues_amount = $1,
          hoa_dues_frequency = $2,
          hoa_dues_date = $3,
          hoa_contact_email = $4
      WHERE id = $5
    `, [testAmount, 'Monthly', '1st', 'board@example.com', communityId]);

        console.log('Update completed. Fetching updated values...\n');

        // Fetch the updated values
        const result = await pool.query(`
      SELECT hoa_dues_amount, hoa_dues_frequency, hoa_dues_date, hoa_contact_email 
      FROM communities 
      WHERE id = $1
    `, [communityId]);

        const row = result.rows[0];
        console.log('Updated values:');
        console.log(`  hoa_dues_amount: "${row.hoa_dues_amount}" (Type: ${typeof row.hoa_dues_amount})`);
        console.log(`  hoa_dues_frequency: "${row.hoa_dues_frequency}"`);
        console.log(`  hoa_dues_date: "${row.hoa_dues_date}"`);
        console.log(`  hoa_contact_email: "${row.hoa_contact_email}"`);

        await pool.end();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        await pool.end();
        process.exit(1);
    }
}

testUpdate();
