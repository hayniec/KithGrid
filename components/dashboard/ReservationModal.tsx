"use client";

import { useState, useEffect } from "react";
import styles from "@/components/dashboard/Modal.module.css";
import { X, Calendar, Clock } from "lucide-react";

interface ReservationModalProps {
    isOpen: boolean;
    onClose: () => void;
    resourceName: string | null;
    onConfirm: (date: string, start: string, end: string) => void;
}

export function ReservationModal({ isOpen, onClose, resourceName, onConfirm }: ReservationModalProps) {
    const [date, setDate] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");

    // Reset form when opening for a new resource
    useEffect(() => {
        if (isOpen) {
            setDate("");
            setStartTime("");
            setEndTime("");
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleConfirm = () => {
        if (!date || !startTime || !endTime) return;
        onConfirm(date, startTime, endTime);
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 className={styles.title}>Reserve {resourceName}</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)' }}>
                        <X size={20} />
                    </button>
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>Date</label>
                    <div style={{ position: 'relative' }}>
                        <Calendar size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)', pointerEvents: 'none' }} />
                        <input
                            type="date"
                            className={styles.input}
                            style={{ paddingLeft: '2.5rem' }}
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div className={styles.field}>
                        <label className={styles.label}>Start Time</label>
                        <div style={{ position: 'relative' }}>
                            <Clock size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)', pointerEvents: 'none' }} />
                            <input
                                type="time"
                                className={styles.input}
                                style={{ paddingLeft: '2.5rem' }}
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className={styles.field}>
                        <label className={styles.label}>End Time</label>
                        <div style={{ position: 'relative' }}>
                            <Clock size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)', pointerEvents: 'none' }} />
                            <input
                                type="time"
                                className={styles.input}
                                style={{ paddingLeft: '2.5rem' }}
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className={styles.actions}>
                    <button className={`${styles.button} ${styles.secondaryButton}`} onClick={onClose}>
                        Cancel
                    </button>
                    <button
                        className={`${styles.button} ${styles.primaryButton}`}
                        onClick={handleConfirm}
                        disabled={!date || !startTime || !endTime}
                    >
                        Confirm Booking
                    </button>
                </div>
            </div>
        </div>
    );
}
