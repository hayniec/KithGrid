"use client";

import styles from "./local.module.css";
import { Utensils, Music, MapPin, Coffee, Pizza, Star, Navigation } from "lucide-react";

interface LocalSpot {
    id: string;
    name: string;
    type: string;
    category: "Restaurant" | "Activity";
    rating: number;
    distance: string;
    address: string;
    imagePlaceholderColor: string;
}

const MOCK_SPOTS: LocalSpot[] = [
    {
        id: "1",
        name: "Luigi's Trattoria",
        type: "Italian Restaurant",
        category: "Restaurant",
        rating: 4.9,
        distance: "0.5 miles",
        address: "123 Main St",
        imagePlaceholderColor: "#ef4444"
    },
    {
        id: "2",
        name: "The Daily Grind",
        type: "Coffee Shop",
        category: "Restaurant",
        rating: 4.7,
        distance: "0.8 miles",
        address: "456 Oak Ave",
        imagePlaceholderColor: "#8b5cf6"
    },
    {
        id: "3",
        name: "Riverwalk Park",
        type: "Park & Trails",
        category: "Activity",
        rating: 4.8,
        distance: "1.2 miles",
        address: "789 River Rd",
        imagePlaceholderColor: "#10b981"
    },
    {
        id: "4",
        name: "Bowl-a-Rama",
        type: "Bowling Alley",
        category: "Activity",
        rating: 4.5,
        distance: "2.5 miles",
        address: "321 Lane St",
        imagePlaceholderColor: "#f59e0b"
    },
    {
        id: "5",
        name: "Taco Haven",
        type: "Mexican Restaurant",
        category: "Restaurant",
        rating: 4.6,
        distance: "1.0 miles",
        address: "555 Spicy Way",
        imagePlaceholderColor: "#eab308"
    }
];

export default function LocalGuidePage() {
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.pageTitle}>Local Guide</h1>
                <p className={styles.pageSubtitle}>Discover the best local dining and activities near the neighborhood.</p>
            </div>

            <div className={styles.grid}>
                {MOCK_SPOTS.map((spot) => (
                    <div key={spot.id} className={styles.card}>
                        <div className={styles.imageHeader} style={{ backgroundColor: spot.imagePlaceholderColor }}>
                            {spot.category === 'Restaurant' ? <Utensils size={48} color="white" /> : <Music size={48} color="white" />}
                        </div>

                        <div className={styles.content}>
                            <div className={styles.typeRow}>
                                <span className={styles.typeBadge}>{spot.type}</span>
                                <div className={styles.rating}>
                                    <Star size={14} fill="currentColor" />
                                    {spot.rating}
                                </div>
                            </div>

                            <h3 className={styles.spotName}>{spot.name}</h3>

                            <div className={styles.infoRow}>
                                <MapPin size={16} />
                                <span>{spot.address}</span>
                            </div>

                            <div className={styles.infoRow}>
                                <Navigation size={16} />
                                <span>{spot.distance} away</span>
                            </div>

                            <button className={styles.visitButton}>
                                View Details
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
