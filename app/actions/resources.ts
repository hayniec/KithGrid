'use server'

import { db } from "@/db";
import { resources, reservations } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export type ResourceActionState = {
    success: boolean;
    data?: any;
    error?: string;
};

export async function getCommunityResources(communityId: string): Promise<ResourceActionState> {
    try {
        const result = await db
            .select()
            .from(resources)
            .where(eq(resources.communityId, communityId));

        return { success: true, data: result };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function createResource(data: {
    communityId: string;
    name: string;
    type: string;
    capacity: number;
    description: string;
    isReservable: boolean;
}): Promise<ResourceActionState> {
    try {
        const [newResource] = await db.insert(resources).values({
            communityId: data.communityId,
            name: data.name,
            type: data.type as "Facility" | "Tool" | "Vehicle",
            capacity: data.capacity,
            description: data.description,
            isReservable: data.isReservable
        }).returning();

        return { success: true, data: newResource };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteResource(id: string): Promise<ResourceActionState> {
    try {
        await db.delete(resources).where(eq(resources.id, id));
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function createReservation(data: {
    communityId: string;
    resourceId: string;
    userId: string;
    date: string;
    startTime: string;
    endTime: string;
}): Promise<ResourceActionState> {
    try {
        const conflicting = await db.select().from(reservations).where(and(
            eq(reservations.resourceId, data.resourceId),
            eq(reservations.date, data.date)
        ));

        // Conflict Logic: (StartA < EndB) and (EndA > StartB)
        // Check if new reservation overlaps any existing confirmed reservation
        const isOverlap = conflicting.some((r: any) => {
            if (r.status === 'Cancelled') return false;
            return (r.startTime < data.endTime) && (r.endTime > data.startTime);
        });

        if (isOverlap) {
            return { success: false, error: "Time slot is already booked." };
        }

        const [newReservation] = await db.insert(reservations).values({
            communityId: data.communityId,
            resourceId: data.resourceId,
            userId: data.userId,
            date: data.date,
            startTime: data.startTime,
            endTime: data.endTime,
            status: 'Confirmed'
        }).returning();

        return { success: true, data: newReservation };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getReservations(communityId: string, resourceId: string, date: string): Promise<ResourceActionState> {
    try {
        const result = await db.select().from(reservations).where(and(
            eq(reservations.resourceId, resourceId),
            eq(reservations.date, date)
        ));
        return { success: true, data: result };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
