"use client";

import { useState } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import styles from "@/components/dashboard/dashboard.module.css";
import { Siren } from "lucide-react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import { getCommunities } from "@/app/actions/communities";
import { useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";

export default function DashboardLayoutClient({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [showSOSModal, setShowSOSModal] = useState(false);
    const [showSOSButton, setShowSOSButton] = useState(true);
    const [sosMessage, setSosMessage] = useState("");
    const [trialBanner, setTrialBanner] = useState<{ show: boolean; daysRemaining: number | null; expired: boolean }>({ show: false, daysRemaining: null, expired: false });
    const router = useRouter();
    const { user } = useUser();
    const { communityName, setCommunityName, applyCommunityBranding } = useTheme();

    useEffect(() => {
        const prepareDashboard = async () => {
            if (!user) return;

            let message = "";
            let hasCode = false;

            if (user.communityId) {
                try {
                    const res = await getCommunities();
                    if (res.success && res.data) {
                        const com = res.data.find((c: any) => c.id === user.communityId);
                        if (com) {
                            // Apply community name and branding
                            if (com.name && com.name !== communityName) {
                                setCommunityName(com.name);
                            }
                            if (com.branding) {
                                applyCommunityBranding(com.branding);
                            }

                            // Check trial status for banner
                            if (com.billing?.planStatus === 'trial') {
                                const trialEnd = com.billing.trialEndsAt ? new Date(com.billing.trialEndsAt) : null;
                                if (trialEnd) {
                                    const diff = trialEnd.getTime() - Date.now();
                                    const days = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
                                    setTrialBanner({ show: true, daysRemaining: days, expired: diff <= 0 });
                                }
                            }

                            // Emergency feature flag
                            setShowSOSButton(com.features?.emergency ?? true);

                            // Build emergency message
                            if (com.emergency?.accessCode) {
                                message = `Community Gate Code: ${com.emergency.accessCode}`;
                                if (com.emergency.instructions) {
                                    message += `\nGate Instructions: ${com.emergency.instructions}`;
                                }
                                hasCode = true;
                            }
                        }
                    }
                } catch (err) {
                    console.error("Failed to fetch community info", err);
                }
            }

            // Append Personal Emergency Info if available
            if (user.personalEmergencyCode) {
                message += `${hasCode ? '\n\n' : ''}My Digital Lock: ${user.personalEmergencyCode}`;
                if (user.personalEmergencyInstructions) {
                    message += `\nMy Instructions: ${user.personalEmergencyInstructions}`;
                }
                hasCode = true;
            }

            if (!hasCode) {
                message = `Emergency! Help needed at: ${user.address || "Unknown Location (Address not set)"}`;
            }

            setSosMessage(message);
        };
        prepareDashboard();
    }, [user, user?.communityId]);

    const handleSOS = () => {
        setShowSOSModal(false);
        // Trigger SMS
        window.location.href = `sms:?body=${encodeURIComponent(sosMessage)}`;
    };

    return (
        <div className={styles.layout}>
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            <div style={{ display: 'contents' }}>
                <Header onMenuClick={() => setIsSidebarOpen(true)} />
                {trialBanner.show && (
                    <div style={{
                        padding: '0.5rem 1.5rem',
                        background: trialBanner.expired ? '#fef2f2' : '#fffbeb',
                        borderBottom: `1px solid ${trialBanner.expired ? '#fecaca' : '#fde68a'}`,
                        fontSize: '0.85rem',
                        textAlign: 'center',
                        color: trialBanner.expired ? '#dc2626' : '#92400e',
                    }}>
                        {trialBanner.expired
                            ? 'Your free trial has expired. Contact your admin to activate a plan.'
                            : `Free trial: ${trialBanner.daysRemaining} day${trialBanner.daysRemaining !== 1 ? 's' : ''} remaining`}
                    </div>
                )}
                <main className={styles.main}>
                    {children}
                </main>
            </div>

            {/* SOS Floating Button */}
            {showSOSButton && (user.emergencyButtonSettings?.visible ?? false) && (
                <button
                    className={`${styles.sosButton} ${styles[
                        user.emergencyButtonSettings?.position === 'bottom-right' ? 'bottomRight' :
                            user.emergencyButtonSettings?.position === 'top-left' ? 'topLeft' :
                                user.emergencyButtonSettings?.position === 'top-right' ? 'topRight' :
                                    'bottomLeft' // default
                    ]}`}
                    onClick={() => setShowSOSModal(true)}
                    title="Emergency Access"
                >
                    <Siren size={32} />
                </button>
            )}

            {/* SOS Confirmation Modal */}
            {showSOSModal && (
                <div className={styles.sosModalOverlay}>
                    <div className={styles.sosModal}>
                        <div className={styles.sosTitle}>
                            <Siren size={32} />
                            Emergency Access
                        </div>
                        <p className={styles.sosDescription}>
                            Are you sure you want to trigger an Emergency Text?
                        </p>
                        <div className={styles.sosActions}>
                            <button className={styles.sosConfirmBtn} onClick={handleSOS}>
                                Yes, Send Text
                            </button>
                            <button className={styles.sosCancelBtn} onClick={() => setShowSOSModal(false)}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
