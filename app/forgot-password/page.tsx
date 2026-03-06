"use client";

import { useState } from "react";
import { sendPasswordResetEmail } from "@/utils/auth";
import styles from "../join/join.module.css";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [sent, setSent] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) {
            setError("Please enter your email address.");
            return;
        }

        setIsLoading(true);
        setError("");

        const redirectTo = `${window.location.origin}/reset-password`;
        const result = await sendPasswordResetEmail(email.trim(), redirectTo);

        if (!result.success) {
            setError(result.error);
        } else {
            setSent(true);
        }
        setIsLoading(false);
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <div className={styles.logoBox}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 28, height: 28 }}>
                            <path d="M12 2L21 7V17L12 22L3 17V7L12 2Z" />
                            <path d="M9 7V17" />
                            <path d="M15 7L9 12L15 17" />
                        </svg>
                    </div>
                    <h1 className={styles.title}>Reset Password</h1>
                    <p className={styles.subtitle}>
                        {sent
                            ? "Check your inbox"
                            : "Enter your email to receive a reset link"}
                    </p>
                </div>

                {sent ? (
                    <div className={styles.formCol}>
                        <p style={{ textAlign: "center", color: "var(--muted-foreground)", lineHeight: 1.6 }}>
                            We sent a password reset link to <strong style={{ color: "var(--foreground)" }}>{email}</strong>.
                            Check your email and click the link to set a new password.
                        </p>
                        <button
                            className={styles.button}
                            style={{ marginTop: "0.5rem" }}
                            onClick={() => { setSent(false); setEmail(""); }}
                        >
                            Send Again
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className={styles.formCol}>
                        <div className={styles.fieldGroup}>
                            <label htmlFor="email" className={styles.label}>Email</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="you@example.com"
                                className={styles.input}
                            />
                        </div>

                        {error && <p className={styles.error}>{error}</p>}

                        <button
                            type="submit"
                            className={styles.button}
                            style={{ marginTop: "0.5rem" }}
                            disabled={isLoading}
                        >
                            {isLoading ? "Sending..." : "Send Reset Link"}
                        </button>
                    </form>
                )}

                <p className={styles.footerText} style={{ marginTop: "1.5rem" }}>
                    <a href="/login" className={styles.link}>Back to Sign In</a>
                </p>
            </div>
        </div>
    );
}
