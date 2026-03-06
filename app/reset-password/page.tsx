"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updatePassword } from "@/utils/auth";
import styles from "../join/join.module.css";

export default function ResetPasswordPage() {
    const router = useRouter();
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [done, setDone] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }
        if (password !== confirm) {
            setError("Passwords do not match.");
            return;
        }

        setIsLoading(true);
        const result = await updatePassword(password);

        if (!result.success) {
            setError(result.error);
            setIsLoading(false);
        } else {
            setDone(true);
            setIsLoading(false);
        }
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
                    <h1 className={styles.title}>
                        {done ? "Password Updated" : "Set New Password"}
                    </h1>
                    <p className={styles.subtitle}>
                        {done
                            ? "You can now sign in with your new password"
                            : "Choose a new password for your account"}
                    </p>
                </div>

                {done ? (
                    <div className={styles.formCol}>
                        <button
                            className={styles.button}
                            onClick={() => router.push("/login")}
                        >
                            Go to Sign In
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className={styles.formCol}>
                        <div className={styles.fieldGroup}>
                            <label htmlFor="password" className={styles.label}>New Password</label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="At least 6 characters"
                                className={styles.input}
                            />
                        </div>
                        <div className={styles.fieldGroup}>
                            <label htmlFor="confirm" className={styles.label}>Confirm Password</label>
                            <input
                                id="confirm"
                                type="password"
                                value={confirm}
                                onChange={(e) => setConfirm(e.target.value)}
                                required
                                placeholder="Re-enter your password"
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
                            {isLoading ? "Updating..." : "Update Password"}
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
