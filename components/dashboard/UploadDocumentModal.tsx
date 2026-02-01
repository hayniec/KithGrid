"use client";

import { useState } from "react";
import styles from "@/components/dashboard/Modal.module.css";
import { Upload, X, FileText } from "lucide-react";

interface UploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpload: (docData: any) => void;
}

export function UploadDocumentModal({ isOpen, onClose, onUpload }: UploadModalProps) {
    const [formData, setFormData] = useState({
        name: "",
        category: "Rules",
        source: "internal", // 'internal' | 'external'
        url: ""
    });

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (!formData.name) return;
        if (formData.source === 'external' && !formData.url) return;

        onUpload(formData);
        setFormData({ name: "", category: "Rules", source: "internal", url: "" });
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 className={styles.title}>Add Document or Resource</h3>
                    <button onClick={onClose} style={{ cursor: 'pointer', background: 'none', border: 'none', color: 'var(--muted-foreground)' }}>
                        <X size={20} />
                    </button>
                </div>

                {/* Source Type Selection */}
                <div className={styles.field}>
                    <label className={styles.label}>Type</label>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                            <input
                                type="radio"
                                name="source"
                                checked={formData.source === 'internal'}
                                onChange={() => setFormData({ ...formData, source: 'internal' })}
                            />
                            File Upload
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                            <input
                                type="radio"
                                name="source"
                                checked={formData.source === 'external'}
                                onChange={() => setFormData({ ...formData, source: 'external' })}
                            />
                            External Link
                        </label>
                    </div>
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>Name</label>
                    <input
                        className={styles.input}
                        placeholder={formData.source === 'internal' ? "e.g. 2024 Budget Proposal" : "e.g. City Zoning Form"}
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>Category</label>
                    <select
                        className={styles.select}
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                        <option value="Rules">Rules & Regulations</option>
                        <option value="Financials">Financials</option>
                        <option value="Meeting Minutes">Meeting Minutes</option>
                        <option value="Forms">Forms</option>
                        <option value="Services">Services / Utilities</option>
                        <option value="General">General Info</option>
                    </select>
                </div>

                {formData.source === 'internal' ? (
                    <div className={styles.field}>
                        <label className={styles.label}>File</label>
                        <div style={{
                            border: '2px dashed var(--border)',
                            borderRadius: 'var(--radius)',
                            padding: '2rem',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.5rem',
                            color: 'var(--muted-foreground)',
                            cursor: 'pointer',
                            fontSize: '0.85rem'
                        }}>
                            <Upload size={24} />
                            <span>Click to browse or drag file here</span>
                        </div>
                    </div>
                ) : (
                    <div className={styles.field}>
                        <label className={styles.label}>External URL</label>
                        <input
                            className={styles.input}
                            placeholder="https://example.com/form..."
                            value={formData.url}
                            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                        />
                    </div>
                )}

                <div className={styles.actions}>
                    <button className={`${styles.button} ${styles.secondaryButton}`} onClick={onClose}>
                        Cancel
                    </button>
                    <button
                        className={`${styles.button} ${styles.primaryButton}`}
                        onClick={handleSubmit}
                        disabled={!formData.name || (formData.source === 'external' && !formData.url)}
                    >
                        {formData.source === 'internal' ? 'Upload' : 'Add Link'}
                    </button>
                </div>
            </div>
        </div>
    );
}
