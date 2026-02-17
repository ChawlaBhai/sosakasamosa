"use client";
import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Image as ImageIcon, Heart } from 'lucide-react';
import Link from 'next/link';
import MomentCard from '@/components/MomentCard';
import AddMomentForm from '@/components/AddMomentForm';
import { Moment } from '@/actions/moments';
import styles from './moments.module.css';

const ITEMS_PER_PAGE = 20;

interface MomentsTimelineProps {
    initialMoments: Moment[];
}

export default function MomentsTimeline({ initialMoments }: MomentsTimelineProps) {
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
                    <Link href="/#moments" className={styles.backLink}>
                        <ArrowLeft size={18} />
                        <span>Back</span>
                    </Link>
                    <div className={styles.titleArea}>
                        <ImageIcon className={styles.icon} size={28} strokeWidth={1.5} />
                        <h1 className={styles.title}>Our Timeline</h1>
                    </div>
                    <p className={styles.subtitle}>
                        every chapter, from the very first page 💕
                    </p>
                    <div className={styles.formWrapper}>
                        <AddMomentForm />
                    </div>
                </div>

                {/* Timeline */}
                <div className={styles.timeline}>
                    {/* Vertical line */}
                    <div className={styles.timelineLine} />

                    {Object.entries(groupedByYear).map(([year, moments]) => (
                        <div key={year} className={styles.yearGroup}>
                            {/* Year marker */}
                            <div className={styles.yearMarker}>
                                <Heart size={14} fill="var(--primary)" stroke="var(--accent)" />
                                <span>{year}</span>
                            </div>

                            {/* Moments in this year */}
                            {moments.map((moment, index) => (
                                <div
                                    key={moment.id}
                                    className={`${styles.timelineItem} ${index % 2 === 0 ? styles.timelineLeft : styles.timelineRight}`}
                                >
                                    {/* Connector dot */}
                                    <div className={styles.timelineDot}>❤️</div>

                                    {/* Date badge */}
                                    <div className={styles.dateBadge}>
                                        {new Date(moment.date).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </div>

                                    {/* Moment card */}
                                    <MomentCard
                                        moment={moment}
                                        align={index % 2 === 0 ? 'left' : 'right'}
                                    />
                                </div>
                            ))}
                        </div>
                    ))}
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
        </div>
    );
}
