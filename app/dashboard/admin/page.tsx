"use client";

import { useState, useEffect, useCallback } from "react";
import { useTheme, THEMES } from "@/contexts/ThemeContext";
import styles from "./admin.module.css";
import { Palette, Shield, Users, FileText, Trash2, CheckCircle, UserPlus, Mail, X, Edit2, Wrench, RefreshCw, Plus, Save } from "lucide-react";
import { createInvitation, getInvitations, deleteInvitation, bulkCreateInvitations, InvitationActionState } from "@/app/actions/invitations";
import { getCommunityById, updateCommunityHoaSettings, updateHoaExtendedSettings, updateCommunityBranding } from "@/app/actions/communities";
import { getNeighbors, deleteNeighbor, updateNeighbor } from "@/app/actions/neighbors";
import { getCommunityResources, createResource, deleteResource } from "@/app/actions/resources";
import { CreateResourceModal } from "@/components/dashboard/CreateResourceModal";
import { useUser } from "@/contexts/UserContext";
import { getUserRoles } from "@/utils/roleHelpers";
import { Upload, CreditCard } from "lucide-react";
import { checkMemberLimit, updateCommunityPlan, getCommunityTrialStatus } from "@/app/actions/billing";
import { PLANS, type PlanId } from "@/app/actions/billing-types";

type Tab = 'general' | 'users' | 'invites' | 'resources' | 'billing';

type Invitation = {
    id: string;
    code: string;
    email: string;
    status: 'pending' | 'used' | 'expired';
    createdAt?: Date;
};

interface NeighborUser {
    id: string;
    name: string;
    avatar: string;
    role: string;
    address: string;
    email: string;
    joinedDate?: Date;
    isHoaOfficer?: boolean;
    hoaPosition?: string;
    roles?: string[];
}

