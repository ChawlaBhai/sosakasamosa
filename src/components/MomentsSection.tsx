"use client";
import { Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import styles from './MomentsSection.module.css';
import AddMomentForm from './AddMomentForm';
import MomentCard from './MomentCard';
import { Moment } from '@/actions/moments';

interface MomentsSectionProps {
    initialMoments?: Moment[];
}

const PREVIEW_COUNT = 4;

export default function MomentsSection({ initialMoments = [] }: MomentsSectionProps) {
    const allMoments = initialMoments;
    // Show 4 most recent moments (sorted by date desc)
    const sorted = [...allMoments].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    const previewMoments = sorted.slice(0, PREVIEW_COUNT);
    const hasMore = allMoments.length > PREVIEW_COUNT;

    return (
        <section id="moments" className={styles.section}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <ImageIcon className={styles.icon} size={32} strokeWidth={1.5} />
                    <div className={styles.titleRow}>
                        <h2 className={styles.title}>Wall of Moments</h2>
                        <AddMomentForm />
                    </div>
                    <p className={styles.subtitle}>chapters of us, pinned forever 📌</p>
                </div>

                {/* Preview Grid — 4 most recent */}
                <div className={styles.previewGrid}>
                    {previewMoments.map((moment, index) => (
                        <MomentCard
                            key={moment.id}
                            moment={moment}
                            align={index % 2 === 0 ? 'left' : 'right'}
                        />
                    ))}
                </div>

                {previewMoments.length === 0 && (
                    <div className={styles.emptyState}>
                        <p>No moments saved yet. Start making memories! 📷</p>
                    </div>
                )}

                {/* View All */}
                {hasMore && (
                    <div className={styles.viewAllWrapper}>
                        <Link href="/moments" className={styles.viewAllBtn}>
                            View All Moments →
                        </Link>
                    </div>
                )}
            </div>
        </section>
    );
}
