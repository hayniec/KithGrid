import { db } from '../db';
import { communities } from '../db/schema';

async function checkHoaDues() {
    try {
        console.log('Fetching all communities...\n');
        const allCommunities = await db.select({
            id: communities.id,
            name: communities.name,
            hoaDuesAmount: communities.hoaDuesAmount,
            hoaDuesFrequency: communities.hoaDuesFrequency,
            hoaDuesDate: communities.hoaDuesDate,
            hoaContactEmail: communities.hoaContactEmail
        }).from(communities);

        console.log('=== HOA Dues Database Check ===\n');

        for (const community of allCommunities) {
            console.log(`Community: ${community.name}`);
            console.log(`  ID: ${community.id}`);
            console.log(`  hoaDuesAmount: "${community.hoaDuesAmount}" (Type: ${typeof community.hoaDuesAmount}, IsNull: ${community.hoaDuesAmount === null})`);
            console.log(`  hoaDuesFrequency: "${community.hoaDuesFrequency}"`);
            console.log(`  hoaDuesDate: "${community.hoaDuesDate}"`);
            console.log(`  hoaContactEmail: "${community.hoaContactEmail}"`);
            console.log('---\n');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkHoaDues();
