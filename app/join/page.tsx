"use client";

import { useState } from "react";
import "../globals.css"; // Ensure global styles are applied
import { useRouter } from "next/navigation";

export default function JoinPage() {
    const router = useRouter();
    const [step, setStep] = useState(1); // 1: Code, 2: Profile
    const [formData, setFormData] = useState({
        code: "",
        email: "",
        firstName: "",
        lastName: "",
        address: "",
        password: ""
    });
    const [error, setError] = useState("");

    const verifyCode = () => {
        // Retrieve valid invites from simulated backend
        let validInvites = [];
        try {
            const stored = localStorage.getItem('neighborNet_invites');
            if (stored) validInvites = JSON.parse(stored);
        } catch (e) { }

        const match = validInvites.find((invite: any) =>
            invite.code === formData.code.toUpperCase() &&
            invite.status === 'pending'
        );

        if (match) {
            setFormData(prev => ({ ...prev, email: match.email }));
            setError("");
            setStep(2);
        } else {
            setError("Invalid or expired invitation code.");
        }
    };

    const handleRegister = () => {
        // Simulate registration
        alert(`Welcome, ${formData.firstName}! Account created successfully.`);
        // In a real app, we'd invalidate the code now

        // Redirect
        router.push("/dashboard");
    };

    return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "var(--background)",
            color: "var(--foreground)",
            padding: "1rem"
        }}>
            <div style={{
                width: "100%",
                maxWidth: "400px",
                backgroundColor: "var(--card)",
                padding: "2rem",
                borderRadius: "var(--radius)",
                border: "1px solid var(--border)",
                boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)"
            }}>
                <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                    <div style={{
                        width: 48, height: 48, background: 'var(--primary)',
                        borderRadius: 12, margin: '0 auto 1rem', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', color: 'white'
                    }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 28, height: 28 }}>
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                            <polyline points="9 22 9 12 15 12 15 22"></polyline>
                        </svg>
                    </div>
                    <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>Join NeighborNet</h1>
                    <p style={{ color: "var(--muted-foreground)" }}>
                        {step === 1 ? "Enter your invitation code to get started." : "Complete your profile."}
                    </p>
                </div>

                {step === 1 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                            <label style={{ fontSize: "0.875rem", fontWeight: 500 }}>Invitation Code</label>
                            <input
                                type="text"
                                placeholder="e.g. A1B2C3"
                                value={formData.code}
                                onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                style={{
                                    padding: "0.75rem",
                                    borderRadius: "var(--radius)",
                                    border: "1px solid var(--border)",
                                    backgroundColor: "var(--background)",
                                    color: "var(--foreground)",
                                    fontSize: "1.1rem",
                                    letterSpacing: "2px",
                                    textAlign: "center",
                                    textTransform: "uppercase"
                                }}
                            />
                        </div>
                        {error && <p style={{ color: "red", fontSize: "0.875rem" }}>{error}</p>}
                        <button
                            onClick={verifyCode}
                            style={{
                                marginTop: "0.5rem",
                                padding: "0.75rem",
                                borderRadius: "var(--radius)",
                                backgroundColor: "var(--primary)",
                                color: "white",
                                border: "none",
                                fontWeight: 600,
                                cursor: "pointer"
                            }}
                        >
                            Verify Code
                        </button>
                        <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>
                            Already have an account? <a href="/login" style={{ color: 'var(--primary)' }}>Sign in</a>
                        </p>
                    </div>
                )}

                {step === 2 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        <div style={{ display: "flex", gap: "1rem" }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", flex: 1 }}>
                                <label style={{ fontSize: "0.875rem", fontWeight: 500 }}>First Name</label>
                                <input
                                    value={formData.firstName}
                                    onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                                    style={{ padding: "0.6rem", borderRadius: "var(--radius)", border: "1px solid var(--border)", backgroundColor: "var(--background)", color: "var(--foreground)" }}
                                />
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", flex: 1 }}>
                                <label style={{ fontSize: "0.875rem", fontWeight: 500 }}>Last Name</label>
                                <input
                                    value={formData.lastName}
                                    onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                                    style={{ padding: "0.6rem", borderRadius: "var(--radius)", border: "1px solid var(--border)", backgroundColor: "var(--background)", color: "var(--foreground)" }}
                                />
                            </div>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                            <label style={{ fontSize: "0.875rem", fontWeight: 500 }}>Email Address</label>
                            <input
                                value={formData.email}
                                disabled
                                style={{ padding: "0.6rem", borderRadius: "var(--radius)", border: "1px solid var(--border)", backgroundColor: "var(--muted)", color: "var(--muted-foreground)", cursor: 'not-allowed' }}
                            />
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                            <label style={{ fontSize: "0.875rem", fontWeight: 500 }}>Home Address</label>
                            <input
                                placeholder="123 Maple Drive"
                                value={formData.address}
                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                                style={{ padding: "0.6rem", borderRadius: "var(--radius)", border: "1px solid var(--border)", backgroundColor: "var(--background)", color: "var(--foreground)" }}
                            />
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                            <label style={{ fontSize: "0.875rem", fontWeight: 500 }}>Password</label>
                            <input
                                type="password"
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                style={{ padding: "0.6rem", borderRadius: "var(--radius)", border: "1px solid var(--border)", backgroundColor: "var(--background)", color: "var(--foreground)" }}
                            />
                        </div>

                        <button
                            onClick={handleRegister}
                            style={{
                                marginTop: "1rem",
                                padding: "0.75rem",
                                borderRadius: "var(--radius)",
                                backgroundColor: "var(--primary)",
                                color: "white",
                                border: "none",
                                fontWeight: 600,
                                cursor: "pointer"
                            }}
                        >
                            Create Account
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
