import { db } from '../db';
import { users } from '../db/schema';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
    const allUsers = await db.select({ email: users.email }).from(users);
    console.log(allUsers);
}
main();
