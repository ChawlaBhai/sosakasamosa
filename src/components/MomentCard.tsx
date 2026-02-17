"use client";
import React from 'react';
import { Play } from 'lucide-react';
import styles from './MomentCard.module.css';
import clsx from 'clsx';

import { Moment } from '@/actions/moments';

export type MomentMedia = {
    id: string;
    type: 'image' | 'video';
    url: string;
    thumbnail?: string;
};

interface MomentCardProps {
    moment: Moment;
    align?: 'left' | 'right';
    showConnector?: boolean; // Only show connector on timeline page
    onClick?: () => void;
}

export default function MomentCard({ moment, align = 'left', showConnector = false, onClick }: MomentCardProps) {
    const rotation = React.useMemo(() => {
        let hash = 0;
        const str = moment.id || 'default';
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        return (Math.abs(hash) % 400) / 100 - 2;
    }, [moment.id]);

    return (
        <div
            className={clsx(
                styles.cardWrapper,
                showConnector && (align === 'right' ? styles.alignRight : styles.alignLeft)
            )}
            onClick={onClick}
        >
            {/* Timeline Connector — only on /moments page */}
            {showConnector && (
                <div className={clsx(styles.connector, align === 'right' ? styles.connectorRight : styles.connectorLeft)}>
                    <div className={styles.connectorDot}>❤️</div>
                </div>
            )}

            <div
                className={styles.card}
                style={{ transform: `rotate(${rotation}deg)` }}
            >
                <div className={styles.header}>
                    <h3 className={styles.title}>{moment.title}</h3>
                    <span className={styles.date}>{moment.date}</span>
                </div>

                {moment.description && (
                    <p className={styles.description}>{moment.description}</p>
                )}

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

                <div className={styles.tags}>
                    {(moment.tags || []).map(tag => (
                        <span key={tag} className={styles.tag}>{tag}</span>
                    ))}
                </div>
            </div>
        </div>
    );
}
