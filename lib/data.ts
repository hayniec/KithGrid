import { Neighbor } from "@/types/neighbor";
import { Event } from "@/types/event";
import { HoaDocument } from "@/types/hoa";
import { CommunityResource } from "@/types/resource";
import { MarketplaceItem } from "@/types/marketplace";

export const MOCK_NEIGHBORS: Neighbor[] = [
    {
        id: "1",
        name: "Sarah Jenkins",
        role: "Board Member",
        address: "124 Maple Drive",
        avatar: "SJ",
        phone: "555-0101",
        skills: ["Gardening", "Event Planning", "Notary Public", "First Aid/CPR"],
        equipment: [
            { id: "e1", name: "Pressure Washer", isAvailable: true },
            { id: "e2", name: "Extension Ladder (20ft)", isAvailable: false, dueDate: "2024-02-15", borrowerName: "Dave" },
            { id: "e3", name: "Folding Tables", isAvailable: true }
        ],
        joinedDate: "2023-01-15",
        isOnline: true,
    },
    {
        id: "2",
        name: "Mike Chen",
        role: "Resident",
        address: "128 Maple Drive",
        avatar: "MC",
        phone: "555-0102",
        skills: ["Plumbing", "Electrical", "Auto Repair", "Generator Maint."],
        equipment: [
            { id: "e4", name: "Power Drill Set", isAvailable: true },
            { id: "e5", name: "Air Compressor", isAvailable: true },
            { id: "e6", name: "Heavy Duty Dolly", isAvailable: false, dueDate: "2024-02-12", borrowerName: "Sarah" }
        ],
        joinedDate: "2023-03-10",
        isOnline: false,
    },
    {
        id: "3",
        name: "Emily Rodriguez",
        role: "Resident",
        address: "135 Oak Lane",
        avatar: "ER",
        phone: "555-0103",
        skills: ["Graphic Design", "Photography", "Pet Sitting", "Nurse"],
        equipment: [
            { id: "e7", name: "DSLR Camera", isAvailable: true },
            { id: "e8", name: "Projector", isAvailable: true },
            { id: "e9", name: "Cornhole Set", isAvailable: true }
        ],
        joinedDate: "2023-06-22",
        isOnline: true,
    },
    {
        id: "4",
        name: "David Kim",
        role: "Resident",
        address: "142 Oak Lane",
        avatar: "DK",
        phone: "555-0104",
        skills: ["Coding", "Math Tutoring", "Piano"],
        equipment: [
            { id: "e10", name: "Pickup Truck", isAvailable: false, dueDate: "2024-02-14", borrowerName: "Mike" },
            { id: "e11", name: "Snow Blower", isAvailable: true },
            { id: "e12", name: "Lawn Aerator", isAvailable: true }
        ],
        joinedDate: "2023-08-05",
        isOnline: false,
    },
    {
        id: "5",
        name: "Lisa Thompson",
        role: "Resident",
        address: "119 Pine Street",
        avatar: "LT",
        phone: "555-0105",
        skills: ["Baking", "Sewing", "Accounting"],
        equipment: [
            { id: "e13", name: "Stand Mixer", isAvailable: true },
            { id: "e14", name: "Sewing Machine", isAvailable: true },
            { id: "e15", name: "Large Cooler", isAvailable: true }
        ],
        joinedDate: "2023-11-30",
        isOnline: true,
    }
];

export const MOCK_EVENTS: Event[] = [
    {
        id: "ev1",
        title: "Monthly HOA Meeting",
        description: "Monthly board meeting open to all residents. Agenda includes budget review and upcoming summer projects.",
        date: "2024-02-12",
        time: "7:00 PM",
        location: "Community Center",
        category: "HOA",
        organizer: "Sarah Jenkins",
        attendees: 12
    },
    {
        id: "ev2",
        title: "Valentine's Social Mixer",
        description: "Bring a snack to share and meet your neighbors! Drinks and music provided.",
        date: "2024-02-14",
        time: "6:00 PM",
        location: "Park Pavilion",
        category: "Social",
        organizer: "Emily Rodriguez",
        attendees: 28
    },
    {
        id: "ev3",
        title: "Community Pool Maintenance",
        description: "Pool will be closed for cleaning. Volunteers needed for deck scrubbing.",
        date: "2024-02-20",
        time: "9:00 AM",
        location: "Community Pool",
        category: "Maintenance",
        organizer: "HOA Board",
        attendees: 5
    },
    {
        id: "ev4",
        title: "Neighborhood Watch Training",
        description: "Learn safety tips and how to report suspicious activity from our local liaison.",
        date: "2024-02-25",
        time: "2:00 PM",
        location: "Library Meeting Room",
        category: "Security",
        organizer: "David Kim",
        attendees: 15
    },
    {
        id: "ev5",
        title: "Spring Gardening Workshop",
        description: "Get ready for spring planting with tips from our master gardeners.",
        date: "2024-03-05",
        time: "10:00 AM",
        location: "Community Garden",
        category: "Social",
        organizer: "Sarah Jenkins",
        attendees: 20
    }
];

