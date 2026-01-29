"use client";

import { Neighbor, Equipment } from "@/types/neighbor";
import styles from "../../app/dashboard/neighbors/neighbors.module.css";
import { Wrench, Lightbulb, MapPin, MessageSquare, User, Clock, AlertCircle } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { CheckoutModal } from "./CheckoutModal";

interface NeighborCardProps {
    neighbor: Neighbor;
}

export function NeighborCard({ neighbor }: NeighborCardProps) {
    // Local state to simulate checking items out without a backend
    const [equipmentList, setEquipmentList] = useState(neighbor.equipment);
    const [selectedItem, setSelectedItem] = useState<Equipment | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleEquipmentClick = (item: Equipment) => {
        if (item.isAvailable) {
            setSelectedItem(item);
            setIsModalOpen(true);
        } else if (item.borrowerName === 'You') {
            // Return item logic
            if (confirm(`Return ${item.name}?`)) {
                setEquipmentList(prev => prev.map(e =>
                    e.id === item.id
                        ? { ...e, isAvailable: true, dueDate: undefined, borrowerName: undefined }
                        : e
                ));
            }
        }
    };

    const handleCheckoutConfirm = (date: string) => {
        if (!selectedItem) return;

        setEquipmentList(prev => prev.map(item => {
            if (item.id === selectedItem.id) {
                return {
                    ...item,
                    isAvailable: false,
                    dueDate: date,
                    borrowerName: "You"
                };
            }
            return item;
        }));
        setIsModalOpen(false);
        setSelectedItem(null);
    };

    return (
        <>
            <div className={styles.card}>
                <div className={styles.header}>
                    <div className={styles.avatar}>
                        {neighbor.avatar}
                        {neighbor.isOnline && <div className={styles.onlineIndicator} />}
                    </div>
                    <div className={styles.info}>
                        <div className={styles.name}>{neighbor.name}</div>
                        <div className={styles.role}>{neighbor.role}</div>
                        <div className={styles.address}>
                            <MapPin size={14} />
                            {neighbor.address}
                        </div>
                    </div>
                </div>

                <div className={styles.section}>
                    <div className={styles.sectionTitle}>
                        <Lightbulb size={14} />
                        Skills to Share
                    </div>
                    <div className={styles.tags}>
                        {neighbor.skills.map((skill) => (
                            <span key={`${neighbor.id}-${skill}`} className={`${styles.tag} ${styles.skillTag}`}>
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>

                <div className={styles.section}>
                    <div className={styles.sectionTitle}>
                        <Wrench size={14} />
                        Equipment to Loan
                    </div>
                    <div className={styles.tags}>
                        {equipmentList.map((item) => (
                            <div key={item.id} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                <button
                                    className={`${styles.tag} ${styles.equipmentTag} ${item.isAvailable ? styles.equipmentAvailable : styles.equipmentUnavailable}`}
                                    onClick={() => handleEquipmentClick(item)}
                                    title={item.isAvailable ? "Click to Check Out" : `Checked out by ${item.borrowerName}`}
                                >
                                    <div className={styles.statusDot} style={{ color: item.isAvailable ? '#10b981' : item.borrowerName === 'You' ? '#f59e0b' : '#64748b' }} />
                                    {item.name}
                                </button>
                                {!item.isAvailable && (
                                    <div style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', paddingLeft: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <Clock size={10} />
                                        {item.borrowerName === 'You' ? 'Due ' : 'Returns '} {item.dueDate}
                                        {item.borrowerName !== 'You' && ` (${item.borrowerName})`}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.actions}>
                    <Link href={`/dashboard/neighbors/${neighbor.id}`} className={`${styles.button} ${styles.secondaryButton}`}>
                        <User size={16} />
                        Profile
                    </Link>
                    <Link href={`/dashboard/messages?new=${neighbor.id}`} className={`${styles.button} ${styles.primaryButton}`}>
                        <MessageSquare size={16} />
                        Message
                    </Link>
                </div>
            </div>

            <CheckoutModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleCheckoutConfirm}
                equipmentName={selectedItem?.name || ''}
                ownerName={neighbor.name}
            />
        </>
    );
}
