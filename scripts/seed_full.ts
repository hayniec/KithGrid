
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL || "eric.haynie@gmail.com";

// --- 3 Communities with realistic HOA data ---

const COMMUNITIES = [
    {
        name: "Valley Cove HOA",
        slug: "valley-cove",
        primaryColor: "#4f46e5",
        secondaryColor: "#1e1b4b",
        accentColor: "#f59e0b",
        planTuple: "growth_250" as const,
        maxHomes: 250,
        hoaDuesAmount: "250.00",
        hoaDuesFrequency: "Monthly",
        hoaDuesDate: "1st",
        hoaContactEmail: "board@valleycove.com",
        emergencyAccessCode: "VC-911",
        emergencyInstructions: "Call gate house at 555-0100, then 911. AED located at clubhouse entrance.",
    },
    {
        name: "Maple Grove Estates",
        slug: "maple-grove",
        primaryColor: "#10b981",
        secondaryColor: "#064e3b",
        accentColor: "#fbbf24",
        planTuple: "pro_500" as const,
        maxHomes: 500,
        hoaDuesAmount: "425.00",
        hoaDuesFrequency: "Quarterly",
        hoaDuesDate: "15th",
        hoaContactEmail: "hoa@maplegrove.org",
        emergencyAccessCode: "MG-2024",
        emergencyInstructions: "Emergency contact: Property Manager at 555-0200. Fire extinguishers in each building lobby.",
    },
    {
        name: "Sunset Ridge",
        slug: "sunset-ridge",
        primaryColor: "#f59e0b",
        secondaryColor: "#78350f",
        accentColor: "#ef4444",
        planTuple: "starter_100" as const,
        maxHomes: 100,
        hoaDuesAmount: "150.00",
        hoaDuesFrequency: "Monthly",
        hoaDuesDate: "1st",
        hoaContactEmail: "board@sunsetridge.net",
        emergencyAccessCode: "SR-HELP",
        emergencyInstructions: "Neighborhood watch captain: Tom at 555-0300. Storm shelter at community center.",
    },
];

// Users per community. First user is always the HOA officer + Admin.
// HOA officers are the only ones who can be Admins.
const COMMUNITY_USERS = [
    // Valley Cove
    [
        { name: "Janet Morrison", email: "janet@valleycove.com", role: "Admin" as const, hoaPosition: "President", address: "101 Valley Cove Dr", skills: ["Project Management", "Budgeting"], equipment: [{ name: "Projector", available: true }] },
        { name: "Marcus Chen", email: "marcus@valleycove.com", role: "Board Member" as const, hoaPosition: "Treasurer", address: "204 Valley Cove Dr", skills: ["Accounting", "Excel"], equipment: [] },
        { name: "Lisa Patel", email: "lisa@valleycove.com", role: "Event Manager" as const, hoaPosition: null, address: "312 Valley Cove Dr", skills: ["Event Planning", "Photography"], equipment: [{ name: "Folding Tables (4)", available: true }] },
        { name: "Derek Washington", email: "derek@valleycove.com", role: "Resident" as const, hoaPosition: null, address: "415 Valley Cove Dr", skills: ["Plumbing", "Carpentry"], equipment: [{ name: "Power Washer", available: true }, { name: "Ladder 24ft", available: true }] },
        { name: "Sofia Reyes", email: "sofia@valleycove.com", role: "Resident" as const, hoaPosition: null, address: "523 Valley Cove Dr", skills: ["Gardening", "First Aid"], equipment: [] },
    ],
    // Maple Grove
    [
        { name: "Robert Kim", email: "robert@maplegrove.org", role: "Admin" as const, hoaPosition: "President", address: "10 Maple Lane", skills: ["Law", "Negotiation"], equipment: [] },
        { name: "Angela Torres", email: "angela@maplegrove.org", role: "Board Member" as const, hoaPosition: "Secretary", address: "22 Maple Lane", skills: ["Writing", "Organization"], equipment: [{ name: "PA System", available: true }] },
        { name: "James O'Brien", email: "james@maplegrove.org", role: "Board Member" as const, hoaPosition: "Vice President", address: "35 Oak Circle", skills: ["Construction", "Landscaping"], equipment: [{ name: "Chainsaw", available: false }, { name: "Truck", available: true }] },
        { name: "Priya Sharma", email: "priya@maplegrove.org", role: "Resident" as const, hoaPosition: null, address: "48 Oak Circle", skills: ["IT Support", "Networking"], equipment: [] },
        { name: "Tom Bradley", email: "tom@maplegrove.org", role: "Resident" as const, hoaPosition: null, address: "61 Birch Ct", skills: ["Cooking", "Grilling"], equipment: [{ name: "Commercial Grill", available: true }] },
        { name: "Nina Volkov", email: "nina@maplegrove.org", role: "Resident" as const, hoaPosition: null, address: "74 Birch Ct", skills: ["Yoga Instruction", "CPR"], equipment: [] },
    ],
    // Sunset Ridge
    [
        { name: "Carlos Mendez", email: "carlos@sunsetridge.net", role: "Admin" as const, hoaPosition: "President", address: "5 Ridge Rd", skills: ["Leadership", "Conflict Resolution"], equipment: [] },
        { name: "Diane Foster", email: "diane@sunsetridge.net", role: "Board Member" as const, hoaPosition: "Treasurer", address: "12 Ridge Rd", skills: ["Finance", "Spreadsheets"], equipment: [] },
        { name: "Kevin Nguyen", email: "kevin@sunsetridge.net", role: "Resident" as const, hoaPosition: null, address: "19 Sunset Blvd", skills: ["Electrical", "Solar Panels"], equipment: [{ name: "Multimeter", available: true }] },
        { name: "Megan Clark", email: "megan@sunsetridge.net", role: "Resident" as const, hoaPosition: null, address: "26 Sunset Blvd", skills: ["Pet Sitting", "Dog Training"], equipment: [] },
    ],
];

