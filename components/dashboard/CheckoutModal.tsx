"use client";

import { useState } from "react";
import styles from "./Modal.module.css";
import { Equipment } from "@/types/neighbor";
import { Calendar } from "lucide-react";

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (date: string) => void;
    equipmentName: string;
    ownerName: string;
}

export function CheckoutModal({ isOpen, onClose, onConfirm, equipmentName, ownerName }: CheckoutModalProps) {
    const [returnDate, setReturnDate] = useState("");

    if (!isOpen) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div>
                    <h3 className={styles.title}>Checkout Equipment</h3>
                    <p className={styles.description}>
                        You are requesting to borrow <strong>{equipmentName}</strong> from {ownerName}.
                    </p>
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>When will you return it?</label>
                    <div style={{ position: 'relative' }}>
                        <Calendar size={18} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--muted-foreground)' }} />
                        <input
                            type="date"
                            className={styles.input}
                            style={{ paddingLeft: '2.25rem', width: '100%' }}
                            value={returnDate}
                            onChange={(e) => setReturnDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                        />
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>
                        The owner set a strict return policy. Please adhere to the agreed date.
                    </p>
                </div>

                <div className={styles.actions}>
                    <button className={`${styles.button} ${styles.secondaryButton}`} onClick={onClose}>
                        Cancel
                    </button>
                    <button
                        className={`${styles.button} ${styles.primaryButton}`}
                        onClick={() => onConfirm(returnDate)}
                        disabled={!returnDate}
                        style={{ opacity: !returnDate ? 0.5 : 1, cursor: !returnDate ? 'not-allowed' : 'pointer' }}
                    >
                        Confirm Checkout
                    </button>
                </div>
            </div>
        </div>
    );
}
