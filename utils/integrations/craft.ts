/**
 * Craft.do Integration Module
 * Handles OAuth authentication and document synchronization with Craft.do
 */

const CRAFT_API_BASE = "https://api.craft.do";
const CRAFT_OAUTH_URL = "https://api.craft.do/oauth/authorize";
const CRAFT_OAUTH_TOKEN_URL = "https://api.craft.do/oauth/token";

export interface CraftOAuthConfig {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
}

export interface CraftAuthToken {
    accessToken: string;
    refreshToken?: string;
    expiresAt: number;
    spaceId?: string;
}

export interface CraftDocument {
    id: string;
    title: string;
    content?: string;
    folderId?: string;
    blockId?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface CraftSyncConfig {
    enabled: boolean;
    spaceId: string;
    folderId?: string; // Which folder to sync documents to
    autoSyncNewDocs: boolean;
    syncedDocIds: string[]; // Track which docs have been synced
}

/**
 * Generate OAuth authorization URL for user to connect Craft.do
 */
export function generateCraftAuthUrl(clientId: string, redirectUri: string): string {
    const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: "code",
        scope: "documents:write documents:read spaces:read",
        state: generateRandomState(),
    });

    return `${CRAFT_OAUTH_URL}?${params.toString()}`;
}

/**
 * Exchange OAuth code for access token
 */
export async function exchangeCraftCode(
    code: string,
    clientId: string,
    clientSecret: string,
    redirectUri: string
): Promise<CraftAuthToken> {
    const params = new URLSearchParams({
        grant_type: "authorization_code",
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
    });

    const response = await fetch(CRAFT_OAUTH_TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
    });

    if (!response.ok) {
        throw new Error(`Failed to exchange Craft code: ${response.statusText}`);
    }

    const data = await response.json();

    return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: Date.now() + (data.expires_in * 1000),
        spaceId: data.space_id,
    };
}

/**
 * Refresh access token if expired
 */
export async function refreshCraftToken(
    refreshToken: string,
    clientId: string,
    clientSecret: string
): Promise<CraftAuthToken> {
    const params = new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: clientId,
        client_secret: clientSecret,
    });

    const response = await fetch(CRAFT_OAUTH_TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
    });

    if (!response.ok) {
        throw new Error(`Failed to refresh Craft token: ${response.statusText}`);
    }

    const data = await response.json();

    return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: Date.now() + (data.expires_in * 1000),
    };
}

/**
 * Create a document in Craft.do workspace
 */
export async function createCraftDocument(
    accessToken: string,
    spaceId: string,
    document: {
        title: string;
        content: string;
        folderId?: string;
    }
): Promise<CraftDocument> {
    const payload = {
        title: document.title,
        content: document.content,
        ...(document.folderId && { folderID: document.folderId }),
    };

    const response = await fetch(`${CRAFT_API_BASE}/v1/spaces/${spaceId}/documents`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to create Craft document: ${error.message}`);
    }

    return await response.json();
}

/**
 * Update an existing document in Craft.do
 */
export async function updateCraftDocument(
    accessToken: string,
    spaceId: string,
    documentId: string,
    updates: {
        title?: string;
        content?: string;
    }
): Promise<CraftDocument> {
    const response = await fetch(
        `${CRAFT_API_BASE}/v1/spaces/${spaceId}/documents/${documentId}`,
        {
            method: "PATCH",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updates),
        }
    );

    if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to update Craft document: ${error.message}`);
    }

    return await response.json();
}

/**
 * List documents in Craft workspace folder
 */
export async function listCraftDocuments(
    accessToken: string,
    spaceId: string,
    folderId?: string
): Promise<CraftDocument[]> {
    const endpoint = folderId
        ? `${CRAFT_API_BASE}/v1/spaces/${spaceId}/folders/${folderId}/documents`
        : `${CRAFT_API_BASE}/v1/spaces/${spaceId}/documents`;

    const response = await fetch(endpoint, {
        headers: { "Authorization": `Bearer ${accessToken}` },
    });

    if (!response.ok) {
        throw new Error(`Failed to list Craft documents: ${response.statusText}`);
    }

    const data = await response.json();
    return data.documents || [];
}

/**
 * Get available spaces and folders in Craft workspace
 */
export async function getCraftSpaces(accessToken: string): Promise<any[]> {
    const response = await fetch(`${CRAFT_API_BASE}/v1/spaces`, {
        headers: { "Authorization": `Bearer ${accessToken}` },
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch Craft spaces: ${response.statusText}`);
    }

    const data = await response.json();
    return data.spaces || [];
}

/**
 * Generate random state for OAuth CSRF protection
 */
function generateRandomState(): string {
    return Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
}

/**
 * Check if token needs refresh
 */
export function isTokenExpired(token: CraftAuthToken): boolean {
    return Date.now() >= token.expiresAt - 60000; // Refresh 1 minute before expiry
}
