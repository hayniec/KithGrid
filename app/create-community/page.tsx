"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import { createCommunity } from "@/app/actions/communities";
import styles from "../join/join.module.css";

const PLANS = [
    { id: "starter_100", name: "Starter", desc: "Up to 100 homes", homes: 100 },
    { id: "growth_250", name: "Growth", desc: "Up to 250 homes", homes: 250 },
    { id: "pro_500", name: "Pro", desc: "Up to 500 homes", homes: 500 },
];

const COMMUNITY_TYPES = ["HOA", "Condo", "Neighborhood", "Co-op"];

const DEFAULT_FEATURES = {
    marketplace: true,
    resources: true,
    events: true,
    documents: true,
    forum: true,
    messages: true,
    services: true,
    local: true,
    emergency: true,
};

const FEATURE_LABELS: Record<string, string> = {
    forum: "Forum",
    events: "Events",
    marketplace: "Marketplace",
    resources: "Resources",
    documents: "Documents",
    messages: "Messages",
    services: "Service Providers",
    local: "Local Guide",
    emergency: "Emergency",
};

export default function CreateCommunityPage() {
    const router = useRouter();
    const { user, setUser, status } = useUser();

    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    // Step 1: Community Info
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [communityType, setCommunityType] = useState("HOA");

    // Step 2: Plan
    const [plan, setPlan] = useState("starter_100");

    // Step 3: Features
    const [features, setFeatures] = useState(DEFAULT_FEATURES);

    // Step 4: Branding
    const [primaryColor, setPrimaryColor] = useState("#4f46e5");
    const [secondaryColor, setSecondaryColor] = useState("#1e1b4b");
    const [accentColor, setAccentColor] = useState("#f59e0b");

    const generateSlug = (input: string) => {
        return input
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-")
            .slice(0, 50);
    };

    const handleNameChange = (val: string) => {
        setName(val);
        if (!slug || slug === generateSlug(name)) {
            setSlug(generateSlug(val));
        }
    };

    const toggleFeature = (key: string) => {
        setFeatures(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));
    };

    const handleSubmit = async () => {
        if (!name.trim()) {
            setError("Community name is required");
            return;
        }
        if (!slug.trim()) {
            setError("URL handle is required");
            return;
        }

        setIsSubmitting(true);
        setError("");

        try {
            const result = await createCommunity({
                name: name.trim(),
                slug: slug.trim(),
                plan,
                features,
                branding: {
                    primaryColor,
                    secondaryColor,
                    accentColor,
                    logoUrl: "",
                },
            });

            if (result.success && result.data) {
                // Set community cookie and context
                const communityId = result.data.id;
                document.cookie = `kithgrid_community=${communityId};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;
                localStorage.setItem("kithgrid_communityId", communityId);
                setUser({ ...user, communityId });
                router.push("/dashboard");
            } else if (!result.success) {
                setError(result.error || "Failed to create community");
            }
        } catch (err) {
            console.error("Create community error:", err);
            setError("An unexpected error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (status === "loading") {
        return (
            <div className={styles.container}>
                <div className={styles.card}><p>Loading...</p></div>
            </div>
        );
    }

    const cardStyle = { maxWidth: "520px" };

    return (
        <div className={styles.container}>
            <div className={styles.card} style={cardStyle}>
                <div className={styles.header}>
                    <div className={styles.logoBox}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 28, height: 28 }}>
                            <path d="M12 2L21 7V17L12 22L3 17V7L12 2Z" />
                            <path d="M9 7V17" />
                            <path d="M15 7L9 12L15 17" />
                        </svg>
                    </div>
                    <h1 className={styles.title}>Create Community</h1>
                    <p className={styles.subtitle}>
                        Step {step} of 5 — {
                            step === 1 ? "Community Info" :
                            step === 2 ? "Plan Selection" :
                            step === 3 ? "Feature Selection" :
                            step === 4 ? "Branding" :
                            "Confirmation"
                        }
                    </p>
                    {/* Progress bar */}
                    <div style={{ display: "flex", gap: 4, marginTop: "1rem" }}>
                        {[1, 2, 3, 4, 5].map(s => (
                            <div key={s} style={{
                                flex: 1,
                                height: 4,
                                borderRadius: 2,
                                background: s <= step ? "var(--primary)" : "var(--border)",
                                transition: "background 0.2s"
                            }} />
                        ))}
                    </div>
                </div>

                {error && <p className={styles.error} style={{ marginBottom: "1rem" }}>{error}</p>}

                {/* Step 1: Community Info */}
                {step === 1 && (
                    <div className={styles.formCol}>
                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Community Name *</label>
                            <input
                                value={name}
                                onChange={(e) => handleNameChange(e.target.value)}
                                placeholder="Oak Hills HOA"
                                className={styles.input}
                            />
                        </div>
                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>URL Handle *</label>
                            <input
                                value={slug}
                                onChange={(e) => setSlug(generateSlug(e.target.value))}
                                placeholder="oak-hills-hoa"
                                className={styles.input}
                            />
                            <span style={{ fontSize: "0.75rem", color: "var(--muted-foreground)" }}>
                                This will be your community identifier
                            </span>
                        </div>
                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Community Type</label>
                            <select
                                value={communityType}
                                onChange={(e) => setCommunityType(e.target.value)}
                                className={styles.input}
                            >
                                {COMMUNITY_TYPES.map(t => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                        </div>
                        <button
                            className={styles.button}
                            style={{ marginTop: "0.5rem" }}
                            onClick={() => {
                                if (!name.trim()) { setError("Community name is required"); return; }
                                setError("");
                                setStep(2);
                            }}
                        >
                            Next
                        </button>
                    </div>
                )}

                {/* Step 2: Plan Selection */}
                {step === 2 && (
                    <div className={styles.formCol}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                            {PLANS.map(p => (
                                <button
                                    key={p.id}
                                    onClick={() => setPlan(p.id)}
                                    style={{
                                        padding: "1rem",
                                        borderRadius: "var(--radius)",
                                        border: plan === p.id ? "2px solid var(--primary)" : "1px solid var(--border)",
                                        background: plan === p.id ? "var(--primary-light, rgba(79,70,229,0.08))" : "var(--card)",
                                        cursor: "pointer",
                                        textAlign: "left",
                                    }}
                                >
                                    <div style={{ fontWeight: 600, color: "var(--foreground)" }}>{p.name}</div>
                                    <div style={{ fontSize: "0.85rem", color: "var(--muted-foreground)" }}>{p.desc}</div>
                                </button>
                            ))}
                        </div>
                        <div className={styles.row} style={{ marginTop: "0.5rem" }}>
                            <button
                                className={styles.button}
                                style={{ flex: 1, backgroundColor: "transparent", color: "var(--foreground)", border: "1px solid var(--border)" }}
                                onClick={() => setStep(1)}
                            >
                                Back
                            </button>
                            <button
                                className={styles.button}
                                style={{ flex: 1 }}
                                onClick={() => setStep(3)}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Feature Selection */}
                {step === 3 && (
                    <div className={styles.formCol}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                            {Object.entries(FEATURE_LABELS).map(([key, label]) => (
                                <label
                                    key={key}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "0.75rem",
                                        padding: "0.6rem 0.75rem",
                                        borderRadius: "var(--radius)",
                                        border: "1px solid var(--border)",
                                        cursor: "pointer",
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        checked={features[key as keyof typeof features]}
                                        onChange={() => toggleFeature(key)}
                                        style={{ width: 18, height: 18, accentColor: "var(--primary)" }}
                                    />
                                    <span style={{ fontWeight: 500, color: "var(--foreground)" }}>{label}</span>
                                </label>
                            ))}
                        </div>
                        <div className={styles.row} style={{ marginTop: "0.5rem" }}>
                            <button
                                className={styles.button}
                                style={{ flex: 1, backgroundColor: "transparent", color: "var(--foreground)", border: "1px solid var(--border)" }}
                                onClick={() => setStep(2)}
                            >
                                Back
                            </button>
                            <button
                                className={styles.button}
                                style={{ flex: 1 }}
                                onClick={() => setStep(4)}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 4: Branding */}
                {step === 4 && (
                    <div className={styles.formCol}>
                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Primary Color</label>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                <input
                                    type="color"
                                    value={primaryColor}
                                    onChange={(e) => setPrimaryColor(e.target.value)}
                                    style={{ width: 40, height: 40, border: "none", cursor: "pointer", borderRadius: 8 }}
                                />
                                <input
                                    value={primaryColor}
                                    onChange={(e) => setPrimaryColor(e.target.value)}
                                    className={styles.input}
                                    style={{ flex: 1 }}
                                />
                            </div>
                        </div>
                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Secondary Color</label>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                <input
                                    type="color"
                                    value={secondaryColor}
                                    onChange={(e) => setSecondaryColor(e.target.value)}
                                    style={{ width: 40, height: 40, border: "none", cursor: "pointer", borderRadius: 8 }}
                                />
                                <input
                                    value={secondaryColor}
                                    onChange={(e) => setSecondaryColor(e.target.value)}
                                    className={styles.input}
                                    style={{ flex: 1 }}
                                />
                            </div>
                        </div>
                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Accent Color</label>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                <input
                                    type="color"
                                    value={accentColor}
                                    onChange={(e) => setAccentColor(e.target.value)}
                                    style={{ width: 40, height: 40, border: "none", cursor: "pointer", borderRadius: 8 }}
                                />
                                <input
                                    value={accentColor}
                                    onChange={(e) => setAccentColor(e.target.value)}
                                    className={styles.input}
                                    style={{ flex: 1 }}
                                />
                            </div>
                        </div>

                        {/* Preview */}
                        <div style={{
                            padding: "1rem",
                            borderRadius: "var(--radius)",
                            border: "1px solid var(--border)",
                            background: secondaryColor,
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                                <div style={{ width: 36, height: 36, borderRadius: 8, background: primaryColor, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700 }}>
                                    {name.charAt(0).toUpperCase() || "K"}
                                </div>
                                <span style={{ color: "white", fontWeight: 600 }}>{name || "Your Community"}</span>
                            </div>
                            <div style={{ height: 4, borderRadius: 2, background: accentColor, width: "60%" }} />
                        </div>

                        <div className={styles.row} style={{ marginTop: "0.5rem" }}>
                            <button
                                className={styles.button}
                                style={{ flex: 1, backgroundColor: "transparent", color: "var(--foreground)", border: "1px solid var(--border)" }}
                                onClick={() => setStep(3)}
                            >
                                Back
                            </button>
                            <button
                                className={styles.button}
                                style={{ flex: 1 }}
                                onClick={() => setStep(5)}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 5: Confirmation */}
                {step === 5 && (
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
                                <span style={{ color: "var(--muted-foreground)", fontSize: "0.875rem" }}>Name</span>
                                <span style={{ fontWeight: 600 }}>{name}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <span style={{ color: "var(--muted-foreground)", fontSize: "0.875rem" }}>Handle</span>
                                <span style={{ fontWeight: 500 }}>{slug}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <span style={{ color: "var(--muted-foreground)", fontSize: "0.875rem" }}>Type</span>
                                <span>{communityType}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <span style={{ color: "var(--muted-foreground)", fontSize: "0.875rem" }}>Plan</span>
                                <span>{PLANS.find(p => p.id === plan)?.name}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <span style={{ color: "var(--muted-foreground)", fontSize: "0.875rem" }}>Features</span>
                                <span>{Object.entries(features).filter(([, v]) => v).length} enabled</span>
                            </div>
                        </div>

                        <div className={styles.row} style={{ marginTop: "0.5rem" }}>
                            <button
                                className={styles.button}
                                style={{ flex: 1, backgroundColor: "transparent", color: "var(--foreground)", border: "1px solid var(--border)" }}
                                onClick={() => setStep(4)}
                                disabled={isSubmitting}
                            >
                                Back
                            </button>
                            <button
                                className={styles.button}
                                style={{ flex: 1 }}
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Creating..." : "Create Community"}
                            </button>
                        </div>
                    </div>
                )}

                <p className={styles.footerText} style={{ marginTop: "1.5rem" }}>
                    <a href="/select-community" className={styles.link}>Back to community selection</a>
                </p>
            </div>
        </div>
    );
}
