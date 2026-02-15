
const { neon } = require('@neondatabase/serverless');
const { drizzle } = require('drizzle-orm/neon-http');
const { eq, ilike } = require('drizzle-orm');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

// Manually define schema to avoid import issues
const users = {
    id: 'id',
    email: 'email',
    name: 'name',
    communityId: 'community_id', // Note: legacy column, might not be used?
    _: { name: 'users', schema: undefined, columns: { id: { name: 'id' }, email: { name: 'email' } } }
};
const members = {
    id: 'id',
    userId: 'user_id',
    communityId: 'community_id',
    role: 'role',
    _: { name: 'members', schema: undefined, columns: { userId: { name: 'user_id' } } }
};
const communities = {
    id: 'id',
    name: 'name',
    _: { name: 'communities', schema: undefined, columns: { id: { name: 'id' } } }
};

const sql = neon(process.env.DATABASE_URL);

async function main() {
    const dbUrl = process.env.DATABASE_URL || '';
    console.log(`DB URL Loaded: ${dbUrl.substring(0, 10)}... (Length: ${dbUrl.length})`);

    try {
        const result = await sql`SELECT 1 as connected`;
        console.log("✅ Database Connection Successful:", result);
    } catch (e) {
        console.error("❌ Database Connection FAILED:", e);
        return;
    }

    const userEmail = "erich.haynie@gmail.com";
    console.log(`\n🔍 Checking User: ${userEmail} (and mixed case variants)...\n`);

    // 1. Find User
    const userRows = await sql`
        SELECT * FROM users 
        WHERE LOWER(email) = LOWER(${userEmail})
    `;

    if (userRows.length === 0) {
        console.error("❌ User NOT FOUND in database!");
        return;
    }

    const user = userRows[0];
    console.log(`✅ User Found: ${user.name} (ID: ${user.id})`);
    console.log(`   Email in DB: ${user.email}`);

    // 2. Find Memberships
    const memberRows = await sql`
        SELECT m.*, c.name as community_name 
        FROM members m
        JOIN communities c ON m.community_id = c.id
        WHERE m.user_id = ${user.id}
    `;

    if (memberRows.length === 0) {
        console.error("❌ NO MEMBERSHIPS FOUND for this user!");
        console.log("   This explains why 'Session Information Missing' happens.");
        console.log("   The user exists, but has no link to any community.");

        // Check if any communities exist to link to
        const comms = await sql`SELECT * FROM communities LIMIT 5`;
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
}

main().catch(console.error);
