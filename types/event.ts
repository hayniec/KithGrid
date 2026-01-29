export interface Event {
    id: string;
    title: string;
    description: string;
    date: string; // ISO date string YYYY-MM-DD
    time: string;
    location: string;
    category: 'Social' | 'HOA' | 'Maintenance' | 'Security';
    organizer: string;
    attendees: number;
}
