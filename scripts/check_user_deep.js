
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
    const dbUrl = process.env.DATABASE_URL || '';
    console.log(`DB URL Loaded: ${dbUrl.substring(0, 10)}... (Length: ${dbUrl.length})`);

    try {
        const result = await pool.query('SELECT 1 as connected');
        console.log("✅ Database Connection Successful:", result.rows);
    } catch (e) {
        console.error("❌ Database Connection FAILED:", e);
        return;
    }

    const TARGET_EMAIL = 'eric.haynie@gmail.com';
    console.log(`\n🔍 Checking User: ${TARGET_EMAIL} (and mixed case variants)...\n`);

    // 1. Find User
    const { rows: userRows } = await pool.query(
        'SELECT * FROM users WHERE LOWER(email) = LOWER($1)',
        [TARGET_EMAIL]
    );

    if (userRows.length === 0) {
        console.error("❌ User NOT FOUND in database!");
        return;
    }

    const user = userRows[0];
    console.log(`✅ User Found: ${user.name} (ID: ${user.id})`);
    console.log(`   Email in DB: ${user.email}`);

    // 2. Find Memberships
    const { rows: memberRows } = await pool.query(
        `SELECT m.*, c.name as community_name
         FROM members m
         JOIN communities c ON m.community_id = c.id
         WHERE m.user_id = $1`,
        [user.id]
    );

    if (memberRows.length === 0) {
        console.error("❌ NO MEMBERSHIPS FOUND for this user!");
        console.log("   This explains why 'Session Information Missing' happens.");
        console.log("   The user exists, but has no link to any community.");

        // Check if any communities exist to link to
        const { rows: comms } = await pool.query('SELECT * FROM communities LIMIT 5');
        if (comms.length > 0) {
            console.log("\nAvailable Communities:");
            comms.forEach(c => console.log(` - ${c.name} (ID: ${c.id})`));
            console.log("\n💡 Recommendation: Manually create a membership.");
        }
    } else {
        console.log(`✅ Found ${memberRows.length} Membership(s):`);
        memberRows.forEach(m => {
            console.log(`   - Community: ${m.community_name}`);
            console.log(`     Role: ${m.role}`);
            console.log(`     Community ID: ${m.community_id}`);
        });
        console.log("\nIf the user still sees 'Session Missing', then the Session is NOT getting this User ID.");
    }

    await pool.end();
}

main().catch(console.error);
