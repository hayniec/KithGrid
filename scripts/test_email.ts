
// Step 1: Add Resend to your environment
// Verify that RESEND_API_KEY is present in .env.local

import { Resend } from 'resend';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
const envPath = path.resolve(__dirname, '../.env.local');
dotenv.config({ path: envPath });

async function testEmail() {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
        console.error("❌ RESEND_API_KEY not found in .env.local");
        console.error(`Attempted to load from: ${envPath}`);
        process.exit(1);
    }

    // Initialize Resend
    const resend = new Resend(apiKey);

    console.log("sending email...");

    try {
        const { data, error } = await resend.emails.send({
            from: 'onboarding@resend.dev', // Use default for testing
            to: 'eric.haynie@gmail.com',   // Your email
            subject: 'Hello World from NeighborNet',
            html: '<p>Congrats on sending your <strong>first email</strong> via NeighborNet script!</p>'
        });

        if (error) {
            console.error("❌ Failed to send email:", error);
            return;
        }

        console.log("✅ Email sent successfully!");
        console.log("Response:", data);
    } catch (err: any) {
        console.error("❌ Unexpected error:", err);
    }
}

testEmail();
