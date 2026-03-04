import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function tryLogin(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
        return `Failed for ${email} with ${password}: ${error.message}`;
    } else {
        return `SUCCESS for ${email} with ${password}`;
    }
}

async function main() {
    let out = '';
    const passwords = ['temp123', 'password123'];
    const emails = ['eric.haynie@gmail.com', 'erich.haynie@gmail.com'];
    for (const email of emails) {
        for (const p of passwords) {
            const res = await tryLogin(email, p);
            out += res + '\n';
        }
    }
    fs.writeFileSync('test_out.txt', out, 'utf8');
}
main();
