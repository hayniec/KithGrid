/**
 * Test Multi-Role Functionality
 * 
 * This script verifies that:
 * 1. Users can have multiple roles assigned
 * 2. Roles persist correctly in the database
 * 3. The roles array is properly synced with the legacy role field
 */

import { db } from "@/db";
import { members, users } from "@/db/schema";
import { eq } from "drizzle-orm";

async function testMultiRoles() {
    console.log("🧪 Testing Multi-Role Functionality\n");

    try {
        // Get all members with their roles
        const allMembers = await db
            .select({
                id: members.id,
                role: members.role,
                roles: members.roles,
                hoaPosition: members.hoaPosition,
                name: users.name,
                email: users.email,
            })
            .from(members)
            .innerJoin(users, eq(members.userId, users.id));

        console.log(`📊 Found ${allMembers.length} members\n`);

        // Check each member's role configuration
        let issuesFound = 0;

        for (const member of allMembers) {
            console.log(`👤 ${member.name} (${member.email})`);
            console.log(`   Legacy role: ${member.role}`);
            console.log(`   Roles array: ${JSON.stringify(member.roles)}`);
            console.log(`   HOA Position: ${member.hoaPosition || 'None'}`);

            // Validation checks
            const checks = [];

            // Check 1: roles array should exist
            if (!member.roles || member.roles.length === 0) {
                checks.push("⚠️  No roles array (should have at least one role)");
                issuesFound++;
            }

            // Check 2: legacy role should match first role in array
            if (member.roles && member.roles.length > 0 && member.role !== member.roles[0]) {
                checks.push(`⚠️  Legacy role mismatch (role: ${member.role}, roles[0]: ${member.roles[0]})`);
                issuesFound++;
            }

            // Check 3: Board Members should have HOA position
            if (member.roles?.includes('Board Member') && !member.hoaPosition) {
                checks.push("⚠️  Board Member without HOA position");
                issuesFound++;
            }

            // Check 4: Multiple roles validation
            if (member.roles && member.roles.length > 1) {
                checks.push(`✅ Has multiple roles: ${member.roles.join(', ')}`);
            } else if (member.roles && member.roles.length === 1) {
                checks.push(`✅ Single role: ${member.roles[0]}`);
            }

            if (checks.length > 0) {
                checks.forEach(check => console.log(`   ${check}`));
            }

            console.log('');
        }

        // Summary
        console.log("\n" + "=".repeat(60));
        console.log("📋 SUMMARY");
        console.log("=".repeat(60));
        console.log(`Total members: ${allMembers.length}`);
        console.log(`Issues found: ${issuesFound}`);

        if (issuesFound === 0) {
            console.log("\n✅ All multi-role checks passed!");
        } else {
            console.log(`\n⚠️  Found ${issuesFound} issues that may need attention`);
        }

        // Show role distribution
        console.log("\n📊 ROLE DISTRIBUTION");
        console.log("=".repeat(60));
        const roleCount: Record<string, number> = {};

        allMembers.forEach(member => {
            if (member.roles) {
                member.roles.forEach(role => {
                    roleCount[role] = (roleCount[role] || 0) + 1;
                });
            }
        });

        Object.entries(roleCount).forEach(([role, count]) => {
            console.log(`${role}: ${count}`);
        });

        // Show members with multiple roles
        const multiRoleMembers = allMembers.filter(m => m.roles && m.roles.length > 1);
        if (multiRoleMembers.length > 0) {
            console.log("\n👥 MEMBERS WITH MULTIPLE ROLES");
            console.log("=".repeat(60));
            multiRoleMembers.forEach(member => {
                console.log(`${member.name}: ${member.roles?.join(', ')}`);
            });
        } else {
            console.log("\nℹ️  No members currently have multiple roles assigned");
        }

    } catch (error) {
        console.error("❌ Error testing multi-roles:", error);
        throw error;
    }
}

// Run the test
testMultiRoles()
    .then(() => {
        console.log("\n✅ Test completed");
        process.exit(0);
    })
    .catch((error) => {
        console.error("\n❌ Test failed:", error);
        process.exit(1);
    });
