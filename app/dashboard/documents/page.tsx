"use client";

import { useState, useEffect } from "react";
import styles from "./documents.module.css";
import { FileText, Download, Eye, X, Upload, Home, Mail, Phone, MapPin, Link as LinkIcon, ExternalLink } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { getCommunityDocuments, createDocument } from "@/app/actions/documents";
import { getNeighbors } from "@/app/actions/neighbors"; // For board members if needed

interface Document {
    id: string;
    title: string;
    type: string;
    source: 'internal' | 'external';
    size?: string;
    date: string;
    url: string;
    category?: string;
}

export default function DocumentsPage() {
    const { user } = useUser();
    const [activeTab, setActiveTab] = useState<'documents' | 'info'>('info');
    const [documents, setDocuments] = useState<Document[]>([]);
    const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDocs = async () => {
            if (!user.communityId) {
                if (user.role) setIsLoading(false);
                return;
            }
            try {
                const res = await getCommunityDocuments(user.communityId);
                if (res.success && res.data) {
                    setDocuments(res.data);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDocs();
    }, [user.communityId, user.role]);

    const handleUpload = async (docData: any) => {
        if (!user.communityId) return;

        // Mock upload logic -> just create record with link
        try {
            const res = await createDocument({
                communityId: user.communityId,
                name: docData.name,
                category: docData.category,
                filePath: docData.url || "#",
                uploadedBy: user.id || ""
            });

            if (res.success && res.data) {
                const newDoc: Document = {
                    id: res.data.id,
                    title: res.data.name,
                    type: 'External Link',
                    source: 'external',
                    category: res.data.category,
                    date: new Date().toLocaleDateString(),
                    size: 'N/A',
                    url: res.data.filePath
                };
                setDocuments([newDoc, ...documents]);
                setIsUploadModalOpen(false);
            }
        } catch (e) {
            console.error(e);
            alert("Failed to upload document.");
        }
    };

    const handlePreview = (doc: Document) => {
        setSelectedDoc(doc);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.pageTitle}>HOA Documents & Info</h1>
                <p className={styles.pageSubtitle}>Central hub for community documents, board contacts, and resources.</p>
            </div>

            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === 'info' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('info')}
                >
                    Community Information
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'documents' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('documents')}
                >
                    Documents & Forms
                </button>
            </div>

            {activeTab === 'info' && (
                <div className={styles.infoGrid}>
                    <div className={styles.infoCard}>
                        <span className={styles.cardLabel}>Contact</span>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <div className={styles.cardValue}>
                                <Mail size={18} className="text-muted-foreground" />
                                board@community.com
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'documents' && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                        {/* Only admins might upload in future, for now allow all or check role */}
                        <button
                            className={styles.uploadButton}
                            onClick={() => setIsUploadModalOpen(true)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                padding: '0.5rem 1rem', background: 'var(--primary)', color: 'white',
                                border: 'none', borderRadius: 'var(--radius)', cursor: 'pointer'
                            }}
                        >
                            <Upload size={16} />
                            Upload Document
                        </button>
                    </div>

                    {isLoading ? (
                        <div style={{ padding: '2rem', textAlign: 'center' }}>Loading documents...</div>
                    ) : documents.length === 0 ? (
                        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>No documents found.</div>
                    ) : (
                        <div className={styles.documentList}>
                            {documents.map((doc) => (
                                <div key={doc.id} className={styles.documentCard} onClick={() => handlePreview(doc)}>
                                    <div className={styles.docIcon}>
                                        {doc.source === 'external' ? <LinkIcon size={24} /> : <FileText size={24} />}
                                    </div>
                                    <div className={styles.docInfo}>
                                        <h3 className={styles.docTitle}>{doc.title}</h3>
                                        <div className={styles.docMeta}>
                                            <span className={styles.docType}>{doc.type}</span>
                                            <span className={styles.docSize}>{doc.size}</span>
                                            <span className={styles.docDate}>{doc.date}</span>
                                            {doc.category && <span className={styles.docCategory}>{doc.category}</span>}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Modal placeholder (UI omitted for brevity but logic present in handleUpload) */}
        </div>
    );
}
