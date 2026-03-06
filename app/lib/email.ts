
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendInvitationEmail(
    toEmail: string,
    inviteCode: string,
    communityName: string,
    senderName?: string
) {
    if (!resend) {
        console.warn("⚠️ RESEND_API_KEY is missing. Email skipped.");
        return { success: false, error: "Missing API Key" };
    }

    try {
        const { data, error } = await resend.emails.send({
            from: 'KithGrid <onboarding@resend.dev>', // Use this for testing/free tier
            to: [toEmail],
            subject: `You've been invited to join ${communityName} on KithGrid!`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1>Welcome to KithGrid!</h1>
                    <p>You have been invited to join the <strong>${communityName}</strong> community${senderName ? ' by ' + senderName : ''}.</p>
                    
                    <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                        <p style="margin: 0; color: #4b5563;">Your Invitation Code:</p>
                        <h2 style="margin: 10px 0; letter-spacing: 5px; color: #4f46e5; font-size: 32px;">${inviteCode}</h2>
                    </div>

                    <p>To accept this invitation:</p>
                    <ol>
                        <li>Visit <a href="${process.env.NEXTAUTH_URL || 'https://kithgrid.netlify.app'}/join">KithGrid</a></li>
                        <li>Enter your email (${toEmail}) and the code above.</li>
                    </ol>
                    
                    <p>See you in the neighborhood!</p>
                </div>
            `,
        });

        if (error) {
            console.error("Resend Error:", error);
            return { success: false, error };
        }

        return { success: true, data };
    } catch (error) {
        console.error("Failed to send email:", error);
        return { success: false, error };
    }
}

// Shared email wrapper with KithGrid branding
function emailLayout(communityName: string, content: string) {
    return `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
            <div style="padding: 24px 0; border-bottom: 2px solid #4f46e5; margin-bottom: 24px;">
                <strong style="font-size: 18px; color: #4f46e5;">KithGrid</strong>
                <span style="color: #94a3b8; margin-left: 8px;">${communityName}</span>
            </div>
            ${content}
            <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8;">
                You received this because you're a member of ${communityName} on KithGrid.
            </div>
        </div>
    `;
}

export async function sendEventReminderEmail(
    toEmail: string,
    eventTitle: string,
    eventDate: string,
    communityName: string,
) {
    if (!resend) return { success: false, error: "Missing API Key" };

    try {
        const { data, error } = await resend.emails.send({
            from: 'KithGrid <onboarding@resend.dev>',
            to: [toEmail],
            subject: `Reminder: ${eventTitle} is coming up`,
            html: emailLayout(communityName, `
                <h2 style="margin: 0 0 8px;">Event Reminder</h2>
                <p><strong>${eventTitle}</strong> is happening on <strong>${eventDate}</strong>.</p>
                <p>Don't forget to check the event details in your <a href="${process.env.NEXTAUTH_URL || 'https://kithgrid.netlify.app'}/dashboard/events" style="color: #4f46e5;">dashboard</a>.</p>
            `),
        });
        if (error) return { success: false, error };
        return { success: true, data };
    } catch (error) {
        return { success: false, error };
    }
}

export async function sendForumReplyEmail(
    toEmail: string,
    postTitle: string,
    replierName: string,
    communityName: string,
) {
    if (!resend) return { success: false, error: "Missing API Key" };

    try {
        const { data, error } = await resend.emails.send({
            from: 'KithGrid <onboarding@resend.dev>',
            to: [toEmail],
            subject: `${replierName} replied to your post "${postTitle}"`,
            html: emailLayout(communityName, `
                <h2 style="margin: 0 0 8px;">New Reply</h2>
                <p><strong>${replierName}</strong> replied to your post <strong>"${postTitle}"</strong>.</p>
                <p><a href="${process.env.NEXTAUTH_URL || 'https://kithgrid.netlify.app'}/dashboard/forum" style="color: #4f46e5;">View the discussion</a></p>
            `),
        });
        if (error) return { success: false, error };
        return { success: true, data };
    } catch (error) {
        return { success: false, error };
    }
}

export async function sendNewMessageEmail(
    toEmail: string,
    senderName: string,
    communityName: string,
) {
    if (!resend) return { success: false, error: "Missing API Key" };

    try {
        const { data, error } = await resend.emails.send({
            from: 'KithGrid <onboarding@resend.dev>',
            to: [toEmail],
            subject: `New message from ${senderName}`,
            html: emailLayout(communityName, `
                <h2 style="margin: 0 0 8px;">New Message</h2>
                <p>You have a new message from <strong>${senderName}</strong>.</p>
                <p><a href="${process.env.NEXTAUTH_URL || 'https://kithgrid.netlify.app'}/dashboard/messages" style="color: #4f46e5;">Read message</a></p>
            `),
        });
        if (error) return { success: false, error };
        return { success: true, data };
    } catch (error) {
        return { success: false, error };
    }
}
