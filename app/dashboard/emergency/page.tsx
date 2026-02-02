"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useUser } from "@/contexts/UserContext";
import { getCommunities } from "@/app/actions/communities";
import { Siren, Phone, ShieldAlert, Key } from "lucide-react";
import styles from "./emergency.module.css";
import Link from "next/link";

export default function EmergencyPage() {
    const { communityName } = useTheme();
    const { user } = useUser();
    const [emergencyInfo, setEmergencyInfo] = useState<{ accessCode: string; instructions: string } | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchInfo = async () => {
            if (user.communityId) {
                // Ideally we have a better way to fetch single community, but reusing getCommunities for MVP speed
                const result = await getCommunities();
                if (result.success && result.data) {
                    const current = result.data.find((c: any) => c.id === user.communityId);
                    if (current && current.emergency) {
                        setEmergencyInfo(current.emergency);
                    }
                }
            }
            setIsLoading(false);
        };
        fetchInfo();
    }, [user.communityId]);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <Siren size={48} className={styles.icon} />
                <h1 className={styles.title}>Emergency Access Information</h1>
                <p className={styles.subtitle}>
                    For use during 911 calls or emergency situations only.
                </p>
            </div>

            {isLoading ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>Loading emergency data...</div>
            ) : (
                <div className={styles.content}>
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <Key size={24} className={styles.cardIcon} />
                            <h2>Gate / Door Code</h2>
                        </div>
                        <div className={styles.codeDisplay}>
                            {emergencyInfo?.accessCode || "No code configured"}
                        </div>
                        <p className={styles.cardNote}>
                            Provide this code to emergency responders (Police, Fire, EMS) for building/gate access.
                        </p>
                    </div>

                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <ShieldAlert size={24} className={styles.cardIcon} />
                            <h2>Instructions</h2>
                        </div>
                        <div className={styles.instructions}>
                            {emergencyInfo?.instructions ? (
                                <p>{emergencyInfo.instructions}</p>
                            ) : (
                                <p style={{ color: 'var(--muted-foreground)', fontStyle: 'italic' }}>
                                    No specific instructions provided by administration.
                                </p>
                            )}
                        </div>
                    </div>

                    <div className={styles.warningBox}>
                        <h3>⚠️ Important</h3>
                        <p>
                            Misuse of this information allows for immediate community access revocation.
                            This page access is logged.
                        </p>
                    </div>
                </div>
            )}

            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                <Link href="/dashboard" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>
                    Return to Dashboard
                </Link>
            </div>
        </div>
    );
}
