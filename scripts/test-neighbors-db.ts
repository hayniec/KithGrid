import 'dotenv/config';
import { db } from './db/index.js';
import { members, users } from './db/schema.js';
import { eq } from 'drizzle-orm';

async function test() {
    console.log("Fetching counts...");
    const mCount = await db.select().from(members);
    console.log("Total members in db:", mCount.length);

    const uCount = await db.select().from(users);
    console.log("Total users in db:", uCount.length);

    const matchCount = await db.select()
        .from(members)
        .innerJoin(users, eq(members.userId, users.id));

    console.log("Total members with matching users:", matchCount.length);

    if (mCount.length > 0) {
        console.log("Sample member:", mCount[0]);
    }
    process.exit(0);
}

test().catch(e => {
    console.error(e);
    process.exit(1);
});
