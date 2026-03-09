"use client";

import { useState, useEffect } from "react";
import { Shield, Plus, Check, PowerOff, Building, Download, Trash2, Database, LogOut, UserPlus, X, Copy, BarChart3 } from "lucide-react";
import styles from "./admin.module.css";
import { getTenants } from "@/app/actions/super-admin";
import { createCommunity, toggleCommunityStatus, deleteCommunity, toggleCommunityFeature } from "@/app/actions/communities";
import { createInvitation } from "@/app/actions/invitations";
import { getAllCommunityUsageStats } from "@/app/actions/billing";
import type { CommunityUsageStats } from "@/app/actions/billing-types";
import type { Community } from "@/types/community";
import { createClient } from "@/utils/supabase/client";

export default function SuperAdminPage() {
    const supabase = createClient();
    const [communities, setCommunities] = useState<Community[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newCommunity, setNewCommunity] = useState<Partial<Community>>({
        name: '',
        slug: '',
        plan: 'starter_100',
        features: {
            marketplace: true, resources: true, events: true, documents: true,
            forum: true, messages: true, services: true, local: true, emergency: true
        }
    });

    // View mode: tenants or usage
    const [viewMode, setViewMode] = useState<'tenants' | 'usage'>('tenants');

    // Usage Stats
    const [usageStats, setUsageStats] = useState<CommunityUsageStats[]>([]);
    const [usageTotals, setUsageTotals] = useState<any>(null);
    const [loadingUsage, setLoadingUsage] = useState(false);

    // Invite Admin State
    const [inviteModalOpen, setInviteModalOpen] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");
    const [selectedCommunityId, setSelectedCommunityId] = useState<string | null>(null);
    const [generatedCode, setGeneratedCode] = useState<string | null>(null);

    useEffect(() => {
        loadCommunities();
    }, []);

    const loadCommunities = async () => {
        setLoading(true);
        try {
            const res = await getTenants();
            if (res.success && res.data) {
                setCommunities(res.data);
            } else {
                console.error(res.error);
                alert(`Failed to load communities: ${res.error}`);
            }
        } catch (e: any) {
            console.error("Failed to load communities", e);
            alert(`Unexpected error loading communities: ${e.message || e}`);
        } finally {
            setLoading(false);
        }
    };

    const loadUsageStats = async () => {
        setLoadingUsage(true);
        try {
            const res = await getAllCommunityUsageStats();
            if (res.success && res.data) {
                setUsageStats(res.data);
                setUsageTotals(res.totals);
            }
        } catch (e) {
            console.error("Failed to load usage stats", e);
        } finally {
            setLoadingUsage(false);
        }
    };

    const handleToggleFeature = async (id: string, feature: keyof Community['features']) => {
        // Optimistic update
        setCommunities(prev => prev.map(c => {
            if (c.id === id) {
                return { ...c, features: { ...c.features, [feature]: !c.features[feature] } };
            }
            return c;
        }));

        const c = communities.find(c => c.id === id);
        if (c) {
            await toggleCommunityFeature(id, feature, !c.features[feature]);
        }
    };

    const handleToggleActive = async (id: string) => {
        // Optimistic update
        const c = communities.find(c => c.id === id);
        if (!c) return;

        const newStatus = !c.isActive;
        setCommunities(prev => prev.map(item => item.id === id ? { ...item, isActive: newStatus } : item));

        await toggleCommunityStatus(id, newStatus);
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this tenant? This action cannot be undone.')) {
            setCommunities(prev => prev.filter(c => c.id !== id));
            await deleteCommunity(id);
        }
    };

    const handleExport = (community: Community) => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(community, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `${community.slug}_export.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    const handleAdd = async () => {
        if (!newCommunity.name || !newCommunity.slug) {
            alert("Please enter a name and slug.");
            return;
        }

        setIsCreating(true);
        try {
            const res = await createCommunity({
                ...newCommunity,
                // defaults
                branding: {
                    logoUrl: '',
                    primaryColor: '#4f46e5',
                    secondaryColor: '#1e1b4b',
                    accentColor: '#f59e0b'
                }
            });

            if (res.success) {
                setCommunities([...communities, res.data]);
                setShowAddModal(false);
                setNewCommunity({
                    name: '', slug: '', plan: 'starter_100',
                    features: {
                        marketplace: true, resources: true, events: true, documents: true,
                        forum: true, messages: true, services: true, local: true, emergency: true
                    }
                });
            } else {
                alert(`Failed to create community: ${res.error || 'Unknown error'}`);
            }
        } catch (e) {
            alert("Unexpected error creating community");
        } finally {
            setIsCreating(false);
        }
    };



    const updateBrandingPreview = (id: string, field: string, value: string) => {
        // Just local state update for preview, ideally implementation would save on blur or store separately
        setCommunities(prev => prev.map(c => c.id === id ? {
            ...c,
            branding: { ...c.branding, [field]: value }
        } : c));
    };

    const handleInviteAdmin = async () => {
        if (!selectedCommunityId || !inviteEmail) return;

        try {
            const res = await createInvitation({
                communityId: selectedCommunityId,
                email: inviteEmail,
                role: 'Admin',
                createdBy: "mock-super-admin-id" // Explicitly use super admin override
            });

            if (res.success && res.data) {
                setGeneratedCode(res.data.code);
            } else {
                alert(`Failed to create invitation: ${res.error}`);
            }
        } catch (e) {
            alert("Error creating invitation");
        }
    };

    const closeInviteModal = () => {
        setInviteModalOpen(false);
        setInviteEmail("");
        setGeneratedCode(null);
        setSelectedCommunityId(null);
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        window.location.href = '/login';
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>
                        <Shield size={32} color="#4f46e5" />
                        Super Admin Console <span className={styles.version}>v2.1</span>
                    </h1>
                    <p className={styles.subtitle}>Master control for all KithGrid tenants.</p>
                </div>
                <div className={styles.actionsContainer}>
                    <button
                        onClick={handleSignOut}
                        className={styles.signOutButton}
                    >
                        <LogOut size={16} />
                        Sign Out
                    </button>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className={styles.addButton}
                    >
                        <Plus size={20} />
                        Add Tenant
                    </button>
                </div>
            </div>

            {/* View Mode Toggle */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <button
                    onClick={() => setViewMode('tenants')}
                    style={{
                        padding: '0.6rem 1.2rem',
                        borderRadius: '6px',
                        border: '1px solid var(--border, #e5e7eb)',
                        background: viewMode === 'tenants' ? '#4f46e5' : '#fff',
                        color: viewMode === 'tenants' ? '#fff' : '#374151',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                    }}
                >
                    <Building size={16} /> Tenants
                </button>
                <button
                    onClick={() => { setViewMode('usage'); loadUsageStats(); }}
                    style={{
                        padding: '0.6rem 1.2rem',
                        borderRadius: '6px',
                        border: '1px solid var(--border, #e5e7eb)',
                        background: viewMode === 'usage' ? '#4f46e5' : '#fff',
                        color: viewMode === 'usage' ? '#fff' : '#374151',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                    }}
                >
                    <BarChart3 size={16} /> Usage Tracking
                </button>
            </div>

            {/* Usage Tracking Dashboard */}
            {viewMode === 'usage' && (
                <div>
                    {loadingUsage ? (
                        <div style={{ textAlign: 'center', padding: '2rem' }}>Loading usage data...</div>
                    ) : (
                        <>
                            {/* Totals Summary */}
                            {usageTotals && (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                                    {[
                                        { label: 'Communities', value: usageTotals.communities },
                                        { label: 'Total Members', value: usageTotals.members },
                                        { label: 'Forum Posts', value: usageTotals.posts },
                                        { label: 'Events', value: usageTotals.events },
                                        { label: 'Listings', value: usageTotals.listings },
                                        { label: 'Messages', value: usageTotals.messages },
                                    ].map(stat => (
                                        <div key={stat.label} style={{
                                            padding: '1rem',
                                            borderRadius: '8px',
                                            background: '#fff',
                                            border: '1px solid #e5e7eb',
                                            textAlign: 'center',
                                        }}>
                                            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#4f46e5' }}>{stat.value}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{stat.label}</div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Per-Community Table */}
                            <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', overflow: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '2px solid #e5e7eb', background: '#f9fafb' }}>
                                            <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Community</th>
                                            <th style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>Plan</th>
                                            <th style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>Status</th>
                                            <th style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>Members</th>
                                            <th style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>Usage</th>
                                            <th style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>Posts</th>
                                            <th style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>Events</th>
                                            <th style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>Listings</th>
                                            <th style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>Messages</th>
                                            <th style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>Invites</th>
                                            <th style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>Trial Ends</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {usageStats.map(stat => (
                                            <tr key={stat.communityId} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                                <td style={{ padding: '0.75rem 1rem' }}>
                                                    <div style={{ fontWeight: 600 }}>{stat.communityName}</div>
                                                    <div style={{ fontSize: '0.75rem', color: '#9ca3af', fontFamily: 'monospace' }}>{stat.slug}</div>
                                                </td>
                                                <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                                                    <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '4px', background: '#eef2ff', color: '#4338ca', fontWeight: 600 }}>
                                                        {stat.plan.replace('_', ' ').toUpperCase()}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                                                    <span style={{
                                                        fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 600,
                                                        background: stat.planStatus === 'active' ? '#dcfce7' : stat.planStatus === 'trial' ? '#fef3c7' : '#fee2e2',
                                                        color: stat.planStatus === 'active' ? '#166534' : stat.planStatus === 'trial' ? '#92400e' : '#dc2626',
                                                    }}>
                                                        {stat.planStatus}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '0.5rem', textAlign: 'center', fontWeight: 500 }}>
                                                    {stat.memberCount}/{stat.maxHomes}
                                                </td>
                                                <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                                                        <div style={{ width: 50, height: 6, borderRadius: 3, background: '#e5e7eb', overflow: 'hidden' }}>
                                                            <div style={{
                                                                width: `${Math.min(100, stat.usagePercent)}%`,
                                                                height: '100%',
                                                                borderRadius: 3,
                                                                background: stat.usagePercent >= 90 ? '#ef4444' : stat.usagePercent >= 70 ? '#f59e0b' : '#4f46e5',
                                                            }} />
                                                        </div>
                                                        <span style={{ fontSize: '0.75rem', minWidth: '2.5rem' }}>{stat.usagePercent}%</span>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '0.5rem', textAlign: 'center' }}>{stat.postCount}</td>
                                                <td style={{ padding: '0.5rem', textAlign: 'center' }}>{stat.eventCount}</td>
                                                <td style={{ padding: '0.5rem', textAlign: 'center' }}>{stat.listingCount}</td>
                                                <td style={{ padding: '0.5rem', textAlign: 'center' }}>{stat.messageCount}</td>
                                                <td style={{ padding: '0.5rem', textAlign: 'center' }}>{stat.invitationCount}</td>
                                                <td style={{ padding: '0.5rem', textAlign: 'center', fontSize: '0.8rem' }}>
                                                    {stat.trialEndsAt ? new Date(stat.trialEndsAt).toLocaleDateString() : '—'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>
            )}

            {viewMode === 'tenants' && loading ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>Loading tenants...</div>
            ) : viewMode === 'tenants' && communities.length === 0 ? (
                <div className={styles.emptyState}>
                    <Database size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                    <p>No tenants found. Add a tenant to get started.</p>
                </div>
            ) : viewMode === 'tenants' ? (
                <div className={styles.grid}>
                    {communities.map(comm => (
                        <div key={comm.id} className={`${styles.card} ${!comm.isActive ? styles.cardInactive : ''}`}>
                            <div className={styles.cardHeader}>
                                <div className={styles.cardTitleSection}>
                                    <div className={styles.iconBox}>
                                        <Building size={24} />
                                    </div>
                                    <div>
                                        <h2 className={styles.cardTitle}>{comm.name}</h2>
                                        <div className={styles.cardMeta}>
                                            <span style={{ fontFamily: 'monospace' }}>{comm.id.substring(0, 8)}...</span>
                                            <span>•</span>
                                            <span>{comm.slug}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className={styles.actions}>
                                    <button
                                        onClick={() => handleExport(comm)}
                                        title="Export Data"
                                        className={styles.iconButton}
                                        aria-label={`Export data for ${comm.name}`}
                                    >
                                        <Download size={18} />
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSelectedCommunityId(comm.id);
                                            setInviteModalOpen(true);
                                        }}
                                        title="Invite Administrator"
                                        className={styles.iconButton}
                                        aria-label={`Invite admin to ${comm.name}`}
                                    >
                                        <UserPlus size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleToggleActive(comm.id)}
                                        title={comm.isActive ? "Disable Tenant" : "Enable Tenant"}
                                        className={`${styles.statusButton} ${comm.isActive ? styles.active : styles.inactive}`}
                                        aria-label={comm.isActive ? "Disable tenant" : "Enable tenant"}
                                    >
                                        {comm.isActive ? <Check size={12} /> : <PowerOff size={12} />}
                                        {comm.isActive ? 'Active' : 'Disabled'}
                                    </button>
                                </div>
                            </div>

                            {/* Branding Section */}
                            <div className={styles.section}>
                                <h3 className={styles.sectionTitle}>Branding</h3>
                                <div className={styles.brandingGrid}>
                                    <div>
                                        <label className={styles.label}>Primary Color</label>
                                        <div className={styles.colorInputWrapper}>
                                            <input
                                                type="color"
                                                value={comm.branding.primaryColor}
                                                onChange={(e) => updateBrandingPreview(comm.id, 'primaryColor', e.target.value)}
                                                className={styles.colorInput}
                                                aria-label="Primary color picker"
                                            />
                                            <span style={{ fontSize: '0.875rem', color: '#6b7280', fontFamily: 'monospace' }}>{comm.branding.primaryColor}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className={styles.label}>Secondary Color</label>
                                        <div className={styles.colorInputWrapper}>
                                            <input
                                                type="color"
                                                value={comm.branding.secondaryColor}
                                                onChange={(e) => updateBrandingPreview(comm.id, 'secondaryColor', e.target.value)}
                                                className={styles.colorInput}
                                                aria-label="Secondary color picker"
                                            />
                                            <span style={{ fontSize: '0.875rem', color: '#6b7280', fontFamily: 'monospace' }}>{comm.branding.secondaryColor}</span>
                                        </div>
                                    </div>
                                    {/* Logo URL */}
                                    <div style={{ gridColumn: 'span 2' }}>
                                        <label className={styles.label}>Logo URL</label>
                                        <input
                                            type="text"
                                            value={comm.branding.logoUrl}
                                            onChange={(e) => updateBrandingPreview(comm.id, 'logoUrl', e.target.value)}
                                            placeholder="https://..."
                                            className={styles.textInput}
                                            aria-label="Logo URL"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className={styles.section}>
                                <h3 className={styles.sectionTitle}>Module Configuration</h3>
                                <div className={styles.modulesFlex}>
                                    {Object.entries(comm.features).map(([key, enabled]) => (
                                        <label key={key} className={`${styles.moduleLabel} ${enabled ? styles.moduleEnabled : styles.moduleDisabled}`}>
                                            <input
                                                type="checkbox"
                                                checked={enabled}
                                                onChange={() => handleToggleFeature(comm.id, key as any)}
                                                className={styles.checkbox}
                                                aria-label={`Toggle ${key} module`}
                                            />
                                            <span className={`${styles.moduleText} ${enabled ? styles.moduleTextEnabled : styles.moduleTextDisabled}`}>{key}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className={styles.footer}>
                                <div className={styles.manageButtons}>
                                    <button
                                        onClick={async () => {
                                            localStorage.setItem('kithGrid_communityName', comm.name);
                                            localStorage.setItem('kithGrid_modules', JSON.stringify(comm.features));
                                            localStorage.setItem('kithGrid_customPrimary', comm.branding.primaryColor);
                                            localStorage.setItem('kithGrid_customSecondary', comm.branding.secondaryColor);
                                            localStorage.setItem('kithGrid_customAccent', comm.branding.accentColor);
                                            localStorage.setItem('kithGrid_communityLogo', comm.branding.logoUrl);

                                            const { data: { user } } = await supabase.auth.getUser();
                                            if (user) {
                                                await supabase.auth.updateUser({ data: { communityId: comm.id } });
                                            }

                                            alert(`Simulating login for ${comm.name}!`);
                                            window.location.href = '/dashboard';
                                        }}
                                        className={styles.simulateButton}
                                    >
                                        <Building size={16} />
                                        Simulate Login
                                    </button>
                                    <button
                                        onClick={() => handleDelete(comm.id)}
                                        className={styles.deleteButton}
                                    >
                                        <Trash2 size={16} />
                                        Delete
                                    </button>
                                </div>
                                <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                                    Current Plan: <strong style={{ color: '#111827' }}>{comm.plan.replace('_', ' ').toUpperCase()}</strong>
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : null}

            {showAddModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <h2 className={styles.modalTitle}>Add New Tenant</h2>
                        <input
                            placeholder="Community Name"
                            className={styles.modalInput}
                            value={newCommunity.name}
                            onChange={e => setNewCommunity({ ...newCommunity, name: e.target.value })}
                            aria-label="New Community Name"
                        />
                        <input
                            placeholder="Slug (e.g. oak-hills)"
                            className={styles.modalInput}
                            value={newCommunity.slug}
                            onChange={e => setNewCommunity({ ...newCommunity, slug: e.target.value })}
                            aria-label="New Community Slug"
                        />
                        <div className={styles.modalActions}>
                            <button onClick={() => setShowAddModal(false)} className={styles.cancelButton} disabled={isCreating}>Cancel</button>
                            <button onClick={handleAdd} className={styles.createButton} disabled={isCreating}>
                                {isCreating ? 'Creating...' : 'Create Tenant'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Invite Admin Modal */}
            {/* Invite Admin Modal */}
            {inviteModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <h2>Invite Initial Administrator</h2>
                            <button onClick={closeInviteModal} className={styles.closeButton}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className={styles.modalBody}>
                            {!generatedCode ? (
                                <>
                                    <p style={{ marginBottom: '1.5rem', color: '#4b5563', lineHeight: '1.5' }}>
                                        Enter the email address of the primary administrator for this community.
                                        They will receive an invite code with <strong style={{ color: '#4f46e5' }}>Admin</strong> privileges.
                                    </p>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Administrator Email</label>
                                        <input
                                            className={styles.input}
                                            value={inviteEmail}
                                            onChange={(e) => setInviteEmail(e.target.value)}
                                            placeholder="e.g. admin@maplegrove.hoa"
                                            autoFocus
                                        />
                                    </div>
                                </>
                            ) : (
                                <div className={styles.successCard}>
                                    <h3 className={styles.successTitle}>
                                        <Check size={20} />
                                        Invitation Generated
                                    </h3>
                                    <p style={{ color: '#166534', fontSize: '0.9rem', marginBottom: '1rem' }}>
                                        Share this code securely with the administrator.
                                    </p>

                                    <div
                                        className={styles.codeBlock}
                                        onClick={() => {
                                            if (generatedCode) {
                                                navigator.clipboard.writeText(generatedCode);
                                                alert("Copied to clipboard!");
                                            }
                                        }}
                                        title="Click to copy"
                                    >
                                        {generatedCode}
                                        <span className={styles.copyHint}>
                                            <Copy size={12} style={{ display: 'inline', marginRight: '4px' }} />
                                            Click to Copy
                                        </span>
                                    </div>

                                    <p style={{ fontSize: '0.875rem', color: '#4b5563', marginTop: '1.5rem' }}>
                                        They should use this code at <strong>/join</strong>
                                    </p>
                                </div>
                            )}
                        </div>
                        <div className={styles.modalFooter}>
                            {!generatedCode ? (
                                <>
                                    <button onClick={closeInviteModal} className={styles.secondaryButton}>Cancel</button>
                                    <button onClick={handleInviteAdmin} className={styles.primaryButton}>
                                        <UserPlus size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                                        Generate Invitation
                                    </button>
                                </>
                            ) : (
                                <button onClick={closeInviteModal} className={styles.primaryButton}>Done</button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
