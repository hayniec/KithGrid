"use client";

import { useState } from "react";
import styles from "@/components/dashboard/Modal.module.css";
import { X, Plus } from "lucide-react";

interface CreateResourceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (data: any) => void;
}

export function CreateResourceModal({ isOpen, onClose, onCreate }: CreateResourceModalProps) {
    const [formData, setFormData] = useState({
        name: "",
        type: "Tool",
        description: "",
        capacity: "",
    });

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (!formData.name) return;
        onCreate({
            ...formData,
            capacity: formData.capacity ? parseInt(formData.capacity) : undefined
        });
        setFormData({ name: "", type: "Tool", description: "", capacity: "" });
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 className={styles.title}>Add New Resource</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)' }}>
                        <X size={20} />
                    </button>
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>Resource Name</label>
                    <input
                        className={styles.input}
                        placeholder="e.g. Community Grill"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>Type</label>
                    <select
                        className={styles.select}
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    >
                        <option value="Facility">Facility (Room, Park, etc.)</option>
                        <option value="Tool">Tool / Equipment</option>
                        <option value="Vehicle">Vehicle</option>
                    </select>
                </div>

                {formData.type === 'Facility' && (
                    <div className={styles.field}>
                        <label className={styles.label}>Capacity (Max People)</label>
                        <input
                            className={styles.input}
                            type="number"
                            placeholder="e.g. 50"
                            value={formData.capacity}
                            onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                        />
                    </div>
                )}

                <div className={styles.field}>
                    <label className={styles.label}>Description</label>
                    <textarea
                        className={styles.textarea}
                        placeholder="Describe the item and any rules for use..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
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
                        Create Resource
                    </button>
                </div>
            </div>
        </div>
    );
}
