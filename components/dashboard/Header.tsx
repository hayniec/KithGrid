import { useState } from "react";
import { Bell, Search, Menu } from "lucide-react";
import styles from "./dashboard.module.css";
import { SearchModal } from "./SearchModal";

export function Header({ title, onMenuClick }: { title?: string, onMenuClick?: () => void }) {
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    return (
        <header className={styles.header}>
            <button className={styles.mobileMenuBtn} onClick={onMenuClick} aria-label="Open Menu">
                <Menu size={24} />
            </button>
            <div className={styles.headerTitle}>{title || "Dashboard"}</div>

            <div className={styles.headerActions}>
                <button
                    className={styles.iconButton}
                    aria-label="Search"
                    onClick={() => setIsSearchOpen(true)}
                >
                    <Search size={20} />
                </button>
                <button className={styles.iconButton} aria-label="Notifications">
                    <Bell size={20} />
                </button>
            </div>

            <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        </header>
    );
}
