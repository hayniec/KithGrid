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
    });

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (!formData.name) return;
        onUpload(formData);
        setFormData({ name: "", category: "Rules" });
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 className={styles.title}>Upload HOA Document</h3>
                    <button onClick={onClose} style={{ cursor: 'pointer', background: 'none', border: 'none', color: 'var(--muted-foreground)' }}>
                        <X size={20} />
                    </button>
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>Document Name</label>
                    <input
                        className={styles.input}
                        placeholder="e.g. 2024 Budget Proposal"
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
                    </select>
                </div>

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

                <div className={styles.actions}>
                    <button className={`${styles.button} ${styles.secondaryButton}`} onClick={onClose}>
                        Cancel
                    </button>
                    <button
                        className={`${styles.button} ${styles.primaryButton}`}
                        onClick={handleSubmit}
                        disabled={!formData.name}
                    >
                        Upload
                    </button>
                </div>
            </div>
        </div>
    );
}
