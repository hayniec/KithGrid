"use client";

import { useState } from "react";
import { MOCK_NEIGHBORS } from "@/lib/data";
import { NeighborCard } from "@/components/dashboard/NeighborCard";
import styles from "./neighbors.module.css";
import { Search, Filter, Mail, X } from "lucide-react";

export default function NeighborsPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");
    const [adminMode, setAdminMode] = useState(false); // Simulate admin privileges

    const filteredNeighbors = MOCK_NEIGHBORS.filter((neighbor) => {
        const term = searchTerm.toLowerCase();
        return (
            neighbor.name.toLowerCase().includes(term) ||
            neighbor.skills.some((s) => s.toLowerCase().includes(term)) ||
            neighbor.equipment.some((e) => e.name.toLowerCase().includes(term))
        );
    });

    const handleSendInvite = () => {
        if (!inviteEmail) return;

        // Simulate generating code and "sending" email
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();

        // Determine existing invites to append
        let existingInvites = [];
        try {
            const stored = localStorage.getItem('neighborNet_invites');
            if (stored) existingInvites = JSON.parse(stored);
        } catch (e) { }

        const newInvite = {
            email: inviteEmail,
            code,
            status: 'pending',
            sentAt: new Date().toISOString()
        };

        localStorage.setItem('neighborNet_invites', JSON.stringify([...existingInvites, newInvite]));

        alert(`Invitation sent to ${inviteEmail}!\n\n(DEBUG) The Code is: ${code}`);
        setInviteEmail("");
        setIsInviteModalOpen(false);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Neighbors Directory</h1>
                        <p style={{ color: 'var(--muted-foreground)', maxWidth: '600px' }}>
                            Connect with neighbors, find help with skills you need, or borrow equipment for your next project.
                        </p>
                    </div>
                    <button
                        onClick={() => setIsInviteModalOpen(true)}
                        style={{
                            padding: '0.6rem 1rem',
                            borderRadius: '999px',
                            backgroundColor: 'var(--primary)',
                            color: 'var(--primary-foreground)',
                            border: 'none',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontSize: '0.9rem'
                        }}
                    >
                        <Mail size={16} />
                        Invite Neighbor
                    </button>
                </div>

                {/* Search Bar */}
                <div style={{
                    display: 'flex',
                    gap: '1rem',
                    maxWidth: '500px',
                    marginTop: '1rem'
                }}>
                    <div style={{
                        position: 'relative',
                        flex: 1
                    }}>
                        <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)' }} />
                        <input
                            type="text"
                            placeholder="Search by name, skill, or equipment..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem 0.75rem 2.75rem',
                                borderRadius: 'var(--radius)',
                                border: '1px solid var(--border)',
                                backgroundColor: 'var(--background)',
                                color: 'var(--foreground)',
                                fontSize: '0.95rem',
                                outline: 'none'
                            }}
                        />
                    </div>
                    <button style={{
                        padding: '0 1.25rem',
                        borderRadius: 'var(--radius)',
                        border: '1px solid var(--border)',
                        backgroundColor: 'var(--card)',
                        color: 'var(--foreground)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontWeight: 500,
                        cursor: 'pointer'
                    }}>
                        <Filter size={18} />
                        Filters
                    </button>
                </div>
            </div>

            <div className={styles.grid}>
                {filteredNeighbors.map((neighbor) => (
                    <NeighborCard key={neighbor.id} neighbor={neighbor} />
                ))}
                {filteredNeighbors.length === 0 && (
                    <div style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>
                        No neighbors found matching "{searchTerm}".
                    </div>
                )}
            </div>

            {isInviteModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
                    backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)'
                }}>
                    <div style={{
                        backgroundColor: 'var(--background)',
                        padding: '2rem',
                        borderRadius: 'var(--radius)',
                        width: '100%',
                        maxWidth: '400px',
                        border: '1px solid var(--border)',
                        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Invite Neighbor</h2>
                            <button onClick={() => setIsInviteModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)' }}>
                                <X size={20} />
                            </button>
                        </div>
                        <p style={{ color: 'var(--muted-foreground)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                            Send an invitation code to a new resident. They can use this code to join NeighborNet.
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Email Address</label>
                                <input
                                    type="email"
                                    placeholder="neighbor@example.com"
                                    value={inviteEmail}
                                    onChange={e => setInviteEmail(e.target.value)}
                                    style={{
                                        padding: '0.75rem',
                                        borderRadius: 'var(--radius)',
                                        border: '1px solid var(--border)',
                                        backgroundColor: 'var(--background)',
                                        color: 'var(--foreground)',
                                        width: '100%'
                                    }}
                                />
                            </div>
                            <button
                                onClick={handleSendInvite}
                                style={{
                                    marginTop: '0.5rem',
                                    padding: '0.75rem',
                                    borderRadius: 'var(--radius)',
                                    backgroundColor: 'var(--primary)',
                                    color: 'white',
                                    border: 'none',
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                }}
                            >
                                Send Invitation
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
