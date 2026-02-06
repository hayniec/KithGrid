export interface MarketplaceItem {
    id: string;
    title: string;
    description: string;
    price: number;
    isFree: boolean;
    isNegotiable: boolean;
    images: string[]; // URLs
    status: 'Active' | 'Sold' | 'Expired';
    postedDate: string; // ISO Date
    expiresAt: string; // ISO Date
    sellerId: string;
    sellerName: string;
    sellerEmail?: string;
}
