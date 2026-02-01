'use server'

import { db } from "@/db";
import { documents } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export type DocumentActionState = {
    success: boolean;
    data?: any;
    error?: string;
};

export async function getCommunityDocuments(communityId: string): Promise<DocumentActionState> {
    try {
        const results = await db
            .select()
            .from(documents)
            .where(eq(documents.communityId, communityId))
            .orderBy(desc(documents.uploadDate));

        return {
            success: true,
            data: results.map(doc => ({
                id: doc.id,
                title: doc.name,
                type: 'External Link', // Default for now since we don't have file storage
                source: 'external',
                size: 'N/A',
                date: doc.uploadDate?.toLocaleDateString(),
                url: doc.filePath,
                category: doc.category
            }))
        };
    } catch (error: any) {
        console.error("Failed to fetch documents:", error);
        return { success: false, error: error.message };
    }
}

export async function createDocument(data: {
    communityId: string;
    name: string;
    category: string;
    filePath: string; // URL
    uploadedBy: string;
}): Promise<DocumentActionState> {
    try {
        const [newDoc] = await db.insert(documents).values({
            communityId: data.communityId,
            name: data.name,
            category: data.category,
            filePath: data.filePath,
            uploadedBy: data.uploadedBy,
        }).returning();

        return {
            success: true,
            data: newDoc
        };
    } catch (error: any) {
        console.error("Failed to create document:", error);
        return { success: false, error: error.message };
    }
}
