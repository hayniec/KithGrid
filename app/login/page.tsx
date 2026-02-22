"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import styles from "../join/join.module.css";
import { createClient } from "@/utils/supabase/client";

export default function LoginPage() {
    const router = useRouter();
    const { setUser } = useUser();
    const supabase = createClient();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                setError(error.message || "Invalid email or password");
            } else if (data.user) {
                // Successful login
                router.push("/dashboard");
            }
        } catch (err) {
            console.error(err);
            setError("An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSocialLogin = async (provider: 'google' | 'facebook' | 'apple') => {
        setIsLoading(true);
        const { error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: `${window.location.origin}/dashboard`,
            },
        });
        if (error) {
            console.error("OAuth error:", error);
            setError("Failed to initialize social login.");
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.header}>
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
                        <label htmlFor="password" className={styles.label}>Password</label>
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
                    {/* <button
                        type="button"
                        onClick={() => handleSocialLogin("facebook")}
                        className={styles.button}
                        style={{ backgroundColor: "#4267B2", borderColor: "#4267B2" }}
                        disabled={isLoading}
                    >
                        Sign in with Facebook
                    </button>
                    <button
                        type="button"
                        onClick={() => handleSocialLogin("apple")}
                        className={styles.button}
                        style={{ backgroundColor: "#000000", borderColor: "#000000" }}
                        disabled={isLoading}
                    >
                        Sign in with Apple
                    </button> */}
                </div>
                <p className={styles.footerText} style={{ marginTop: '1.5rem' }}>
                    Don't have an account? <a href="/join" className={styles.link}>Join with Code</a>
                </p>
            </div>
        </div>
    );
}
