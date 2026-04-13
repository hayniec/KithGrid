import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function signUpUser() {
    const email = process.env.SUPER_ADMIN_EMAIL;
    const password = process.env.SEED_PASSWORD || 'temp123';
    if (!email) {
        console.error("SUPER_ADMIN_EMAIL environment variable is required. Set it in .env.local");
        process.exit(1);
    }
    console.log(`Attempting to sign up ${email}...`);

    // In order to bypass email confirmation if disabled, sometimes signups automatically login
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { name: 'Eric Haynie' }
        }
    });

    if (error) {
        console.error('Sign up error:', error);
    } else {
        console.log('Sign up result:', data?.user?.id ? 'Success' : 'No User created');
    }
}

signUpUser();
