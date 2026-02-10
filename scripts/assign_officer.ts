
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { eq, and } from "drizzle-orm";

async function assignHoaPosition() {
    const { db } = await import("@/db");
    const { members, users } = await import("@/db/schema");

    const emailInput = process.argv[2];
    const position = process.argv[3] || "President";

    if (!emailInput) {
        console.error("Usage: npx tsx scripts/assign_officer.ts <email> [position]");
        process.exit(1);
    }

    const email = emailInput.trim().toLowerCase();
    console.log(`Searching for user: '${email}'...`);

    // Find user by fetching all and filtering in JS (to debug/bypass DB query issues)
    const allUsers = await db.select().from(users);
    const user = allUsers.find(u => u.email.trim().toLowerCase() === email);

    if (!user) {
        console.error("User not found.");
        console.log(`Input email: '${email}' codes: ${email.split('').map(c => c.charCodeAt(0)).join(',')}`);
        console.log("Available emails in DB:");
        allUsers.forEach(u => {
            console.log(`'${u.email}' codes: ${u.email.split('').map(c => c.charCodeAt(0)).join(',')}`);
        });
        process.exit(1);
    }

    // Update their membership(s)
    // For simplicity, updating all memberships to have this position, 
    // but in reality you'd pick a specific community.
    const result = await db.update(members)
        .set({
            hoaPosition: position,
            role: "Board Member" // Usually implies board role
        })
        .where(eq(members.userId, user.id))
        .returning();

    if (result.length > 0) {
        console.log(`✅ Updated ${result.length} membership(s) for ${user.name}.`);
        console.log(`   Role: Board Member`);
        console.log(`   Position: ${position}`);
    } else {
        console.error("User has no memberships to update.");
    }

    process.exit(0);
}

assignHoaPosition().catch(console.error);
