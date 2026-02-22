"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { getPrimaryRole, getUserRoles } from "@/utils/roleHelpers";
import { createClient } from "@/utils/supabase/client";

export type UserRole = "admin" | "resident" | "event manager" | "board member";

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
}

const UserContext = createContext<UserContextType | undefined>(undefined);

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

        const handleSession = (session: any) => {
            if (session?.user) {
                // Get roles using helper function (this might need refactoring to match Supabase schema later)
                // For now, assuming user_metadata might contain roles, or falling back to defaults.
                const meta = session.user.user_metadata || {};
                const sessionUser = {
                    ...session.user,
                    name: meta.name || meta.full_name || session.user.email?.split('@')[0],
                    image: meta.avatar_url || meta.picture || "",
                    communityId: meta.communityId || session.user.communityId || "2bf6bc8a-899c-4e29-8ee7-f2038c804260",
                    communityRoles: meta.communityRoles || session.user.communityRoles || []
                };

                const finalRoles = getUserRoles(sessionUser as any).map(r => r.toLowerCase() as UserRole);
                const primaryRole = getPrimaryRole(sessionUser as any).toLowerCase() as UserRole;

                setUserState(prev => ({
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
                // MOCK USER FOR DEVELOPMENT/BYPASS
                setUserState(prev => ({
                    id: "cd48f9df-4096-4f8d-b76c-9a6dca90ceab",
                    name: "Super Admin (Bypass)",
                    email: "admin@neighbornet.com",
                    role: "admin",
                    roles: ["admin", "resident"],
                    avatar: "SA",
                    communityId: "2bf6bc8a-899c-4e29-8ee7-f2038c804260",
                    emergencyButtonSettings: savedSettings || prev.emergencyButtonSettings || {
                        visible: false,
                        position: 'bottom-left'
                    }
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
        const savedUser = localStorage.getItem("neighborNet_user");
        if (savedUser && status !== "authenticated") {
            setUserState(JSON.parse(savedUser));
        }
    }, [status]);

    const setUser = (newUser: UserProfile) => {
        setUserState(newUser);
        localStorage.setItem("neighborNet_user", JSON.stringify(newUser));
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
        <UserContext.Provider value={{ user, setUser, toggleRole }}>
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
