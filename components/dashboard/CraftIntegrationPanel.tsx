'use client';

import { useState, useEffect } from 'react';
import { 
    getCraftIntegrationStatus, 
    getCraftAuthUrl,
    syncAllDocumentsToCraft,
    toggleCraftAutoSync,
    disconnectCraft
} from '@/app/actions/craft';
import styles from './CraftIntegrationPanel.module.css';
import { Link, Unlink, RefreshCw, Settings } from 'lucide-react';

interface CraftIntegrationPanelProps {
    communityId: string;
    onStatusChange?: (connected: boolean) => void;
}

export function CraftIntegrationPanel({ communityId, onStatusChange }: CraftIntegrationPanelProps) {
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [status, setStatus] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Load integration status on mount
    useEffect(() => {
        loadStatus();
    }, [communityId]);

    const loadStatus = async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await getCraftIntegrationStatus(communityId);
            
            if (result.success) {
                setStatus(result.data);
                onStatusChange?.(result.data?.connected || false);
            } else {
                setError(result.error || 'Failed to load integration status');
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleConnect = async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await getCraftAuthUrl(communityId);
            
            if (result.redirectUrl) {
                // Redirect to Craft OAuth
                window.location.href = result.redirectUrl;
            } else {
                setError(result.error || 'Failed to generate auth URL');
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleSyncAll = async () => {
        try {
            setSyncing(true);
            setError(null);
            const result = await syncAllDocumentsToCraft(communityId);
            
            if (result.success) {
                setSuccessMessage(result.data?.message || 'All documents synced');
                setTimeout(() => setSuccessMessage(null), 5000);
                loadStatus();
            } else {
                setError(result.error || 'Failed to sync documents');
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setSyncing(false);
        }
    };

    const handleToggleAutoSync = async (enabled: boolean) => {
        try {
            setError(null);
            const result = await toggleCraftAutoSync(communityId, enabled);
            
            if (result.success) {
                setSuccessMessage(
                    `Auto-sync ${enabled ? 'enabled' : 'disabled'}`
                );
                setTimeout(() => setSuccessMessage(null), 3000);
                loadStatus();
            } else {
                setError(result.error || 'Failed to update setting');
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        }
    };

    const handleDisconnect = async () => {
        if (!confirm('Disconnect Craft.do? Documents already synced will remain in Craft.')) {
            return;
        }

        try {
            setError(null);
            const result = await disconnectCraft(communityId);
            
            if (result.success) {
                setSuccessMessage('Craft.do disconnected');
                setTimeout(() => setSuccessMessage(null), 3000);
                loadStatus();
            } else {
                setError(result.error || 'Failed to disconnect');
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        }
    };

    if (loading && !status) {
        return <div className={styles.container}>Loading Craft.do integration status...</div>;
    }

    const connected = status?.connected;
    const craftInfo = status?.integration;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3>
                    <span className={styles.icon}>📚</span>
                    Craft.do Integration
                </h3>
                {connected && (
                    <span className={styles.badge}>Connected</span>
                )}
            </div>

            {/* Error Alert */}
            {error && (
                <div className={styles.alert} style={{ borderColor: '#ef4444' }}>
                    ❌ {error}
                </div>
            )}

            {/* Success Alert */}
            {successMessage && (
                <div className={styles.alert} style={{ borderColor: '#10b981' }}>
                    ✓ {successMessage}
                </div>
            )}

            {/* Not Connected */}
            {!connected ? (
                <div className={styles.notConnected}>
                    <p>Sync your HOA documents to Craft.do for better organization.</p>
                    <button
                        onClick={handleConnect}
                        disabled={loading}
                        className={styles.primaryButton}
                    >
                        <Link size={16} />
                        Connect Craft Workspace
                    </button>
                    <p className={styles.hint}>
                        You'll be redirected to Craft.do to authorize KithGrid
                    </p>
                </div>
            ) : (
                <div className={styles.connected}>
                    {/* Connection Info */}
                    <div className={styles.infoBox}>
                        <div className={styles.infoRow}>
                            <span className={styles.label}>Workspace:</span>
                            <span className={styles.value}>{craftInfo?.craftSpaceName}</span>
                        </div>
                        {craftInfo?.craftUserEmail && (
                            <div className={styles.infoRow}>
                                <span className={styles.label}>Account:</span>
                                <span className={styles.value}>{craftInfo.craftUserEmail}</span>
                            </div>
                        )}
                        {craftInfo?.lastSyncAt && (
                            <div className={styles.infoRow}>
                                <span className={styles.label}>Last Sync:</span>
                                <span className={styles.value}>
                                    {new Date(craftInfo.lastSyncAt).toLocaleDateString()}
                                </span>
                            </div>
                        )}
                        {craftInfo?.connectedAt && (
                            <div className={styles.infoRow}>
                                <span className={styles.label}>Connected:</span>
                                <span className={styles.value}>
                                    {new Date(craftInfo.connectedAt).toLocaleDateString()}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Settings */}
                    <div className={styles.settingsBox}>
                        <label className={styles.checkboxLabel}>
                            <input
                                type="checkbox"
                                checked={craftInfo?.autoSyncDocuments || false}
                                onChange={(e) => handleToggleAutoSync(e.target.checked)}
                                disabled={loading}
                            />
                            <span>Auto-sync new documents to Craft.do</span>
                        </label>
                        <p className={styles.hint}>
                            When enabled, new documents will automatically appear in your Craft workspace
                        </p>
                    </div>

                    {/* Actions */}
                    <div className={styles.actions}>
                        <button
                            onClick={handleSyncAll}
                            disabled={syncing}
                            className={styles.secondaryButton}
                        >
                            <RefreshCw size={16} />
                            {syncing ? 'Syncing...' : 'Sync All Documents'}
                        </button>
                        <button
                            onClick={handleDisconnect}
                            disabled={loading}
                            className={styles.dangerButton}
                        >
                            <Unlink size={16} />
                            Disconnect
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