// Events per community
const COMMUNITY_EVENTS = [
    // Valley Cove
    [
        { title: "Annual HOA Meeting", description: "Review budget, elect new board members, and discuss 2026 improvement plans.", date: "2026-04-12", time: "18:00:00", location: "Clubhouse Main Hall", category: "HOA" as const },
        { title: "Spring Pool Party", description: "Kick off pool season! Bring a dish to share.", date: "2026-05-23", time: "14:00:00", location: "Community Pool", category: "Social" as const },
        { title: "Parking Lot Reseal", description: "Lot A will be closed for resurfacing. Park in Lot B.", date: "2026-06-05", time: "07:00:00", location: "Parking Lot A", category: "Maintenance" as const },
        { title: "Neighborhood Watch Kickoff", description: "Meet your block captains and learn safety tips.", date: "2026-03-20", time: "19:00:00", location: "Clubhouse Room B", category: "Security" as const },
    ],
    // Maple Grove
    [
        { title: "Board Meeting - Q2", description: "Quarterly board meeting. Open to all residents.", date: "2026-04-01", time: "19:00:00", location: "Community Center", category: "HOA" as const },
        { title: "Summer BBQ & Movie Night", description: "Burgers, hot dogs, and an outdoor movie for the kids.", date: "2026-07-04", time: "17:00:00", location: "Central Park Pavilion", category: "Social" as const },
        { title: "Tree Trimming Day", description: "Arborist will trim common area trees. Please move cars.", date: "2026-05-10", time: "08:00:00", location: "Common Areas", category: "Maintenance" as const },
    ],
    // Sunset Ridge
    [
        { title: "HOA Budget Review", description: "Presenting next year's proposed budget.", date: "2026-03-28", time: "18:30:00", location: "Community Center", category: "HOA" as const },
        { title: "Block Party", description: "Live music, food trucks, and bounce house for kids!", date: "2026-06-14", time: "15:00:00", location: "Ridge Park", category: "Social" as const },
        { title: "Security Camera Installation", description: "New cameras being installed at entrances.", date: "2026-04-20", time: "09:00:00", location: "Main Entrance & Back Gate", category: "Security" as const },
    ],
];

