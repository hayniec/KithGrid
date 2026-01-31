"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";

export default function LoginPage() {
    const router = useRouter();
    const { setUser } = useUser();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();

        // Simple mock authentication logic
        if (email.includes("admin")) {
            setUser({
                name: "Admin User",
                role: "admin",
                avatar: "AD"
            });
            router.push("/dashboard");
        } else if (email.includes("resident")) {
            setUser({
                name: "Resident User",
                role: "resident",
                avatar: "RU"
            });
            router.push("/dashboard");
        } else if (email === "erich@example.com") {
            setUser({
                name: "Eric H.",
                role: "admin", // Eric is admin by default in this demo
                avatar: "EH"
            });
            router.push("/dashboard");
        } else {
            // For demo purposes, let anyone login as resident if not specified
            setUser({
                name: email.split('@')[0],
                role: "resident",
                avatar: email.substring(0, 2).toUpperCase()
            });
            router.push("/dashboard");
        }
    };

    return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "var(--background)",
            color: "var(--foreground)"
        }}>
            <div style={{
                width: "100%",
                maxWidth: "400px",
                padding: "2rem",
                borderRadius: "var(--radius)",
                border: "1px solid var(--border)",
                backgroundColor: "var(--card)",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
            }}>
                <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                    <h1 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>Welcome Back</h1>
                    <p style={{ color: "var(--muted-foreground)" }}>Sign in to NeighborNet</p>
                </div>

                <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div>
                        <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem" }}>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="Type 'admin' to be admin..."
                            style={{
                                width: "100%",
                                padding: "0.75rem",
                                borderRadius: "var(--radius)",
                                border: "1px solid var(--border)",
                                backgroundColor: "var(--background)",
                                color: "var(--foreground)"
                            }}
                        />
                    </div>
                    <div>
                        <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem" }}>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="Any password works"
                            style={{
                                width: "100%",
                                padding: "0.75rem",
                                borderRadius: "var(--radius)",
                                border: "1px solid var(--border)",
                                backgroundColor: "var(--background)",
                                color: "var(--foreground)"
                            }}
                        />
                    </div>

                    {error && <p style={{ color: "red", fontSize: "0.875rem" }}>{error}</p>}

                    <button
                        type="submit"
                        style={{
                            padding: "0.75rem",
                            borderRadius: "var(--radius)",
                            backgroundColor: "var(--primary)",
                            color: "var(--primary-foreground)",
                            border: "none",
                            fontWeight: "600",
                            cursor: "pointer",
                            marginTop: "1rem"
                        }}
                    >
                        Sign In
                    </button>

                    <div style={{ marginTop: "1rem", fontSize: "0.875rem", color: "var(--muted-foreground)", textAlign: "center" }}>
                        <p>Demo Hints:</p>
                        <p>Use email containing "admin" for Admin role.</p>
                        <p>Use email containing "resident" for Resident role.</p>
                    </div>
                </form>
                <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem' }}>
                    Don't have an account? <a href="/join" style={{ color: 'var(--primary)' }}>Join with Code</a>
                </p>
            </div>
        </div>
    );
}
