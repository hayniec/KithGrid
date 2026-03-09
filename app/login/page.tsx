"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "../join/join.module.css";
import { signInWithPassword, signInWithOAuth } from "@/utils/auth";

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get("redirect") || "/select-community";

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        const result = await signInWithPassword(email, password);
        if (!result.success) {
            setError(result.error);
        } else {
            router.push(redirectTo);
        }
        setIsLoading(false);
    };

    const handleSocialLogin = async (provider: "google" | "facebook" | "apple") => {
        setIsLoading(true);
        const dest = redirectTo === "/super-admin" ? "/super-admin" : "/select-community";
        const result = await signInWithOAuth(provider, `${window.location.origin}${dest}`);
        if (!result.success) {
            setError(result.error);
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
                    <h1 className={styles.title}>Welcome Back</h1>
                    <p className={styles.subtitle}>Sign in to KithGrid</p>
                </div>

                <form onSubmit={handleLogin} className={styles.formCol}>
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
                    <div className={styles.fieldGroup}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                            <label htmlFor="password" className={styles.label}>Password</label>
                            <a href="/forgot-password" className={styles.link} style={{ fontSize: "0.8rem" }}>Forgot password?</a>
                        </div>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="Example: temp123"
                            className={styles.input}
                        />
                    </div>

                    {error && <p className={styles.error}>{error}</p>}

                    <button
                        type="submit"
                        className={styles.button}
                        style={{ marginTop: "1rem" }}
                        disabled={isLoading}
                    >
                        {isLoading ? "Signing In..." : "Sign In"}
                    </button>

                </form>

                <div style={{ display: "flex", alignItems: "center", margin: "1.5rem 0" }}>
                    <div style={{ flex: 1, height: "1px", background: "#e5e7eb" }} />
                    <span style={{ padding: "0 0.5rem", color: "#6b7280", fontSize: "0.875rem" }}>OR</span>
                    <div style={{ flex: 1, height: "1px", background: "#e5e7eb" }} />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <button
                        type="button"
                        onClick={() => handleSocialLogin("google")}
                        className={styles.button}
                        style={{ backgroundColor: "#DB4437", borderColor: "#DB4437" }}
                        disabled={isLoading}
                    >
                        Sign in with Google
                    </button>
                </div>
                <p className={styles.footerText} style={{ marginTop: '1.5rem' }}>
                    Don't have an account? <a href="/join" className={styles.link}>Join with Code</a>
                </p>
                <p className={styles.footerText} style={{ marginTop: '0.5rem' }}>
                    <a href="/login?redirect=/super-admin" className={styles.link} style={{ fontSize: '0.8rem', opacity: 0.6 }}>Super Admin</a>
                </p>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense>
            <LoginForm />
        </Suspense>
    );
}
