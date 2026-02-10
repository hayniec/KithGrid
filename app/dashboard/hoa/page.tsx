"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/contexts/UserContext";
import { MOCK_DOCUMENTS } from "@/lib/data";
import { HoaDocument } from "@/types/hoa";
import styles from "./hoa.module.css";
import { FileText, Download, Mail, Phone, MapPin, Upload } from "lucide-react";
import { UploadDocumentModal } from "@/components/dashboard/UploadDocumentModal";
import { getNeighbors, NeighborActionState } from "@/app/actions/neighbors";
import { ContactOfficerModal } from "@/components/dashboard/ContactOfficerModal";

interface Officer {
    id: string;
    name: string;
    role: string;
    hoaPosition: string | null;
    email: string;
    avatar?: string;
}

export default function HoaPage() {
    const [documents, setDocuments] = useState<HoaDocument[]>(MOCK_DOCUMENTS);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

    // Contact Modal State
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);
    const [selectedOfficer, setSelectedOfficer] = useState<Officer | null>(null);

    const { user } = useUser();
    const role = user?.role?.toLowerCase();
    const canUpload = role === 'admin' || role === 'board member';

    const [officers, setOfficers] = useState<Officer[]>([]);
    const [isLoadingOfficers, setIsLoadingOfficers] = useState(true);

    useEffect(() => {
        async function fetchOfficers() {
            if (!user?.communityId) return;

            try {
                const result = await getNeighbors(user.communityId);
                if (result.success && result.data) {
                    const foundOfficers = result.data.filter((n: any) =>
                        n.hoaPosition && n.hoaPosition.trim() !== ""
                    ).map((n: any) => ({
                        id: n.id,
                        name: n.name,
                        role: n.role,
                        hoaPosition: n.hoaPosition,
                        email: n.email,
                        avatar: n.avatar
                    }));
                    setOfficers(foundOfficers);
                }
            } catch (err) {
                console.error("Failed to load officers", err);
            } finally {
                setIsLoadingOfficers(false);
            }
        }

        fetchOfficers();
    }, [user?.communityId]);


    const handleUpload = (docData: any) => {
        // Mock upload
        const newDoc: HoaDocument = {
            id: Math.random().toString(36).substr(2, 9),
            name: docData.name,
            category: docData.category,
            uploadDate: new Date().toISOString().split('T')[0],
            size: docData.file ? "1.5 MB" : "Link",
            url: docData.source === 'external' ? docData.url : "#",
            uploaderName: user?.name || "Neighbor"
        };
        setDocuments([newDoc, ...documents]);
        setIsUploadModalOpen(false);
    };

    const handleEmailClick = (officer: Officer) => {
        setSelectedOfficer(officer);
        setIsContactModalOpen(true);
    };

    return (
        <div className={styles.container}>

            <div className={styles.intro}>
                <h1>Maple Grove HOA</h1>
                <p>
                    Welcome to the official information hub for the Maple Grove community.
                    Here you can find board contacts, community rules, and financial reports.
                </p>
            </div>

            <div className={styles.section}>
                <h2 className={styles.title}>Community Information</h2>
                <div className={styles.infoGrid}>
                    <div className={styles.infoCard}>
                        <span className={styles.cardLabel}>Contact</span>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <div className={styles.cardValue}>
                                <Mail size={18} className="text-muted-foreground" />
                                board@maplegrovehoa.com
                            </div>
                            <div className={styles.cardValue}>
                                <Phone size={18} className="text-muted-foreground" />
                                (555) 123-4567
                            </div>
                            <div className={styles.cardValue}>
                                <MapPin size={18} className="text-muted-foreground" />
                                P.O. Box 42, Springfield
                            </div>
                        </div>
                    </div>

                    <div className={styles.infoCard}>
                        <span className={styles.cardLabel}>Board Members / Officers</span>
                        <div className={styles.officerList}>
                            {isLoadingOfficers ? (
                                <div style={{ padding: '1rem', color: 'var(--muted-foreground)' }}>Loading officers...</div>
                            ) : officers.length === 0 ? (
                                <div style={{ padding: '1rem', color: 'var(--muted-foreground)', fontStyle: 'italic' }}>
                                    No officers listed.
                                </div>
                            ) : (
                                officers.map(officer => (
                                    <div key={officer.id} className={styles.officerItem}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>
                                                {officer.avatar || officer.name.charAt(0)}
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{officer.name}</span>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', fontWeight: 500 }}>
                                                    {officer.hoaPosition}
                                                </span>
                                            </div>
                                        </div>

                                        <button
                                            className={styles.contactLink}
                                            onClick={() => handleEmailClick(officer)}
                                            title={`Email ${officer.name}`}
                                        >
                                            <Mail size={16} />
                                            Email
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className={styles.infoCard}>
                        <span className={styles.cardLabel}>Dues & Fees</span>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            <span style={{ fontSize: '2rem', fontWeight: 700 }}>$150<span style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--muted-foreground)' }}>/month</span></span>
                            <p style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)' }}>Next payment due: Feb 1st, 2024</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.title}>Documents & Resources</h2>
                    {canUpload && (
                        <button
                            onClick={() => setIsUploadModalOpen(true)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                backgroundColor: 'var(--primary)',
                                color: 'var(--primary-foreground)',
                                border: 'none',
                                padding: '0.6rem 1rem',
                                borderRadius: 'var(--radius)',
                                fontSize: '0.9rem',
                                fontWeight: 500,
                                cursor: 'pointer'
                            }}
                        >
                            <Upload size={18} />
                            Upload Document
                        </button>
                    )}
                </div>

                <div className={styles.docsList}>
                    {documents.map(doc => (
                        <div key={doc.id} className={styles.docItem}>
                            <div className={styles.docInfo}>
                                <div className={styles.docIcon}>
                                    <FileText size={24} />
                                </div>
                                <div className={styles.docMeta}>
                                    <span className={styles.docName}>{doc.name}</span>
                                    <span className={styles.docDetails}>
                                        {doc.category} • {doc.size} • Uploaded {doc.uploadDate}
                                    </span>
                                </div>
                            </div>
                            <button className={styles.downloadButton} title="Download">
                                <Download size={20} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <UploadDocumentModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                onUpload={handleUpload}
            />

            <ContactOfficerModal
                isOpen={isContactModalOpen}
                onClose={() => setIsContactModalOpen(false)}
                officer={selectedOfficer ? {
                    name: selectedOfficer.name,
                    email: selectedOfficer.email,
                    position: selectedOfficer.hoaPosition || "Officer"
                } : null}
                sender={{
                    name: user?.name || "Resident",
                    email: user?.email || ""
                }}
            />
        </div>
    );
}
