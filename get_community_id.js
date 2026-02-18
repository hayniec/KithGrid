// Get community ID
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function getCommunityId() {
    const result = await pool.query('SELECT id, name FROM communities LIMIT 1');
    if (result.rows.length > 0) {
        console.log('Community ID:', result.rows[0].id);
        console.log('Community Name:', result.rows[0].name);
    }
    await pool.end();
}

getCommunityId();
