import { useState, useEffect, useRef } from "react";
import { Bell, Search, Menu, Check, MessageCircle, MessageSquare, Calendar, Megaphone } from "lucide-react";
import styles from "./dashboard.module.css";
import { SearchModal } from "./SearchModal";
import { useTheme } from "@/contexts/ThemeContext";
import { useUser } from "@/contexts/UserContext";
import { getNotifications, markNotificationRead, markAllNotificationsRead } from "@/app/actions/notifications";
import { useRouter } from "next/navigation";

interface Notification {
    id: string;
    type: string;
    title: string;
    body: string | null;
    relatedUrl: string | null;
    isRead: boolean;
    createdAt: string | null;
}

const typeIcons: Record<string, typeof MessageCircle> = {
    message: MessageCircle,
    forum_reply: MessageSquare,
    event_reminder: Calendar,
    announcement: Megaphone,
};

function timeAgo(dateStr: string | null): string {
    if (!dateStr) return "";
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
}

export function Header({ title, onMenuClick }: { title?: string, onMenuClick?: () => void }) {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [notifs, setNotifs] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { communityName, communityLogo } = useTheme();
    const { user } = useUser();
    const router = useRouter();
    const panelRef = useRef<HTMLDivElement>(null);

    const unreadCount = notifs.filter(n => !n.isRead).length;

    const fetchNotifs = async () => {
        if (!user?.id || !user?.communityId) return;
        setIsLoading(true);
        const res = await getNotifications(user.id, user.communityId);
        if (res.success && res.data) {
            setNotifs(res.data as Notification[]);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchNotifs();
        // Poll every 30s for new notifications
        const interval = setInterval(fetchNotifs, 30000);
        return () => clearInterval(interval);
    }, [user?.id, user?.communityId]);

    // Close on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                setIsNotifOpen(false);
            }
        };
        if (isNotifOpen) document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [isNotifOpen]);

    const handleNotifClick = async (notif: Notification) => {
        if (!notif.isRead) {
            await markNotificationRead(notif.id);
            setNotifs(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
        }
        if (notif.relatedUrl) {
            router.push(notif.relatedUrl);
            setIsNotifOpen(false);
        }
    };

    const handleMarkAllRead = async () => {
        if (!user?.id || !user?.communityId) return;
        await markAllNotificationsRead(user.id, user.communityId);
        setNotifs(prev => prev.map(n => ({ ...n, isRead: true })));
    };

    return (
        <header className={styles.header}>
            <button className={styles.mobileMenuBtn} onClick={onMenuClick} aria-label="Open Menu">
                <Menu size={24} />
            </button>
            <div className={styles.headerTitle}>
                {communityLogo ? (
                    <img src={communityLogo} alt={communityName} style={{ height: '32px', objectFit: 'contain' }} />
                ) : (
                    <span>{title || communityName}</span>
                )}
            </div>

            <div className={styles.headerActions}>
                <button
                    className={styles.iconButton}
                    aria-label="Search"
                    onClick={() => setIsSearchOpen(true)}
                >
                    <Search size={20} />
                </button>
                <div style={{ position: 'relative' }} ref={panelRef}>
                    <button
                        className={styles.iconButton}
                        aria-label="Notifications"
                        onClick={() => { setIsNotifOpen(!isNotifOpen); if (!isNotifOpen) fetchNotifs(); }}
                    >
                        <Bell size={20} />
                        {unreadCount > 0 && (
                            <span style={{
                                position: 'absolute', top: 2, right: 2,
                                width: 18, height: 18, borderRadius: '50%',
                                background: '#ef4444', color: 'white',
                                fontSize: '0.65rem', fontWeight: 700,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                lineHeight: 1
                            }}>
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </button>

                    {isNotifOpen && (
                        <div style={{
                            position: 'absolute', top: '100%', right: 0,
                            width: 340, maxHeight: 420, overflowY: 'auto',
                            background: 'var(--card)', border: '1px solid var(--border)',
                            borderRadius: 'var(--radius)', boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                            zIndex: 100
                        }}>
                            <div style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)'
                            }}>
                                <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Notifications</span>
                                {unreadCount > 0 && (
                                    <button
                                        onClick={handleMarkAllRead}
                                        style={{
                                            background: 'none', border: 'none', cursor: 'pointer',
                                            color: 'var(--primary)', fontSize: '0.8rem',
                                            display: 'flex', alignItems: 'center', gap: '0.25rem'
                                        }}
                                    >
                                        <Check size={14} /> Mark all read
                                    </button>
                                )}
                            </div>

                            {isLoading && notifs.length === 0 ? (
                                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>Loading...</div>
                            ) : notifs.length === 0 ? (
                                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>
                                    No notifications yet
                                </div>
                            ) : (
                                notifs.map(notif => {
                                    const Icon = typeIcons[notif.type] || Bell;
                                    return (
                                        <div
                                            key={notif.id}
                                            onClick={() => handleNotifClick(notif)}
                                            style={{
                                                display: 'flex', gap: '0.75rem', padding: '0.75rem 1rem',
                                                cursor: notif.relatedUrl ? 'pointer' : 'default',
                                                borderBottom: '1px solid var(--border)',
                                                background: notif.isRead ? 'transparent' : 'color-mix(in srgb, var(--primary) 5%, transparent)',
                                                transition: 'background 0.15s'
                                            }}
                                        >
                                            <div style={{
                                                width: 32, height: 32, borderRadius: '50%',
                                                background: 'var(--muted)', display: 'flex',
                                                alignItems: 'center', justifyContent: 'center', flexShrink: 0
                                            }}>
                                                <Icon size={16} />
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontWeight: notif.isRead ? 400 : 600, fontSize: '0.85rem', marginBottom: '0.15rem' }}>
                                                    {notif.title}
                                                </div>
                                                {notif.body && (
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {notif.body}
                                                    </div>
                                                )}
                                                <div style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', marginTop: '0.2rem' }}>
                                                    {timeAgo(notif.createdAt)}
                                                </div>
                                            </div>
                                            {!notif.isRead && (
                                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', flexShrink: 0, marginTop: '0.5rem' }} />
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}
                </div>
            </div>

            <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        </header>
    );
}
