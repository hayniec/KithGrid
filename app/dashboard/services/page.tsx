"use client";

import { useState } from "react";
import styles from "./services.module.css";
import { Wrench, Phone, Star, User, Hammer, Trees, ShieldCheck } from "lucide-react";

interface ServiceProvider {
    id: string;
    name: string;
    category: string;
    phone: string;
    rating: number;
    recommendedBy: string;
    description: string;
}

const MOCK_PROVIDERS: ServiceProvider[] = [
    {
        id: "1",
        name: "Joe's Handyman Services",
        category: "Handyman",
        phone: "(555) 123-4567",
        rating: 4.8,
        recommendedBy: "Sarah Jenkins",
        description: "Fixed my fence and leaky faucet. Very reliable and fair pricing."
    },
    {
        id: "2",
        name: "Eco Tree Removal",
        category: "Tree Service",
        phone: "(555) 987-6543",
        rating: 5.0,
        recommendedBy: "Mike Chen",
        description: "Removed a large oak that was threatening my roof. Cleaned up everything perfectly."
    },
    {
        id: "3",
        name: "Top Tier Roofing",
        category: "Roofer",
        phone: "(555) 456-7890",
        rating: 4.5,
        recommendedBy: "HOA Board",
        description: "Preferred vendor for roof inspections and repairs."
    },
    {
        id: "4",
        name: "Green Thumb Landscaping",
        category: "Landscaping",
        phone: "(555) 222-3333",
        rating: 4.7,
        recommendedBy: "Emily R.",
        description: "Does the weekly mowing for half the cul-de-sac. Great work."
    }
];

export default function ServicesPage() {
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.pageTitle}>Service Recommendations</h1>
                <p className={styles.pageSubtitle}>Trusted professionals recommended by your neighbors.</p>
            </div>

            <div className={styles.grid}>
                {MOCK_PROVIDERS.map((provider) => (
                    <div key={provider.id} className={styles.card}>
                        <div className={styles.cardHeader}>
                            <div className={styles.iconWrapper}>
                                {provider.category === 'Handyman' && <Hammer size={24} />}
                                {provider.category === 'Tree Service' && <Trees size={24} />}
                                {provider.category === 'Roofer' && <ShieldCheck size={24} />}
                                {provider.category === 'Landscaping' && <Trees size={24} />}
                            </div>
                            <div className={styles.categoryBadge}>{provider.category}</div>
                        </div>

                        <h3 className={styles.providerName}>{provider.name}</h3>

                        <div className={styles.ratingRow}>
                            <div className={styles.stars}>
                                <Star size={16} fill="currentColor" className={styles.starIcon} />
                                <span>{provider.rating}</span>
                            </div>
                            <span className={styles.reviewCount}>(Verified)</span>
                        </div>

                        <p className={styles.description}>"{provider.description}"</p>

                        <div className={styles.footer}>
                            <div className={styles.recommendedBy}>
                                <User size={14} />
                                <span>Rec by {provider.recommendedBy}</span>
                            </div>
                            <a href={`tel:${provider.phone}`} className={styles.callButton}>
                                <Phone size={16} />
                                Call
                            </a>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