// Marketplace items per community
const COMMUNITY_MARKETPLACE = [
    // Valley Cove
    [
        { title: "Mountain Bike - Trek", description: "2024 Trek Marlin 7, excellent condition. Ridden maybe 10 times.", price: "450.00", isFree: false, isNegotiable: true },
        { title: "Free Moving Boxes", description: "About 20 large and medium boxes, free to a good home.", price: "0", isFree: true, isNegotiable: false },
        { title: "Patio Dining Set", description: "Glass table with 6 wicker chairs. Small chip on one chair.", price: "275.00", isFree: false, isNegotiable: true },
    ],
    // Maple Grove
    [
        { title: "Weber Gas Grill", description: "4-burner Weber Genesis. Works great, upgrading to built-in.", price: "350.00", isFree: false, isNegotiable: true },
        { title: "Kids Swing Set", description: "Wooden swing set, must disassemble and haul. Free!", price: "0", isFree: true, isNegotiable: false },
        { title: "Lawn Mower - Honda", description: "Self-propelled Honda mower, 2 years old.", price: "200.00", isFree: false, isNegotiable: false },
        { title: "Snow Blower", description: "Toro Power Clear, used 3 seasons.", price: "175.00", isFree: false, isNegotiable: true },
    ],
    // Sunset Ridge
    [
        { title: "Baby Crib + Mattress", description: "Graco convertible crib in white. Mattress included.", price: "120.00", isFree: false, isNegotiable: true },
        { title: "Free Firewood", description: "Half cord of seasoned oak. You haul.", price: "0", isFree: true, isNegotiable: false },
    ],
];

// Forum posts per community
const COMMUNITY_FORUM_POSTS = [
    // Valley Cove
    [
        { content: "Has anyone else noticed the streetlight on Valley Cove Dr near #300 is out? Should we report it to the city or does the HOA handle that?", category: "Maintenance" },
        { content: "Just a reminder - please pick up after your dogs on the walking trails. I've seen a lot more messes lately.", category: "General" },
        { content: "Would anyone be interested in starting a weekend running group? Thinking Saturday mornings at 7am from the clubhouse.", category: "Social" },
    ],
    // Maple Grove
    [
        { content: "The new landscaping around the entrance looks amazing! Great job to the board for getting that approved.", category: "General" },
        { content: "Heads up - there was a package theft on Oak Circle yesterday afternoon. Keep an eye out and maybe get a doorbell camera.", category: "Safety" },
        { content: "Anyone know a good electrician? Need some outdoor outlets installed.", category: "Recommendations" },
    ],
    // Sunset Ridge
    [
        { content: "The community garden plots are available for signup! See the board at the community center.", category: "General" },
        { content: "Coyote spotted near the back gate around dusk. Keep small pets indoors.", category: "Safety" },
    ],
];

// Service providers per community
const COMMUNITY_SERVICES = [
    // Valley Cove
    [
        { name: "Valley Plumbing Co.", category: "Plumbing", phone: "555-0111", description: "Licensed & insured. Fast response for emergencies.", rating: "4.8" },
        { name: "Green Scene Landscaping", category: "Landscaping", phone: "555-0112", description: "Weekly mowing, seasonal cleanup, and irrigation.", rating: "4.5" },
        { name: "SafeHome Security", category: "Security", phone: "555-0113", description: "Camera installation, alarm systems, and monitoring.", rating: "4.9" },
    ],
    // Maple Grove
    [
        { name: "Bright Spark Electric", category: "Electrical", phone: "555-0211", description: "Residential electrical work. Panel upgrades a specialty.", rating: "4.7" },
        { name: "Maple Tree Service", category: "Tree Care", phone: "555-0212", description: "Trimming, removal, and stump grinding.", rating: "4.6" },
        { name: "CleanPro Janitorial", category: "Cleaning", phone: "555-0213", description: "House cleaning and move-in/move-out deep cleans.", rating: "4.4" },
    ],
    // Sunset Ridge
    [
        { name: "Ridge HVAC Solutions", category: "HVAC", phone: "555-0311", description: "AC repair, furnace maintenance, duct cleaning.", rating: "4.8" },
        { name: "Handy Dan", category: "Handyman", phone: "555-0312", description: "Drywall, painting, minor repairs. No job too small.", rating: "4.9" },
    ],
];

