"use client";

import { useState } from "react";
import { MOCK_MARKETPLACE } from "@/lib/data";
import styles from "./marketplace.module.css";
import { ShoppingBag, Plus, Tag, Clock, User, Check, X, Image as ImageIcon } from "lucide-react";
import { MarketplaceItem } from "@/types/marketplace";

export default function MarketplacePage() {
    // Filter out items older than 60 days (mock logic, mostly handled by initial data)
    // Filter out items that are not expired for display, or show them as expired
    const [items, setItems] = useState<MarketplaceItem[]>(MOCK_MARKETPLACE);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [newItem, setNewItem] = useState({
        title: "",
        description: "",
        price: "",
        isFree: false,
        isNegotiable: false,
    });

    const handleCreate = () => {
        if (!newItem.title) return;

        const priceVal = newItem.isFree ? 0 : parseFloat(newItem.price || '0');
        const today = new Date();
        const expires = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

        const createdItem: MarketplaceItem = {
            id: Math.random().toString(36).substr(2, 9),
            title: newItem.title,
            description: newItem.description,
            price: priceVal,
            isFree: newItem.isFree,
            isNegotiable: newItem.isNegotiable,
            images: [],
            status: 'Active',
            postedDate: today.toISOString(),
            expiresAt: expires.toISOString(),
            sellerId: "currentUser", // Mock
            sellerName: "Eric H." // Mock
        };

        setItems([createdItem, ...items]);
        setIsModalOpen(false);
        setNewItem({ title: "", description: "", price: "", isFree: false, isNegotiable: false });
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Neighborhood Trade</h1>
                    <p style={{ color: 'var(--muted-foreground)' }}>
                        Buy, sell, or trade items with your neighbors. Listings expire in 30 days.
                    </p>
                </div>
                <button
                    className={styles.button}
                    onClick={() => setIsModalOpen(true)}
                >
                    <Plus size={18} />
                    Post Item
                </button>
            </div>

            <div className={styles.grid}>
                {items.map(item => {
                    const isExpired = new Date() > new Date(item.expiresAt);
                    // Don't show deleted items (older than 60 days) - implicitly handled by data source in real app

                    return (
                        <div key={item.id} className={styles.card} style={{ opacity: isExpired ? 0.6 : 1 }}>
                            <div className={styles.imagePlaceholder}>
                                <ImageIcon size={40} />
                                {item.status === 'Sold' && (
                                    <div className={styles.soldOverlay}>SOLD</div>
                                )}
                                {isExpired && item.status !== 'Sold' && (
                                    <div className={styles.soldOverlay} style={{ backgroundColor: 'rgba(0,0,0,0.7)', fontSize: '1.2rem' }}>EXPIRED</div>
                                )}
                            </div>
                            <div className={styles.content}>
                                <div className={styles.header}>
                                    <h3 className={styles.title}>{item.title}</h3>
                                    {item.isFree ? (
                                        <span className={styles.freeTag}>FREE</span>
                                    ) : (
                                        <span className={styles.priceTag}>${item.price}</span>
                                    )}
                                </div>
                                <p className={styles.description}>{item.description}</p>
                                {item.isNegotiable && (
                                    <div style={{ display: 'flex', marginTop: 'auto' }}>
                                        <span className={styles.negotiable}>OBO / Negotiable</span>
                                    </div>
                                )}

                                <div className={styles.meta}>
                                    <div className={styles.seller}>
                                        <User size={14} />
                                        {item.sellerName}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }} title={`Expires: ${new Date(item.expiresAt).toLocaleDateString()}`}>
                                        <Clock size={14} />
                                        {new Date(item.postedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {isModalOpen && (
                <div className={styles.overlay}>
                    <div className={styles.modal}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Create New Listing</h3>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)' }}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className={styles.field}>
                            <label className={styles.label}>Item Title</label>
                            <input
                                className={styles.input}
                                placeholder="e.g. Lawn Mower, Kids Bike"
                                value={newItem.title}
                                onChange={e => setNewItem({ ...newItem, title: e.target.value })}
                            />
                        </div>

                        <div className={styles.field}>
                            <label className={styles.label}>Price</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ position: 'relative', flex: 1 }}>
                                    {!newItem.isFree && (
                                        <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)' }}>$</span>
                                    )}
                                    <input
                                        className={styles.input}
                                        type="number"
                                        placeholder="0.00"
                                        style={{ paddingLeft: newItem.isFree ? '10px' : '25px' }}
                                        disabled={newItem.isFree}
                                        value={newItem.price}
                                        onChange={e => setNewItem({ ...newItem, price: e.target.value })}
                                    />
                                </div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                                    <input
                                        type="checkbox"
                                        checked={newItem.isFree}
                                        onChange={e => setNewItem({ ...newItem, isFree: e.target.checked })}
                                    />
                                    List as Free
                                </label>
                            </div>
                        </div>

                        <div className={styles.field}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                                <input
                                    type="checkbox"
                                    checked={newItem.isNegotiable}
                                    onChange={e => setNewItem({ ...newItem, isNegotiable: e.target.checked })}
                                />
                                Open to negotiation (OBO)
                            </label>
                        </div>

                        <div className={styles.field}>
                            <label className={styles.label}>Description</label>
                            <textarea
                                className={styles.textarea}
                                placeholder="Describe condition, age, dimensions, etc."
                                value={newItem.description}
                                onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                            />
                        </div>

                        <div className={styles.field}>
                            <label className={styles.label}>Images</label>
                            <div style={{ height: '80px', border: '2px dashed var(--border)', borderRadius: 'var(--radius)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--muted-foreground)', fontSize: '0.875rem' }}>
                                <ImageIcon size={20} style={{ marginBottom: 4 }} />
                                <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>Upload Images</span>
                            </div>
                        </div>

                        <div className={styles.actions}>
                            <button className={`${styles.button} ${styles.secondaryButton}`} onClick={() => setIsModalOpen(false)}>
                                Cancel
                            </button>
                            <button className={styles.button} onClick={handleCreate}>
                                Publish Listing
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
