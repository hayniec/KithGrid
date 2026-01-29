export interface HoaDocument {
    id: string;
    name: string;
    category: 'Rules' | 'Financials' | 'Meeting Minutes' | 'Forms';
    uploadDate: string;
    size: string;
    url: string;
    uploaderName: string;
}
