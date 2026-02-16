"use client";

import { useState } from "react";
import styles from "./Modal.module.css";
import { X } from "lucide-react";

interface CreateLocalModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (data: any) => void;
}

export function CreateLocalModal({ isOpen, onClose, onCreate }: CreateLocalModalProps) {
    const [formData, setFormData] = useState({
        name: "",
        category: "Restaurant",
        address: "",
        description: ""
    });

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (!formData.name || !formData.category || !formData.address || !formData.description) return;
        onCreate(formData);
        setFormData({
            name: "",
            category: "Restaurant",
            address: "",
            description: ""
        });
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal} style={{ maxWidth: '500px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 className={styles.title} style={{ margin: 0 }}>Add Local Gem</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }} aria-label="Close">
                        <X size={20} />
                    </button>
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>Place Name</label>
                    <input
                        className={styles.input}
                        placeholder="e.g. Joe's Pizza"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        autoFocus
                    />
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>Category</label>
                    <select
                        className={styles.select}
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                        <option value="Restaurant">Restaurant</option>
                        <option value="Cafe">Cafe</option>
                        <option value="Shopping">Shopping</option>
                        <option value="Park">Park</option>
                        <option value="Entertainment">Entertainment</option>
                        <option value="Other">Other</option>
                    </select>
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>Address / Location</label>
                    <input
                        className={styles.input}
                        placeholder="e.g. 123 Main St or 'Downtown'"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>Description / Why go there?</label>
                    <textarea
                        className={styles.textarea}
                        placeholder="Great pasta and friendly service..."
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
                        disabled={!formData.name || !formData.address || !formData.description}
                        style={{ opacity: (!formData.name || !formData.address || !formData.description) ? 0.5 : 1 }}
                    >
                        Add Place
                    </button>
                </div>
            </div>
        </div>
    );
}