// Local places per community
const COMMUNITY_PLACES = [
    // Valley Cove
    [
        { name: "Valley Brew Coffee", category: "Coffee Shop", address: "1200 Main St", description: "Best lattes in the area. Free wifi.", rating: "4.7" },
        { name: "Cove Pizza", category: "Restaurant", address: "1205 Main St", description: "NY style pizza. Great for families.", rating: "4.5" },
        { name: "Valley Cove Park", category: "Park", address: "800 Park Ave", description: "Playground, walking trails, and dog park.", rating: "4.8" },
    ],
    // Maple Grove
    [
        { name: "Maple Leaf Diner", category: "Restaurant", address: "500 Grove Blvd", description: "Classic American diner. Breakfast all day.", rating: "4.3" },
        { name: "Grove Fitness Center", category: "Gym", address: "510 Grove Blvd", description: "Full gym, pool, group classes. Resident discount!", rating: "4.6" },
        { name: "Paws & Claws Vet", category: "Veterinarian", address: "520 Grove Blvd", description: "Friendly staff. Walk-ins welcome for emergencies.", rating: "4.9" },
    ],
    // Sunset Ridge
    [
        { name: "Sunset Scoops", category: "Ice Cream", address: "300 Ridge Center", description: "Homemade ice cream. Seasonal flavors.", rating: "4.8" },
        { name: "Ridge Hardware", category: "Hardware Store", address: "310 Ridge Center", description: "Old school hardware store. Staff knows everything.", rating: "4.7" },
    ],
];

// Resources per community
const COMMUNITY_RESOURCES = [
    // Valley Cove
    [
        { name: "Clubhouse Main Hall", type: "Facility" as const, capacity: 100, description: "Large event space with kitchen access. Tables and chairs included.", isReservable: true },
        { name: "Community Pool", type: "Facility" as const, capacity: 50, description: "Heated pool open May-September. Lifeguard on duty weekends.", isReservable: false },
        { name: "Pressure Washer", type: "Tool" as const, capacity: null, description: "3000 PSI gas pressure washer. 24-hour checkout.", isReservable: true },
    ],
    // Maple Grove
    [
        { name: "Community Center", type: "Facility" as const, capacity: 200, description: "Full-size gymnasium and meeting rooms. AV equipment available.", isReservable: true },
        { name: "Tennis Courts (2)", type: "Facility" as const, capacity: 4, description: "Lighted courts, open 6am-10pm. Reserve 1-hour blocks.", isReservable: true },
        { name: "Utility Trailer", type: "Vehicle" as const, capacity: null, description: "6x10 enclosed trailer. Must have valid license and insurance.", isReservable: true },
        { name: "Party Supplies Kit", type: "Tool" as const, capacity: null, description: "Folding tables, chairs, canopy tent. For community events.", isReservable: true },
    ],
    // Sunset Ridge
    [
        { name: "Community Center", type: "Facility" as const, capacity: 75, description: "Meeting room with projector. Small kitchen.", isReservable: true },
        { name: "Fire Pit Area", type: "Facility" as const, capacity: 20, description: "Outdoor fire pit with seating. Firewood provided.", isReservable: true },
    ],
];

// Documents per community
const COMMUNITY_DOCUMENTS = [
    // Valley Cove
    [
        { name: "CC&Rs - Valley Cove HOA", category: "Governing Documents", size: "2.4 MB", url: "/docs/valley-cove-ccrs.pdf" },
        { name: "2026 Annual Budget", category: "Financial", size: "850 KB", url: "/docs/valley-cove-budget-2026.pdf" },
        { name: "Pool Rules & Hours", category: "Rules", size: "320 KB", url: "/docs/valley-cove-pool-rules.pdf" },
        { name: "Architectural Review Guidelines", category: "Governing Documents", size: "1.1 MB", url: "/docs/valley-cove-arch-guidelines.pdf" },
    ],
    // Maple Grove
    [
        { name: "Bylaws - Maple Grove Estates", category: "Governing Documents", size: "3.1 MB", url: "/docs/maple-grove-bylaws.pdf" },
        { name: "Q1 2026 Financial Report", category: "Financial", size: "620 KB", url: "/docs/maple-grove-q1-2026.pdf" },
        { name: "Noise Policy", category: "Rules", size: "180 KB", url: "/docs/maple-grove-noise-policy.pdf" },
    ],
    // Sunset Ridge
    [
        { name: "HOA Rules & Regulations", category: "Governing Documents", size: "1.8 MB", url: "/docs/sunset-ridge-rules.pdf" },
        { name: "2025 Annual Meeting Minutes", category: "Meeting Minutes", size: "440 KB", url: "/docs/sunset-ridge-minutes-2025.pdf" },
    ],
];

