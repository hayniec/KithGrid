'use server'

import { db } from "@/db";
import { directMessages, members, users } from "@/db/schema";
import { eq, desc, or, and, inArray } from "drizzle-orm";

export type MessageActionState = {
    success: boolean;
    data?: any;
    error?: string;
};

// Helper to get memberId from userId and communityId
async function getMemberId(userId: string, communityId: string): Promise<string | null> {
    const [member] = await db
        .select()
        .from(members)
        .where(and(eq(members.userId, userId), eq(members.communityId, communityId)));
    return member ? member.id : null;
}

export async function getConversations(currentUserId: string, communityId: string): Promise<MessageActionState> {
    try {
        const currentMemberId = await getMemberId(currentUserId, communityId);
        if (!currentMemberId) return { success: false, error: 'Member not found.' };

        // Naive approach due to lack of distinct on in complex query easily
        const msgs = await db
            .select()
            .from(directMessages)
            .where(or(eq(directMessages.senderId, currentMemberId), eq(directMessages.recipientId, currentMemberId)))
            .orderBy(desc(directMessages.createdAt));

        const conversationMap = new Map<string, any>();

        for (const msg of msgs) {
            const otherId = msg.senderId === currentMemberId ? msg.recipientId : msg.senderId;
            if (!conversationMap.has(otherId)) {
                conversationMap.set(otherId, {
                    otherId,
                    lastMessage: msg.content,
                    timestamp: msg.createdAt,
                    unreadCount: (msg.recipientId === currentMemberId && !msg.isRead) ? 1 : 0
                });
            } else {
                if (msg.recipientId === currentMemberId && !msg.isRead) {
                    const existing = conversationMap.get(otherId);
                    existing.unreadCount += 1;
                }
            }
        }

        const conversationList = Array.from(conversationMap.values());
        const otherMemberIds = conversationList.map(c => c.otherId);

        if (otherMemberIds.length > 0) {
            const usersData = await db
                .select({
                    memberId: members.id,
                    userId: users.id,
                    name: users.name
                })
                .from(members)
                .leftJoin(users, eq(members.userId, users.id))
                .where(and(inArray(members.id, otherMemberIds), eq(members.communityId, communityId)));

            const nameMap = new Map(usersData.map(u => [u.memberId, { name: u.name, userId: u.userId }]));

            conversationList.forEach(c => {
                const mappedUser = nameMap.get(c.otherId);
                // We use mappedUser.userId so the frontend can still route/identify using USER IDs
                c.otherUserId = mappedUser?.userId || c.otherId;
                c.otherName = mappedUser?.name || "Neighbor";
            });
        }

        return { success: true, data: conversationList };

    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getThread(currentUserId: string, otherUserId: string, communityId: string): Promise<MessageActionState> {
    try {
        const currentMemberId = await getMemberId(currentUserId, communityId);
        const otherMemberId = await getMemberId(otherUserId, communityId);

        if (!currentMemberId || !otherMemberId) return { success: false, error: 'Members not found in this community.' };

        const msgs = await db
            .select()
            .from(directMessages)
            .where(
                or(
                    and(eq(directMessages.senderId, currentMemberId), eq(directMessages.recipientId, otherMemberId)),
                    and(eq(directMessages.senderId, otherMemberId), eq(directMessages.recipientId, currentMemberId))
                )
            )
            .orderBy(desc(directMessages.createdAt));

        return { success: true, data: msgs.reverse() }; // Return ascending
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function sendMessage(senderUserId: string, recipientUserId: string, content: string, communityId: string): Promise<MessageActionState> {
    try {
        const senderMemberId = await getMemberId(senderUserId, communityId);
        if (!senderMemberId) return { success: false, error: 'Sender member not found in this community.' };

        const recipientMemberId = await getMemberId(recipientUserId, communityId);
        if (!recipientMemberId) return { success: false, error: 'Recipient member not found in this community.' };

        const [msg] = await db.insert(directMessages).values({
            senderId: senderMemberId,
            recipientId: recipientMemberId,
            content
        }).returning();

        return { success: true, data: msg };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
