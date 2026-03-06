'use server'

import { db } from "@/db";
import {
    users, members, communities,
    invitations, events, marketplaceItems, documents,
    eventRsvps, forumPosts, forumComments, forumLikes,
    announcements, directMessages, serviceProviders,
    localPlaces, resources, reservations
} from "@/db/schema";

export async function resetAndSeed() {
    try {
        console.log("[SEED] Starting Full Database Reset...");

        // ============================================================
        // PHASE 1: DELETE EVERYTHING (order matters for FK constraints)
        // ============================================================

        // Level 4 - deepest dependents
        await db.delete(forumLikes);
        await db.delete(forumComments);
        await db.delete(eventRsvps);
        await db.delete(directMessages);
        await db.delete(reservations);
        console.log("[SEED] Level 4 deleted.");

        // Level 3
        await db.delete(forumPosts);
        await db.delete(invitations);
        await db.delete(events);
        await db.delete(marketplaceItems);
        await db.delete(documents);
        await db.delete(announcements);
        await db.delete(serviceProviders);
        await db.delete(localPlaces);
        await db.delete(resources);
        console.log("[SEED] Level 3 deleted.");

        // Level 2 - members
        await db.delete(members);
        console.log("[SEED] Members deleted.");

        // Level 1 - users
        await db.delete(users);
        console.log("[SEED] Users deleted.");

        // Level 0 - communities
        await db.delete(communities);
        console.log("[SEED] Communities deleted.");

        // ============================================================
        // PHASE 2: CREATE 3 COMMUNITIES
        // ============================================================

        const [oakHills] = await db.insert(communities).values({
            name: "Oak Hills HOA",
            slug: "oak-hills",
            planTuple: "growth_250",
            maxHomes: 250,
            isActive: true,
            primaryColor: "#2563eb",
            secondaryColor: "#1e3a5f",
            accentColor: "#f59e0b",
            hasMarketplace: true,
            hasResources: true,
            hasEvents: true,
            hasDocuments: true,
            hasForum: true,
            hasMessages: true,
            hasServicePros: true,
            hasLocalGuide: true,
            hasEmergency: true,
            emergencyAccessCode: "OAK2024",
            emergencyInstructions: "Main gate code: #4455. After hours, call security at 555-0100.",
            hoaDuesAmount: "275.00",
            hoaDuesFrequency: "Monthly",
            hoaDuesDate: "1st",
            hoaContactEmail: "hoa@oakhills.example.com",
        }).returning();

        const [mapleCreek] = await db.insert(communities).values({
            name: "Maple Creek Condos",
            slug: "maple-creek",
            planTuple: "starter_100",
            maxHomes: 100,
            isActive: true,
            primaryColor: "#059669",
            secondaryColor: "#064e3b",
            accentColor: "#f97316",
            hasMarketplace: true,
            hasResources: true,
            hasEvents: true,
            hasDocuments: true,
            hasForum: true,
            hasMessages: true,
            hasServicePros: false,
            hasLocalGuide: true,
            hasEmergency: true,
            emergencyAccessCode: "MPC911",
            emergencyInstructions: "Front desk: ext 100. Building manager on-call: 555-0200.",
            hoaDuesAmount: "450.00",
            hoaDuesFrequency: "Monthly",
            hoaDuesDate: "15th",
            hoaContactEmail: "board@maplecreek.example.com",
        }).returning();

        const [pinewoodEstates] = await db.insert(communities).values({
            name: "Pinewood Estates",
            slug: "pinewood-estates",
            planTuple: "pro_500",
            maxHomes: 500,
            isActive: true,
            primaryColor: "#7c3aed",
            secondaryColor: "#312e81",
            accentColor: "#ec4899",
            hasMarketplace: true,
            hasResources: true,
            hasEvents: true,
            hasDocuments: true,
            hasForum: true,
            hasMessages: true,
            hasServicePros: true,
            hasLocalGuide: true,
            hasEmergency: true,
            emergencyAccessCode: "PINE999",
            emergencyInstructions: "Gate remote freq: 315MHz. Guardhouse: 555-0300. Non-emergency: 555-0301.",
            hoaDuesAmount: "175.00",
            hoaDuesFrequency: "Quarterly",
            hoaDuesDate: "1st",
            hoaContactEmail: "admin@pinewood-estates.example.com",
        }).returning();

        console.log("[SEED] 3 Communities created.");

        // ============================================================
        // PHASE 3: CREATE USERS
        // ============================================================
        // NOTE: These are DB records only. Supabase Auth accounts must be
        // created separately (via /join flow or Supabase dashboard) with
        // matching emails and the passwords listed below.

        // --- Oak Hills Users ---
        const [sarahAdmin] = await db.insert(users).values({
            name: "Sarah Chen",
            email: "sarah.chen@oakhills.example.com",
            password: "OakAdmin1!",
            avatar: "SC",
        }).returning();

        const [jamesResident] = await db.insert(users).values({
            name: "James Wilson",
            email: "james.wilson@oakhills.example.com",
            password: "OakRes123!",
            avatar: "JW",
        }).returning();

        const [mariaBoard] = await db.insert(users).values({
            name: "Maria Garcia",
            email: "maria.garcia@oakhills.example.com",
            password: "OakBoard1!",
            avatar: "MG",
        }).returning();

        const [tomResident] = await db.insert(users).values({
            name: "Tom Bradley",
            email: "tom.bradley@oakhills.example.com",
            password: "OakRes456!",
            avatar: "TB",
        }).returning();

        // --- Maple Creek Users ---
        const [linaAdmin] = await db.insert(users).values({
            name: "Lina Patel",
            email: "lina.patel@maplecreek.example.com",
            password: "MapleAdmin1!",
            avatar: "LP",
        }).returning();

        const [derekResident] = await db.insert(users).values({
            name: "Derek Nguyen",
            email: "derek.nguyen@maplecreek.example.com",
            password: "MapleRes123!",
            avatar: "DN",
        }).returning();

        const [amyResident] = await db.insert(users).values({
            name: "Amy Foster",
            email: "amy.foster@maplecreek.example.com",
            password: "MapleRes456!",
            avatar: "AF",
        }).returning();

        // --- Pinewood Estates Users ---
        const [robertAdmin] = await db.insert(users).values({
            name: "Robert Kim",
            email: "robert.kim@pinewood.example.com",
            password: "PineAdmin1!",
            avatar: "RK",
        }).returning();

        const [jessicaResident] = await db.insert(users).values({
            name: "Jessica Martinez",
            email: "jessica.martinez@pinewood.example.com",
            password: "PineRes123!",
            avatar: "JM",
        }).returning();

        const [benBoard] = await db.insert(users).values({
            name: "Ben Thompson",
            email: "ben.thompson@pinewood.example.com",
            password: "PineBoard1!",
            avatar: "BT",
        }).returning();

        const [evaResident] = await db.insert(users).values({
            name: "Eva Russo",
            email: "eva.russo@pinewood.example.com",
            password: "PineRes456!",
            avatar: "ER",
        }).returning();

        // --- Multi-community user (belongs to Oak Hills AND Maple Creek) ---
        const [crossUser] = await db.insert(users).values({
            name: "Alex Rivera",
            email: "alex.rivera@example.com",
            password: "Multi123!",
            avatar: "AR",
        }).returning();

        console.log("[SEED] 12 Users created.");

        // ============================================================
        // PHASE 4: CREATE MEMBERSHIPS
        // ============================================================

        // Oak Hills members
        const [sarahMember] = await db.insert(members).values({
            userId: sarahAdmin.id, communityId: oakHills.id,
            role: "Admin", roles: ["Admin"], address: "101 Oak Hills Dr",
            hoaPosition: "President", joinedDate: new Date("2023-06-01"), isOnline: true,
        }).returning();

        const [jamesMember] = await db.insert(members).values({
            userId: jamesResident.id, communityId: oakHills.id,
            role: "Resident", roles: ["Resident"], address: "205 Oak Hills Dr",
            joinedDate: new Date("2023-08-15"), isOnline: false,
            skills: ["Plumbing", "Electrical"],
        }).returning();

        const [mariaMember] = await db.insert(members).values({
            userId: mariaBoard.id, communityId: oakHills.id,
            role: "Board Member", roles: ["Board Member"], address: "312 Oak Hills Ct",
            hoaPosition: "Treasurer", joinedDate: new Date("2023-07-01"), isOnline: true,
        }).returning();

        const [tomMember] = await db.insert(members).values({
            userId: tomResident.id, communityId: oakHills.id,
            role: "Resident", roles: ["Resident"], address: "418 Oak Hills Ln",
            joinedDate: new Date("2024-01-10"), isOnline: false,
            personalEmergencyCode: "TOM#7788",
            personalEmergencyInstructions: "Medication list on fridge. Allergic to penicillin.",
        }).returning();

        // Maple Creek members
        const [linaMember] = await db.insert(members).values({
            userId: linaAdmin.id, communityId: mapleCreek.id,
            role: "Admin", roles: ["Admin"], address: "Unit 4A, Maple Creek",
            hoaPosition: "Community Manager", joinedDate: new Date("2023-05-01"), isOnline: true,
        }).returning();

        const [derekMember] = await db.insert(members).values({
            userId: derekResident.id, communityId: mapleCreek.id,
            role: "Resident", roles: ["Resident"], address: "Unit 7B, Maple Creek",
            joinedDate: new Date("2023-09-20"), isOnline: true,
            skills: ["Cooking", "Photography"],
        }).returning();

        const [amyMember] = await db.insert(members).values({
            userId: amyResident.id, communityId: mapleCreek.id,
            role: "Resident", roles: ["Resident"], address: "Unit 12C, Maple Creek",
            joinedDate: new Date("2024-02-01"), isOnline: false,
        }).returning();

        // Pinewood Estates members
        const [robertMember] = await db.insert(members).values({
            userId: robertAdmin.id, communityId: pinewoodEstates.id,
            role: "Admin", roles: ["Admin"], address: "1 Pinewood Circle",
            hoaPosition: "HOA President", joinedDate: new Date("2022-12-01"), isOnline: true,
        }).returning();

        const [jessicaMember] = await db.insert(members).values({
            userId: jessicaResident.id, communityId: pinewoodEstates.id,
            role: "Resident", roles: ["Resident"], address: "45 Pinewood Lane",
            joinedDate: new Date("2023-03-15"), isOnline: false,
            skills: ["Gardening", "First Aid"],
        }).returning();

        const [benMember] = await db.insert(members).values({
            userId: benBoard.id, communityId: pinewoodEstates.id,
            role: "Board Member", roles: ["Board Member"], address: "78 Pinewood Ct",
            hoaPosition: "Vice President", joinedDate: new Date("2023-01-10"), isOnline: true,
        }).returning();

        const [evaMember] = await db.insert(members).values({
            userId: evaResident.id, communityId: pinewoodEstates.id,
            role: "Resident", roles: ["Resident"], address: "120 Pinewood Way",
            joinedDate: new Date("2024-05-01"), isOnline: false,
        }).returning();

        // Alex Rivera - multi-community (Oak Hills + Maple Creek)
        const [alexOakMember] = await db.insert(members).values({
            userId: crossUser.id, communityId: oakHills.id,
            role: "Resident", roles: ["Resident"], address: "502 Oak Hills Dr",
            joinedDate: new Date("2024-03-01"), isOnline: true,
        }).returning();

        const [alexMapleMember] = await db.insert(members).values({
            userId: crossUser.id, communityId: mapleCreek.id,
            role: "Resident", roles: ["Resident"], address: "Unit 3D, Maple Creek",
            joinedDate: new Date("2024-06-01"), isOnline: true,
        }).returning();

        console.log("[SEED] 13 Memberships created.");

        // ============================================================
        // PHASE 5: SAMPLE EVENTS
        // ============================================================

        const [oakEvent1] = await db.insert(events).values({
            communityId: oakHills.id, title: "Summer Block Party",
            description: "Annual neighborhood cookout with live music, games for kids, and a potluck. Bring a dish to share!",
            date: "2026-04-12", time: "16:00", location: "Oak Hills Community Park",
            category: "Social", organizerId: sarahMember.id, attendeesCount: 45,
        }).returning();

        const [oakEvent2] = await db.insert(events).values({
            communityId: oakHills.id, title: "Q2 HOA Board Meeting",
            description: "Quarterly board meeting to discuss budget, landscaping contract renewal, and pool season prep.",
            date: "2026-03-20", time: "19:00", location: "Clubhouse Conference Room",
            category: "HOA", organizerId: mariaMember.id, attendeesCount: 12,
        }).returning();

        await db.insert(events).values({
            communityId: oakHills.id, title: "Spring Landscaping Day",
            description: "Volunteer to help plant flowers and mulch common areas. Gloves and tools provided.",
            date: "2026-03-29", time: "09:00", location: "Front Entrance Gardens",
            category: "Maintenance", organizerId: jamesMember.id, attendeesCount: 8,
        });

        const [mapleEvent1] = await db.insert(events).values({
            communityId: mapleCreek.id, title: "Rooftop Movie Night",
            description: "Showing 'The Grand Budapest Hotel' on the rooftop deck. Popcorn provided!",
            date: "2026-03-21", time: "20:00", location: "Rooftop Terrace",
            category: "Social", organizerId: linaMember.id, attendeesCount: 22,
        }).returning();

        await db.insert(events).values({
            communityId: mapleCreek.id, title: "Condo Association Q1 Review",
            description: "Review of building maintenance, upcoming elevator renovation, and reserve fund status.",
            date: "2026-03-15", time: "18:30", location: "Community Room B",
            category: "HOA", organizerId: linaMember.id, attendeesCount: 15,
        });

        const [pineEvent1] = await db.insert(events).values({
            communityId: pinewoodEstates.id, title: "Easter Egg Hunt",
            description: "Kids 2-12 welcome! Over 500 eggs hidden across the meadow. Prizes for most eggs found.",
            date: "2026-04-05", time: "10:00", location: "Pinewood Meadow",
            category: "Social", organizerId: robertMember.id, attendeesCount: 60,
        }).returning();

        await db.insert(events).values({
            communityId: pinewoodEstates.id, title: "Neighborhood Watch Kickoff",
            description: "Meet your area captains and learn about our new safety app integration.",
            date: "2026-03-18", time: "19:00", location: "Pinewood Clubhouse",
            category: "Security", organizerId: benMember.id, attendeesCount: 35,
        });

        console.log("[SEED] 7 Events created.");

        // RSVPs
        await db.insert(eventRsvps).values([
            { eventId: oakEvent1.id, neighborId: jamesMember.id, guestCount: 2, status: "Going" },
            { eventId: oakEvent1.id, neighborId: tomMember.id, guestCount: 1, status: "Going" },
            { eventId: oakEvent1.id, neighborId: alexOakMember.id, guestCount: 1, status: "Maybe" },
            { eventId: oakEvent2.id, neighborId: mariaMember.id, guestCount: 1, status: "Going" },
            { eventId: mapleEvent1.id, neighborId: derekMember.id, guestCount: 2, status: "Going" },
            { eventId: mapleEvent1.id, neighborId: alexMapleMember.id, guestCount: 1, status: "Going" },
            { eventId: pineEvent1.id, neighborId: jessicaMember.id, guestCount: 3, status: "Going" },
            { eventId: pineEvent1.id, neighborId: evaMember.id, guestCount: 2, status: "Going" },
        ]);

        console.log("[SEED] 8 RSVPs created.");

        // ============================================================
        // PHASE 6: MARKETPLACE ITEMS
        // ============================================================

        await db.insert(marketplaceItems).values([
            {
                communityId: oakHills.id, title: "Weber Gas Grill - Like New",
                description: "3-burner propane grill, used one season. Includes cover and propane tank.", price: "150.00",
                isFree: false, isNegotiable: true, status: "Active", sellerId: jamesMember.id,
            },
            {
                communityId: oakHills.id, title: "Free Moving Boxes",
                description: "20+ assorted moving boxes from our recent move. Come pick up anytime.",
                price: "0", isFree: true, isNegotiable: false, status: "Active", sellerId: tomMember.id,
            },
            {
                communityId: oakHills.id, title: "Kids Bicycle (age 6-9)",
                description: "Purple 20-inch girls bike with training wheels. Minor scratches.", price: "45.00",
                isFree: false, isNegotiable: true, status: "Active", sellerId: alexOakMember.id,
            },
            {
                communityId: mapleCreek.id, title: "Standing Desk Converter",
                description: "Adjustable sit-stand desk converter, fits on any desk. Great for WFH.", price: "80.00",
                isFree: false, isNegotiable: true, status: "Active", sellerId: derekMember.id,
            },
            {
                communityId: mapleCreek.id, title: "Sourdough Starter - Free",
                description: "Active sourdough starter, 6 months old. Text me and I'll leave it at your door.",
                price: "0", isFree: true, isNegotiable: false, status: "Active", sellerId: amyMember.id,
            },
            {
                communityId: pinewoodEstates.id, title: "Riding Lawn Mower",
                description: "John Deere E100, 42-inch deck. 3 years old, well maintained.", price: "900.00",
                isFree: false, isNegotiable: true, status: "Active", sellerId: benMember.id,
            },
            {
                communityId: pinewoodEstates.id, title: "Patio Furniture Set",
                description: "6-piece wicker set with cushions. Table + 4 chairs + loveseat.", price: "350.00",
                isFree: false, isNegotiable: false, status: "Active", sellerId: jessicaMember.id,
            },
        ]);

        console.log("[SEED] 7 Marketplace items created.");

        // ============================================================
        // PHASE 7: FORUM POSTS & COMMENTS
        // ============================================================

        const [oakPost1] = await db.insert(forumPosts).values({
            communityId: oakHills.id, authorId: jamesMember.id,
            content: "Has anyone else noticed the streetlights on Elm Ct are flickering? Reported it to the city but curious if others have too.",
            category: "Maintenance", likes: 5,
        }).returning();

        const [oakPost2] = await db.insert(forumPosts).values({
            communityId: oakHills.id, authorId: tomMember.id,
            content: "Looking for recommendations for a good house painter. Need the exterior done before summer.",
            category: "Recommendations", likes: 3,
        }).returning();

        const [maplePost1] = await db.insert(forumPosts).values({
            communityId: mapleCreek.id, authorId: derekMember.id,
            content: "The gym equipment is really outdated. Can we discuss an upgrade at the next meeting? I'd be willing to help research options.",
            category: "Amenities", likes: 8,
        }).returning();

        const [pinePost1] = await db.insert(forumPosts).values({
            communityId: pinewoodEstates.id, authorId: jessicaMember.id,
            content: "Starting a community garden plot signup! We have 12 raised beds available for the spring season. First come first served.",
            category: "General", likes: 14,
        }).returning();

        const [pinePost2] = await db.insert(forumPosts).values({
            communityId: pinewoodEstates.id, authorId: evaMember.id,
            content: "Anyone interested in a weekly walking group? I was thinking Saturday mornings around the lake trail.",
            category: "Social", likes: 7,
        }).returning();

        // Comments
        await db.insert(forumComments).values([
            { postId: oakPost1.id, authorId: sarahMember.id, content: "I've noticed it too. I'll follow up with the utility company this week." },
            { postId: oakPost1.id, authorId: mariaMember.id, content: "The board already submitted a maintenance request. Should be fixed within 2 weeks." },
            { postId: oakPost2.id, authorId: alexOakMember.id, content: "We used ColorCraft Painting last year - they were great. About $3,500 for a 2-story." },
            { postId: maplePost1.id, authorId: linaMember.id, content: "Great idea Derek! I'll add this as an agenda item for next month's meeting." },
            { postId: maplePost1.id, authorId: amyMember.id, content: "I agree, especially the treadmills. The display on #3 hasn't worked in months." },
            { postId: pinePost1.id, authorId: robertMember.id, content: "Wonderful initiative Jessica! I'll get the water hookups checked before the season starts." },
            { postId: pinePost1.id, authorId: benMember.id, content: "Sign me up for plot #7 if it's still available!" },
            { postId: pinePost2.id, authorId: jessicaMember.id, content: "I'm in! 8am Saturdays works for me." },
        ]);

        // Likes
        await db.insert(forumLikes).values([
            { postId: oakPost1.id, memberId: sarahMember.id },
            { postId: oakPost1.id, memberId: mariaMember.id },
            { postId: maplePost1.id, memberId: linaMember.id },
            { postId: maplePost1.id, memberId: amyMember.id },
            { postId: pinePost1.id, memberId: robertMember.id },
            { postId: pinePost1.id, memberId: benMember.id },
            { postId: pinePost2.id, memberId: jessicaMember.id },
        ]);

        console.log("[SEED] 5 Forum posts, 8 comments, 7 likes created.");

        // ============================================================
        // PHASE 8: ANNOUNCEMENTS
        // ============================================================

        await db.insert(announcements).values([
            {
                communityId: oakHills.id, title: "Pool Opening Day - April 1st",
                content: "The community pool opens April 1st! Pool passes available at the clubhouse. Hours: 10am-8pm daily.",
                authorId: sarahMember.id,
            },
            {
                communityId: oakHills.id, title: "Trash Collection Schedule Change",
                content: "Starting March 15, recycling pickup moves from Wednesday to Thursday. Regular trash remains on Monday.",
                authorId: mariaMember.id,
            },
            {
                communityId: mapleCreek.id, title: "Elevator Renovation Notice",
                content: "Elevator B will be out of service March 10-24 for modernization. Please use Elevator A or stairs during this period.",
                authorId: linaMember.id,
            },
            {
                communityId: pinewoodEstates.id, title: "New Playground Equipment Installed",
                content: "The new playground equipment has been installed at the east park! Ribbon cutting this Saturday at 10am.",
                authorId: robertMember.id,
            },
            {
                communityId: pinewoodEstates.id, title: "Speed Limit Reminder",
                content: "Please observe the 15 MPH speed limit throughout the neighborhood. We've had reports of speeding on Pinewood Circle.",
                authorId: benMember.id,
            },
        ]);

        console.log("[SEED] 5 Announcements created.");

        // ============================================================
        // PHASE 9: DIRECT MESSAGES
        // ============================================================

        await db.insert(directMessages).values([
            { senderId: jamesMember.id, recipientId: sarahMember.id, content: "Hey Sarah, are we still on for the planning meeting Thursday?" },
            { senderId: sarahMember.id, recipientId: jamesMember.id, content: "Yes! 7pm at the clubhouse. Can you bring the landscaping quotes?" },
            { senderId: derekMember.id, recipientId: linaMember.id, content: "Lina, do we have a budget number for the gym equipment upgrade?" },
            { senderId: linaMember.id, recipientId: derekMember.id, content: "I'm pulling numbers together. Looking at around $5,000 from the reserve fund." },
            { senderId: jessicaMember.id, recipientId: robertMember.id, content: "Robert, 8 people have signed up for garden plots already!" },
        ]);

        console.log("[SEED] 5 Direct messages created.");

        // ============================================================
        // PHASE 10: SERVICE PROVIDERS
        // ============================================================

        await db.insert(serviceProviders).values([
            { communityId: oakHills.id, name: "ColorCraft Painting", category: "Painting", phone: "555-0150", rating: "4.8", description: "Interior and exterior. Licensed & insured. Oak Hills resident discount.", recommendedBy: "Alex Rivera" },
            { communityId: oakHills.id, name: "Green Thumb Landscaping", category: "Landscaping", phone: "555-0160", rating: "4.5", description: "Lawn care, tree trimming, seasonal planting.", recommendedBy: "Sarah Chen" },
            { communityId: oakHills.id, name: "Quick Fix Plumbing", category: "Plumbing", phone: "555-0170", rating: "4.9", description: "24/7 emergency plumbing. Fair prices.", recommendedBy: "James Wilson" },
            { communityId: pinewoodEstates.id, name: "Pine State Electric", category: "Electrical", phone: "555-0180", rating: "4.7", description: "Residential electrical, panel upgrades, EV charger installs.", recommendedBy: "Robert Kim" },
            { communityId: pinewoodEstates.id, name: "Four Seasons HVAC", category: "HVAC", phone: "555-0190", rating: "4.6", description: "AC/heating repair and installation. Annual maintenance plans available.", recommendedBy: "Ben Thompson" },
        ]);

        console.log("[SEED] 5 Service providers created.");

        // ============================================================
        // PHASE 11: LOCAL GUIDE
        // ============================================================

        await db.insert(localPlaces).values([
            { communityId: oakHills.id, name: "Oak Barrel Coffee", category: "Coffee", address: "2100 Main St", description: "Best local coffee shop. Try the cold brew!", rating: "4.7" },
            { communityId: oakHills.id, name: "Sunrise Yoga Studio", category: "Fitness", address: "2205 Elm Ave", description: "Drop-in classes $15. Community discount with Oak Hills ID.", rating: "4.5" },
            { communityId: mapleCreek.id, name: "Noodle House", category: "Restaurant", address: "88 Creek Rd", description: "Excellent pho and bao buns. Quick lunch spot.", rating: "4.6" },
            { communityId: mapleCreek.id, name: "Maple Creek Dog Park", category: "Parks", address: "50 Maple Ln", description: "Off-leash dog park with separate small dog area.", rating: "4.3" },
            { communityId: pinewoodEstates.id, name: "Lakeside Grill", category: "Restaurant", address: "1 Lake Dr", description: "Waterfront dining with amazing sunset views. Reservations recommended.", rating: "4.8" },
            { communityId: pinewoodEstates.id, name: "Pine Trail Bike Shop", category: "Shopping", address: "300 Commerce Blvd", description: "Sales, rentals, and repairs. 10% off for Pinewood residents.", rating: "4.4" },
        ]);

        console.log("[SEED] 6 Local places created.");

        // ============================================================
        // PHASE 12: COMMUNITY RESOURCES
        // ============================================================

        const [oakClubhouse] = await db.insert(resources).values({
            communityId: oakHills.id, name: "Clubhouse Event Room",
            type: "Facility", capacity: 80,
            description: "Large event room with kitchen access, projector, and sound system.",
            isReservable: true,
        }).returning();

        await db.insert(resources).values([
            {
                communityId: oakHills.id, name: "Community Pool",
                type: "Facility", capacity: 50,
                description: "Heated pool with lap lanes and kiddie pool. Open April-October.",
                isReservable: false,
            },
            {
                communityId: mapleCreek.id, name: "Rooftop Terrace",
                type: "Facility", capacity: 30,
                description: "Rooftop event space with skyline views. Includes grill area.",
                isReservable: true,
            },
            {
                communityId: mapleCreek.id, name: "Guest Suite",
                type: "Facility", capacity: 4,
                description: "1BR guest apartment for visiting family. Max 3-night stay.",
                isReservable: true,
            },
            {
                communityId: pinewoodEstates.id, name: "Tennis Courts (2)",
                type: "Facility", capacity: 4,
                description: "Two hard-surface courts with lights. 1-hour time slots.",
                isReservable: true,
            },
            {
                communityId: pinewoodEstates.id, name: "Pressure Washer",
                type: "Tool", capacity: 1,
                description: "3100 PSI gas pressure washer. Checkout from guardhouse.",
                isReservable: true,
            },
        ]);

        console.log("[SEED] 6 Resources created.");

        // ============================================================
        // PHASE 13: INVITATIONS (some pending for testing)
        // ============================================================

        await db.insert(invitations).values([
            {
                communityId: oakHills.id, code: "OAK001",
                email: "newresident@oakhills.example.com", invitedName: "New Oak Resident",
                role: "Resident", status: "pending", createdBy: sarahMember.id,
            },
            {
                communityId: mapleCreek.id, code: "MPC001",
                email: "newcondo@maplecreek.example.com", invitedName: "New Condo Owner",
                role: "Resident", status: "pending", createdBy: linaMember.id,
            },
            {
                communityId: pinewoodEstates.id, code: "PIN001",
                email: "newhome@pinewood.example.com", invitedName: "New Pine Homeowner",
                role: "Resident", status: "pending", createdBy: robertMember.id,
            },
        ]);

        console.log("[SEED] 3 Pending invitations created.");

        // ============================================================
        // PHASE 14: HOA DOCUMENTS
        // ============================================================

        await db.insert(documents).values([
            { communityId: oakHills.id, name: "2026 Annual Budget", category: "Financial", size: "245 KB", uploaderId: mariaMember.id },
            { communityId: oakHills.id, name: "CC&Rs - Amended 2025", category: "Governance", size: "1.2 MB", uploaderId: sarahMember.id },
            { communityId: mapleCreek.id, name: "Condo Bylaws", category: "Governance", size: "890 KB", uploaderId: linaMember.id },
            { communityId: mapleCreek.id, name: "Building Insurance Certificate", category: "Insurance", size: "156 KB", uploaderId: linaMember.id },
            { communityId: pinewoodEstates.id, name: "Architectural Guidelines", category: "Governance", size: "2.1 MB", uploaderId: robertMember.id },
            { communityId: pinewoodEstates.id, name: "Reserve Study 2025", category: "Financial", size: "3.4 MB", uploaderId: benMember.id },
        ]);

        console.log("[SEED] 6 Documents created.");

        // ============================================================
        // DONE
        // ============================================================

        console.log("[SEED] COMPLETE! All data seeded successfully.");

        return {
            success: true,
            summary: {
                communities: 3,
                users: 12,
                memberships: 13,
                events: 7,
                marketplaceItems: 7,
                forumPosts: 5,
                announcements: 5,
                messages: 5,
                serviceProviders: 5,
                localPlaces: 6,
                resources: 6,
                invitations: 3,
                documents: 6,
            },
        };

    } catch (e: any) {
        console.error("[SEED] Failed:", e);
        return { success: false, error: "Seed failed: " + e.message };
    }
}
