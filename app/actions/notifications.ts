'use server'

import { db } from "@/db";
import { notifications } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

export async function getNotifications(userId: string, communityId: string) {
    try {
        const rows = await db
            .select()
            .from(notifications)
            .where(and(
                eq(notifications.userId, userId),
                eq(notifications.communityId, communityId)
            ))
            .orderBy(desc(notifications.createdAt))
            .limit(50);

        return {
            success: true,
            data: rows.map(r => ({
                id: r.id,
                type: r.type,
                title: r.title,
                body: r.body,
                relatedId: r.relatedId,
                relatedUrl: r.relatedUrl,
                isRead: r.isRead,
                createdAt: r.createdAt?.toISOString() || null,
            }))
        };
    } catch (e: any) {
        console.error("Failed to fetch notifications", e);
        return { success: false, error: e.message };
    }
}

export async function getUnreadCount(userId: string, communityId: string) {
    try {
        const rows = await db
            .select()
            .from(notifications)
            .where(and(
                eq(notifications.userId, userId),
                eq(notifications.communityId, communityId),
                eq(notifications.isRead, false)
            ));

        return { success: true, count: rows.length };
    } catch (e: any) {
        return { success: false, count: 0 };
    }
}

export async function markNotificationRead(notificationId: string) {
    try {
        await db.update(notifications)
            .set({ isRead: true })
            .where(eq(notifications.id, notificationId));
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function markAllNotificationsRead(userId: string, communityId: string) {
    try {
        await db.update(notifications)
            .set({ isRead: true })
            .where(and(
                eq(notifications.userId, userId),
                eq(notifications.communityId, communityId)
            ));
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function createNotification(data: {
    userId: string;
    communityId: string;
    type: 'message' | 'forum_reply' | 'event_reminder' | 'announcement';
    title: string;
    body?: string;
    relatedId?: string;
    relatedUrl?: string;
}) {
    try {
        const [inserted] = await db.insert(notifications).values({
            userId: data.userId,
            communityId: data.communityId,
            type: data.type,
            title: data.title,
            body: data.body,
            relatedId: data.relatedId,
            relatedUrl: data.relatedUrl,
        }).returning();

        return { success: true, data: inserted };
    } catch (e: any) {
        console.error("Failed to create notification", e);
        return { success: false, error: e.message };
    }
}
