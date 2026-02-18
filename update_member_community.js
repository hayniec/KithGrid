// Update member's community ID
// Run this with: node --env-file=.env.local update_member_community.js

const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function updateMemberCommunity() {
    try {
        // Find the existing community with HOA dues
        const communityResult = await pool.query(`
      SELECT id, name, hoa_dues_amount 
      FROM communities 
      WHERE id = 'f3d141b0-f8a7-4441-923d-ec2d01c0de83'
    `);

        if (communityResult.rows.length === 0) {
            console.log('\n❌ Community not found!');
            await pool.end();
            return;
        }

        const existingCommunity = communityResult.rows[0];
        console.log(`\n✅ Found community: ${existingCommunity.name}`);
        console.log(`   ID: ${existingCommunity.id}`);
        console.log(`   HOA Dues: $${existingCommunity.hoa_dues_amount}\n`);

        // Find all members (neighbors)
        const membersResult = await pool.query(`
      SELECT n.id, n.user_id, n.community_id, u.email, u.name
      FROM neighbors n
      JOIN users u ON n.user_id = u.id
      ORDER BY n.joined_date DESC
      LIMIT 10
    `);

        console.log('=== Current Members ===\n');
        for (const member of membersResult.rows) {
            console.log(`Member: ${member.email || member.name}`);
            console.log(`  Member ID: ${member.id}`);
            console.log(`  User ID: ${member.user_id}`);
            console.log(`  Current Community ID: ${member.community_id}`);
            console.log('---');
        }

        // Update all members to point to the existing community
        const updateResult = await pool.query(`
      UPDATE neighbors 
      SET community_id = $1 
      WHERE community_id != $1 OR community_id IS NULL
      RETURNING id, user_id
    `, [existingCommunity.id]);

        console.log(`\n✅ Updated ${updateResult.rows.length} member(s) to community: ${existingCommunity.name}\n`);

        await pool.end();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        await pool.end();
        process.exit(1);
    }
}

updateMemberCommunity();
