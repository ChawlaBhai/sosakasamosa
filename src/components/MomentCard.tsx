"use client";
import React, { useState } from 'react';
import { Play } from 'lucide-react';
import styles from './MomentCard.module.css';
import clsx from 'clsx';

import { Moment } from '@/actions/moments';

export type MomentMedia = {
    id: string;
    type: 'image' | 'video';
    url: string;
    thumbnail?: string; // for videos
};

interface MomentCardProps {
    moment: Moment;
    align?: 'left' | 'right';
    onClick?: () => void;
}

export default function MomentCard({ moment, align = 'left', onClick }: MomentCardProps) {
    // Deterministic rotation based on ID to avoid hydration mismatch
    // (Math.random() causes server/client mismatch)
    const rotation = React.useMemo(() => {
        let hash = 0;
        const str = moment.id || 'default';
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        // Map to range -2 to 2 roughly
        return (Math.abs(hash) % 400) / 100 - 2;
    }, [moment.id]);

    return (
        <div
            className={clsx(styles.cardWrapper, align === 'right' ? styles.alignRight : styles.alignLeft)}
            onClick={onClick}
        >
            {/* The Connector Dot */}
            <div className={clsx(styles.connector, align === 'right' ? styles.connectorRight : styles.connectorLeft)}>
                <div className={styles.connectorDot}>❤️</div>
            </div>

            <div
                className={styles.card}
                style={{ transform: `rotate(${rotation}deg)` }}
            >
                {/* Title & Date */}
                <div className={styles.header}>
                    <h3 className={styles.title}>{moment.title}</h3>
                    <span className={styles.date}>{moment.date}</span>
                </div>

                {/* Description */}
                {moment.description && (
                    <p className={styles.description}>{moment.description}</p>
                )}

                {/* Media Strip */}
                <div className={styles.mediaStrip}>
                    {(moment.media_urls as unknown as MomentMedia[] || []).slice(0, 3).map((item, index) => (
                        <div key={item.id || index} className={styles.mediaItem}>
                            <img
                                src={item.type === 'video' ? (item.thumbnail || item.url) : item.url}
                                alt={moment.title}
                                className={styles.mediaThumb}
                            />
                            {item.type === 'video' && (
                                <div className={styles.playOverlay}>
                                    <Play size={20} fill="white" />
                                </div>
                            )}
                        </div>
                    ))}
                    {(moment.media_urls as unknown as MomentMedia[] || []).length > 3 && (
                        <div className={styles.moreMedia}>
                            <span>+{(moment.media_urls as unknown as MomentMedia[] || []).length - 3} more →</span>
                        </div>
                    )}
                </div>

                {/* Tags */}
                <div className={styles.tags}>
                    {(moment.tags || []).map(tag => (
                        <span key={tag} className={styles.tag}>{tag}</span>
                    ))}
                </div>
            </div>
        </div>
    );
}
