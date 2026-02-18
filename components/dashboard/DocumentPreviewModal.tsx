"use client";

import { X, Download, FileText } from "lucide-react";
import styles from "./Modal.module.css";

interface DocumentPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    doc: {
        url: string;
        name: string;
        type?: string;
    } | null;
}

export function DocumentPreviewModal({ isOpen, onClose, doc }: DocumentPreviewModalProps) {
    if (!isOpen || !doc) return null;

    const isPDF = doc.url.toLowerCase().endsWith('.pdf');
    const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(doc.url);

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '2rem'
        }}>
            <div style={{
                backgroundColor: 'var(--card)',
                borderRadius: 'var(--radius)',
                width: '100%',
                maxWidth: '900px',
                height: '85vh',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}>
                <div style={{
                    padding: '1rem 1.5rem',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <FileText size={20} className="text-primary" />
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>{doc.name}</h3>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <a
                            href={doc.url}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                fontSize: '0.9rem',
                                color: 'var(--primary)',
                                textDecoration: 'none'
                            }}
                        >
                            <Download size={16} />
                            Download
                        </a>
                        <button
                            onClick={onClose}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: 'var(--muted-foreground)',
                                padding: '0.25rem'
                            }}
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                <div style={{ flex: 1, backgroundColor: '#f1f5f9', position: 'relative', overflow: 'hidden' }}>
                    {isPDF ? (
                        <iframe
                            src={`${doc.url}#toolbar=0`}
                            style={{ width: '100%', height: '100%', border: 'none' }}
                            title={doc.name}
                        />
                    ) : isImage ? (
                        <div style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'auto'
                        }}>
                            <img
                                src={doc.url}
                                alt={doc.name}
                                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                            />
                        </div>
                    ) : (
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%',
                            gap: '1rem',
                            color: 'var(--muted-foreground)'
                        }}>
                            <FileText size={64} style={{ opacity: 0.2 }} />
                            <p>Preview not available for this file type.</p>
                            <a
                                href={doc.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    backgroundColor: 'var(--primary)',
                                    color: 'white',
                                    borderRadius: 'var(--radius)',
                                    textDecoration: 'none',
                                    fontWeight: 500
                                }}
                            >
                                Download to View
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
