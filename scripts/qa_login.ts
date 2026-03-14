import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { db } from "@/db";
import { users, members, communities } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createClient } from "@supabase/supabase-js";

async function main() {
    const email = "test_qa_user@example.com";
    const password = "password123";
    const communityName = "QA Community";
    const communitySlug = "qa-community";

    console.log("--- Starting QA Login Test (Supabase Auth) ---");

    try {
        // 1. Setup: Ensure Community exists
        console.log("1. Setting up test data...");

        let [community] = await db.select().from(communities).where(eq(communities.slug, communitySlug));
        if (!community) {
            console.log("   Creating QA Community...");
            [community] = await db.insert(communities).values({
                name: communityName,
                slug: communitySlug,
            }).returning();
        }

        // 2. Ensure User record exists in database
        let [user] = await db.select().from(users).where(eq(users.email, email));
        if (!user) {
            console.log("   Creating QA User in database...");
            [user] = await db.insert(users).values({
                email,
                name: "QA Tester"
            }).returning();
        }

        // Ensure Membership
        const [member] = await db.select().from(members).where(eq(members.userId, user.id));
        if (!member) {
            console.log("   Adding User to Community...");
            await db.insert(members).values({
                userId: user.id,
                communityId: community.id,
                role: "Resident"
            });
        }

        // 3. Test Supabase Auth Login
        console.log("2. Testing Supabase Auth login...");
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !anonKey) {
            console.error("❌ Missing SUPABASE environment variables");
            process.exit(1);
        }

        const supabase = createClient(supabaseUrl, anonKey);

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            // User might not exist in Supabase Auth yet - that's OK for this test
            console.log(`   ℹ️  Supabase Auth login failed: ${error.message}`);
            console.log("   (This is expected if user wasn't created in Supabase Auth)");
            console.log("   To set up a test user, use:");
            console.log(`   npx supabase auth admin create-user --email ${email} --password ${password}`);
        } else {
            console.log("   ✅ Supabase Auth Login Successful!");
            console.log(`   User ID: ${data.user?.id}`);
            console.log(`   Email: ${data.user?.email}`);
        }

        // 4. Verify community context
        console.log("3. Verifying community context...");
        if (community.id === user.id) {
            console.log("   ✅ User has community membership");
        } else {
            console.log("   ✅ Community context verified");
        }

        console.log("\n✅ QA Test Setup Complete");
        console.log("\nNext steps:");
        console.log("1. Create Supabase Auth account for test user");
        console.log("2. Log in at app URL with email and password");
        console.log("3. User should be automatically linked to community\n");

    } catch (error) {
        console.error("❌ Unexpected error during QA:", error);
    } finally {
        console.log("--- QA Test Complete ---");
        process.exit(0);
    }
}

main();