// Announcements per community
const COMMUNITY_ANNOUNCEMENTS = [
    // Valley Cove
    [
        { title: "Pool Opens May 1st!", content: "The community pool will open for the season on May 1st. Hours: 10am-8pm weekdays, 9am-9pm weekends. All residents must have updated pool passes." },
        { title: "HOA Dues Increase Notice", content: "After board review, monthly dues will increase from $225 to $250 effective April 1st, 2026. This covers rising insurance and landscaping costs. Details at the next board meeting." },
    ],
    // Maple Grove
    [
        { title: "New Trash Collection Schedule", content: "Starting April 1st, trash pickup moves to Tuesdays and Fridays. Recycling remains on Wednesdays. Please have bins out by 7am." },
        { title: "Welcome New Board Members", content: "Please welcome Angela Torres (Secretary) and James O'Brien (Vice President) to the board! They were elected at the February meeting." },
        { title: "Parking Garage Maintenance", content: "The underground parking garage will be power washed on March 15-16. Please remove vehicles by 6am. Temporary parking available in Lot C." },
    ],
    // Sunset Ridge
    [
        { title: "Community Garden Signups Open", content: "We have 12 garden plots available this year. $25 per season. Sign up at the community center or email board@sunsetridge.net." },
    ],
];

// Direct messages (will be created between members of same community)
const DM_TEMPLATES = [
    { content: "Hey! Are you coming to the meeting this Thursday?" },
    { content: "Sure thing, I'll be there. Want to grab coffee beforehand?" },
    { content: "Sounds great! Meet at the coffee shop at 5:30?" },
    { content: "Hi, I noticed your listing for the patio set. Is it still available?" },
    { content: "Yes! Want to come take a look this weekend?" },
];

