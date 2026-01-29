export interface CommunityResource {
    id: string;
    name: string;
    type: 'Facility' | 'Tool' | 'Vehicle';
    capacity?: number;
    description: string;
    isReservable: boolean;
    imageUrl?: string;
    nextAvailable?: string;
}
