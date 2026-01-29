"use client";

import { useState } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import styles from "@/components/dashboard/dashboard.module.css";
import { Siren } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DashboardLayoutClient({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [showSOSModal, setShowSOSModal] = useState(false);
    const router = useRouter();

    const handleSOS = () => {
        setShowSOSModal(false);
        router.push('/dashboard/emergency');
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
                            Are you sure you want to access the Emergency Help page? This is for urgent situations only.
                        </p>
                        <div className={styles.sosActions}>
                            <button className={styles.sosConfirmBtn} onClick={handleSOS}>
                                Yes, Go to Emergency Page
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
