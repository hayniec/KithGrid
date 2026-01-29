"use client";

import { useTheme, THEMES } from "@/contexts/ThemeContext";
import styles from "./admin.module.css";
import { Palette, Shield, Users, FileText, AlertTriangle } from "lucide-react";

export default function AdminPage() {
    const { theme, setTheme, communityName, setCommunityName } = useTheme();

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Admin Console</h1>
                <p className={styles.subtitle}>Manage community settings, global configuration, and moderation.</p>
            </div>

            {/* Quick Stats Row */}
            <div className={styles.grid} style={{ marginBottom: '2rem' }}>
                <div className={styles.statCard}>
                    <span className={styles.statValue}>124</span>
                    <span className={styles.statLabel}>Active Households</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statValue}>3</span>
                    <span className={styles.statLabel}>Pending Approvals</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statValue}>12</span>
                    <span className={styles.statLabel}>Open Maintenance Requests</span>
                </div>
            </div>

            <div className={styles.grid}>
                {/* Branding Section */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <Palette size={20} className="text-primary" />
                        <span className={styles.cardTitle}>Branding & Appearance</span>
                    </div>
                    <div className={styles.cardContent}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Community Name</label>
                            <input
                                className={styles.input}
                                value={communityName}
                                onChange={(e) => setCommunityName(e.target.value)}
                                placeholder="e.g. HOA NeighborNet"
                            />
                            <div style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', marginTop: '0.5rem' }}>
                                This name appears on the sidebar and browser tab.
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Color Theme</label>
                            <div className={styles.themeGrid}>
                                {THEMES.map((t) => (
                                    <button
                                        key={t.name}
                                        onClick={() => setTheme(t)}
                                        className={styles.themeBtn}
                                        style={{
                                            borderColor: theme.name === t.name ? 'var(--primary)' : 'var(--border)',
                                            backgroundColor: theme.name === t.name ? 'var(--accent)' : 'var(--background)'
                                        }}
                                    >
                                        <div className={styles.themeColor} style={{ backgroundColor: t.primary }}></div>
                                        <span className={styles.themeName}>{t.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Dummy Section to fill space */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <Shield size={20} />
                        <span className={styles.cardTitle}>Access Control</span>
                    </div>
                    <div className={styles.cardContent}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>New Member Policy</label>
                            <select className={styles.input}>
                                <option>Approval Required (Recommended)</option>
                                <option>Open Registration</option>
                                <option>Invite Only</option>
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Guest Access</label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                                <input type="checkbox" defaultChecked />
                                Allow residents to generate guest passes
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
