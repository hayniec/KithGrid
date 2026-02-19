
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL || "erich.haynie@gmail.com";

// --- Data Definitions ---

const TENANT_DATA = [
    {
        name: "Maple Grove",
        slug: "maple-grove",
        primaryColor: "#10b981", // Emerald
        users: [
            { name: "Alice Baker", email: "alice@maplegrove.com", initial: "AB" },
            { name: "Bob Carter", email: "bob@maplegrove.com", initial: "BC" },
            { name: "Charlie Davis", email: "charlie@maplegrove.com", initial: "CD" }
        ],
        events: [
            { title: "Summer BBQ", description: "Annual neighborhood slightly burnt hotdogs.", date: "2026-07-04", category: "Social" },
            { title: "HOA Meeting", description: "Discussing fence height regulations again.", date: "2026-03-15", category: "HOA" }
        ],
        marketplace: [
            { title: "Kids Bicycle", description: "Red bike, slightly used.", price: 50.00, category: "For Sale" },
            { title: "Free Firewood", description: "Come and get it.", price: 0, category: "Free" }
        ],
        services: [
            { name: "Sparkle Cleaners", category: "Cleaning", phone: "555-0101", description: "Best house cleaners in town." }
        ]
    },
    {
        name: "River Valley",
        slug: "river-valley",
        primaryColor: "#3b82f6", // Blue
        users: [
            { name: "David Evans", email: "david@rivervalley.com", initial: "DE" },
            { name: "Eve Foster", email: "eve@rivervalley.com", initial: "EF" },
            { name: "Frank Green", email: "frank@rivervalley.com", initial: "FG" }
        ],
        events: [
            { title: "River Cleanup", description: "Help keep our river clean.", date: "2026-04-22", category: "Social" },
            { title: "Book Club", description: "Reading 'The Great Gatsby'.", date: "2026-02-28", category: "Social" }
        ],
        marketplace: [
            { title: "Kayak", description: "Blue single seat kayak.", price: 300.00, category: "For Sale" }
        ],
        services: [
            { name: "Green Thumb Landscaping", category: "Landscaping", phone: "555-0202", description: "They do great work on hedges." }
        ]
    },
    {
        name: "Sunset Heights",
        slug: "sunset-heights",
        primaryColor: "#f59e0b", // Amber
        users: [
            { name: "Grace Harris", email: "grace@sunsetheights.com", initial: "GH" },
            { name: "Henry Irving", email: "henry@sunsetheights.com", initial: "HI" },
            { name: "Isabel Jones", email: "isabel@sunsetheights.com", initial: "IJ" }
        ],
        events: [
            { title: "Sunset Yoga", description: "Yoga in the park at dusk.", date: "2026-06-21", category: "Social" },
            { title: "Security Watch Training", description: "Learn how to patrol effectively.", date: "2026-05-10", category: "Security" }
        ],
        marketplace: [
            { title: "Patio Set", description: "Table and 4 chairs.", price: 150.00, category: "For Sale" },
            { title: "Moving Boxes", description: "Lots of boxes, free.", price: 0, category: "Free" }
        ],
        services: [
            { name: "Fix-It Felix", category: "Handyman", phone: "555-0303", description: "Can fix anything." }
        ]
    }
];

