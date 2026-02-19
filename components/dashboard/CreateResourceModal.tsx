"use client";

import { useState, useEffect } from "react";
import styles from "@/components/dashboard/Modal.module.css";
import { X } from "lucide-react";

interface CreateResourceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (data: any) => void;
    isLoading?: boolean;
}

export function CreateResourceModal({ isOpen, onClose, onCreate, isLoading = false }: CreateResourceModalProps) {
    const [formData, setFormData] = useState({
        name: "",
        type: "Tool",
        description: "",
        capacity: "",
    });

    useEffect(() => {
        if (isOpen) {
            setFormData({
                name: "",
                type: "Tool",
                description: "",
                capacity: "",
            });
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (!formData.name) return;
        onCreate({
            ...formData,
            capacity: formData.capacity ? parseInt(formData.capacity) : undefined
        });
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h3 className={styles.title}>Add New Resource</h3>
                    <button className={styles.closeButton} onClick={onClose} aria-label="Close">
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
                        disabled={isLoading}
                    />
                </div>

                <div className={styles.field}>
                    <label className={styles.label} htmlFor="resource-type">Type</label>
                    <select
                        id="resource-type"
                        className={styles.select}
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        disabled={isLoading}
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
                            disabled={isLoading}
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
                        disabled={isLoading}
                    />
                </div>

                <div className={styles.actions}>
                    <button className={`${styles.button} ${styles.secondaryButton}`} onClick={onClose} disabled={isLoading}>
                        Cancel
                    </button>
                    <button
                        className={`${styles.button} ${styles.primaryButton}`}
                        onClick={handleSubmit}
                        disabled={!formData.name || isLoading}
                    >
                        {isLoading ? 'Creating...' : 'Create Resource'}
                    </button>
                </div>
            </div>
        </div>
    );
}
