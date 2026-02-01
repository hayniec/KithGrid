"use client";

import { useState } from "react";
import styles from "./documents.module.css";
import { FileText, Download, Eye, X, Upload, Home, Mail, Phone, MapPin, Link as LinkIcon, ExternalLink } from "lucide-react";
import { MOCK_NEIGHBORS } from "@/lib/data";
import { UploadDocumentModal } from "@/components/dashboard/UploadDocumentModal";

interface Document {
    id: string;
    title: string;
    type: string; // 'PDF', 'Image', 'Link', etc.
    source: 'internal' | 'external';
    size?: string;
    date: string;
    url: string;
    category?: string;
}

const MOCK_DOCUMENTS_START: Document[] = [
    { id: "1", title: "HOA Bylaws 2024", type: "PDF", source: 'internal', size: "2.4 MB", date: "Jan 10, 2024", url: "#", category: "Rules" },
    { id: "2", title: "Architectural Guidelines", type: "PDF", source: 'internal', size: "1.8 MB", date: "Feb 15, 2024", url: "#", category: "Rules" },
    { id: "3", title: "Community Map", type: "Image", source: 'internal', size: "4.5 MB", date: "Mar 01, 2024", url: "#", category: "General" },
    { id: "4", title: "Pool Rules & Regulations", type: "PDF", source: 'internal', size: "1.2 MB", date: "May 20, 2024", url: "#", category: "Rules" },
    { id: "5", title: "Financial Report Q1 2025", type: "PDF", source: 'internal', size: "3.1 MB", date: "Apr 10, 2025", url: "#", category: "Financials" },
    // External Link Example
    { id: "100", title: "City Zoning Application", type: "External Link", source: 'external', size: "N/A", date: "N/A", url: "https://www.example.com", category: "Forms" },
    { id: "101", title: "County Waste Schedule", type: "External Link", source: 'external', size: "N/A", date: "N/A", url: "https://www.example.com", category: "Services" },
];

export default function DocumentsPage() {
    const [activeTab, setActiveTab] = useState<'documents' | 'info'>('info');
    const [documents, setDocuments] = useState<Document[]>(MOCK_DOCUMENTS_START);
    const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

    // Board members filtering (from previous HOA page)
    const boardMembers = MOCK_NEIGHBORS.filter(n => n.role === "Board Member" || n.role === "Admin");

    const handleUpload = (docData: any) => {
        const newDoc: Document = {
            id: Math.random().toString(36).substr(2, 9),
            title: docData.name,
            type: docData.source === 'external' ? 'External Link' : 'PDF',
            source: docData.source,
            category: docData.category,
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            size: docData.source === 'external' ? 'N/A' : '1.5 MB', // Mock
            url: docData.url || "#"
        };
        setDocuments([newDoc, ...documents]);
        setIsUploadModalOpen(false);
    };

    const handlePreview = (doc: Document) => {
        if (doc.source === 'external') {
            // Option: Open in new window or modal iframe.
            // For now, let's open in the modal viewer similar to internal docs but render an iframe.
            setSelectedDoc(doc);
        } else {
            setSelectedDoc(doc);
        }
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
                    {/* Contact Info */}
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

                    {/* Board Members */}
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

                    {/* Dues */}
                    <div className={styles.infoCard}>
                        <span className={styles.cardLabel}>Dues & Fees</span>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            <span style={{ fontSize: '2rem', fontWeight: 700 }}>$150<span style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--muted-foreground)' }}>/month</span></span>
                            <p style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)' }}>Next payment due: Feb 1st, 2024</p>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'documents' && (
                <>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                        <button
                            onClick={() => setIsUploadModalOpen(true)}
                            className={styles.actionButton}
                            style={{ flex: '0 0 auto' }}
                        >
                            <Upload size={18} />
                            Add Document / Link
                        </button>
                    </div>

                    <div className={styles.docGrid}>
                        {documents.map((doc) => (
                            <div key={doc.id} className={styles.docCard}>
                                <div className={styles.docIcon}>
                                    {doc.source === 'external' ? <LinkIcon size={40} /> : <FileText size={40} />}
                                </div>
                                <div className={styles.docInfo}>
                                    <h3 className={styles.docTitle}>{doc.title}</h3>
                                    <div className={styles.docMeta}>
                                        <span>{doc.type}</span>
                                        <span>•</span>
                                        <span>{doc.category || 'General'}</span>
                                        {doc.source === 'internal' && (
                                            <>
                                                <span>•</span>
                                                <span>{doc.size}</span>
                                                <span>•</span>
                                                <span>{doc.date}</span>
                                            </>
                                        )}
                                    </div>
                                    {doc.source === 'external' && <span style={{ fontSize: '0.75rem', color: 'var(--primary)', display: 'block', marginTop: '4px' }}>External Resource</span>}
                                </div>
                                <div className={styles.docActions}>
                                    <button
                                        className={styles.actionButton}
                                        onClick={() => handlePreview(doc)}
                                        title={doc.source === 'external' ? "Open Link" : "View Document"}
                                    >
                                        <Eye size={18} />
                                        {doc.source === 'external' ? 'Open' : 'Preview'}
                                    </button>
                                    {doc.source === 'internal' && (
                                        <button className={styles.iconButton} title="Download">
                                            <Download size={18} />
                                        </button>
                                    )}
                                    {doc.source === 'external' && (
                                        <a href={doc.url} target="_blank" rel="noopener noreferrer" className={styles.iconButton} title="Open in new tab">
                                            <ExternalLink size={18} />
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Inline Viewer Overlay */}
            {selectedDoc && (
                <div className={styles.viewerOverlay} onClick={() => setSelectedDoc(null)}>
                    <div className={styles.viewerContent} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.viewerHeader}>
                            <h2 className={styles.viewerTitle}>{selectedDoc.title}</h2>
                            <button className={styles.closeButton} onClick={() => setSelectedDoc(null)}>
                                <X size={24} />
                            </button>
                        </div>
                        <div className={styles.viewerBody}>
                            {selectedDoc.source === 'external' ? (
                                <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                                    <p>Opening external resource...</p>
                                    <a href={selectedDoc.url} target="_blank" rel="noopener noreferrer"
                                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: 'var(--primary)', color: 'white', borderRadius: 'var(--radius)', textDecoration: 'none' }}>
                                        Open "{selectedDoc.title}" in new tab <ExternalLink size={16} />
                                    </a>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>
                                        Note: Some external sites cannot be embedded directly due to conflicting policy headers.
                                    </p>
                                </div>
                            ) : (
                                <div className={styles.placeholderViewer}>
                                    <FileText size={64} style={{ opacity: 0.2 }} />
                                    <p>This is a placeholder for the inline document viewer.</p>
                                    <p>Viewing: <strong>{selectedDoc.title}</strong> ({selectedDoc.type})</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <UploadDocumentModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                onUpload={handleUpload}
            />
        </div>
    );
}
