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
    const [error, setError] = useState("");

    // Reset form when opening for a new resource
    useEffect(() => {
        if (isOpen) {
            setDate("");
            setStartTime("");
            setEndTime("");
            setError("");
        }
    }, [isOpen]);

    // Validate time range whenever times change
    useEffect(() => {
        if (startTime && endTime && startTime >= endTime) {
            setError("End time must be after start time");
        } else {
            setError("");
        }
    }, [startTime, endTime]);

    if (!isOpen) return null;

    const handleConfirm = () => {
        if (!date || !startTime || !endTime) return;
        if (startTime >= endTime) {
            setError("End time must be after start time");
            return;
        }
        onConfirm(date, startTime, endTime);
    };

    // Get today's date for min attribute
    const today = new Date().toISOString().split('T')[0];
    const isValid = date && startTime && endTime && !error;

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h3 className={styles.title}>Reserve {resourceName}</h3>
                    <button className={styles.closeButton} onClick={onClose} aria-label="Close">
                        <X size={20} />
                    </button>
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>Date</label>
                    <div className={styles.inputWrapper}>
                        <Calendar size={18} className={styles.inputIcon} />
                        <input
                            type="date"
                            min={today}
                            className={`${styles.input} ${styles.inputWithIcon}`}
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div className={styles.field}>
                        <label className={styles.label}>Start Time</label>
                        <div className={styles.inputWrapper}>
                            <Clock size={18} className={styles.inputIcon} />
                            <input
                                type="time"
                                className={`${styles.input} ${styles.inputWithIcon}`}
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className={styles.field}>
                        <label className={styles.label}>End Time</label>
                        <div className={styles.inputWrapper}>
                            <Clock size={18} className={styles.inputIcon} />
                            <input
                                type="time"
                                className={`${styles.input} ${styles.inputWithIcon}`}
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {error && (
                    <div className={styles.errorText}>
                        {error}
                    </div>
                )}

                <div className={styles.actions}>
                    <button className={`${styles.button} ${styles.secondaryButton}`} onClick={onClose}>
                        Cancel
                    </button>
                    <button
                        className={`${styles.button} ${styles.primaryButton}`}
                        onClick={handleConfirm}
                        disabled={!isValid}
                    >
                        Confirm Booking
                    </button>
                </div>
            </div>
        </div>
    );
}
