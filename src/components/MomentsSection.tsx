"use client";
import { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import styles from './MomentsSection.module.css';
import AddMomentForm from './AddMomentForm';
import MomentCard from './MomentCard';
import { Moment, deleteMoment } from '@/actions/moments';
import clsx from 'clsx';

interface MomentsSectionProps {
    initialMoments?: Moment[];
}

const DUMMY_MOMENTS: Moment[] = [
    {
        id: '1',
        title: 'First Coffee Date ☕️',
        date: '2023-10-12',
        description: 'The day we realized we both obsess over oat milk lattes. You wore that green sweater.',
        media_urls: [
            { id: 'm1', type: 'image', url: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?q=80&w=300&auto=format&fit=crop' },
            { id: 'm2', type: 'image', url: 'https://images.unsplash.com/photo-1726064823617-683e375264b3?q=80&w=300&auto=format&fit=crop' }
        ],
        tags: ['Firsts', 'Date Night'],
        created_at: new Date().toISOString()
    },
];

const ITEMS_PER_PAGE = 6;

export default function MomentsSection({ initialMoments = [] }: MomentsSectionProps) {
    const allMoments = initialMoments.length > 0 ? initialMoments : DUMMY_MOMENTS;
    const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

    const visibleMoments = allMoments.slice(0, visibleCount);
    const hasMore = visibleCount < allMoments.length;

    const loadMore = () => {
        setVisibleCount(prev => prev + ITEMS_PER_PAGE);
    };

    return (
        <section id="moments" className={styles.section}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <ImageIcon className={styles.icon} size={32} strokeWidth={1.5} />
                    <h2 className={styles.title}>Wall of Moments</h2>
                    <p className={styles.subtitle}>chapters of us, pinned forever 📌</p>
                </div>

                {/* Add New Form */}
                <div className={styles.formWrapper}>
                    <AddMomentForm />
                </div>

                {/* Wall Grid */}
                <div className={styles.wallGrid}>
                    {visibleMoments.map((moment, index) => (
                        <MomentCard
                            key={moment.id}
                            moment={moment}
                            align={index % 2 === 0 ? 'left' : 'right'}
                        />
                    ))}
                </div>

                {hasMore && (
                    <div className={styles.loadMoreWrapper}>
                        <button className={styles.loadMoreBtn} onClick={loadMore}>
                            Load More Moments ✨
                        </button>
                    </div>
                )}

                {!hasMore && allMoments.length > 0 && (
                    <div className={styles.endMessage}>
                        <span>And so many more to come... 💕</span>
                    </div>
                )}
            </div>
        </section>
    );
}
