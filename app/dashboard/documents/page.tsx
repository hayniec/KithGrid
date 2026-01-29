"use client";

import { useState } from "react";
import styles from "./documents.module.css";
import { FileText, Download, Eye, X } from "lucide-react";

interface Document {
    id: string;
    title: string;
    type: string;
    size: string;
    date: string;
    url: string; // In a real app, this would be a real URL
}

const MOCK_DOCUMENTS: Document[] = [
    { id: "1", title: "HOA Bylaws 2024", type: "PDF", size: "2.4 MB", date: "Jan 10, 2024", url: "/mock-docs/bylaws.pdf" },
    { id: "2", title: "Architectural Guidelines", type: "PDF", size: "1.8 MB", date: "Feb 15, 2024", url: "/mock-docs/guidelines.pdf" },
    { id: "3", title: "Community Map", type: "Image", size: "4.5 MB", date: "Mar 01, 2024", url: "/mock-docs/map.jpg" },
    { id: "4", title: "Pool Rules & Regulations", type: "PDF", size: "1.2 MB", date: "May 20, 2024", url: "/mock-docs/pool-rules.pdf" },
    { id: "5", title: "Financial Report Q1 2025", type: "PDF", size: "3.1 MB", date: "Apr 10, 2025", url: "/mock-docs/financials.pdf" },
];

export default function DocumentsPage() {
    const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.pageTitle}>Community Documents</h1>
                <p className={styles.pageSubtitle}>Access important HOA documents, forms, and community information.</p>
            </div>

            <div className={styles.docGrid}>
                {MOCK_DOCUMENTS.map((doc) => (
                    <div key={doc.id} className={styles.docCard}>
                        <div className={styles.docIcon}>
                            <FileText size={40} />
                        </div>
                        <div className={styles.docInfo}>
                            <h3 className={styles.docTitle}>{doc.title}</h3>
                            <div className={styles.docMeta}>
                                <span>{doc.type}</span>
                                <span>•</span>
                                <span>{doc.size}</span>
                                <span>•</span>
                                <span>{doc.date}</span>
                            </div>
                        </div>
                        <div className={styles.docActions}>
                            <button
                                className={styles.actionButton}
                                onClick={() => setSelectedDoc(doc)}
                                title="View Document"
                            >
                                <Eye size={18} />
                                Preview
                            </button>
                            <button className={styles.iconButton} title="Download">
                                <Download size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

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
                            {/* In a real app, this would be a real PDF viewer or iframe */}
                            <div className={styles.placeholderViewer}>
                                <FileText size={64} style={{ opacity: 0.2 }} />
                                <p>This is a placeholder for the inline document viewer.</p>
                                <p>Viewing: <strong>{selectedDoc.title}</strong> ({selectedDoc.type})</p>
                                <p style={{ fontSize: '0.9rem', marginTop: '1rem', color: 'var(--muted-foreground)' }}>
                                    In a production environment, this would render the actual file content using an iframe or a PDF library like react-pdf.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
