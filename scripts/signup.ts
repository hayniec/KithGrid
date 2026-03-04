import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function signUpUser() {
    const email = 'eric.haynie@gmail.com';
    const password = 'temp123';
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
