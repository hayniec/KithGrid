"use client";

import { useState } from "react";
import { X, Send } from "lucide-react";
import styles from "./ContactOfficerModal.module.css";

interface ContactOfficerModalProps {
    isOpen: boolean;
    onClose: () => void;
    officer: {
        name: string;
        email: string;
        position: string;
    } | null;
    sender: {
        name: string;
        email: string;
    };
}

export function ContactOfficerModal({ isOpen, onClose, officer, sender }: ContactOfficerModalProps) {
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [isSent, setIsSent] = useState(false);

    if (!isOpen || !officer) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSending(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        console.log("Message sent to:", officer.email);
        console.log("Subject:", subject);
        console.log("Message:", message);

        setIsSending(false);
        setIsSent(true);

        setTimeout(() => {
            setIsSent(false);
            setSubject("");
            setMessage("");
            onClose();
        }, 2000);
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Contact HOA Officer</h2>
                    <button onClick={onClose} className={styles.closeButton}>
                        <X size={20} />
                    </button>
                </div>

                {!isSent ? (
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.field}>
                            <label className={styles.label}>To:</label>
                            <div className={styles.readOnlyValue}>
                                {officer.name} ({officer.position})
                            </div>
                        </div>

                        <div className={styles.field}>
                            <label className={styles.label}>From:</label>
                            <div className={styles.readOnlyValue}>
                                {sender.name} &lt;{sender.email}&gt;
                            </div>
                        </div>

                        <div className={styles.field}>
                            <label className={styles.label} htmlFor="subject">Subject</label>
                            <input
                                id="subject"
                                type="text"
                                className={styles.input}
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                required
                                placeholder="Regarding..."
                            />
                        </div>

                        <div className={styles.field}>
                            <label className={styles.label} htmlFor="message">Message</label>
                            <textarea
                                id="message"
                                className={styles.textarea}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                required
                                placeholder="Type your message here..."
                                rows={5}
                            />
                        </div>

                        <div className={styles.footer}>
                            <button type="button" onClick={onClose} className={styles.cancelButton}>
                                Cancel
                            </button>
                            <button type="submit" disabled={isSending} className={styles.submitButton}>
                                {isSending ? "Sending..." : (
                                    <>
                                        <Send size={16} />
                                        Send Message
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className={styles.successMessage}>
                        <div className={styles.successIcon}>✓</div>
                        <h3>Message Sent!</h3>
                        <p>Your message has been sent to {officer.name}.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