export default function AdminPage() {
    const { theme, setTheme, communityName, setCommunityName, communityLogo, setCommunityLogo, colorMode, setColorMode } = useTheme();
    const { user } = useUser();
    const [activeTab, setActiveTab] = useState<Tab>('general');
    const [communityId, setCommunityId] = useState<string>("");

    // HOA Settings State
    const [hoaDuesAmount, setHoaDuesAmount] = useState("");
    const [hoaDuesFrequency, setHoaDuesFrequency] = useState("Monthly");
    const [hoaDuesDate, setHoaDuesDate] = useState("1st");
    const [hoaContactEmail, setHoaContactEmail] = useState("");
    const [isSavingHoa, setIsSavingHoa] = useState(false);

    // HOA Extended Settings State
    const [amenities, setAmenities] = useState<any[]>([]);
    const [rules, setRules] = useState<any[]>([]);
    const [vendors, setVendors] = useState<any[]>([]);
    const [isSavingExtended, setIsSavingExtended] = useState(false);
    const [extendedDirty, setExtendedDirty] = useState(false);

    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Billing & Plan State
    const [currentPlan, setCurrentPlan] = useState<string>('starter_100');
    const [memberCount, setMemberCount] = useState(0);
    const [maxHomes, setMaxHomes] = useState(100);
    const [planStatus, setPlanStatus] = useState('trial');
    const [trialDaysRemaining, setTrialDaysRemaining] = useState<number | null>(null);
    const [isTrialExpired, setIsTrialExpired] = useState(false);
    const [isUpdatingPlan, setIsUpdatingPlan] = useState(false);

    // Fetch real Community ID and Settings
    useEffect(() => {
        const fetchCommunityDetails = async () => {
            try {
                // Ignore dummy/initial community ID
                if (user.communityId && user.communityId !== "00000000-0000-0000-0000-000000000000") {
                    console.log("[Admin] Using user.communityId:", user.communityId);
                    setCommunityId(user.communityId);

                    // Fetch community details by ID to load HOA settings
                    const res = await getCommunityById(user.communityId);
                    console.log("[Admin] getCommunityById response:", res);

                    if (res.success && res.data) {
                        const current = res.data;
                        console.log("[Admin] Current community:", current);
                        // Set HOA Settings locally
                        if (current.hoaSettings) {
                            console.log("[Admin] Loading HOA settings:", current.hoaSettings);
                            setHoaDuesAmount(current.hoaSettings.duesAmount || "");
                            setHoaDuesFrequency(current.hoaSettings.duesFrequency || "Monthly");
                            setHoaDuesDate(current.hoaSettings.duesDate || "1st");
                            setHoaContactEmail(current.hoaSettings.contactEmail || "");
                        }
                        // Load extended settings
                        if (current.hoaExtendedSettings) {
                            if (current.hoaExtendedSettings.amenities) setAmenities(current.hoaExtendedSettings.amenities);
                            if (current.hoaExtendedSettings.rules) setRules(current.hoaExtendedSettings.rules);
                            if (current.hoaExtendedSettings.vendors) setVendors(current.hoaExtendedSettings.vendors);
                        }
                        // Load billing info
                        if (current.billing) {
                            setMaxHomes(current.billing.maxHomes || 100);
                            setPlanStatus(current.billing.planStatus || 'trial');
                        }
                        setCurrentPlan(current.plan || 'starter_100');

                        // Fetch member limit and trial status
                        const limitRes = await checkMemberLimit(user.communityId);
                        if (limitRes) {
                            setMemberCount(limitRes.currentCount);
                            setMaxHomes(limitRes.maxHomes);
                        }
                        const trialRes = await getCommunityTrialStatus(user.communityId);
                        if (trialRes.success && trialRes.data) {
                            setTrialDaysRemaining(trialRes.data.daysRemaining);
                            setIsTrialExpired(trialRes.data.isTrialExpired);
                            setPlanStatus(trialRes.data.planStatus);
                        }
                    } else {
                        console.warn("[Admin] Failed to load community:", res.error);
                    }
                } else {
                    console.warn("[Admin] Waiting for valid communityId (current: " + user.communityId + ")");
                }
            } catch (error) {
                console.error("Failed to fetch community details", error);
            }
        };
        fetchCommunityDetails();
    }, [user.communityId, refreshTrigger]);

    const refreshHoaSettings = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    const handleSaveHoaSettings = async () => {
        console.log("[Admin] Attempting to save HOA settings. CommunityId:", communityId);

        if (!communityId) {
            alert("Error: No community ID found. Please refresh the page and try again.");
            console.error("[Admin] Cannot save: communityId is empty");
            return;
        }

        setIsSavingHoa(true);
        console.log("[Admin] Saving HOA settings:", {
            duesAmount: hoaDuesAmount,
            duesFrequency: hoaDuesFrequency,
            duesDate: hoaDuesDate,
            contactEmail: hoaContactEmail
        });

        const res = await updateCommunityHoaSettings(communityId, {
            duesAmount: hoaDuesAmount,
            duesFrequency: hoaDuesFrequency,
            duesDate: hoaDuesDate,
            contactEmail: hoaContactEmail
        });

        console.log("[Admin] Save HOA settings response:", res);
        setIsSavingHoa(false);

        if (res.success) {
            alert("HOA settings saved successfully!");
            refreshHoaSettings();
        } else {
            alert("Failed to save: " + res.error);
        }
    };



    const handleSaveExtendedSettings = async () => {
        if (!communityId) return;
        setIsSavingExtended(true);
        const res = await updateHoaExtendedSettings(communityId, { amenities, rules, vendors });
        setIsSavingExtended(false);
        if (res.success) {
            setExtendedDirty(false);
            alert("Community content saved!");
        } else {
            alert("Failed to save: " + res.error);
        }
    };

    // Amenity helpers
    const addAmenity = () => {
        setAmenities([...amenities, { icon: "🏠", name: "", hours: "", note: "" }]);
        setExtendedDirty(true);
    };
    const updateAmenity = (idx: number, field: string, value: string) => {
        const updated = [...amenities];
        updated[idx] = { ...updated[idx], [field]: value };
        setAmenities(updated);
        setExtendedDirty(true);
    };
    const removeAmenity = (idx: number) => {
        setAmenities(amenities.filter((_, i) => i !== idx));
        setExtendedDirty(true);
    };

    // Rule helpers
    const addRuleCategory = () => {
        setRules([...rules, { category: "", icon: "📋", items: [""] }]);
        setExtendedDirty(true);
    };
    const updateRuleCategory = (idx: number, field: string, value: string) => {
        const updated = [...rules];
        updated[idx] = { ...updated[idx], [field]: value };
        setRules(updated);
        setExtendedDirty(true);
    };
    const addRuleItem = (catIdx: number) => {
        const updated = [...rules];
        updated[catIdx] = { ...updated[catIdx], items: [...updated[catIdx].items, ""] };
        setRules(updated);
        setExtendedDirty(true);
    };
    const updateRuleItem = (catIdx: number, itemIdx: number, value: string) => {
        const updated = [...rules];
        const items = [...updated[catIdx].items];
        items[itemIdx] = value;
        updated[catIdx] = { ...updated[catIdx], items };
        setRules(updated);
        setExtendedDirty(true);
    };
    const removeRuleItem = (catIdx: number, itemIdx: number) => {
        const updated = [...rules];
        updated[catIdx] = { ...updated[catIdx], items: updated[catIdx].items.filter((_: any, i: number) => i !== itemIdx) };
        setRules(updated);
        setExtendedDirty(true);
    };
    const removeRuleCategory = (idx: number) => {
        setRules(rules.filter((_, i) => i !== idx));
        setExtendedDirty(true);
    };

    // Vendor helpers
    const addVendor = () => {
        setVendors([...vendors, { type: "", icon: "🔧", company: "", services: "", contact: "" }]);
        setExtendedDirty(true);
    };
    const updateVendor = (idx: number, field: string, value: string) => {
        const updated = [...vendors];
        updated[idx] = { ...updated[idx], [field]: value };
        setVendors(updated);
        setExtendedDirty(true);
    };
    const removeVendor = (idx: number) => {
        setVendors(vendors.filter((_, i) => i !== idx));
        setExtendedDirty(true);
    };

    // CSV Import
    const [csvFile, setCsvFile] = useState<File | null>(null);
    const [isImporting, setIsImporting] = useState(false);
    const [bulkImportResults, setBulkImportResults] = useState<{ email: string; code: string }[]>([]);





    const handleDownloadTemplate = () => {
        const csvContent = "Email,First Name,Last Name\nresident@example.com,John,Doe\nanother@example.com,Jane,Smith";
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "resident_import_template.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleCsvUpload = async () => {
        if (!csvFile || !communityId || !user.id) return;
        const currentUserId = user.id;
        setIsImporting(true);
        const reader = new FileReader();
        reader.onload = async (e) => {
            const text = e.target?.result as string;
            const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
            const parsedData: { email: string; name?: string }[] = [];

            // Skip header if present
            const startIndex = lines[0].toLowerCase().startsWith('email') ? 1 : 0;

            for (let i = startIndex; i < lines.length; i++) {
                const parts = lines[i].split(',').map(p => p.trim());
                if (parts.length > 0 && parts[0].includes('@')) {
                    const email = parts[0];
                    let name = undefined;
                    if (parts.length >= 2) {
                        const firstName = parts[1];
                        const lastName = parts[2] || '';
                        name = `${firstName} ${lastName}`.trim();
                    }
                    parsedData.push({ email, name: name || undefined });
                }
            }

            if (parsedData.length === 0) {
                alert("No valid emails found.");
                setIsImporting(false);
                return;
            }

            const res = await bulkCreateInvitations({
                communityId,
                invitations: parsedData,
                createdBy: currentUserId
            });

            if (res.success && res.data) {
                setBulkImportResults(res.data as any);
                alert(`Imported ${res.data.length} invitations.`);
                loadInvites();
                setCsvFile(null);
            } else {
                alert("Import failed: " + res.error);
            }
            setIsImporting(false);
        };
        reader.readAsText(csvFile);
    };

    // User Management State
    const [users, setUsers] = useState<NeighborUser[]>([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);
    const [userSearchTerm, setUserSearchTerm] = useState("");

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        (u.email && u.email.toLowerCase().includes(userSearchTerm.toLowerCase())) ||
        (u.address && u.address.toLowerCase().includes(userSearchTerm.toLowerCase()))
    );

    // User Editing State
    const [editingUser, setEditingUser] = useState<NeighborUser | null>(null);
    const [isUpdatingUser, setIsUpdatingUser] = useState(false);
    const [isHoaOfficer, setIsHoaOfficer] = useState(false);
    const [hoaPosition, setHoaPosition] = useState("");

    // Effect to initialize HOA fields when editingUser is set
    useEffect(() => {
        if (editingUser) {
            const isBoard = editingUser.role === 'Board Member';
            setIsHoaOfficer(isBoard);
            // Assuming editingUser might have hoaPosition in the future, currently not in interface but will be added
            // setHoaPosition(editingUser.hoaPosition || ""); 
        }
    }, [editingUser]);

    // Invite System State
    const [invites, setInvites] = useState<Invitation[]>([]);
    const [newInviteEmail, setNewInviteEmail] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [isLoadingInvites, setIsLoadingInvites] = useState(false);
    const [inviteFilter, setInviteFilter] = useState<'pending' | 'used' | 'expired'>('pending');
    const [inviteSearchTerm, setInviteSearchTerm] = useState("");

    const filteredInvites = invites.filter(i =>
        i.status === inviteFilter &&
        i.email.toLowerCase().includes(inviteSearchTerm.toLowerCase())
    );



    const loadUsers = useCallback(async () => {
        if (!communityId) return;
        setIsLoadingUsers(true);
        try {
            const result = await getNeighbors(communityId);
            if (result.success && result.data) {
                // Cast logic to match defined interface if data from server is loose
                setUsers(result.data as unknown as NeighborUser[]);
            }
        } catch (error) {
            console.error("Failed to load users", error);
        } finally {
            setIsLoadingUsers(false);
        }
    }, [communityId]);

    const loadInvites = useCallback(async () => {
        if (!communityId) return;
        setIsLoadingInvites(true);
        try {
            const result = await getInvitations(communityId);
            if (result.success && result.data) {
                setInvites(result.data as unknown as Invitation[]);
            } else {
                console.error("Failed to load invitations:", result.error);
            }
        } catch (error) {
            console.error("Error loading invitations:", error);
        } finally {
            setIsLoadingInvites(false);
        }
    }, [communityId]);

    // Load invitations when switching to the invites tab
    useEffect(() => {
        if (activeTab === 'invites' && communityId) {
            loadInvites();
        }
    }, [activeTab, communityId, loadInvites]);

    // Load users when switching to the users tab
    useEffect(() => {
        if (activeTab === 'users' && communityId) {
            loadUsers();
        }
    }, [activeTab, communityId, loadUsers]);

    const handleDeleteUser = async (userId: string, userName: string) => {
        if (!confirm(`Are you sure you want to remove ${userName}? This action cannot be undone.`)) {
            return;
        }

        try {
            const result = await deleteNeighbor(userId);
            if (result.success) {
                alert("User removed successfully.");
                loadUsers(); // Refresh list
            } else {
                alert(`Failed to remove user: ${result.error}`);
            }
        } catch (error) {
            console.error("Error removing user:", error);
            alert("Unexpected error removing user.");
        }
    };

    const handleUpdateUser = async () => {
        if (!editingUser) return;
        setIsUpdatingUser(true);

        try {
            const result = await updateNeighbor(editingUser.id, {
                name: editingUser.name,
                roles: editingUser.roles || (editingUser.role ? [editingUser.role] : ['Resident']),
                address: editingUser.address,
                hoaPosition: editingUser.isHoaOfficer ? editingUser.hoaPosition : null
            });

            if (result.success) {
                setEditingUser(null); // Close modal
                loadUsers(); // Refresh list
            } else {
                alert(`Failed to update user: ${result.error}`);
            }
        } catch (error) {
            console.error("Error updating user:", error);
            alert("Unexpected error updating user.");
        } finally {
            setIsUpdatingUser(false);
        }
    };

    const [showModal, setShowModal] = useState(false);
    const [modalData, setModalData] = useState<{ code: string, email: string, message: string }>({ code: '', email: '', message: '' });

    const generateInvite = async () => {
        if (!newInviteEmail) {
            alert("Please enter an email address");
            return;
        }

        if (!communityId) {
            alert("No community found. Please refresh or create a community first.");
            return;
        }

        setIsGenerating(true);
        try {
            const result = await createInvitation({
                communityId: communityId,
                email: newInviteEmail,
                createdBy: user.id
            });

            if (result.success && result.data) {
                const appUrl = window.location.origin;
                const message = `Hi! I've invited you to join our neighborhood portal.\n\n1. Go to: ${appUrl}/join\n2. Enter code: ${result.data.code}\n\nThis code expires in 7 days.`;

                setModalData({
                    code: result.data.code,
                    email: newInviteEmail,
                    message: message
                });
                setShowModal(true);

                setNewInviteEmail("");
                await loadInvites(); // Reload the list
            } else {
                alert(`Failed to generate invitation: ${result.error}`);
            }
        } catch (error) {
            console.error("Error generating invitation:", error);
            alert("Unexpected error generating invitation");
        } finally {
            setIsGenerating(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(modalData.message).then(() => {
            alert("Message copied to clipboard!");
            setShowModal(false);
        });
    };

    const handleDeleteInvite = async (id: string) => {
        if (!confirm("Are you sure you want to delete this invitation?")) {
            return;
        }

        try {
            const result = await deleteInvitation(id);
            if (result.success) {
                await loadInvites();
            } else {
                alert(`Failed to delete invitation: ${result.error}`);
            }
        } catch (error) {
            console.error("Error deleting invitation:", error);
            alert("Unexpected error deleting invitation");
        }
    };


    // Resources State
    const [resources, setResources] = useState<any[]>([]);
    const [isLoadingResources, setIsLoadingResources] = useState(false);
    const [isCreateResourceModalOpen, setIsCreateResourceModalOpen] = useState(false);
    const [isCreatingResource, setIsCreatingResource] = useState(false);

    const loadResources = useCallback(async () => {
        if (!communityId) return;
        setIsLoadingResources(true);
        try {
            const res = await getCommunityResources(communityId);
            if (res.success && res.data) {
                setResources(res.data);
            }
        } catch (error) {
            console.error("Failed to load resources", error);
        } finally {
            setIsLoadingResources(false);
        }
    }, [communityId]);

    // Load resources when switching to the resources tab
    useEffect(() => {
        if (activeTab === 'resources' && communityId) {
            loadResources();
        }
    }, [activeTab, communityId, loadResources]);

    const handleCreateResource = async (data: any) => {
        if (!communityId) {
            alert("Error: Community ID not found. Please refresh the page.");
            return;
        }

        setIsCreatingResource(true);
        const res = await createResource({
            communityId: communityId,
            name: data.name,
            type: data.type,
            capacity: parseInt(data.capacity) || 0,
            description: data.description,
            isReservable: true
        });
        setIsCreatingResource(false);

        if (res.success) {
            loadResources();
            setIsCreateResourceModalOpen(false);
        } else {
            alert("Failed to create resource: " + res.error);
        }
    };

    const handleDeleteResource = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete ${name}?`)) {
            return;
        }
        const res = await deleteResource(id);
        if (res.success) {
            loadResources();
        } else {
            alert("Failed to delete resource: " + res.error);
        }
    };

    // Tabs Navigation
    const renderTabs = () => (
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border)' }}>
            <button
                onClick={() => setActiveTab('general')}
                style={{
                    padding: '0.75rem 1rem',
                    borderBottom: activeTab === 'general' ? '2px solid var(--primary)' : 'none',
                    fontWeight: activeTab === 'general' ? 600 : 400,
                    color: activeTab === 'general' ? 'var(--foreground)' : 'var(--muted-foreground)'
                }}
            >
                Configuration
            </button>
            <button
                onClick={() => setActiveTab('users')}
                style={{
                    padding: '0.75rem 1rem',
                    borderBottom: activeTab === 'users' ? '2px solid var(--primary)' : 'none',
                    fontWeight: activeTab === 'users' ? 600 : 400,
                    color: activeTab === 'users' ? 'var(--foreground)' : 'var(--muted-foreground)'
                }}
            >
                User Management
            </button>
            <button
                onClick={() => setActiveTab('invites')}
                style={{
                    padding: '0.75rem 1rem',
                    borderBottom: activeTab === 'invites' ? '2px solid var(--primary)' : 'none',
                    fontWeight: activeTab === 'invites' ? 600 : 400,
                    color: activeTab === 'invites' ? 'var(--foreground)' : 'var(--muted-foreground)'
                }}
            >
                Invitations
            </button>
            <button
                onClick={() => setActiveTab('resources')}
                style={{
                    padding: '0.75rem 1rem',
                    borderBottom: activeTab === 'resources' ? '2px solid var(--primary)' : 'none',
                    fontWeight: activeTab === 'resources' ? 600 : 400,
                    color: activeTab === 'resources' ? 'var(--foreground)' : 'var(--muted-foreground)'
                }}
            >
                Resources
            </button>
            <button
                onClick={() => setActiveTab('billing')}
                style={{
                    padding: '0.75rem 1rem',
                    borderBottom: activeTab === 'billing' ? '2px solid var(--primary)' : 'none',
                    fontWeight: activeTab === 'billing' ? 600 : 400,
                    color: activeTab === 'billing' ? 'var(--foreground)' : 'var(--muted-foreground)'
                }}
            >
                Plan & Billing
            </button>
        </div>
    );

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Admin Console</h1>
                <p className={styles.subtitle}>Manage community settings, global configuration, and moderation.</p>
            </div>

            <div className={styles.grid} style={{ marginBottom: '2rem' }}>
                <div className={styles.statCard}>
                    <span className={styles.statValue}>{users.length}</span>
                    <span className={styles.statLabel}>Active Households</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statValue}>{invites.filter(i => i.status === 'pending').length}</span>
                    <span className={styles.statLabel}>Pending Invites</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statValue}>12</span>
                    <span className={styles.statLabel}>Open Maintenance Requests</span>
                </div>
            </div>

            {renderTabs()}

            {activeTab === 'general' && (
                <div className={styles.grid}>
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <Palette size={20} className="text-primary" />
                            <span className={styles.cardTitle}>Branding & Appearance</span>
                        </div>
                        <div className={styles.cardContent}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Community Name</label>
                                <input
                                    className={styles.input}
                                    value={communityName}
                                    onChange={(e) => setCommunityName(e.target.value)}
                                    placeholder="e.g. KithGrid Community"
                                    aria-label="Community Name"
                                />
                                <div style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', marginTop: '0.5rem' }}>
                                    This name appears on the sidebar and browser tab.
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Community Logo</label>
                                {communityLogo && (
                                    <div style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <img src={communityLogo} alt="Logo preview" style={{ maxHeight: 48, maxWidth: 120, objectFit: 'contain', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }} />
                                        <button onClick={() => setCommunityLogo('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '0.8rem' }}>Remove</button>
                                    </div>
                                )}
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <input
                                        className={styles.input}
                                        value={communityLogo}
                                        onChange={(e) => setCommunityLogo(e.target.value)}
                                        placeholder="https://example.com/logo.png"
                                        aria-label="Community Logo URL"
                                        style={{ flex: 1 }}
                                    />
                                    <label style={{
                                        display: 'flex', alignItems: 'center', gap: '0.3rem',
                                        padding: '0.5rem 0.75rem', borderRadius: 'var(--radius)',
                                        border: '1px solid var(--border)', cursor: 'pointer',
                                        fontSize: '0.85rem', whiteSpace: 'nowrap'
                                    }}>
                                        <Upload size={14} />
                                        Upload
                                        <input
                                            type="file"
                                            accept="image/*"
                                            style={{ display: 'none' }}
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (!file) return;
                                                if (file.size > 500 * 1024) {
                                                    alert("Logo must be under 500KB");
                                                    return;
                                                }
                                                const reader = new FileReader();
                                                reader.onload = (ev) => {
                                                    if (ev.target?.result) setCommunityLogo(ev.target.result as string);
                                                };
                                                reader.readAsDataURL(file);
                                            }}
                                        />
                                    </label>
                                </div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', marginTop: '0.5rem' }}>
                                    Upload an image or paste a URL. PNG with transparent background recommended. Max 500KB.
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Color Theme</label>
                                <div className={styles.themeGrid}>
                                    {THEMES.map((t) => (
                                        <button
                                            key={t.name}
                                            onClick={() => setTheme(t)}
                                            className={styles.themeBtn}
                                            style={{
                                                borderColor: theme.name === t.name ? 'var(--primary)' : 'var(--border)',
                                                backgroundColor: theme.name === t.name ? 'var(--accent)' : 'var(--background)'
                                            }}
                                        >
                                            <div className={styles.themeColor} style={{ backgroundColor: t.primary }}></div>
                                            <span className={styles.themeName}>{t.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Interface Mode</label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    {[
                                        { id: 'light', label: 'Light' },
                                        { id: 'dark', label: 'Dark' },
                                        { id: 'system', label: 'System' }
                                    ].map((mode) => (
                                        <button
                                            key={mode.id}
                                            onClick={() => setColorMode(mode.id as any)}
                                            style={{
                                                flex: 1,
                                                padding: '0.6rem',
                                                borderRadius: 'var(--radius)',
                                                border: '1px solid var(--border)',
                                                backgroundColor: colorMode === mode.id ? 'var(--primary)' : 'var(--card)',
                                                color: colorMode === mode.id ? 'var(--primary-foreground)' : 'var(--foreground)',
                                                fontWeight: 500,
                                                cursor: 'pointer',
                                                fontSize: '0.9rem'
                                            }}
                                        >
                                            {mode.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={async () => {
                                    if (!communityId) { alert("No community ID found."); return; }
                                    const res = await updateCommunityBranding(communityId, {
                                        primaryColor: localStorage.getItem('kithGrid_customPrimary') || theme.primary,
                                        secondaryColor: localStorage.getItem('kithGrid_customSecondary') || '#1e1b4b',
                                        accentColor: localStorage.getItem('kithGrid_customAccent') || '#f59e0b',
                                        logoUrl: communityLogo || ''
                                    });
                                    if (res.success) {
                                        alert("Branding saved to database!");
                                    } else {
                                        alert("Failed to save branding: " + res.error);
                                    }
                                }}
                                style={{
                                    padding: '0.75rem',
                                    borderRadius: 'var(--radius)',
                                    background: 'var(--primary)',
                                    color: 'white',
                                    border: 'none',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    marginTop: '1rem',
                                    width: '100%'
                                }}
                            >
                                Save Branding
                            </button>
                        </div>
                    </div>



                    <div className={styles.card}>
                        <div className={styles.cardHeader} style={{ justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <FileText size={20} />
                                <span className={styles.cardTitle}>HOA Settings</span>
                            </div>
                            <button
                                onClick={refreshHoaSettings}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: '4px',
                                    color: 'var(--muted-foreground)',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                                title="Refresh Settings"
                            >
                                <RefreshCw size={16} />
                            </button>
                        </div>
                        <div className={styles.cardContent}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Dues Amount ($)</label>
                                <input
                                    type="number"
                                    className={styles.input}
                                    value={hoaDuesAmount}
                                    onChange={(e) => setHoaDuesAmount(e.target.value)}
                                    placeholder="e.g. 150.00"
                                    aria-label="Dues Amount"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Payment Frequency</label>
                                <select
                                    className={styles.input}
                                    value={hoaDuesFrequency}
                                    onChange={(e) => setHoaDuesFrequency(e.target.value)}
                                    aria-label="Payment Frequency"
                                >
                                    <option value="Monthly">Monthly</option>
                                    <option value="Quarterly">Quarterly</option>
                                    <option value="Annually">Annually</option>
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Due Date (e.g. "1st")</label>
                                <input
                                    className={styles.input}
                                    value={hoaDuesDate}
                                    onChange={(e) => setHoaDuesDate(e.target.value)}
                                    placeholder="e.g. 1st of month"
                                    aria-label="Due Date"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Board Contact Email</label>
                                <input
                                    type="email"
                                    className={styles.input}
                                    value={hoaContactEmail}
                                    onChange={(e) => setHoaContactEmail(e.target.value)}
                                    placeholder="board@example.com"
                                    aria-label="Board Contact Email"
                                />
                            </div>
                            <button
                                onClick={handleSaveHoaSettings}
                                disabled={isSavingHoa}
                                style={{
                                    padding: '0.75rem',
                                    borderRadius: 'var(--radius)',
                                    background: 'var(--primary)',
                                    color: 'white',
                                    border: 'none',
                                    fontWeight: 600,
                                    cursor: isSavingHoa ? 'not-allowed' : 'pointer',
                                    marginTop: '1rem',
                                    width: '100%'
                                }}
                            >
                                {isSavingHoa ? 'Saving...' : 'Save HOA Settings'}
                            </button>
                        </div>
                    </div>

                    {/* HOA Extended Settings: Amenities, Rules, Vendors */}
                    <div className={styles.card}>
                        <div className={styles.cardHeader} style={{ justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Wrench size={20} />
                                <span className={styles.cardTitle}>Community Content</span>
                            </div>
                            <button
                                onClick={handleSaveExtendedSettings}
                                disabled={isSavingExtended || !extendedDirty}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                                    padding: '0.5rem 1rem', borderRadius: 'var(--radius)',
                                    background: extendedDirty ? 'var(--primary)' : 'var(--muted)',
                                    color: extendedDirty ? 'white' : 'var(--muted-foreground)',
                                    border: 'none', fontWeight: 600, cursor: extendedDirty ? 'pointer' : 'default',
                                    fontSize: '0.85rem'
                                }}
                            >
                                <Save size={14} />
                                {isSavingExtended ? 'Saving...' : 'Save Content'}
                            </button>
                        </div>
                        <div className={styles.cardContent}>
                            <p style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)', marginBottom: '1rem' }}>
                                Customize amenities, rules, and service providers shown on your HOA page. Leave empty to use defaults.
                            </p>

                            {/* Amenities Editor */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                    <h4 style={{ fontWeight: 600, fontSize: '0.95rem' }}>Amenities</h4>
                                    <button onClick={addAmenity} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'none', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.3rem 0.6rem', cursor: 'pointer', fontSize: '0.8rem' }}>
                                        <Plus size={14} /> Add
                                    </button>
                                </div>
                                {amenities.map((a, idx) => (
                                    <div key={idx} style={{ display: 'grid', gridTemplateColumns: '3rem 1fr 1fr auto', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                                        <input className={styles.input} value={a.icon} onChange={(e) => updateAmenity(idx, 'icon', e.target.value)} placeholder="Icon" style={{ textAlign: 'center' }} />
                                        <input className={styles.input} value={a.name} onChange={(e) => updateAmenity(idx, 'name', e.target.value)} placeholder="Name" />
                                        <input className={styles.input} value={a.hours || ''} onChange={(e) => updateAmenity(idx, 'hours', e.target.value)} placeholder="Hours" />
                                        <button onClick={() => removeAmenity(idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={16} /></button>
                                    </div>
                                ))}
                                {amenities.length === 0 && <p style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', fontStyle: 'italic' }}>Using default amenities. Add items to customize.</p>}
                            </div>

                            {/* Rules Editor */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                    <h4 style={{ fontWeight: 600, fontSize: '0.95rem' }}>Rules & Guidelines</h4>
                                    <button onClick={addRuleCategory} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'none', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.3rem 0.6rem', cursor: 'pointer', fontSize: '0.8rem' }}>
                                        <Plus size={14} /> Add Category
                                    </button>
                                </div>
                                {rules.map((cat, catIdx) => (
                                    <div key={catIdx} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.75rem', marginBottom: '0.75rem' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                                            <input className={styles.input} value={cat.icon} onChange={(e) => updateRuleCategory(catIdx, 'icon', e.target.value)} placeholder="Icon" style={{ width: '3rem', textAlign: 'center' }} />
                                            <input className={styles.input} value={cat.category} onChange={(e) => updateRuleCategory(catIdx, 'category', e.target.value)} placeholder="Category name" style={{ flex: 1 }} />
                                            <button onClick={() => removeRuleCategory(catIdx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={16} /></button>
                                        </div>
                                        {cat.items.map((item: string, itemIdx: number) => (
                                            <div key={itemIdx} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.35rem', paddingLeft: '0.5rem' }}>
                                                <input className={styles.input} value={item} onChange={(e) => updateRuleItem(catIdx, itemIdx, e.target.value)} placeholder="Rule item" style={{ flex: 1 }} />
                                                <button onClick={() => removeRuleItem(catIdx, itemIdx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={14} /></button>
                                            </div>
                                        ))}
                                        <button onClick={() => addRuleItem(catIdx)} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--primary)', paddingLeft: '0.5rem', marginTop: '0.25rem' }}>
                                            <Plus size={12} /> Add rule
                                        </button>
                                    </div>
                                ))}
                                {rules.length === 0 && <p style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', fontStyle: 'italic' }}>Using default rules. Add categories to customize.</p>}
                            </div>

                            {/* Vendors Editor */}
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                    <h4 style={{ fontWeight: 600, fontSize: '0.95rem' }}>Service Providers</h4>
                                    <button onClick={addVendor} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'none', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.3rem 0.6rem', cursor: 'pointer', fontSize: '0.8rem' }}>
                                        <Plus size={14} /> Add
                                    </button>
                                </div>
                                {vendors.map((v, idx) => (
                                    <div key={idx} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.75rem', marginBottom: '0.5rem' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '3rem 1fr 1fr auto', gap: '0.5rem', marginBottom: '0.35rem', alignItems: 'center' }}>
                                            <input className={styles.input} value={v.icon} onChange={(e) => updateVendor(idx, 'icon', e.target.value)} placeholder="Icon" style={{ textAlign: 'center' }} />
                                            <input className={styles.input} value={v.type} onChange={(e) => updateVendor(idx, 'type', e.target.value)} placeholder="Service type" />
                                            <input className={styles.input} value={v.company} onChange={(e) => updateVendor(idx, 'company', e.target.value)} placeholder="Company name" />
                                            <button onClick={() => removeVendor(idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={16} /></button>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                            <input className={styles.input} value={v.services || ''} onChange={(e) => updateVendor(idx, 'services', e.target.value)} placeholder="Services provided" />
                                            <input className={styles.input} value={v.contact || ''} onChange={(e) => updateVendor(idx, 'contact', e.target.value)} placeholder="Contact info" />
                                        </div>
                                    </div>
                                ))}
                                {vendors.length === 0 && <p style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', fontStyle: 'italic' }}>Using default vendors. Add providers to customize.</p>}
                            </div>
                        </div>
                    </div>

                </div>
            )
            }

            {
                activeTab === 'users' && (
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <Users size={20} />
                            <span className={styles.cardTitle}>Manage Residents</span>
                        </div>
                        <div className={styles.cardContent}>
                            {/* Search Input */}
                            <div style={{ marginBottom: '1rem' }}>
                                <input
                                    className={styles.input}
                                    placeholder="Search by name, email, or address..."
                                    value={userSearchTerm}
                                    onChange={(e) => setUserSearchTerm(e.target.value)}
                                    aria-label="Search residents"
                                />
                            </div>

                            {isLoadingUsers ? (
                                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>Loading residents...</div>
                            ) : (
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                                            <th style={{ padding: '0.5rem' }}>Name</th>
                                            <th style={{ padding: '0.5rem' }}>Role</th>
                                            <th style={{ padding: '0.5rem' }}>Address</th>
                                            <th style={{ padding: '0.5rem' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredUsers.map((user) => (
                                            <tr key={user.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                                <td style={{ padding: '0.75rem 0.5rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>{user.avatar}</div>
                                                        {user.name}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '0.5rem' }}>
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                                                        {getUserRoles(user).map((role, idx) => (
                                                            <span key={idx} style={{
                                                                padding: '0.25rem 0.5rem',
                                                                borderRadius: '1rem',
                                                                fontSize: '0.75rem',
                                                                background: role === 'Admin' ? 'var(--primary)' : (role === 'Board Member' ? 'var(--accent)' : 'var(--muted)'),
                                                                color: role === 'Admin' ? 'white' : (role === 'Board Member' ? 'var(--primary)' : 'var(--foreground)')
                                                            }}>
                                                                {role}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '0.5rem' }}>{user.address}</td>
                                                <td style={{ padding: '0.5rem' }}>
                                                    <button
                                                        onClick={() => setEditingUser(user)}
                                                        style={{ fontSize: '0.8rem', color: 'var(--primary)', marginRight: '1rem', background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                                    >
                                                        <Edit2 size={12} /> Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteUser(user.id, user.name)}
                                                        style={{ fontSize: '0.8rem', color: 'red', background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                                    >
                                                        <Trash2 size={12} /> Remove
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                )
            }

            {
                activeTab === 'invites' && (
                    <div className={styles.grid}>
                        <div className={styles.card}>
                            <div className={styles.cardHeader}>
                                <UserPlus size={20} />
                                <span className={styles.cardTitle}>Generate New Invite</span>
                            </div>
                            <div className={styles.cardContent}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Recipient Email</label>
                                    <input
                                        className={styles.input}
                                        placeholder="neighbor@example.com"
                                        value={newInviteEmail}
                                        onChange={(e) => setNewInviteEmail(e.target.value)}
                                        aria-label="Recipient Email"
                                    />
                                </div>
                                <button
                                    onClick={generateInvite}
                                    disabled={isGenerating}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        borderRadius: 'var(--radius)',
                                        background: isGenerating ? 'var(--muted)' : 'var(--primary)',
                                        color: 'white',
                                        border: 'none',
                                        fontWeight: 600,
                                        cursor: isGenerating ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    {isGenerating ? 'Generating...' : 'Generate Code'}
                                </button>
                            </div>
                        </div>



                        <div className={styles.card}>
                            <div className={styles.cardHeader}>
                                <Upload size={20} />
                                <span className={styles.cardTitle}>Bulk Import Residents</span>
                            </div>
                            <div className={styles.cardContent}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="csv-upload" className={styles.label}>Upload CSV</label>
                                    <input
                                        id="csv-upload"
                                        type="file"
                                        accept=".csv"
                                        onChange={(e) => setCsvFile(e.target.files ? e.target.files[0] : null)}
                                        style={{ display: 'block', marginTop: '0.5rem' }}
                                    />
                                    <div style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span>CSV Format: Email, First Name, Last Name. One per line.</span>
                                        <button
                                            onClick={handleDownloadTemplate}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                color: 'var(--primary)',
                                                textDecoration: 'underline',
                                                cursor: 'pointer',
                                                fontSize: '0.8rem',
                                                padding: 0
                                            }}
                                        >
                                            Download Template
                                        </button>
                                    </div>
                                </div>
                                <button
                                    onClick={handleCsvUpload}
                                    disabled={!csvFile || isImporting}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        borderRadius: 'var(--radius)',
                                        background: isImporting ? 'var(--muted)' : 'var(--secondary)',
                                        color: 'white',
                                        border: 'none',
                                        fontWeight: 600,
                                        cursor: isImporting ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    {isImporting ? 'Importing...' : 'Import & Generate Codes'}
                                </button>

                                {bulkImportResults.length > 0 && (
                                    <div style={{ marginTop: '1.5rem', background: 'var(--muted)', padding: '1rem', borderRadius: 'var(--radius)', maxHeight: '200px', overflowY: 'auto' }}>
                                        <h4 style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>Generated Codes ({bulkImportResults.length})</h4>
                                        <table style={{ width: '100%', fontSize: '0.85rem' }}>
                                            <thead>
                                                <tr style={{ textAlign: 'left' }}><th>Email</th><th>Code</th></tr>
                                            </thead>
                                            <tbody>
                                                {bulkImportResults.map((r, i) => (
                                                    <tr key={i}>
                                                        <td>{r.email}</td>
                                                        <td style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{r.code}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>



                        <div className={styles.card}>
                            <div className={styles.cardHeader}>
                                <Mail size={20} />
                                <span className={styles.cardTitle}>Invitations</span>
                            </div>
                            <div className={styles.cardContent}>
                                <div className={styles.filterContainer}>
                                    <button
                                        onClick={() => setInviteFilter('pending')}
                                        className={`${styles.filterButton} ${inviteFilter === 'pending' ? styles.filterButtonActive : ''}`}
                                    >
                                        Pending
                                    </button>
                                    <button
                                        onClick={() => setInviteFilter('used')}
                                        className={`${styles.filterButton} ${inviteFilter === 'used' ? styles.filterButtonActive : ''}`}
                                    >
                                        Accepted
                                    </button>
                                    <button
                                        onClick={() => setInviteFilter('expired')}
                                        className={`${styles.filterButton} ${inviteFilter === 'expired' ? styles.filterButtonActive : ''}`}
                                    >
                                        Expired
                                    </button>
                                </div>

                                {/* Search Input */}
                                <div style={{ marginBottom: '1rem' }}>
                                    <input
                                        className={styles.input}
                                        placeholder="Search by email..."
                                        value={inviteSearchTerm}
                                        onChange={(e) => setInviteSearchTerm(e.target.value)}
                                        aria-label="Search invitations"
                                    />
                                </div>

                                {isLoadingInvites ? (
                                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>Loading invitations...</div>
                                ) : filteredInvites.length === 0 ? (
                                    <p style={{ color: 'var(--muted-foreground)', textAlign: 'center', padding: '1rem' }}>No {inviteFilter} invitations.</p>
                                ) : (
                                    <ul style={{ listStyle: 'none', padding: 0 }}>
                                        {filteredInvites.map((invite, idx) => (
                                            <li key={idx} style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                padding: '0.75rem',
                                                borderBottom: '1px solid var(--border)'
                                            }}>
                                                <div>
                                                    <div style={{ fontWeight: 500 }}>{invite.email}</div>
                                                    <div style={{ fontSize: '0.8rem', fontFamily: 'monospace', background: 'var(--muted)', padding: '0.1rem 0.3rem', borderRadius: 4, display: 'inline-block', marginTop: 4 }}>
                                                        {invite.code}
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <span style={{
                                                        fontSize: '0.75rem',
                                                        padding: '0.25rem 0.5rem',
                                                        borderRadius: '1rem',
                                                        background: invite.status === 'pending' ? 'var(--accent)' : 'var(--muted)',
                                                        color: invite.status === 'pending' ? 'var(--primary)' : 'var(--muted-foreground)'
                                                    }}>
                                                        {invite.status}
                                                    </span>
                                                    <button
                                                        onClick={() => handleDeleteInvite(invite.id)}
                                                        aria-label="Delete invitation"
                                                        style={{ color: 'var(--muted-foreground)', cursor: 'pointer', background: 'none', border: 'none' }}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }


            {
                activeTab === 'resources' && (
                    <div className={styles.grid}>
                        <div className={styles.card}>
                            <div className={styles.cardHeader}>
                                <Wrench size={20} />
                                <span className={styles.cardTitle}>Manage Community Resources</span>
                            </div>
                            <div className={styles.cardContent}>
                                <button
                                    onClick={() => setIsCreateResourceModalOpen(true)}
                                    style={{
                                        marginBottom: '1.5rem',
                                        padding: '0.75rem 1rem',
                                        background: 'var(--primary)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: 'var(--radius)',
                                        cursor: 'pointer',
                                        fontWeight: 600,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    <UserPlus size={16} /> {/* Reuse UserPlus or similar icon */}
                                    Add New Resource
                                </button>

                                {isLoadingResources ? (
                                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted-foreground)' }}>Loading resources...</div>
                                ) : resources.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted-foreground)' }}>No resources found.</div>
                                ) : (
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                                                <th style={{ padding: '0.5rem' }}>Name</th>
                                                <th style={{ padding: '0.5rem' }}>Type</th>
                                                <th style={{ padding: '0.5rem' }}>Capacity</th>
                                                <th style={{ padding: '0.5rem' }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {resources.map((resource) => (
                                                <tr key={resource.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: 500 }}>{resource.name}</td>
                                                    <td style={{ padding: '0.5rem' }}>
                                                        <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'var(--muted)' }}>
                                                            {resource.type}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '0.5rem' }}>{resource.capacity > 0 ? resource.capacity : '-'}</td>
                                                    <td style={{ padding: '0.5rem' }}>
                                                        <button
                                                            onClick={() => handleDeleteResource(resource.id, resource.name)}
                                                            style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                                                        >
                                                            <Trash2 size={16} /> Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                        <CreateResourceModal
                            isOpen={isCreateResourceModalOpen}
                            onClose={() => setIsCreateResourceModalOpen(false)}
                            onCreate={handleCreateResource}
                            isLoading={isCreatingResource}
                        />
                    </div>
                )
            }

            {activeTab === 'billing' && (
                <div className={styles.grid}>
                    {/* Trial Banner */}
                    {planStatus === 'trial' && (
                        <div style={{
                            gridColumn: '1 / -1',
                            padding: '1rem 1.5rem',
                            borderRadius: 'var(--radius)',
                            background: isTrialExpired ? '#fef2f2' : '#fffbeb',
                            border: `1px solid ${isTrialExpired ? '#fecaca' : '#fde68a'}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                        }}>
                            <div>
                                <strong style={{ color: isTrialExpired ? '#dc2626' : '#d97706' }}>
                                    {isTrialExpired ? 'Trial Expired' : `Free Trial: ${trialDaysRemaining} day${trialDaysRemaining !== 1 ? 's' : ''} remaining`}
                                </strong>
                                <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.25rem' }}>
                                    {isTrialExpired
                                        ? 'Your trial has ended. Select a plan below to continue using all features.'
                                        : 'Enjoy full access during your trial. Choose a plan before it expires to avoid interruptions.'}
                                </p>
                            </div>
                        </div>
                    )}

                    {planStatus === 'expired' && (
                        <div style={{
                            gridColumn: '1 / -1',
                            padding: '1rem 1.5rem',
                            borderRadius: 'var(--radius)',
                            background: '#fef2f2',
                            border: '1px solid #fecaca',
                        }}>
                            <strong style={{ color: '#dc2626' }}>Plan Expired</strong>
                            <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.25rem' }}>
                                Your plan has expired. New members cannot join until you select a plan.
                            </p>
                        </div>
                    )}

                    {/* Current Usage Card */}
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <CreditCard size={20} />
                            <span className={styles.cardTitle}>Current Usage</span>
                        </div>
                        <div className={styles.cardContent}>
                            <div style={{ marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span style={{ fontSize: '0.9rem', color: 'var(--muted-foreground)' }}>Members</span>
                                    <span style={{ fontWeight: 600 }}>{memberCount} / {maxHomes}</span>
                                </div>
                                <div style={{ width: '100%', height: 8, borderRadius: 4, background: 'var(--muted)', overflow: 'hidden' }}>
                                    <div style={{
                                        width: `${Math.min(100, Math.round((memberCount / maxHomes) * 100))}%`,
                                        height: '100%',
                                        borderRadius: 4,
                                        background: memberCount >= maxHomes ? '#ef4444' : memberCount >= maxHomes * 0.8 ? '#f59e0b' : 'var(--primary)',
                                        transition: 'width 0.3s',
                                    }} />
                                </div>
                                <p style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', marginTop: '0.25rem' }}>
                                    {memberCount >= maxHomes
                                        ? 'Limit reached — upgrade to add more members'
                                        : memberCount >= maxHomes * 0.8
                                            ? 'Approaching limit — consider upgrading'
                                            : `${maxHomes - memberCount} slots remaining`}
                                </p>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderTop: '1px solid var(--border)' }}>
                                <span style={{ color: 'var(--muted-foreground)' }}>Current Plan</span>
                                <span style={{ fontWeight: 600, textTransform: 'uppercase' }}>{currentPlan.replace('_', ' ')}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderTop: '1px solid var(--border)' }}>
                                <span style={{ color: 'var(--muted-foreground)' }}>Status</span>
                                <span style={{
                                    fontWeight: 600,
                                    color: planStatus === 'active' ? '#16a34a' : planStatus === 'trial' && !isTrialExpired ? '#d97706' : '#dc2626',
                                }}>
                                    {planStatus === 'active' ? 'Active' : planStatus === 'trial' && !isTrialExpired ? 'Trial' : 'Expired'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Plan Selection Card */}
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <Shield size={20} />
                            <span className={styles.cardTitle}>Choose Plan</span>
                        </div>
                        <div className={styles.cardContent}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {(Object.entries(PLANS) as [PlanId, typeof PLANS[PlanId]][]).map(([planId, planInfo]) => {
                                    const isCurrentPlan = currentPlan === planId;
                                    const tooSmall = memberCount > planInfo.maxHomes;
                                    return (
                                        <div
                                            key={planId}
                                            style={{
                                                padding: '1rem',
                                                borderRadius: 'var(--radius)',
                                                border: isCurrentPlan ? '2px solid var(--primary)' : '1px solid var(--border)',
                                                background: isCurrentPlan ? 'rgba(79,70,229,0.05)' : 'var(--card)',
                                                opacity: tooSmall ? 0.5 : 1,
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div>
                                                    <div style={{ fontWeight: 600, fontSize: '1rem' }}>{planInfo.name}</div>
                                                    <div style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)' }}>
                                                        Up to {planInfo.maxHomes} homes
                                                    </div>
                                                    {tooSmall && (
                                                        <div style={{ fontSize: '0.8rem', color: '#ef4444', marginTop: '0.25rem' }}>
                                                            Too small — you have {memberCount} members
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    {isCurrentPlan ? (
                                                        <span style={{
                                                            padding: '0.4rem 0.75rem',
                                                            borderRadius: 'var(--radius)',
                                                            background: 'var(--primary)',
                                                            color: 'white',
                                                            fontSize: '0.8rem',
                                                            fontWeight: 600,
                                                        }}>
                                                            Current
                                                        </span>
                                                    ) : (
                                                        <button
                                                            disabled={tooSmall || isUpdatingPlan}
                                                            onClick={async () => {
                                                                if (!communityId) return;
                                                                setIsUpdatingPlan(true);
                                                                const res = await updateCommunityPlan(communityId, planId);
                                                                if (res.success) {
                                                                    setCurrentPlan(planId);
                                                                    setMaxHomes(res.maxHomes!);
                                                                    setPlanStatus('active');
                                                                    alert(`Plan updated to ${planInfo.name}!`);
                                                                } else {
                                                                    alert(res.error || 'Failed to update plan');
                                                                }
                                                                setIsUpdatingPlan(false);
                                                            }}
                                                            style={{
                                                                padding: '0.4rem 0.75rem',
                                                                borderRadius: 'var(--radius)',
                                                                background: 'var(--card)',
                                                                border: '1px solid var(--border)',
                                                                cursor: tooSmall ? 'not-allowed' : 'pointer',
                                                                fontSize: '0.8rem',
                                                                fontWeight: 500,
                                                            }}
                                                        >
                                                            {isUpdatingPlan ? 'Updating...' : memberCount > (PLANS[currentPlan as PlanId]?.maxHomes || 0) ? 'Select' : planInfo.maxHomes > (PLANS[currentPlan as PlanId]?.maxHomes || 0) ? 'Upgrade' : 'Downgrade'}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Invitation Modal */}
            {
                showModal && (
                    <div className={styles.modal}>
                        <div className={styles.modalContent}>
                            <button
                                onClick={() => setShowModal(false)}
                                aria-label="Close modal"
                                className={styles.closeButton}
                            >
                                <X size={20} />
                            </button>

                            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                                <div className={styles.successIcon}>
                                    <CheckCircle size={24} />
                                </div>
                                <h2 className={styles.modalTitle}>Invitation Created!</h2>
                                <p className={styles.modalText}>Share this with your neighbor.</p>
                            </div>

                            <div className={styles.codeBlock}>
                                {modalData.message}
                            </div>

                            <div className={styles.modalActions}>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className={styles.buttonSecondary}
                                >
                                    Close
                                </button>
                                <button
                                    onClick={copyToClipboard}
                                    className={styles.buttonPrimary}
                                >
                                    <FileText size={18} />
                                    Copy Message
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Edit User Modal */}
            {
                editingUser && (
                    <div className={styles.modal}>
                        <div className={styles.modalContent}>
                            <button
                                onClick={() => setEditingUser(null)}
                                aria-label="Close modal"
                                className={styles.closeButton}
                            >
                                <X size={20} />
                            </button>

                            <h2 className={styles.modalTitle}>Edit User</h2>

                            <div className={styles.formGroup}>
                                <label htmlFor="edit-name" className={styles.label}>Name</label>
                                <input
                                    id="edit-name"
                                    className={styles.input}
                                    value={editingUser.name}
                                    onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="edit-address" className={styles.label}>Address</label>
                                <input
                                    id="edit-address"
                                    className={styles.input}
                                    value={editingUser.address || ''}
                                    onChange={(e) => setEditingUser({ ...editingUser, address: e.target.value })}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Roles</label>
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    {['Resident', 'Admin', 'Board Member', 'Event Manager'].map((role) => {
                                        const currentRoles = editingUser.roles || (editingUser.role ? [editingUser.role] : []);
                                        const isChecked = currentRoles.includes(role);
                                        return (
                                            <label key={role} style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                padding: '0.5rem',
                                                borderRadius: 'var(--radius)',
                                                border: isChecked ? '1px solid var(--primary)' : '1px solid var(--border)',
                                                background: isChecked ? 'var(--muted)' : 'transparent',
                                                cursor: 'pointer'
                                            }}>
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={(e) => {
                                                        let newRoles = [...currentRoles];
                                                        if (e.target.checked) {
                                                            newRoles.push(role);
                                                        } else {
                                                            newRoles = newRoles.filter(r => r !== role);
                                                        }
                                                        // Ensure at least one role
                                                        if (newRoles.length === 0) newRoles = ['Resident'];

                                                        // Handle Board Member side effects
                                                        const isBoard = newRoles.includes('Board Member');
                                                        setEditingUser({
                                                            ...editingUser,
                                                            roles: newRoles,
                                                            isHoaOfficer: isBoard, // Auto-toggle HOA officer
                                                            // Clear position if unchecking board member? Maybe keep it for UX.
                                                        });
                                                    }}
                                                />
                                                <span style={{ fontSize: '0.9rem' }}>{role}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        // Assuming isHoaOfficer is a state variable
                                        checked={editingUser.isHoaOfficer || false} // Use editingUser.isHoaOfficer
                                        onChange={(e) => setEditingUser({ ...editingUser, isHoaOfficer: e.target.checked })}
                                    />
                                    <span className={styles.label} style={{ marginBottom: 0 }}>Is HOA Officer?</span>
                                </label>
                            </div>

                            {editingUser.isHoaOfficer && ( // Use editingUser.isHoaOfficer
                                <div className={styles.formGroup}>
                                    <label htmlFor="edit-hoa-position" className={styles.label}>HOA Position</label>
                                    <input
                                        id="edit-hoa-position"
                                        className={styles.input}
                                        placeholder="e.g. President, Treasurer"
                                        // Assuming hoaPosition is a state variable
                                        value={editingUser.hoaPosition || ''} // Use editingUser.hoaOfficer
                                        onChange={(e) => setEditingUser({ ...editingUser, hoaPosition: e.target.value })}
                                    />
                                </div>
                            )}

                            <div className={styles.modalActions}>
                                <button
                                    onClick={handleUpdateUser}
                                    disabled={isUpdatingUser}
                                    className={styles.buttonPrimary}
                                >
                                    {isUpdatingUser ? 'Saving...' : 'Save Changes'}
                                </button>
                                <button
                                    onClick={() => setEditingUser(null)}
                                    className={styles.buttonSecondary}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
