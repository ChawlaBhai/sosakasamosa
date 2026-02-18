"use client";
import { useState } from 'react';
import { Image as ImageIcon, Plus, Images } from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';
import styles from './MomentsSection.module.css';
import MomentCard from './MomentCard';
import AddMomentForm from './AddMomentForm';
import MomentDetailModal from './MomentDetailModal';
import { Moment } from '@/actions/moments';

interface MomentsSectionProps {
    initialMoments?: Moment[];
}

const PREVIEW_COUNT = 4;

export default function MomentsSection({ initialMoments = [] }: MomentsSectionProps) {
    const [showForm, setShowForm] = useState(false);
    const [selectedMoment, setSelectedMoment] = useState<Moment | null>(null);
    const allMoments = initialMoments;
    const sorted = [...allMoments].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    const previewMoments = sorted.slice(0, PREVIEW_COUNT);

    return (
        <section id="moments" className={styles.section}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <Images className={styles.icon} size={32} strokeWidth={1.5} />
                    <div className={styles.titleRow}>
                        <h2 className={styles.title}>Wall of Moments</h2>
                        <Link href="/moments" className={styles.addBtn} title="Add Moment">
                            +
                        </Link>
                    </div>
                    <p className={styles.subtitle}>chapters of us, pinned forever 📌</p>
                </div>

                {/* Collapsible Add Form — Modal overlay */}
                {showForm && (
                    <div className={styles.formOverlay} onClick={() => setShowForm(false)}>
                        <div className={styles.formModal} onClick={(e) => e.stopPropagation()}>
                            <button className={styles.closeFormBtn} onClick={() => setShowForm(false)}>×</button>
                            <AddMomentForm onMomentAdded={() => setShowForm(false)} />
                        </div>
                    </div>
                )}

                {/* Vertical Connected Timeline */}
                {previewMoments.length > 0 ? (
                    <div className={styles.timelineContainer}>
                        <div className={styles.timelineLine} />
                        {previewMoments.map((moment, index) => (
                            <div
                                key={moment.id}
                                className={clsx(
                                    styles.timelineItem,
                                    index % 2 === 0 ? styles.timelineLeft : styles.timelineRight
                                )}
                            >
                                <div className={styles.timelineDot}>❤️</div>
                                <div className={styles.horizontalLine} />
                                <div className={styles.cardContainer}>
                                    <MomentCard
                                        moment={moment}
                                        showConnector={false}
                                        onClick={() => setSelectedMoment(moment)}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className={styles.emptyState}>
                        <p>No moments saved yet. Start making memories! 📷</p>
                    </div>
                )}

                {/* View All — links to the full timeline page */}
                <div className={styles.viewAllWrapper}>
                    <Link href="/moments" className={styles.viewAllBtn}>
                        View All Moments →
                    </Link>
                </div>
            </div>

            {selectedMoment && (
                <MomentDetailModal
                    moment={selectedMoment}
                    onClose={() => setSelectedMoment(null)}
                />
            )}
        </section>
    );
}