export const MOCK_DOCUMENTS: HoaDocument[] = [
    {
        id: "d1",
        name: "HOA Bylaws & Covenants",
        category: "Rules",
        uploadDate: "2023-01-01",
        size: "2.4 MB",
        url: "#",
        uploaderName: "Admin"
    },
    {
        id: "d2",
        name: "Architectural Review Form",
        category: "Forms",
        uploadDate: "2023-03-15",
        size: "156 KB",
        url: "#",
        uploaderName: "Sarah Jenkins"
    },
    {
        id: "d3",
        name: "2023 Annual Financial Report",
        category: "Financials",
        uploadDate: "2024-01-10",
        size: "1.1 MB",
        url: "#",
        uploaderName: "Admin"
    },
    {
        id: "d4",
        name: "Jan 2024 Meeting Minutes",
        category: "Meeting Minutes",
        uploadDate: "2024-01-15",
        size: "450 KB",
        url: "#",
        uploaderName: "Sarah Jenkins"
    },
    {
        id: "d5",
        name: "Pool Rules & Regulations",
        category: "Rules",
        uploadDate: "2023-05-20",
        size: "320 KB",
        url: "#",
        uploaderName: "Admin"
    }
];

export const MOCK_RESOURCES: CommunityResource[] = [
    {
        id: "r1",
        name: "Community Center Main Hall",
        type: "Facility",
        capacity: 100,
        description: "Large hall suitable for parties and meetings. Includes tables, chairs, and kitchenette.",
        isReservable: true,
        nextAvailable: "Tomorrow"
    },
    {
        id: "r2",
        name: "Park Pavilion",
        type: "Facility",
        capacity: 40,
        description: "Outdoor covered pavilion with picnic tables and charcoal grills.",
        isReservable: true,
        nextAvailable: "Today"
    },
    {
        id: "r3",
        name: "Ride-on Lawnmower",
        type: "Tool",
        description: "Shared community lawnmower. Fuel not included.",
        isReservable: true,
        nextAvailable: "Today"
    },
    {
        id: "r4",
        name: "Pressure Washer (Industrial)",
        type: "Tool",
        description: "High-power gas pressure washer. Safety goggles required.",
        isReservable: true,
        nextAvailable: "Feb 15"
    }
];

const today = new Date();
const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
const tenDaysAgo = new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString();

export const MOCK_MARKETPLACE: MarketplaceItem[] = [
    {
        id: "m1",
        title: "Kids Bike (Age 5-8)",
        description: "Red specialized bike. Great condition, just outgrown. Includes training wheels.",
        price: 40,
        isFree: false,
        isNegotiable: true,
        images: [],
        status: "Active",
        postedDate: tenDaysAgo,
        expiresAt: thirtyDaysFromNow,
        sellerId: "2",
        sellerName: "Mike Chen"
    },
    {
        id: "m2",
        title: "Moving Boxes",
        description: "Bundle of 20 medium moving boxes. Used once.",
        price: 0,
        isFree: true,
        isNegotiable: false,
        images: [],
        status: "Active",
        postedDate: new Date().toISOString(),
        expiresAt: thirtyDaysFromNow,
        sellerId: "3",
        sellerName: "Emily Rodriguez"
    },
    {
        id: "m3",
        title: "Vintage Coffee Table",
        description: "Solid oak coffee table. Needs a bit of refinishing on top.",
        price: 25,
        isFree: false,
        isNegotiable: false,
        images: [],
        status: "Sold",
        postedDate: "2024-01-10",
        expiresAt: "2024-02-10",
        sellerId: "1",
        sellerName: "Sarah Jenkins"
    }
];
