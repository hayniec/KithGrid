// Seed database with a community that has HOA dues configured
import { db } from '../db';
import { communities, users, members } from '../db/schema';

async function seedWithHOA() {
    try {
        console.log('🌱 Seeding database with HOA data...\n');

        // 1. Create a community with HOA dues
        console.log('Creating community...');
        const [community] = await db.insert(communities).values({
            name: 'Valley Cove HOA',
            slug: 'valley-cove',
            planTuple: 'growth_250',
            maxHomes: 250,
            isActive: true,
            primaryColor: '#4f46e5',
            secondaryColor: '#1e1b4b',
            accentColor: '#f59e0b',

            // HOA Settings - THIS IS THE KEY PART
            hoaDuesAmount: '250.00', // Set as string for decimal type
            hoaDuesFrequency: 'Monthly',
            hoaDuesDate: '1st',
            hoaContactEmail: 'board@valleycove.com',

            // Feature flags
            hasMarketplace: true,
            hasResources: true,
            hasEvents: true,
            hasDocuments: true,
            hasForum: true,
            hasMessages: true,
            hasServicePros: true,
            hasLocalGuide: true,
            hasEmergency: true,
        }).returning();

        console.log(`✅ Community created: ${community.name} (${community.id})`);
        console.log(`   HOA Dues: $${community.hoaDuesAmount} / ${community.hoaDuesFrequency}\n`);

        // 2. Create a test user
        console.log('Creating test user...');
        const [user] = await db.insert(users).values({
            email: 'admin@valleycove.com',
            password: 'password123', // In production, this should be hashed
            name: 'Admin User',
        }).returning();

        console.log(`✅ User created: ${user.email} (${user.id})\n`);

        // 3. Create member relationship
        console.log('Creating member relationship...');
        const [member] = await db.insert(members).values({
            userId: user.id,
            communityId: community.id,
            role: 'Admin',
            address: '123 Main Street',
            isOnline: true,
        }).returning();

        console.log(`✅ Member created (${member.id})\n`);

        console.log('🎉 Database seeded successfully!\n');
        console.log('Login credentials:');
        console.log('  Email: admin@valleycove.com');
        console.log('  Password: password123\n');
        console.log('HOA Dues configured:');
        console.log(`  Amount: $${community.hoaDuesAmount}`);
        console.log(`  Frequency: ${community.hoaDuesFrequency}`);
        console.log(`  Due Date: ${community.hoaDuesDate}`);
        console.log(`  Contact: ${community.hoaContactEmail}\n`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
}

seedWithHOA();
