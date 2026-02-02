"use client";

import { useState } from "react";
import styles from "./Modal.module.css";
import { Users } from "lucide-react";

interface RsvpModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (count: number) => void;
    eventTitle: string;
    currentRsvp?: number;
}

export function RsvpModal({ isOpen, onClose, onConfirm, eventTitle, currentRsvp = 0 }: RsvpModalProps) {
    const [count, setCount] = useState(currentRsvp || 1);

    if (!isOpen) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div>
                    <h3 className={styles.title}>RSVP to Event</h3>
                    <p className={styles.description}>
                        <strong>{eventTitle}</strong>
                    </p>
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>Total Attendees (including you)</label>
                    <div style={{ position: 'relative' }}>
                        <Users size={18} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--muted-foreground)' }} />
                        <input
                            type="number"
                            className={styles.input}
                            style={{ paddingLeft: '2.25rem' }}
                            value={count}
                            onChange={(e) => setCount(Math.max(1, parseInt(e.target.value) || 0))}
                            min="1"
                        />
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>
                        RSVPing helps organizers prepare effectively.
                    </p>
                </div>

                <div className={styles.actions}>
                    {currentRsvp > 0 && (
                        <button className={`${styles.button} ${styles.secondaryButton}`} onClick={() => onConfirm(0)} style={{ color: '#dc2626', borderColor: '#fee2e2' }}>
                            Not Going
                        </button>
                    )}
                    <button className={`${styles.button} ${styles.secondaryButton}`} onClick={onClose}>
                        Cancel
                    </button>
                    <button
                        className={`${styles.button} ${styles.primaryButton}`}
                        onClick={() => onConfirm(count)}
                    >
                        {currentRsvp > 0 ? 'Update' : 'Confirm'}
                    </button>
                </div>
            </div>
        </div>
    );
}
