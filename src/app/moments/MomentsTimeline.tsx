"use client";
import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Image as ImageIcon, Heart, Images } from 'lucide-react';
import Link from 'next/link';
import MomentCard from '@/components/MomentCard';
import AddMomentForm from '@/components/AddMomentForm';
import MomentDetailModal from '@/components/MomentDetailModal';
import { Moment } from '@/actions/moments';
import styles from './moments.module.css';

const ITEMS_PER_PAGE = 20;

interface MomentsTimelineProps {
    initialMoments: Moment[];
}

export default function MomentsTimeline({ initialMoments }: MomentsTimelineProps) {
    const [selectedMoment, setSelectedMoment] = useState<Moment | null>(null);

    // Sort most recent first
    const sorted = [...initialMoments].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
    const loaderRef = useRef<HTMLDivElement>(null);

    const visibleMoments = sorted.slice(0, visibleCount);
    const hasMore = visibleCount < sorted.length;

    // Infinite scroll
    useEffect(() => {
        if (!loaderRef.current || !hasMore) return;
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setVisibleCount(prev => prev + ITEMS_PER_PAGE);
                }
            },
            { rootMargin: '300px' }
        );
        observer.observe(loaderRef.current);
        return () => observer.disconnect();
    }, [hasMore]);

    // Group moments by year
    const groupedByYear: Record<string, Moment[]> = {};
    visibleMoments.forEach(moment => {
        const year = new Date(moment.date).getFullYear().toString();
        if (!groupedByYear[year]) groupedByYear[year] = [];
        groupedByYear[year].push(moment);
    });

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                {/* Header */}
                <div className={styles.header}>
                    <Link href="/" className={styles.backLink}>
                        <ArrowLeft size={16} />
                        Back to Home
                    </Link>
                    <br />
                    <Images className={styles.icon} size={48} strokeWidth={1.5} />
                    <div className={styles.titleArea}>
                        <h1 className={styles.title}>Our Timeline</h1>
                    </div>
                    <p className={styles.subtitle}>chapters of us, pinned forever 📌</p>
                    <div className={styles.formWrapper}>
                        <AddMomentForm onMomentAdded={() => window.location.reload()} />
                    </div>
                </div>

                {/* Timeline */}
                <div className={styles.timeline}>
                    {/* Vertical line */}
                    <div className={styles.timelineLine} />

                    {(() => {
                        let globalIndex = 0;
                        return Object.entries(groupedByYear).map(([year, moments]) => (
                            <div key={year} className={styles.yearGroup}>
                                {/* Year marker */}
                                <div className={styles.yearMarker}>
                                    <Heart size={14} fill="var(--primary)" stroke="var(--accent)" />
                                    <span>{year}</span>
                                </div>

                                {/* Moments in this year */}
                                {moments.map((moment) => {
                                    const isLeft = globalIndex % 2 === 0;
                                    globalIndex++;

                                    return (
                                        <div
                                            key={moment.id}
                                            className={`${styles.timelineItem} ${isLeft ? styles.timelineLeft : styles.timelineRight}`}
                                        >
                                            <div className={styles.timelineDot}>❤️</div>
                                            <div className={styles.horizontalLine} />
                                            <div className={styles.cardContainer}>
                                                <MomentCard
                                                    moment={moment}
                                                    align={isLeft ? 'left' : 'right'}
                                                    onClick={() => setSelectedMoment(moment)}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ));
                    })()}
                </div>

                {/* Infinite scroll trigger */}
                {hasMore && (
                    <div ref={loaderRef} className={styles.loader}>
                        Loading more moments...
                    </div>
                )}

                {!hasMore && sorted.length > 0 && (
                    <div className={styles.endMessage}>
                        <span className={styles.endHeart}>💕</span>
                        <span>And so many more to come...</span>
                    </div>
                )}
            </div>

            {selectedMoment && (
                <MomentDetailModal
                    moment={selectedMoment}
                    onClose={() => setSelectedMoment(null)}
                />
            )}
        </div>
    );
}
