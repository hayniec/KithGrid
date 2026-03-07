"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/contexts/UserContext";
import { isAdmin } from "@/utils/roleHelpers";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import styles from "./OnboardingChecklist.module.css";

interface ChecklistItem {
    id: string;
    label: string;
    href: string;
    check: () => boolean;
}

interface OnboardingChecklistProps {
    communityData?: {
        hasMembers?: boolean;
        hasEvents?: boolean;
        hasAnnouncements?: boolean;
        hasDocuments?: boolean;
        hasBranding?: boolean;
    };
}

export function OnboardingChecklist({ communityData }: OnboardingChecklistProps) {
    const { user } = useUser();
    const [dismissed, setDismissed] = useState(false);
    const [expanded, setExpanded] = useState(true);

    useEffect(() => {
        const wasDismissed = localStorage.getItem("kithGrid_onboardingDismissed");
        if (wasDismissed === user?.communityId) {
            setDismissed(true);
        }
    }, [user?.communityId]);

    if (!isAdmin(user) || dismissed) return null;

    const items: ChecklistItem[] = [
        {
            id: "invite",
            label: "Invite your first neighbors",
            href: "/dashboard/admin",
            check: () => communityData?.hasMembers ?? false,
        },
        {
            id: "announcement",
            label: "Post a welcome announcement",
            href: "/dashboard",
            check: () => communityData?.hasAnnouncements ?? false,
        },
        {
            id: "event",
            label: "Create your first event",
            href: "/dashboard/events",
            check: () => communityData?.hasEvents ?? false,
        },
        {
            id: "document",
            label: "Upload a community document",
            href: "/dashboard/documents",
            check: () => communityData?.hasDocuments ?? false,
        },
        {
            id: "branding",
            label: "Customize your community colors",
            href: "/dashboard/settings",
            check: () => communityData?.hasBranding ?? false,
        },
    ];

    const completedCount = items.filter(i => i.check()).length;
    const allDone = completedCount === items.length;

    if (allDone) return null;

    const handleDismiss = () => {
        setDismissed(true);
        if (user?.communityId) {
            localStorage.setItem("kithGrid_onboardingDismissed", user.communityId);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header} onClick={() => setExpanded(!expanded)}>
                <div>
                    <h3 className={styles.title}>Get your community set up</h3>
                    <p className={styles.progress}>{completedCount} of {items.length} complete</p>
                </div>
                <div className={styles.headerActions}>
                    <button className={styles.dismissBtn} onClick={(e) => { e.stopPropagation(); handleDismiss(); }}>
                        Dismiss
                    </button>
                    {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
            </div>

            {/* Progress bar */}
            <div className={styles.progressBar}>
                <div
                    className={styles.progressFill}
                    style={{ width: `${(completedCount / items.length) * 100}%` }}
                />
            </div>

            {expanded && (
                <div className={styles.items}>
                    {items.map(item => {
                        const done = item.check();
                        return (
                            <a
                                key={item.id}
                                href={item.href}
                                className={`${styles.item} ${done ? styles.itemDone : ""}`}
                            >
                                <div className={`${styles.checkbox} ${done ? styles.checkboxDone : ""}`}>
                                    {done && <Check size={14} />}
                                </div>
                                <span className={done ? styles.labelDone : ""}>{item.label}</span>
                            </a>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
