// Reset and reseed the database with HOA dues
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function resetAndSeed() {
    try {
        console.log('🗑️  Dropping all tables...\n');

        // Drop tables in reverse order of dependencies
        await pool.query('DROP TABLE IF EXISTS neighbors CASCADE');
        await pool.query('DROP TABLE IF EXISTS users CASCADE');
        await pool.query('DROP TABLE IF EXISTS communities CASCADE');

        console.log('✅ All tables dropped\n');

        console.log('📋 Creating tables...\n');

        // Create communities table
        await pool.query(`
      CREATE TABLE communities (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        slug TEXT UNIQUE,
        plan_tuple TEXT DEFAULT 'starter_100',
        max_homes INTEGER DEFAULT 100,
        is_active BOOLEAN DEFAULT true,
        logo_url TEXT,
        primary_color TEXT DEFAULT '#4f46e5',
        secondary_color TEXT DEFAULT '#1e1b4b',
        accent_color TEXT DEFAULT '#f59e0b',
        has_marketplace BOOLEAN DEFAULT true,
        has_resources BOOLEAN DEFAULT true,
        has_events BOOLEAN DEFAULT true,
        has_documents BOOLEAN DEFAULT true,
        has_forum BOOLEAN DEFAULT true,
        has_messages BOOLEAN DEFAULT true,
        has_service_pros BOOLEAN DEFAULT true,
        has_local_guide BOOLEAN DEFAULT true,
        has_emergency BOOLEAN DEFAULT true,
        stripe_customer_id TEXT,
        stripe_subscription_id TEXT,
        emergency_access_code TEXT,
        emergency_instructions TEXT,
        hoa_dues_amount DECIMAL(10, 2),
        hoa_dues_frequency TEXT DEFAULT 'Monthly',
        hoa_dues_date TEXT DEFAULT '1st',
        hoa_contact_email TEXT,
        hoa_extended_settings JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

        // Create users table
        await pool.query(`
      CREATE TABLE users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT NOT NULL UNIQUE,
        password TEXT,
        name TEXT NOT NULL,
        avatar TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

        // Create neighbors (members) table
        await pool.query(`
      CREATE TABLE neighbors (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id),
        community_id UUID REFERENCES communities(id) NOT NULL,
        roles TEXT[] DEFAULT ARRAY['Resident'],
        role TEXT DEFAULT 'Resident',
        hoa_position TEXT,
        address TEXT,
        personal_emergency_code TEXT,
        personal_emergency_instructions TEXT,
        skills TEXT[],
        equipment JSONB DEFAULT '[]',
        joined_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        is_online BOOLEAN DEFAULT false
      )
    `);

        console.log('✅ Tables created\n');

        console.log('🌱 Seeding data...\n');

        // Insert community with HOA dues
        const communityResult = await pool.query(`
      INSERT INTO communities (
        name, slug, plan_tuple, max_homes, is_active,
        primary_color, secondary_color, accent_color,
        hoa_dues_amount, hoa_dues_frequency, hoa_dues_date, hoa_contact_email,
        has_marketplace, has_resources, has_events, has_documents,
        has_forum, has_messages, has_service_pros, has_local_guide, has_emergency
      ) VALUES (
        'Valley Cove HOA', 'valley-cove', 'growth_250', 250, true,
        '#4f46e5', '#1e1b4b', '#f59e0b',
        250.00, 'Monthly', '1st', 'board@valleycove.com',
        true, true, true, true, true, true, true, true, true
      ) RETURNING id, name, hoa_dues_amount, hoa_dues_frequency
    `);

        const community = communityResult.rows[0];
        console.log(`✅ Community created: ${community.name}`);
        console.log(`   ID: ${community.id}`);
        console.log(`   HOA Dues: $${community.hoa_dues_amount} / ${community.hoa_dues_frequency}\n`);

        // Insert user
        const userResult = await pool.query(`
      INSERT INTO users (email, password, name)
      VALUES ('admin@valleycove.com', 'password123', 'Admin User')
      RETURNING id, email
    `);

        const user = userResult.rows[0];
        console.log(`✅ User created: ${user.email}`);
        console.log(`   ID: ${user.id}\n`);

        // Insert member
        await pool.query(`
      INSERT INTO neighbors (user_id, community_id, role, address, is_online)
      VALUES ($1, $2, 'Admin', '123 Main Street', true)
    `, [user.id, community.id]);

        console.log('✅ Member relationship created\n');

        console.log('🎉 Database reset and seeded successfully!\n');
        console.log('═══════════════════════════════════════');
        console.log('Login credentials:');
        console.log('  Email: admin@valleycove.com');
        console.log('  Password: password123');
        console.log('');
        console.log('HOA Dues configured:');
        console.log(`  Amount: $${community.hoa_dues_amount}`);
        console.log(`  Frequency: ${community.hoa_dues_frequency}`);
        console.log(`  Due Date: 1st`);
        console.log(`  Contact: board@valleycove.com`);
        console.log('═══════════════════════════════════════\n');

        await pool.end();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        await pool.end();
        process.exit(1);
    }
}

resetAndSeed();
