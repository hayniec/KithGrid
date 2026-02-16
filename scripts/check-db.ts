
import { db } from '../db';
import { users, communities, members, invitations } from '../db/schema';

async function check() {
    console.log("Checking DB...");
    try {
        const u = await db.select().from(users);
        console.log(`Users: ${u.length}`);
        u.forEach(user => console.log(` - ${user.email} (${user.id})`));

        const c = await db.select().from(communities);
        console.log(`Communities: ${c.length}`);
        c.forEach(comm => console.log(` - ${comm.name} (${comm.id})`));

        const m = await db.select().from(members);
        console.log(`Members: ${m.length}`);

        const i = await db.select().from(invitations);
        console.log(`Invitations: ${i.length}`);

    } catch (e) {
        console.error("DB Check Failed:", e);
    }
    process.exit(0);
}

check();
