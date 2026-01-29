"use client";

import styles from "./emergency.module.css";
import { Phone, Heart, Zap, ShieldAlert, Siren, Flame, Info, AlertOctagon } from "lucide-react";
import { MOCK_NEIGHBORS } from "@/lib/data";

export default function EmergencyPage() {

    const medicallyTrained = MOCK_NEIGHBORS.filter(n =>
        n.skills.some(s => ["Nurse", "Doctor", "First Aid", "CPR", "EMT", "First Aid/CPR"].some(term => s.includes(term)))
    );

    const emergencyServices = [
        { name: "Emergency", number: "911", icon: Siren, color: "#ef4444", bg: "#fee2e2" },
        { name: "Poison Control", number: "1-800-222-1222", icon: ShieldAlert, color: "#d97706", bg: "#fef3c7" },
        { name: "Non-Emergency", number: "311", icon: Info, color: "#3b82f6", bg: "#dbeafe" },
    ];

    return (
        <div className={styles.container}>
            {/* SOS Hero */}
            <div className={styles.sosCard}>
                <div className={styles.sosHeader}>
                    <AlertOctagon size={48} />
                    <div className={styles.sosTitle}>Emergency SOS</div>
                </div>
                <div className={styles.sosButtonContainer}>
                    <button className={styles.sosButton} onClick={() => alert("Simulating SOS: Alert sent to neighbors and emergency contacts!")}>
                        SOS
                    </button>
                    <span className={styles.sosHint}>Tap to Alert Network</span>
                </div>
                <div className={styles.sosDescription}>
                    Pressing this button will instantly notify your designated emergency contacts and nearby neighbors listed as first responders.
                </div>
            </div>

            {/* Your Emergency Contacts (Mock) */}
            <div className={styles.section}>
                <div className={styles.sectionTitle}>
                    <Phone size={18} />
                    Your Emergency Contacts
                </div>
                <div className={styles.grid}>
                    <div className={styles.card}>
                        <div className={styles.contactInfo}>
                            <span className={styles.contactName}>Sarah Thompson</span>
                            <span className={styles.contactRole}>Spouse</span>
                        </div>
                        <a href="tel:555-234-5679" className={styles.callButton}>
                            <Phone size={14} />
                            Call
                        </a>
                    </div>
                    <div className={styles.card}>
                        <div className={styles.contactInfo}>
                            <span className={styles.contactName}>Dr. Williams</span>
                            <span className={styles.contactRole}>Family Doctor</span>
                        </div>
                        <a href="tel:555-888-1234" className={styles.callButton}>
                            <Phone size={14} />
                            Call
                        </a>
                    </div>
                </div>
            </div>

            {/* Neighbors with Medical Training */}
            <div className={styles.section}>
                <div className={styles.sectionTitle}>
                    <Heart size={18} color="#ef4444" />
                    <span style={{ color: '#ef4444' }}>Neighbors with Medical Training</span>
                </div>
                <div className={styles.grid}>
                    {medicallyTrained.map(neighbor => (
                        <div key={neighbor.id} className={styles.card} style={{ borderColor: 'rgba(239, 68, 68, 0.2)', backgroundColor: '#fff5f5' }}>
                            <div className={styles.contactInfo}>
                                <span className={styles.contactName}>{neighbor.name}</span>
                                <span className={styles.contactRole}>
                                    {neighbor.skills.find(s => ["Nurse", "Doctor", "First Aid", "CPR", "EMT", "First Aid/CPR"].some(term => s.includes(term)))}
                                </span>
                            </div>
                            <a href={`tel:${neighbor.id}`} className={styles.callButton} style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
                                <Phone size={14} />
                                Alert
                            </a>
                        </div>
                    ))}
                </div>
            </div>

            {/* Local Services */}
            <div className={styles.section}>
                <div className={styles.sectionTitle}>
                    Local Emergency Services
                </div>
                <div className={styles.grid} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}>
                    {emergencyServices.map(service => (
                        <a key={service.name} href={`tel:${service.number}`} className={styles.serviceButton}>
                            <div className={styles.serviceIcon} style={{ backgroundColor: service.bg, color: service.color }}>
                                <service.icon size={24} />
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div className={styles.serviceName}>{service.name}</div>
                                <div className={styles.serviceNumber}>{service.number}</div>
                            </div>
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
}
