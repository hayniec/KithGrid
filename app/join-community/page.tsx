"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import { validateInvitation, markInvitationUsed } from "@/app/actions/invitations";
import { joinCommunityWithCode } from "@/app/actions/neighbors";
import styles from "../join/join.module.css";

export default function JoinCommunityPage() {
    const router = useRouter();
    const { user, status } = useUser();

    const [code, setCode] = useState("");
    const [error, setError] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const [isJoining, setIsJoining] = useState(false);

    // After validation
    const [validated, setValidated] = useState(false);
    const [communityName, setCommunityName] = useState("");
    const [communityId, setCommunityId] = useState("");
    const [assignedRole, setAssignedRole] = useState("");
    const [invitationId, setInvitationId] = useState("");

    const verifyCode = async () => {
        if (!code.trim()) {
            setError("Please enter an invitation code");
            return;
        }

        setIsVerifying(true);
        setError("");

        try {
            const result = await validateInvitation(code);
            if (result.success && result.data) {
                setCommunityId(result.data.communityId);
                setCommunityName(result.data.communityName || "Community");
                setAssignedRole(result.data.role || "Resident");
                setInvitationId(result.data.id);
                setValidated(true);
            } else {
                setError(result.error || "Invalid or expired invitation code.");
            }
        } catch (err) {
            console.error("Error validating invitation:", err);
            setError("Unexpected error validating invitation code");
        } finally {
            setIsVerifying(false);
        }
    };

    const handleJoin = async () => {
        if (!user.id) {
            setError("You must be logged in to join a community");
            return;
        }

        setIsJoining(true);
        setError("");

        try {
            const result = await joinCommunityWithCode({
                userId: user.id,
                communityId,
                invitationCode: code,
                role: assignedRole,
            });

            if (result.success) {
                // Mark invitation as used
                await markInvitationUsed(code);

                // Set new community cookie and redirect
                document.cookie = `kithgrid_community=${communityId};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;
                localStorage.setItem("kithgrid_communityId", communityId);

                // Navigate to dashboard with the new community
                window.location.href = "/dashboard";
            } else {
                setError(result.error || "Failed to join community");
            }
        } catch (err) {
            console.error("Error joining community:", err);
            setError("Unexpected error joining community");
        } finally {
            setIsJoining(false);
        }
    };

    if (status === "loading") {
        return (
            <div className={styles.container}>
                <div className={styles.card}><p>Loading...</p></div>
            </div>
        );
    }

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
                    <h1 className={styles.title}>Join Another Community</h1>
                    <p className={styles.subtitle}>
                        {!validated
                            ? "Enter your invitation code to join a new community."
                            : `You've been invited to join ${communityName}!`
                        }
                    </p>
                </div>

                {!validated ? (
                    <div className={styles.formCol}>
                        <div className={styles.fieldGroup}>
                            <label htmlFor="invite-code" className={styles.label}>Invitation Code</label>
                            <input
                                id="invite-code"
                                type="text"
                                placeholder="e.g. A1B2C3"
                                value={code}
                                onChange={e => setCode(e.target.value.toUpperCase())}
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
                            {isVerifying ? "Verifying..." : "Verify Code"}
                        </button>
                    </div>
                ) : (
                    <div className={styles.formCol}>
                        <div style={{
                            padding: "1rem",
                            borderRadius: "var(--radius)",
                            border: "1px solid var(--border)",
                            display: "flex",
                            flexDirection: "column",
                            gap: "0.5rem",
                        }}>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <span style={{ color: "var(--muted-foreground)", fontSize: "0.875rem" }}>Community</span>
                                <span style={{ fontWeight: 600 }}>{communityName}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <span style={{ color: "var(--muted-foreground)", fontSize: "0.875rem" }}>Your Role</span>
                                <span>{assignedRole}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <span style={{ color: "var(--muted-foreground)", fontSize: "0.875rem" }}>Joining As</span>
                                <span>{user.email}</span>
                            </div>
                        </div>

                        {error && <p className={styles.error}>{error}</p>}

                        <button
                            onClick={handleJoin}
                            className={styles.button}
                            disabled={isJoining}
                        >
                            {isJoining ? "Joining..." : `Join ${communityName}`}
                        </button>
                        <button
                            onClick={() => { setValidated(false); setCode(""); setError(""); }}
                            className={styles.button}
                            style={{ backgroundColor: "transparent", color: "var(--foreground)", border: "1px solid var(--border)" }}
                        >
                            Use Different Code
                        </button>
                    </div>
                )}

                <p className={styles.footerText} style={{ marginTop: "1.5rem" }}>
                    <a href="/select-community" className={styles.link}>Back to community selection</a>
                </p>
            </div>
        </div>
    );
}
