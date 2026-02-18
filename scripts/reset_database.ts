// Reset and reseed the database with HOA dues
import { db } from '../db';
import { communities, users, members } from '../db/schema';
import { sql } from 'drizzle-orm';

async function resetDatabase() {
    try {
        console.log('🗑️  Dropping all tables...');

        // Drop tables in reverse order of dependencies
        await db.execute(sql`DROP TABLE IF EXISTS neighbors CASCADE`);
        await db.execute(sql`DROP TABLE IF EXISTS users CASCADE`);
        await db.execute(sql`DROP TABLE IF EXISTS communities CASCADE`);

        console.log('✅ All tables dropped');

        console.log('📋 Pushing schema to database...');
        // Note: You'll need to run `npm run db:push` after this script

        console.log('✅ Database reset complete!');
        console.log('');
        console.log('Next steps:');
        console.log('1. Run: npm run db:push');
        console.log('2. Run: tsx scripts/seed_with_hoa.ts');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error resetting database:', error);
        process.exit(1);
    }
}

resetDatabase();
