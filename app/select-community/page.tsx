"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser, type CommunityInfo } from "@/contexts/UserContext";
import { getCommunities } from "@/app/actions/communities";
import styles from "../join/join.module.css";

export default function SelectCommunityPage() {
    const router = useRouter();
    const { user, setUser, status } = useUser();
    const [communities, setCommunities] = useState<CommunityInfo[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === "loading") return;
        if (status === "unauthenticated") {
            router.push("/login");
            return;
        }

        const fetchCommunities = async () => {
            try {
                const res = await getCommunities();
                if (res.success && res.data) {
                    const list: CommunityInfo[] = res.data.map((c: any) => ({
                        id: c.id,
                        name: c.name,
                        slug: c.slug,
                        logoUrl: c.branding?.logoUrl,
                    }));
                    setCommunities(list);

                    // Auto-redirect if user has exactly 1 community
                    if (list.length === 1) {
                        selectCommunity(list[0].id);
                        return;
                    }
                }
            } catch (err) {
                console.error("Failed to fetch communities:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchCommunities();
    }, [status]);

    const selectCommunity = (communityId: string) => {
        // Set cookie
        document.cookie = `kithgrid_community=${communityId};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;
        localStorage.setItem("kithgrid_communityId", communityId);

        // Update user context
        setUser({ ...user, communityId });

        // Navigate to dashboard
        router.push("/dashboard");
    };

    if (loading || status === "loading") {
        return (
            <div className={styles.container}>
                <div className={styles.card}>
                    <div className={styles.header}>
                        <h1 className={styles.title}>Loading...</h1>
                        <p className={styles.subtitle}>Checking your communities</p>
                    </div>
                </div>
            </div>
        );
    }

    // No communities - show create/join options
    if (communities.length === 0) {
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
                        <h1 className={styles.title}>Welcome to KithGrid</h1>
                        <p className={styles.subtitle}>You&apos;re not part of any community yet. Get started below.</p>
                    </div>

                    <div className={styles.formCol}>
                        <button
                            onClick={() => router.push("/create-community")}
                            className={styles.button}
                        >
                            Create a Community
                        </button>
                        <button
                            onClick={() => router.push("/join-community")}
                            className={styles.button}
                            style={{ backgroundColor: "transparent", color: "var(--primary)", border: "2px solid var(--primary)" }}
                        >
                            Join with Invitation Code
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Multiple communities - show picker
    return (
        <div className={styles.container}>
            <div className={styles.card} style={{ maxWidth: "500px" }}>
                <div className={styles.header}>
                    <div className={styles.logoBox}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 28, height: 28 }}>
                            <path d="M12 2L21 7V17L12 22L3 17V7L12 2Z" />
                            <path d="M9 7V17" />
                            <path d="M15 7L9 12L15 17" />
                        </svg>
                    </div>
                    <h1 className={styles.title}>Select Community</h1>
                    <p className={styles.subtitle}>Choose which community to enter</p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {communities.map((community) => (
                        <button
                            key={community.id}
                            onClick={() => selectCommunity(community.id)}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "1rem",
                                padding: "1rem",
                                borderRadius: "var(--radius)",
                                border: "1px solid var(--border)",
                                background: "var(--card)",
                                cursor: "pointer",
                                textAlign: "left",
                                width: "100%",
                                transition: "border-color 0.15s, box-shadow 0.15s",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = "var(--primary)";
                                e.currentTarget.style.boxShadow = "0 0 0 1px var(--primary)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = "var(--border)";
                                e.currentTarget.style.boxShadow = "none";
                            }}
                        >
                            <div style={{
                                width: 44,
                                height: 44,
                                borderRadius: 12,
                                background: "var(--primary)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "white",
                                fontWeight: 700,
                                fontSize: "1.1rem",
                                flexShrink: 0,
                            }}>
                                {community.logoUrl ? (
                                    <img src={community.logoUrl} alt="" style={{ width: 44, height: 44, borderRadius: 12, objectFit: "cover" }} />
                                ) : (
                                    community.name.charAt(0).toUpperCase()
                                )}
                            </div>
                            <div>
                                <div style={{ fontWeight: 600, color: "var(--foreground)" }}>{community.name}</div>
                                <div style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>{community.slug}</div>
                            </div>
                        </button>
                    ))}
                </div>

                <div style={{ marginTop: "1.5rem", display: "flex", gap: "0.75rem" }}>
                    <button
                        onClick={() => router.push("/create-community")}
                        className={styles.button}
                        style={{ flex: 1, fontSize: "0.875rem" }}
                    >
                        Create New
                    </button>
                    <button
                        onClick={() => router.push("/join-community")}
                        className={styles.button}
                        style={{ flex: 1, fontSize: "0.875rem", backgroundColor: "transparent", color: "var(--primary)", border: "2px solid var(--primary)" }}
                    >
                        Join Another
                    </button>
                </div>
            </div>
        </div>
    );
}
