"use client";

import { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { MOCK_DOCUMENTS, MOCK_NEIGHBORS } from "@/lib/data";
import { HoaDocument } from "@/types/hoa";
import styles from "./hoa.module.css";
import { FileText, Download, Mail, Phone, MapPin, Upload } from "lucide-react";
import { UploadDocumentModal } from "@/components/dashboard/UploadDocumentModal";

export default function HoaPage() {
    const [documents, setDocuments] = useState<HoaDocument[]>(MOCK_DOCUMENTS);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const { user } = useUser();
    const role = user?.role?.toLowerCase();
    const canUpload = role === 'admin' || role === 'board member';

    // Filter board members from neighbors
    const boardMembers = MOCK_NEIGHBORS.filter(n => n.role === "Board Member" || n.role === "Admin");

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
                        <span className={styles.cardLabel}>Board Members</span>
                        <div className={styles.officerList}>
                            {boardMembers.map(member => (
                                <div key={member.id} className={styles.officerItem}>
                                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>
                                        {member.avatar}
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{member.name}</span>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>{member.role === 'Board Member' ? 'Director' : 'President'}</span>
                                    </div>
                                </div>
                            ))}
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
        </div>
    );
}
