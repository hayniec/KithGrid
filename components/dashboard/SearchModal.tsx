"use client";

import { useState, useEffect } from "react";
import styles from "@/components/dashboard/Modal.module.css"; // Reuse existing modal styles
import { Search, X, User, Calendar, ShoppingBag, BoxSelect, ArrowRight } from "lucide-react";
import { MOCK_NEIGHBORS, MOCK_EVENTS, MOCK_MARKETPLACE, MOCK_RESOURCES } from "@/lib/data";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
    const [query, setQuery] = useState("");
    const router = useRouter();

    // Prevent scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            // Auto focus input logic could go here
        } else {
            document.body.style.overflow = 'unset';
            setQuery(""); // Reset query handling
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    if (!isOpen) return null;

    // Search Logic
    const lowerQuery = query.toLowerCase();
    const hasQuery = query.length > 0;

    const results = {
        neighbors: hasQuery ? MOCK_NEIGHBORS.filter(n =>
            n.name.toLowerCase().includes(lowerQuery) ||
            n.skills.some(s => s.toLowerCase().includes(lowerQuery))
        ) : [],
        events: hasQuery ? MOCK_EVENTS.filter(e =>
            e.title.toLowerCase().includes(lowerQuery) ||
            e.description.toLowerCase().includes(lowerQuery)
        ) : [],
        marketplace: hasQuery ? MOCK_MARKETPLACE.filter(m =>
            m.title.toLowerCase().includes(lowerQuery) ||
            m.description.toLowerCase().includes(lowerQuery)
        ) : [],
        resources: hasQuery ? MOCK_RESOURCES.filter(r =>
            r.name.toLowerCase().includes(lowerQuery) ||
            r.type.toLowerCase().includes(lowerQuery)
        ) : []
    };

    const hasResults = Object.values(results).some(arr => arr.length > 0);

    const handleNavigate = (path: string) => {
        router.push(path);
        onClose();
    };

    return (
        <div className={styles.overlay} style={{ alignItems: 'flex-start', paddingTop: '10vh' }}>
            <div className={styles.modal} style={{ maxWidth: '600px', width: '100%', padding: 0, overflow: 'hidden' }}>
                {/* Search Header */}
                <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Search size={20} style={{ color: 'var(--muted-foreground)' }} />
                    <input
                        autoFocus
                        style={{
                            flex: 1,
                            border: 'none',
                            fontSize: '1.2rem',
                            outline: 'none',
                            background: 'transparent',
                            color: 'var(--foreground)'
                        }}
                        placeholder="Search neighbors, events, items..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)' }}>
                        <X size={24} />
                    </button>
                </div>

                {/* Results Area */}
                <div style={{ maxHeight: '60vh', overflowY: 'auto', padding: '0' }}>
                    {!hasQuery && (
                        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>
                            Type to start searching...
                        </div>
                    )}

                    {hasQuery && !hasResults && (
                        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>
                            No results found for "{query}"
                        </div>
                    )}

                    {/* Neighbors Section */}
                    {results.neighbors.length > 0 && (
                        <div style={{ padding: '0.5rem 0' }}>
                            <div style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--muted-foreground)', textTransform: 'uppercase' }}>Neighbors</div>
                            {results.neighbors.map(n => (
                                <div
                                    key={n.id}
                                    onClick={() => handleNavigate(`/dashboard/neighbors/${n.id}`)}
                                    style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', transition: 'background 0.2s' }}
                                    className="hover:bg-gray-100 dark:hover:bg-gray-800"
                                >
                                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>
                                        {n.avatar}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 500 }}>{n.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>{n.address}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Events Section */}
                    {results.events.length > 0 && (
                        <div style={{ padding: '0.5rem 0', borderTop: '1px solid var(--border)' }}>
                            <div style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--muted-foreground)', textTransform: 'uppercase' }}>Events</div>
                            {results.events.map(e => (
                                <div
                                    key={e.id}
                                    onClick={() => handleNavigate(`/dashboard/events`)}
                                    style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}
                                >
                                    <div style={{ padding: '0.5rem', borderRadius: '6px', background: 'var(--muted)' }}>
                                        <Calendar size={20} />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 500 }}>{e.title}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>{e.date} • {e.location}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Marketplace Section */}
                    {results.marketplace.length > 0 && (
                        <div style={{ padding: '0.5rem 0', borderTop: '1px solid var(--border)' }}>
                            <div style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--muted-foreground)', textTransform: 'uppercase' }}>Marketplace</div>
                            {results.marketplace.map(m => (
                                <div
                                    key={m.id}
                                    onClick={() => handleNavigate(`/dashboard/marketplace`)}
                                    style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}
                                >
                                    <div style={{ padding: '0.5rem', borderRadius: '6px', background: 'var(--muted)' }}>
                                        <ShoppingBag size={20} />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 500 }}>{m.title}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>${m.price} • {m.sellerName}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Resources Section */}
                    {results.resources.length > 0 && (
                        <div style={{ padding: '0.5rem 0', borderTop: '1px solid var(--border)' }}>
                            <div style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--muted-foreground)', textTransform: 'uppercase' }}>Resources</div>
                            {results.resources.map(r => (
                                <div
                                    key={r.id}
                                    onClick={() => handleNavigate(`/dashboard/resources`)}
                                    style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}
                                >
                                    <div style={{ padding: '0.5rem', borderRadius: '6px', background: 'var(--muted)' }}>
                                        <BoxSelect size={20} />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 500 }}>{r.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>{r.type}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {hasResults && (
                    <div style={{ padding: '0.75rem', background: 'var(--muted)', fontSize: '0.8rem', color: 'var(--muted-foreground)', display: 'flex', justifyContent: 'center' }}>
                        Press Esc to close
                    </div>
                )}
            </div>
        </div>
    );
}