async function main() {
    console.log("🚀 Starting Multi-Tenant Seeding...");

    // Dynamic imports
    const { db } = await import("@/db");
    const {
        communities, users, members,
        events, eventRsvps, marketplaceItems, serviceProviders,
        resources, documents, invitations, directMessages,
        forumPosts, forumComments, forumLikes, announcements, localPlaces, reservations
    } = await import("@/db/schema");
    const { eq } = await import("drizzle-orm");

    console.log("🧹 Wiping existing data...");
    // 1. Deepest Dependencies (Likes, RSVPs, Comments, Messages, Reservations)
    try { await db.delete(forumLikes); } catch { }
    try { await db.delete(forumComments); } catch { }
    try { await db.delete(eventRsvps); } catch { }
    try { await db.delete(directMessages); } catch { }
    try { await db.delete(reservations); } catch { }

    // 2. Member/Community Content
    try { await db.delete(forumPosts); } catch { }
    try { await db.delete(invitations); } catch { }
    try { await db.delete(events); } catch { }
    try { await db.delete(marketplaceItems); } catch { }
    try { await db.delete(serviceProviders); } catch { }
    try { await db.delete(localPlaces); } catch { }
    try { await db.delete(resources); } catch { }
    try { await db.delete(documents); } catch { }
    try { await db.delete(announcements); } catch { }

    // 3. Core Entities
    try { await db.delete(members); } catch { }
    try { await db.delete(communities); } catch { }
    console.log("✨ Data wiped.");

    // 2. Ensure Super Admin User Exists
    let superAdminId: string;
    const [existingAdmin] = await db.select().from(users).where(eq(users.email, SUPER_ADMIN_EMAIL));
    if (existingAdmin) {
        superAdminId = existingAdmin.id;
        console.log(`👤 Found Super Admin: ${SUPER_ADMIN_EMAIL}`);
    } else {
        console.log(`👤 Creating Super Admin: ${SUPER_ADMIN_EMAIL}`);
        const [newAdmin] = await db.insert(users).values({
            email: SUPER_ADMIN_EMAIL,
            name: "Super Admin",
            password: "temp123",
            avatar: "SA"
        }).returning();
        superAdminId = newAdmin.id;
    }

    // 3. Loop through Tenants
    for (const tenant of TENANT_DATA) {
        console.log(`\nPb Building Tenant: ${tenant.name}...`);

        // Create Community
        const [comm] = await db.insert(communities).values({
            name: tenant.name,
            slug: tenant.slug,
            primaryColor: tenant.primaryColor,
            isActive: true,
            hasMarketplace: true,
            hasEvents: true,
            hasServicePros: true
        }).returning();

        // Add Super Admin as Admin Member
        await db.insert(members).values({
            userId: superAdminId,
            communityId: comm.id,
            role: "Admin",
            joinedDate: new Date()
        });

        // Create Tenant Users & Members
        const memberIds = [];
        for (const u of tenant.users) {
            // Upsert User
            let uid;
            const [exUser] = await db.select().from(users).where(eq(users.email, u.email));
            if (exUser) {
                uid = exUser.id;
            } else {
                const [newUser] = await db.insert(users).values({
                    email: u.email,
                    name: u.name,
                    password: "password123",
                    avatar: u.initial
                }).returning();
                uid = newUser.id;
            }

            // Create Member
            const [mem] = await db.insert(members).values({
                userId: uid,
                communityId: comm.id,
                role: "Resident",
                joinedDate: new Date()
            }).returning();
            memberIds.push(mem.id);
        }

        // Create Events
        if (memberIds.length > 0) {
            for (const evt of tenant.events) {
                await db.insert(events).values({
                    communityId: comm.id,
                    title: evt.title,
                    description: evt.description,
                    date: evt.date, // String to date might need casting? Drizzle usually handles YYYY-MM-DD
                    category: evt.category as any,
                    organizerId: memberIds[0], // First user organizes everything
                    time: "12:00:00",
                    location: "Community Center"
                });
            }

            // Create Marketplace Items
            for (const item of tenant.marketplace) {
                await db.insert(marketplaceItems).values({
                    communityId: comm.id,
                    title: item.title,
                    description: item.description,
                    price: item.price.toString(),
                    sellerId: memberIds[1] || memberIds[0], // Bob sells stuff
                    status: "Active",
                    postedDate: new Date()
                });
            }
        }

        // Create Services
        for (const svc of tenant.services) {
            await db.insert(serviceProviders).values({
                communityId: comm.id,
                name: svc.name,
                category: svc.category,
                phone: svc.phone,
                description: svc.description,
                rating: "5.0",
                recommendedBy: tenant.users[0]?.name || "Anonymous"
            });
        }
    }

    console.log("\n✅ Multi-tenant seeding complete!");
    process.exit(0);
}

main().catch((err: any) => {
    console.error("❌ Seeding failed with error:");
    console.error("Message:", err.message);
    if (err.table) console.error("Table:", err.table);
    if (err.constraint) console.error("Constraint:", err.constraint);
    if (err.detail) console.error("Detail:", err.detail);
    if (err.routine) console.error("Routine:", err.routine);
    process.exit(1);
});
