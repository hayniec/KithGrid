"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Plus, UserPlus } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import styles from "./dashboard.module.css";

export function CommunitySwitcher() {
    const { user, communities, switchCommunity } = useUser();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const currentCommunity = communities.find(c => c.id === user.communityId);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // If user has only 1 community, just show the name
    if (communities.length <= 1) {
        return (
            <span className={styles.logoText}>
                {currentCommunity?.name || "KithGrid"}
            </span>
        );
    }

    const handleSwitch = async (communityId: string) => {
        setIsOpen(false);
        if (communityId === user.communityId) return;
        await switchCommunity(communityId);
    };

    return (
        <div ref={dropdownRef} style={{ position: "relative", width: "100%" }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    width: "100%",
                    color: "inherit",
                    fontSize: "inherit",
                }}
            >
                <span className={styles.logoText} style={{ flex: 1, textAlign: "left" }}>
                    {currentCommunity?.name || "Select Community"}
                </span>
                <ChevronDown
                    size={14}
                    style={{
                        opacity: 0.5,
                        transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.2s",
                        flexShrink: 0,
                    }}
                />
            </button>

            {isOpen && (
                <div style={{
                    position: "absolute",
                    top: "calc(100% + 0.5rem)",
                    left: 0,
                    right: 0,
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius)",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                    zIndex: 50,
                    overflow: "hidden",
                    minWidth: "200px",
                }}>
                    {communities.map((community) => (
                        <button
                            key={community.id}
                            onClick={() => handleSwitch(community.id)}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.75rem",
                                padding: "0.75rem 1rem",
                                width: "100%",
                                border: "none",
                                background: community.id === user.communityId ? "var(--primary-light, rgba(79,70,229,0.08))" : "transparent",
                                cursor: "pointer",
                                textAlign: "left",
                                borderBottom: "1px solid var(--border)",
                                color: "var(--foreground)",
                            }}
                        >
                            <div style={{
                                width: 28,
                                height: 28,
                                borderRadius: 6,
                                background: "var(--primary)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "white",
                                fontWeight: 700,
                                fontSize: "0.75rem",
                                flexShrink: 0,
                            }}>
                                {community.logoUrl ? (
                                    <img src={community.logoUrl} alt="" style={{ width: 28, height: 28, borderRadius: 6, objectFit: "cover" }} />
                                ) : (
                                    community.name.charAt(0).toUpperCase()
                                )}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{
                                    fontWeight: community.id === user.communityId ? 600 : 400,
                                    fontSize: "0.875rem",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                }}>
                                    {community.name}
                                </div>
                            </div>
                            {community.id === user.communityId && (
                                <div style={{
                                    width: 6,
                                    height: 6,
                                    borderRadius: "50%",
                                    background: "var(--primary)",
                                    flexShrink: 0,
                                }} />
                            )}
                        </button>
                    ))}

                    {/* Actions */}
                    <button
                        onClick={() => { setIsOpen(false); router.push("/join-community"); }}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            padding: "0.6rem 1rem",
                            width: "100%",
                            border: "none",
                            background: "transparent",
                            cursor: "pointer",
                            color: "var(--primary)",
                            fontSize: "0.8rem",
                            fontWeight: 500,
                            borderBottom: "1px solid var(--border)",
                        }}
                    >
                        <UserPlus size={14} />
                        Join Another Community
                    </button>
                    <button
                        onClick={() => { setIsOpen(false); router.push("/create-community"); }}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            padding: "0.6rem 1rem",
                            width: "100%",
                            border: "none",
                            background: "transparent",
                            cursor: "pointer",
                            color: "var(--primary)",
                            fontSize: "0.8rem",
                            fontWeight: 500,
                        }}
                    >
                        <Plus size={14} />
                        Create New Community
                    </button>
                </div>
            )}
        </div>
    );
}
