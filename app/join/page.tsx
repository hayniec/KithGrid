"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";
import styles from "./join.module.css";
import { validateInvitation, markInvitationUsed } from "@/app/actions/invitations";
import { registerNeighbor } from "@/app/actions/neighbors";
import { useUser, type UserRole } from "@/contexts/UserContext";
import { signUp } from "@/utils/auth";

export default function JoinPage() {
    const router = useRouter();
    const { setUser } = useUser();
    const [step, setStep] = useState(1); // 1: Code, 2: Profile, 3: Check Email
    const [formData, setFormData] = useState({
        code: "",
        email: "",
        firstName: "",
        lastName: "",
        address: "",
        password: ""
    });
    const [error, setError] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);
    const [invitationId, setInvitationId] = useState<string>("");
    const [communityId, setCommunityId] = useState<string>("");

    const verifyCode = async () => {
        if (!formData.code) {
            setError("Please enter an invitation code");
            return;
        }

        setIsVerifying(true);
        setError("");

        try {
            const result = await validateInvitation(formData.code);

            if (result.success && result.data) {
                setFormData(prev => ({ ...prev, email: result.data.email }));
                setInvitationId(result.data.id);
                setCommunityId(result.data.communityId);
                setStep(2);
            } else {
                setError(result.error || "Invalid or expired invitation code.");
            }
        } catch (error) {
            console.error("Error validating invitation:", error);
            setError("Unexpected error validating invitation code");
        } finally {
            setIsVerifying(false);
        }
    };

    const handleRegister = async () => {
        if (!formData.firstName || !formData.lastName || !formData.password) {
            setError("Please fill in all required fields.");
            return;
        }

        setIsRegistering(true);
        setError("");
        try {
            // 1. Create the user account via auth abstraction
            const authResult = await signUp(formData.email, formData.password, {
                first_name: formData.firstName,
                last_name: formData.lastName,
            });

            if (!authResult.success) {
                setError(authResult.error);
                setIsRegistering(false);
                return;
            }

            // If email confirmation is required, show the check-email step
            if (authResult.needsEmailConfirmation) {
                // Still register in our DB so the record exists when they confirm
                if (authResult.user) {
                    await registerNeighbor({
                        communityId: communityId,
                        email: formData.email,
                        password: formData.password,
                        name: `${formData.firstName} ${formData.lastName}`,
                        address: formData.address || "",
                        invitationCode: formData.code,
                        authId: authResult.user.id
                    });
                }
                setStep(3);
                setIsRegistering(false);
                return;
            }

            if (!authResult.user) {
                setError("Registration failed. Please try again.");
                setIsRegistering(false);
                return;
            }

            // 2. Link with custom Drizzle tables via registerNeighbor action
            const registerResult = await registerNeighbor({
                communityId: communityId,
                email: formData.email,
                password: formData.password,
                name: `${formData.firstName} ${formData.lastName}`,
                address: formData.address || "",
                invitationCode: formData.code,
                authId: authResult.user.id
            });

            if (!registerResult.success) {
                setError(registerResult.error || "Failed to link your account to the community.");
                setIsRegistering(false);
                return;
            }

            // 3. Update User Context
            const newUserProfile = {
                id: registerResult.data.id,
                communityId: registerResult.data.communityId,
                email: registerResult.data.email,
                name: registerResult.data.name,
                role: "resident" as const,
                roles: ["resident"] as UserRole[],
                avatar: registerResult.data.name.charAt(0).toUpperCase()
            };
            setUser(newUserProfile);

            router.push("/select-community");
        } catch (error) {
            console.error("Error during registration:", error);
            setError("An unexpected error occurred during registration.");
            setIsRegistering(false);
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
                    <h1 className={styles.title}>Join KithGrid</h1>
                    <p className={styles.subtitle}>
                        {step === 1 ? "Enter your invitation code to get started." : step === 2 ? "Complete your profile." : "Almost there!"}
                    </p>
                </div>

                {step === 1 && (
                    <div className={styles.formCol}>
                        <div className={styles.fieldGroup}>
                            <label htmlFor="invite-code" className={styles.label}>Invitation Code</label>
                            <input
                                id="invite-code"
                                type="text"
                                placeholder="e.g. A1B2C3"
                                value={formData.code}
                                onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                className={styles.codeInput}
                                disabled={isVerifying}
                            />
                        </div>
                        {error && <p className={styles.error}>{error}</p>}
                        <button
                            onClick={verifyCode}
                            className={styles.button}
                            disabled={isVerifying}
                        >
                            {isVerifying ? 'Verifying...' : 'Verify Code'}
                        </button>
                        <p className={styles.footerText}>
                            Already have an account? <a href="/login" className={styles.link}>Sign in</a>
                        </p>
                    </div>
                )}

                {step === 2 && (
                    <div className={styles.formCol}>
                        <div className={styles.row}>
                            <div className={`${styles.fieldGroup} ${styles.flex1}`}>
                                <label htmlFor="first-name" className={styles.label}>First Name</label>
                                <input
                                    id="first-name"
                                    value={formData.firstName}
                                    onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                                    className={styles.input}
                                />
                            </div>
                            <div className={`${styles.fieldGroup} ${styles.flex1}`}>
                                <label htmlFor="last-name" className={styles.label}>Last Name</label>
                                <input
                                    id="last-name"
                                    value={formData.lastName}
                                    onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                                    className={styles.input}
                                />
                            </div>
                        </div>

                        <div className={styles.fieldGroup}>
                            <label htmlFor="email" className={styles.label}>Email Address</label>
                            <input
                                id="email"
                                value={formData.email}
                                disabled
                                className={`${styles.input} ${styles.inputDisabled}`}
                            />
                        </div>

                        <div className={styles.fieldGroup}>
                            <label htmlFor="address" className={styles.label}>Home Address</label>
                            <input
                                id="address"
                                placeholder="123 Maple Drive"
                                value={formData.address}
                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                                className={styles.input}
                            />
                        </div>

                        <div className={styles.fieldGroup}>
                            <label htmlFor="password" className={styles.label}>Password</label>
                            <input
                                id="password"
                                type="password"
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                className={styles.input}
                            />
                        </div>

                        {error && <p className={styles.error}>{error}</p>}

                        <button
                            onClick={handleRegister}
                            className={styles.button}
                            style={{ marginTop: '0.5rem' }}
                            disabled={isRegistering}
                        >
                            {isRegistering ? "Creating Account..." : "Create Account"}
                        </button>
                    </div>
                )}

                {step === 3 && (
                    <div className={styles.formCol} style={{ textAlign: "center" }}>
                        <div style={{
                            width: 56,
                            height: 56,
                            borderRadius: "50%",
                            background: "var(--primary)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 1rem",
                        }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 28, height: 28 }}>
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                <polyline points="22,6 12,13 2,6" />
                            </svg>
                        </div>
                        <p style={{ color: "var(--foreground)", fontWeight: 600, fontSize: "1.1rem", marginBottom: "0.5rem" }}>
                            Check your email
                        </p>
                        <p style={{ color: "var(--muted-foreground)", lineHeight: 1.6 }}>
                            We sent a confirmation link to <strong style={{ color: "var(--foreground)" }}>{formData.email}</strong>.
                            Click the link to verify your email and activate your account.
                        </p>
                        <p className={styles.footerText} style={{ marginTop: "1.5rem" }}>
                            Already confirmed? <a href="/login" className={styles.link}>Sign in</a>
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
