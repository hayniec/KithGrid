// Update user's community ID
// Run this with: node --env-file=.env.local update_user_community.js

const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function updateUserCommunity() {
    try {
        // First, find all users and their current community IDs
        const usersResult = await pool.query(`
      SELECT id, email, name, community_id 
      FROM users 
      ORDER BY created_at DESC
      LIMIT 10
    `);

        console.log('\n=== Current Users ===\n');
        for (const user of usersResult.rows) {
            console.log(`User: ${user.email || user.name || 'Unknown'}`);
            console.log(`  ID: ${user.id}`);
            console.log(`  Community ID: ${user.community_id}`);
            console.log('---');
        }

        // Find the existing community
        const communityResult = await pool.query(`
      SELECT id, name 
      FROM communities 
      LIMIT 1
    `);

        if (communityResult.rows.length === 0) {
            console.log('\n❌ No communities found in database!');
            await pool.end();
            return;
        }

        const existingCommunity = communityResult.rows[0];
        console.log(`\n✅ Found existing community: ${existingCommunity.name} (${existingCommunity.id})\n`);

        // Update all users to point to this community
        const updateResult = await pool.query(`
      UPDATE users 
      SET community_id = $1 
      WHERE community_id IS NULL OR community_id != $1
      RETURNING id, email, name
    `, [existingCommunity.id]);

        console.log(`\n✅ Updated ${updateResult.rows.length} user(s) to community: ${existingCommunity.name}\n`);

        for (const user of updateResult.rows) {
            console.log(`  - ${user.email || user.name || user.id}`);
        }

        await pool.end();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        await pool.end();
        process.exit(1);
    }
}

updateUserCommunity();
