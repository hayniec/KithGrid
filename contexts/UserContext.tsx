"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getPrimaryRole, getUserRoles } from "@/utils/roleHelpers";
import { createClient } from "@/utils/supabase/client";
import { getUserProfile } from "@/app/actions/user";
import { getCommunities } from "@/app/actions/communities";

export type UserRole = "admin" | "resident" | "event manager" | "board member";

export interface CommunityInfo {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string;
    role?: string;
}

interface UserProfile {
    id?: string;
    communityId?: string;
    email?: string;
    name: string;
    role: UserRole;
    roles: UserRole[]; // New multi-role support
    avatar: string;
    address?: string;
    personalEmergencyCode?: string;
    personalEmergencyInstructions?: string;
    emergencyButtonSettings?: {
        visible: boolean;
        position: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
    };
}

interface UserContextType {
    user: UserProfile;
    setUser: (user: UserProfile) => void;
    toggleRole: () => void;
    switchCommunity: (communityId: string) => Promise<void>;
    communities: CommunityInfo[];
    status: "loading" | "authenticated" | "unauthenticated";
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Cookie helpers for community persistence
function setCommunityIdCookie(communityId: string) {
    document.cookie = `kithgrid_community=${communityId};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;
}

function getCommunityIdFromCookie(): string | undefined {
    const match = document.cookie.match(/(?:^|; )kithgrid_community=([^;]*)/);
    return match ? match[1] : undefined;
}

function clearCommunityIdCookie() {
    document.cookie = `kithgrid_community=;path=/;max-age=0`;
}

export function UserProvider({ children }: { children: React.ReactNode }) {
    const supabase = createClient();
    const [user, setUserState] = useState<UserProfile>({
        name: "",
        role: "resident",
        roles: ["resident"],
        avatar: "",
        address: "",
        communityId: "",
        emergencyButtonSettings: {
            visible: false,
            position: 'bottom-left'
        }
    });

    const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading");
    const [communities, setCommunities] = useState<CommunityInfo[]>([]);

    // Switch community: updates state, cookie, localStorage, and reloads member data
    const switchCommunity = useCallback(async (communityId: string) => {
        // Update cookie + localStorage
        setCommunityIdCookie(communityId);
        localStorage.setItem("kithgrid_communityId", communityId);

        // Find community in the list for name/role info
        const target = communities.find(c => c.id === communityId);

        setUserState(prev => ({
            ...prev,
            communityId,
        }));

        // Re-fetch user profile to get updated role for this community
        if (user.id) {
            try {
                const profileRes = await getUserProfile(user.id);
                if (profileRes.success && profileRes.data) {
                    const newRole = (profileRes.data.role?.toLowerCase() || "resident") as UserRole;
                    setUserState(prev => ({
                        ...prev,
                        communityId,
                        role: newRole,
                        roles: [newRole],
                    }));
                }
            } catch (e) {
                console.error("Failed to refresh profile after community switch", e);
            }
        }

        // Reload the page to refresh all dashboard data
        window.location.href = "/dashboard";
    }, [communities, user.id]);

    useEffect(() => {
        let savedSettings = undefined;
        try {
            const saved = localStorage.getItem("neighborNet_user");
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed.emergencyButtonSettings) {
                    savedSettings = parsed.emergencyButtonSettings;
                }
            }
        } catch (e) {
            console.error("Failed to parse saved user settings", e);
        }

        const handleSession = async (session: any) => {
            if (session?.user) {
                // Get roles using helper function
                const meta = session.user.user_metadata || {};

                // Try to restore communityId from cookie or localStorage (not hardcoded)
                const cookieCommunityId = getCommunityIdFromCookie();
                const storedCommunityId = localStorage.getItem("kithgrid_communityId");
                const restoredCommunityId = cookieCommunityId || storedCommunityId || undefined;

                let sessionUser = {
                    ...session.user,
                    name: meta.name || meta.full_name || session.user.email?.split('@')[0],
                    image: meta.avatar_url || meta.picture || "",
                    communityId: restoredCommunityId,
                    communityRoles: meta.communityRoles || session.user.communityRoles || []
                };

                // Sync with DB for real communityId
                try {
                    const profileRes = await getUserProfile(session.user.id);
                    if (profileRes.success && profileRes.data) {
                        // If we have a restored communityId, keep it; otherwise use DB value
                        if (!sessionUser.communityId && profileRes.data.communityId) {
                            sessionUser.communityId = profileRes.data.communityId;
                        }
                        if (profileRes.data.name) {
                            sessionUser.name = profileRes.data.name;
                        }
                        if (profileRes.data.roles && profileRes.data.roles.length > 0) {
                            sessionUser.communityRoles = profileRes.data.roles;
                        } else if (profileRes.data.role) {
                            sessionUser.communityRoles = [profileRes.data.role.toLowerCase()];
                        }
                    }
                } catch (e) {
                    console.error("UserContext DB sync failed", e);
                }

                // Fetch user's communities list
                try {
                    const commRes = await getCommunities();
                    if (commRes.success && commRes.data) {
                        const commList: CommunityInfo[] = commRes.data.map((c: any) => ({
                            id: c.id,
                            name: c.name,
                            slug: c.slug,
                            logoUrl: c.branding?.logoUrl,
                        }));
                        setCommunities(commList);

                        // Validate that the restored communityId is still valid
                        if (sessionUser.communityId) {
                            const isValid = commList.some(c => c.id === sessionUser.communityId);
                            if (!isValid && commList.length > 0) {
                                // Restored ID is invalid, clear it
                                sessionUser.communityId = undefined;
                            }
                        }

                        // If user has exactly 1 community and no selection, auto-select it
                        if (!sessionUser.communityId && commList.length === 1) {
                            sessionUser.communityId = commList[0].id;
                            setCommunityIdCookie(commList[0].id);
                            localStorage.setItem("kithgrid_communityId", commList[0].id);
                        }
                    }
                } catch (e) {
                    console.error("Failed to fetch communities list", e);
                }

                // Persist communityId to cookie if we have one
                if (sessionUser.communityId) {
                    setCommunityIdCookie(sessionUser.communityId);
                    localStorage.setItem("kithgrid_communityId", sessionUser.communityId);
                }

                // Map communityRoles to roles so getUserRoles() can find them
                if (sessionUser.communityRoles && sessionUser.communityRoles.length > 0) {
                    (sessionUser as any).roles = sessionUser.communityRoles;
                }

                const finalRoles = getUserRoles(sessionUser as any).map(r => r.toLowerCase() as UserRole);
                const primaryRole = getPrimaryRole(sessionUser as any).toLowerCase() as UserRole;

                setUserState(prev => ({
                    ...prev,
                    id: session.user.id,
                    name: sessionUser.name || "Neighbor",
                    email: session.user.email || "",
                    role: primaryRole,
                    roles: finalRoles.length ? finalRoles : ["resident"],
                    avatar: sessionUser.image || "",
                    communityId: sessionUser.communityId || undefined,
                    emergencyButtonSettings: savedSettings || prev.emergencyButtonSettings || {
                        visible: false,
                        position: 'bottom-left'
                    }
                }));
                setStatus("authenticated");
            } else {
                // No session - unauthenticated, no mock user
                setUserState(prev => ({
                    ...prev,
                    name: "",
                    email: "",
                    role: "resident",
                    roles: ["resident"],
                    avatar: "",
                    communityId: undefined,
                }));
                setStatus("unauthenticated");
            }
        };

        // Check initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            handleSession(session);
        });

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            handleSession(session);
        });

        return () => subscription.unsubscribe();
    }, [supabase.auth]);

    useEffect(() => {
        // Only restore from localStorage in development for testing convenience.
        // In production, auth state comes exclusively from the session.
        if (process.env.NODE_ENV === "development") {
            const savedUser = localStorage.getItem("neighborNet_user");
            if (savedUser && status !== "authenticated") {
                setUserState(JSON.parse(savedUser));
            }
        }
    }, [status]);

    const setUser = (newUser: UserProfile) => {
        setUserState(newUser);
        localStorage.setItem("neighborNet_user", JSON.stringify(newUser));
        // Keep cookie in sync
        if (newUser.communityId) {
            setCommunityIdCookie(newUser.communityId);
            localStorage.setItem("kithgrid_communityId", newUser.communityId);
        }
    };

    const toggleRole = () => {
        const newPrimaryRole = user.role === "admin" ? "resident" : "admin";
        let newRoles = [...user.roles];
        if (!newRoles.includes(newPrimaryRole)) {
            newRoles = [newPrimaryRole, ...newRoles.filter(r => r !== newPrimaryRole)];
        } else {
            newRoles = [newPrimaryRole, ...newRoles.filter(r => r !== newPrimaryRole)];
        }
        setUser({ ...user, role: newPrimaryRole, roles: newRoles });
    };

    return (
        <UserContext.Provider value={{ user, setUser, toggleRole, switchCommunity, communities, status }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
}
