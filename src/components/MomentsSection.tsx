"use client";
import { useState } from 'react';
import { Image as ImageIcon, Plus } from 'lucide-react';
import Link from 'next/link';
import styles from './MomentsSection.module.css';
import MomentCard from './MomentCard';
import AddMomentForm from './AddMomentForm';
import { Moment } from '@/actions/moments';

interface MomentsSectionProps {
    initialMoments?: Moment[];
}

const PREVIEW_COUNT = 4;

export default function MomentsSection({ initialMoments = [] }: MomentsSectionProps) {
    const [showForm, setShowForm] = useState(false);
    const allMoments = initialMoments;
    const sorted = [...allMoments].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    const previewMoments = sorted.slice(0, PREVIEW_COUNT);

    return (
        <section id="moments" className={styles.section}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <ImageIcon className={styles.icon} size={32} strokeWidth={1.5} />
                    <div className={styles.titleRow}>
                        <h2 className={styles.title}>Wall of Moments</h2>
                        <button
                            className={styles.addBtn}
                            onClick={() => setShowForm(!showForm)}
                            title="Add a new moment"
                        >
                            <Plus size={16} />
                        </button>
                    </div>
                    <p className={styles.subtitle}>chapters of us, pinned forever 📌</p>
                </div>

                {/* Collapsible Add Form — Modal overlay */}
                {showForm && (
                    <div className={styles.formOverlay} onClick={() => setShowForm(false)}>
                        <div className={styles.formModal} onClick={(e) => e.stopPropagation()}>
                            <button className={styles.closeFormBtn} onClick={() => setShowForm(false)}>×</button>
                            <AddMomentForm />
                        </div>
                    </div>
                )}

                {/* Preview Grid — up to 4 moments */}
                {previewMoments.length > 0 ? (
                    <div className={styles.previewGrid}>
                        {previewMoments.map((moment) => (
                            <div key={moment.id} className={styles.momentPreview}>
                                <MomentCard moment={moment} showConnector={false} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className={styles.emptyState}>
                        <p>No moments saved yet. Start making memories! 📷</p>
                    </div>
                )}

                {/* Always show View All — links to the full timeline page */}
                <div className={styles.viewAllWrapper}>
                    <Link href="/moments" className={styles.viewAllBtn}>
                        View All Moments →
                    </Link>
                </div>
            </div>
        </section>
    );
}
