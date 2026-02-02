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

export default function DashboardLayoutClient({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [showSOSModal, setShowSOSModal] = useState(false);
    const [sosMessage, setSosMessage] = useState("");
    const router = useRouter();
    const { user } = useUser();

    useEffect(() => {
        const prepareSOS = async () => {
            if (!user) return;

            let message = "";
            let hasCode = false;

            if (user.communityId) {
                try {
                    const res = await getCommunities();
                    if (res.success && res.data) {
                        const com = res.data.find((c: any) => c.id === user.communityId);
                        if (com && com.emergency?.accessCode) {
                            message = `Emergency Access Code: ${com.emergency.accessCode}`;
                            if (com.emergency.instructions) {
                                message += `\nInstructions: ${com.emergency.instructions}`;
                            }
                            hasCode = true;
                        }
                    }
                } catch (err) {
                    console.error("Failed to fetch emergency info", err);
                }
            }

            if (!hasCode) {
                message = `Emergency! Help needed at: ${user.address || "Unknown Location (Address not set)"}`;
            }

            setSosMessage(message);
        };
        prepareSOS();
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
                <main className={styles.main}>
                    {children}
                </main>
            </div>

            {/* SOS Floating Button */}
            <button
                className={styles.sosButton}
                onClick={() => setShowSOSModal(true)}
                title="Emergency Access"
            >
                <Siren size={32} />
            </button>

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