async function main() {
    console.log("Starting comprehensive seed...\n");

    const { db } = await import("@/db");
    const {
        communities, users, members,
        events, eventRsvps, marketplaceItems, serviceProviders,
        resources, documents, invitations, directMessages,
        forumPosts, forumComments, forumLikes, announcements, localPlaces, reservations
    } = await import("@/db/schema");
    const { eq } = await import("drizzle-orm");
    const { createClient } = await import("@supabase/supabase-js");

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = serviceRoleKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const useAdmin = !!serviceRoleKey;

    const supabase = createClient(supabaseUrl, supabaseKey, {
        auth: { autoRefreshToken: false, persistSession: false },
    });

    if (useAdmin) {
        console.log("Using service role key - auth accounts will be loginable.\n");
    } else {
        console.log("No SUPABASE_SERVICE_ROLE_KEY - auth accounts may require email confirmation.\n");
    }

    // ── Wipe everything ──────────────────────────────────────────
    console.log("Wiping existing data...");
    try { await db.delete(forumLikes); } catch {}
    try { await db.delete(forumComments); } catch {}
    try { await db.delete(eventRsvps); } catch {}
    try { await db.delete(directMessages); } catch {}
    try { await db.delete(reservations); } catch {}
    try { await db.delete(forumPosts); } catch {}
    try { await db.delete(invitations); } catch {}
    try { await db.delete(events); } catch {}
    try { await db.delete(marketplaceItems); } catch {}
    try { await db.delete(serviceProviders); } catch {}
    try { await db.delete(localPlaces); } catch {}
    try { await db.delete(resources); } catch {}
    try { await db.delete(documents); } catch {}
    try { await db.delete(announcements); } catch {}
    try { await db.delete(members); } catch {}
    try { await db.delete(communities); } catch {}
    console.log("Data wiped.\n");

    // ── Ensure Super Admin user exists ────────────────────────────
    let superAdminUserId: string;
    const [existingAdmin] = await db.select().from(users).where(eq(users.email, SUPER_ADMIN_EMAIL));
    if (existingAdmin) {
        superAdminUserId = existingAdmin.id;
        console.log(`Found Super Admin user: ${SUPER_ADMIN_EMAIL} (${superAdminUserId})`);
    } else {
        console.log(`Creating Super Admin user: ${SUPER_ADMIN_EMAIL}`);
        const { data: suData } = useAdmin
            ? await supabase.auth.admin.createUser({ email: SUPER_ADMIN_EMAIL, password: "temp123", email_confirm: true, user_metadata: { name: "Eric Haynie" } })
            : await supabase.auth.signUp({ email: SUPER_ADMIN_EMAIL, password: "temp123", options: { data: { name: "Eric Haynie" } } });

        const insertVals: any = {
            email: SUPER_ADMIN_EMAIL,
            name: "Eric Haynie",
            password: "temp123",
            avatar: "EH",
        };
        if (suData?.user?.id) insertVals.id = suData.user.id;

        const [newAdmin] = await db.insert(users).values(insertVals).returning();
        superAdminUserId = newAdmin.id;
    }
    console.log("");

    // ── Create communities and seed all related data ─────────────
    for (let ci = 0; ci < COMMUNITIES.length; ci++) {
        const commData = COMMUNITIES[ci];
        const commUsers = COMMUNITY_USERS[ci];
        console.log(`=== ${commData.name} ===`);

        // Create community
        const [comm] = await db.insert(communities).values({
            name: commData.name,
            slug: commData.slug,
            primaryColor: commData.primaryColor,
            secondaryColor: commData.secondaryColor,
            accentColor: commData.accentColor,
            planTuple: commData.planTuple,
            maxHomes: commData.maxHomes,
            isActive: true,
            hasMarketplace: true,
            hasResources: true,
            hasEvents: true,
            hasDocuments: true,
            hasForum: true,
            hasMessages: true,
            hasServicePros: true,
            hasLocalGuide: true,
            hasEmergency: true,
            hoaDuesAmount: commData.hoaDuesAmount,
            hoaDuesFrequency: commData.hoaDuesFrequency,
            hoaDuesDate: commData.hoaDuesDate,
            hoaContactEmail: commData.hoaContactEmail,
            emergencyAccessCode: commData.emergencyAccessCode,
            emergencyInstructions: commData.emergencyInstructions,
            planStatus: "active",
        }).returning();
        console.log(`  Community created: ${comm.id}`);

        // Add Super Admin as Admin member in every community
        const [superAdminMember] = await db.insert(members).values({
            userId: superAdminUserId,
            communityId: comm.id,
            role: "Admin",
            roles: ["Admin", "Board Member"],
            hoaPosition: "Super Admin",
            address: "1 Admin Way",
            joinedDate: new Date(),
            isOnline: true,
        }).returning();
        console.log(`  Super Admin member added (${superAdminMember.id})`);

        // Create users and members
        const memberIds: string[] = [superAdminMember.id];
        const memberUserMap: { memberId: string; name: string }[] = [
            { memberId: superAdminMember.id, name: "Eric Haynie" },
        ];

        for (const u of commUsers) {
            // Upsert user
            let userId: string;
            const [existing] = await db.select().from(users).where(eq(users.email, u.email));
            if (existing) {
                userId = existing.id;
            } else {
                const { data: suData } = useAdmin
                    ? await supabase.auth.admin.createUser({ email: u.email, password: "password123", email_confirm: true, user_metadata: { name: u.name } })
                    : await supabase.auth.signUp({ email: u.email, password: "password123", options: { data: { name: u.name } } });

                const insertVals: any = {
                    email: u.email,
                    name: u.name,
                    password: "password123",
                    avatar: u.name.split(" ").map(w => w[0]).join(""),
                };
                if (suData?.user?.id) insertVals.id = suData.user.id;

                const [newUser] = await db.insert(users).values(insertVals).returning();
                userId = newUser.id;
            }

            // Create member
            const roles = [u.role];
            if (u.hoaPosition) roles.push("Board Member");
            // Deduplicate
            const uniqueRoles = [...new Set(roles)];

            const [mem] = await db.insert(members).values({
                userId,
                communityId: comm.id,
                role: u.role,
                roles: uniqueRoles,
                hoaPosition: u.hoaPosition,
                address: u.address,
                skills: u.skills,
                equipment: u.equipment,
                joinedDate: new Date(),
                isOnline: false,
            }).returning();
            memberIds.push(mem.id);
            memberUserMap.push({ memberId: mem.id, name: u.name });
            console.log(`  Member: ${u.name} (${u.role}${u.hoaPosition ? ` / ${u.hoaPosition}` : ""})`);
        }

        // Events + RSVPs
        const commEvents = COMMUNITY_EVENTS[ci];
        for (const evt of commEvents) {
            const [newEvent] = await db.insert(events).values({
                communityId: comm.id,
                title: evt.title,
                description: evt.description,
                date: evt.date,
                time: evt.time,
                location: evt.location,
                category: evt.category,
                organizerId: memberIds[0], // Super admin organizes
                attendeesCount: 0,
            }).returning();

            // Random RSVPs from members
            let attendees = 0;
            for (let mi = 0; mi < memberIds.length; mi++) {
                if (Math.random() > 0.3) { // 70% chance of RSVP
                    const status = Math.random() > 0.2 ? "Going" : "Maybe";
                    const guests = Math.floor(Math.random() * 3) + 1;
                    await db.insert(eventRsvps).values({
                        eventId: newEvent.id,
                        neighborId: memberIds[mi],
                        status: status as any,
                        guestCount: guests,
                    });
                    if (status === "Going") attendees += guests;
                }
            }
        }
        console.log(`  Events: ${commEvents.length} created with RSVPs`);

        // Marketplace items
        const commMarket = COMMUNITY_MARKETPLACE[ci];
        for (let mi = 0; mi < commMarket.length; mi++) {
            const item = commMarket[mi];
            // Rotate sellers among non-admin members
            const sellerIdx = (mi % (memberIds.length - 1)) + 1;
            await db.insert(marketplaceItems).values({
                communityId: comm.id,
                title: item.title,
                description: item.description,
                price: item.price,
                isFree: item.isFree,
                isNegotiable: item.isNegotiable,
                sellerId: memberIds[sellerIdx],
                status: "Active",
                postedDate: new Date(),
            });
        }
        console.log(`  Marketplace: ${commMarket.length} items`);

        // Forum posts + comments + likes
        const commPosts = COMMUNITY_FORUM_POSTS[ci];
        for (let pi = 0; pi < commPosts.length; pi++) {
            const post = commPosts[pi];
            const authorIdx = (pi % (memberIds.length - 1)) + 1;
            const [newPost] = await db.insert(forumPosts).values({
                communityId: comm.id,
                authorId: memberIds[authorIdx],
                content: post.content,
                category: post.category,
                likes: 0,
            }).returning();

            // Add 1-2 comments from other members
            const commentCount = Math.floor(Math.random() * 2) + 1;
            for (let c = 0; c < commentCount; c++) {
                const commenterIdx = ((authorIdx + c + 1) % memberIds.length);
                const commentTexts = [
                    "Great point! I totally agree.",
                    "Thanks for bringing this up. I noticed the same thing.",
                    "I'm interested! Count me in.",
                    "Good to know. I'll keep an eye out.",
                    "Has anyone reported this to the board yet?",
                ];
                await db.insert(forumComments).values({
                    postId: newPost.id,
                    authorId: memberIds[commenterIdx],
                    content: commentTexts[c % commentTexts.length],
                });
            }

            // Add some likes
            const likeCount = Math.floor(Math.random() * 3) + 1;
            for (let l = 0; l < likeCount && l < memberIds.length; l++) {
                const likerIdx = (authorIdx + l + 1) % memberIds.length;
                await db.insert(forumLikes).values({
                    postId: newPost.id,
                    memberId: memberIds[likerIdx],
                });
            }
        }
        console.log(`  Forum: ${commPosts.length} posts with comments & likes`);

        // Service providers
        const commServices = COMMUNITY_SERVICES[ci];
        for (const svc of commServices) {
            await db.insert(serviceProviders).values({
                communityId: comm.id,
                name: svc.name,
                category: svc.category,
                phone: svc.phone,
                description: svc.description,
                rating: svc.rating,
                recommendedBy: memberUserMap[1]?.name || "Community",
            });
        }
        console.log(`  Service Providers: ${commServices.length}`);

        // Local places
        const commPlaces = COMMUNITY_PLACES[ci];
        for (const place of commPlaces) {
            await db.insert(localPlaces).values({
                communityId: comm.id,
                name: place.name,
                category: place.category,
                address: place.address,
                description: place.description,
                rating: place.rating,
            });
        }
        console.log(`  Local Places: ${commPlaces.length}`);

        // Resources + Reservations
        const commResources = COMMUNITY_RESOURCES[ci];
        for (const res of commResources) {
            const [newRes] = await db.insert(resources).values({
                communityId: comm.id,
                name: res.name,
                type: res.type,
                capacity: res.capacity,
                description: res.description,
                isReservable: res.isReservable,
            }).returning();

            // Add a reservation if reservable
            if (res.isReservable && memberIds.length > 2) {
                await db.insert(reservations).values({
                    communityId: comm.id,
                    resourceId: newRes.id,
                    userId: memberIds[2], // A regular member
                    date: "2026-04-01",
                    startTime: "10:00:00",
                    endTime: "12:00:00",
                    status: "Confirmed",
                });
            }
        }
        console.log(`  Resources: ${commResources.length} (with reservations)`);

        // Documents
        const commDocs = COMMUNITY_DOCUMENTS[ci];
        for (const doc of commDocs) {
            await db.insert(documents).values({
                communityId: comm.id,
                name: doc.name,
                category: doc.category,
                size: doc.size,
                url: doc.url,
                uploaderId: memberIds[0], // Admin uploaded
            });
        }
        console.log(`  Documents: ${commDocs.length}`);

        // Announcements
        const commAnnouncements = COMMUNITY_ANNOUNCEMENTS[ci];
        for (const ann of commAnnouncements) {
            await db.insert(announcements).values({
                communityId: comm.id,
                title: ann.title,
                content: ann.content,
                authorId: memberIds[0], // Admin authored
            });
        }
        console.log(`  Announcements: ${commAnnouncements.length}`);

        // Direct messages (between first few members)
        if (memberIds.length >= 3) {
            for (let di = 0; di < DM_TEMPLATES.length && di < 5; di++) {
                const sendIdx = di % 2 === 0 ? 1 : 2;
                const recvIdx = di % 2 === 0 ? 2 : 1;
                await db.insert(directMessages).values({
                    senderId: memberIds[sendIdx],
                    recipientId: memberIds[recvIdx],
                    content: DM_TEMPLATES[di].content,
                    isRead: di < 3, // first few are read
                });
            }
            console.log(`  Direct Messages: ${Math.min(DM_TEMPLATES.length, 5)}`);
        }

        console.log("");
    }

    // ── Summary ──────────────────────────────────────────────────
    console.log("════════════════════════════════════════════════════");
    console.log("Seed complete!");
    console.log("════════════════════════════════════════════════════");
    console.log("");
    console.log("Super Admin (all communities):");
    console.log(`  Email: ${SUPER_ADMIN_EMAIL}`);
    console.log("  Password: temp123");
    console.log("");
    console.log("Communities:");
    for (let ci = 0; ci < COMMUNITIES.length; ci++) {
        const c = COMMUNITIES[ci];
        console.log(`  ${c.name} (/${c.slug})`);
        console.log(`    HOA Dues: $${c.hoaDuesAmount} ${c.hoaDuesFrequency}`);
        console.log(`    Members: ${COMMUNITY_USERS[ci].length} + Super Admin`);
        console.log(`    Admin/Officer: ${COMMUNITY_USERS[ci][0].name} (${COMMUNITY_USERS[ci][0].hoaPosition})`);
    }
    console.log("");
    console.log("All regular users password: password123");
    console.log("════════════════════════════════════════════════════");

    process.exit(0);
}

main().catch((err: any) => {
    console.dir(err, { depth: null });
    process.exit(1);
});
