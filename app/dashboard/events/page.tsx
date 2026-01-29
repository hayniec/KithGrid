"use client";

import { useState } from "react";
import { MOCK_EVENTS } from "@/lib/data";
import { EventCard } from "@/components/dashboard/EventCard";
import { CreateEventModal } from "@/components/dashboard/CreateEventModal";
import { RsvpModal } from "@/components/dashboard/RsvpModal";
import styles from "./events.module.css";
import { Plus } from "lucide-react";
import { Event } from "@/types/event";

export default function EventsPage() {
    const [events, setEvents] = useState<Event[]>(MOCK_EVENTS);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // RSVP State
    const [isRsvpModalOpen, setIsRsvpModalOpen] = useState(false);
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

    // Sorting
    const sortedEvents = [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const handleCreateEvent = (newEvent: any) => {
        const event: Event = {
            id: Math.random().toString(36).substr(2, 9),
            ...newEvent,
            attendees: 1, // The creator + 0
            organizer: "You",
            userRsvp: 1
        };
        setEvents([...events, event]);
        setIsCreateModalOpen(false);
    };

    const handleRsvpClick = (event: Event) => {
        setSelectedEventId(event.id);
        setIsRsvpModalOpen(true);
    };

    const handleRsvpConfirm = (count: number) => {
        if (!selectedEventId) return;

        setEvents(events.map(ev => {
            if (ev.id === selectedEventId) {
                // Logic: subtract previous rsvp count if needed, then add new.
                // For simplicity in this demo, we assume we are updating the total attendees.
                const previousUserRsvp = ev.userRsvp || 0;
                const newTotal = ev.attendees - previousUserRsvp + count;

                return {
                    ...ev,
                    attendees: newTotal,
                    userRsvp: count
                };
            }
            return ev;
        }));

        setIsRsvpModalOpen(false);
        setSelectedEventId(null);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Community Events</h1>
                    <p className={styles.subtitle}>
                        Stay up to date with HOA meetings, social gatherings, and maintenance schedules.
                    </p>
                </div>
                <button
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        backgroundColor: 'var(--primary)',
                        color: 'var(--primary-foreground)',
                        border: 'none',
                        padding: '0.75rem 1.25rem',
                        borderRadius: 'var(--radius)',
                        fontWeight: 600,
                        cursor: 'pointer'
                    }}
                    onClick={() => setIsCreateModalOpen(true)}
                >
                    <Plus size={20} />
                    Create Event
                </button>
            </div>

            <div className={styles.grid}>
                {sortedEvents.map((event) => (
                    <EventCard
                        key={event.id}
                        event={event}
                        onRsvp={handleRsvpClick}
                    />
                ))}
            </div>

            <CreateEventModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onCreate={handleCreateEvent}
            />

            <RsvpModal
                isOpen={isRsvpModalOpen}
                onClose={() => setIsRsvpModalOpen(false)}
                onConfirm={handleRsvpConfirm}
                eventTitle={events.find(e => e.id === selectedEventId)?.title || ''}
                currentRsvp={events.find(e => e.id === selectedEventId)?.userRsvp}
            />
        </div>
    );
}
