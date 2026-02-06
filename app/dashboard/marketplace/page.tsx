"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./marketplace.module.css";
import { ShoppingBag, Plus, Tag, Clock, User, Check, X, Image as ImageIcon, UploadCloud, Trash2 } from "lucide-react";
import { MarketplaceItem } from "@/types/marketplace";
import { useUser } from "@/contexts/UserContext";
import { getCommunityMarketplaceItems, createMarketplaceItem } from "@/app/actions/marketplace";

export default function MarketplacePage() {
    const { user } = useUser();
    const [items, setItems] = useState<MarketplaceItem[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const [newItem, setNewItem] = useState({
        title: "",
        description: "",
        price: "",
        isFree: false,
        isNegotiable: false,
        images: [] as string[]
    });

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        Array.from(files).forEach(file => {
            if (file.size > 800 * 1024) { // 800KB limit for safety
                alert(`File ${file.name} is too large. Max 800KB.`);
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewItem(prev => ({
                    ...prev,
                    images: [...prev.images, reader.result as string].slice(0, 5) // Max 5 images
                }));
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index: number) => {
        setNewItem(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    useEffect(() => {
        const fetchItems = async () => {
            if (!user.communityId) {
                if (user.role) setIsLoading(false);
                return;
            }
            try {
                const res = await getCommunityMarketplaceItems(user.communityId);
                if (res.success && res.data) {
                    setItems(res.data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchItems();
    }, [user.communityId, user.role]);

    const handleCreate = async () => {
        if (!newItem.title || !user.communityId) return;

        // Note: For now, create action only supports basic fields. 
        // We'll map UI fields to what the server expects.
        // isFree/isNegotiable logic might be client-side derived or need schema update.
        // For now, price=0 means free.

        const priceVal = newItem.isFree ? "0" : newItem.price || "0";

        try {
            const res = await createMarketplaceItem({
                communityId: user.communityId,
                title: newItem.title,
                description: newItem.description,
                price: priceVal,
                isFree: newItem.isFree,
                isNegotiable: newItem.isNegotiable,
                images: newItem.images,
                sellerId: user.id || ""
            });

            if (res.success && res.data) {
                const createdItem: MarketplaceItem = {
                    id: res.data.id,
                    title: res.data.title,
                    description: res.data.description,
                    price: Number(res.data.price),
                    isFree: res.data.isFree,
                    isNegotiable: res.data.isNegotiable,
                    images: res.data.images || newItem.images,
                    status: 'Active',
                    postedDate: new Date().toISOString(),
                    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                    sellerId: user.id || "currentUser",
                    sellerName: user.name || "Me",
                    sellerEmail: user.email || ""
                };
                setItems([createdItem, ...items]);
                setIsModalOpen(false);
                setNewItem({ title: "", description: "", price: "", isFree: false, isNegotiable: false, images: [] });
            } else {
                alert("Failed to create item.");
            }
        } catch (e) {
            console.error(e);
            alert(`Error creating item: ${e instanceof Error ? e.message : String(e)}`);
        }
    };


    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Neighborhood Trade</h1>
                    <p style={{ color: 'var(--muted-foreground)' }}>
                        Buy, sell, or trade items with your neighbors.
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

            {isLoading ? (
                <div style={{ padding: '2rem', textAlign: 'center' }}>Loading items...</div>
            ) : items.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>No items found. Be the first to post!</div>
            ) : (
                <div className={styles.grid}>
                    {items.map(item => {
                        const isExpired = item.expiresAt ? new Date() > new Date(item.expiresAt) : false;
                        return (
                            <div key={item.id} className={styles.card} style={{ opacity: isExpired ? 0.6 : 1 }}>
                                <div className={styles.imagePlaceholder}>
                                    {item.images && item.images.length > 0 ? (
                                        <img src={item.images[0]} alt={item.title} className={styles.cardImage} />
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--muted-foreground)' }}>
                                            <ImageIcon size={40} />
                                            <span style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>No Photo</span>
                                        </div>
                                    )}
                                    {item.status === 'Sold' && <div className={styles.soldOverlay}>SOLD</div>}
                                </div>
                                <div className={styles.content}>
                                    <div className={styles.header}>
                                        <h3 className={styles.title}>{item.title}</h3>
                                        {item.isFree ? (
                                            <span className={styles.freeTag}>FREE</span>
                                        ) : (
                                            <span className={styles.priceTag}>${item.price.toFixed(2)}</span>
                                        )}
                                    </div>
                                    <p className={styles.description}>{item.description}</p>

                                    <div className={styles.meta}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                            <User size={14} />
                                            {item.sellerName === "Unknown Neighbor" ? (
                                                <span>{item.sellerName}</span>
                                            ) : (
                                                <Link href={`/dashboard/neighbors/${item.sellerId}`} className="hover:underline hover:text-primary">
                                                    {item.sellerName}
                                                </Link>
                                            )}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                            <Clock size={14} />
                                            <span>{item.postedDate ? new Date(item.postedDate).toLocaleDateString() : 'Now'}</span>
                                        </div>
                                    </div>

                                    <a
                                        href={`mailto:${item.sellerEmail || ''}?subject=Question about ${item.title}`}
                                        className={styles.contactButton}
                                        style={{ textDecoration: 'none', textAlign: 'center', display: 'block', marginTop: 'auto' }}
                                    >
                                        Contact Seller
                                    </a>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {isModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <div className={styles.modalHeader}>
                            <h2>Post New Item</h2>
                            <button onClick={() => setIsModalOpen(false)} className={styles.closeButton} aria-label="Close">
                                <X size={24} />
                            </button>
                        </div>
                        <div className={styles.form}>
                            {/* Form fields */}
                            <div className={styles.formGroup}>
                                <label>Item Title</label>
                                <input
                                    value={newItem.title}
                                    onChange={e => setNewItem({ ...newItem, title: e.target.value })}
                                    placeholder="e.g. Kids Bike"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Description</label>
                                <textarea
                                    value={newItem.description}
                                    onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                                    placeholder="Condition, details, etc."
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Photos (Max 5)</label>
                                <label className={styles.imageUploadArea}>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleImageUpload}
                                        style={{ display: 'none' }}
                                    />
                                    <UploadCloud size={24} />
                                    <span>Click to upload photos</span>
                                </label>
                                {newItem.images.length > 0 && (
                                    <div className={styles.imagePreviewGrid}>
                                        {newItem.images.map((img, idx) => (
                                            <div key={idx} className={styles.imagePreview}>
                                                <img src={img} alt="Preview" />
                                                <button
                                                    className={styles.removeImage}
                                                    onClick={() => removeImage(idx)}
                                                    type="button"
                                                    aria-label="Remove image"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className={styles.flexibleRow}>
                                <div className={`${styles.formGroup} ${styles.flex1}`}>
                                    <label>Price ($)</label>
                                    <input
                                        type="number"
                                        value={newItem.price}
                                        onChange={e => setNewItem({ ...newItem, price: e.target.value })}
                                        disabled={newItem.isFree}
                                        placeholder="0.00"
                                    />
                                </div>
                                <div className={styles.checkboxGroup}>
                                    <input
                                        type="checkbox"
                                        checked={newItem.isFree}
                                        onChange={e => setNewItem({ ...newItem, isFree: e.target.checked })}
                                        id="free-check"
                                    />
                                    <label htmlFor="free-check">List as Free</label>
                                </div>
                            </div>

                            <div className={styles.modalActions}>
                                <button className={styles.cancelButton} onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button className={styles.submitButton} onClick={handleCreate}>Post Listing</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
