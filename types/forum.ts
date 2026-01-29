export type ForumCategory = "General" | "Safety" | "Events" | "Lost & Found" | "Recommendations";

export interface ForumPost {
    id: string | number;
    authorId?: string;
    authorName?: string; // keeping legacy for now if needed, though author is used in page
    author: string; // Used in page.tsx
    initials: string; // Used in page.tsx
    category: ForumCategory;
    content: string;
    timestamp: string;
    likes: number;
    likedByMe?: boolean;
    comments: number | ForumComment[];
}

export interface ForumComment {
    id: string;
    authorId: string;
    authorName: string;
    content: string;
    timestamp: string;
}

export interface DirectMessage {
    id: string;
    senderId: string;
    senderName: string;
    recipientId: string;
    content: string;
    timestamp: string;
    read: boolean;
}
