
import { config } from 'dotenv';
config({ path: '.env.local' });
import { db } from "../db";
import { users, members, communities } from "../db/schema";
import { eq, ilike } from "drizzle-orm";

async function main() {
    const emailData = "Erich.Haynie@gmail.com"; // Simulating mixed case input
    console.log(`Checking user: ${emailData}`);

    // Check User
    const [user] = await db.select().from(users).where(eq(users.email, emailData.toLowerCase()));

    if (!user) {
        console.error("❌ User NOT found via lowercase lookup!");
        const [anyUser] = await db.select().from(users).where(ilike(users.email, emailData));
        if (anyUser) {
            console.log("✅ User FOUND via ilike (case-insensitive database match).");
            console.log("User details:", anyUser);
        } else {
            console.log("❌ User absolutely not found.");
        }
        return;
    }

    console.log("✅ User found:", user.id, user.email, user.name);

    // Check Memberships
    const memberships = await db.select({
        communityName: communities.name,
        role: members.role,
        communityId: members.communityId
    })
        .from(members)
        .innerJoin(communities, eq(members.communityId, communities.id))
        .where(eq(members.userId, user.id));

    console.log(`Found ${memberships.length} memberships:`);
    memberships.forEach(m => console.log(` - ${m.communityName} (${m.role}) - ID: ${m.communityId}`));

    if (memberships.length === 0) {
        console.error("❌ User has NO memberships. This explains the missing session info.");
    } else {
        console.log("✅ User has memberships. Session *should* work.");
    }
}

main().catch(console.error).finally(() => process.exit());
