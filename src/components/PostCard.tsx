"use client";
import { Bookmark, Trash2, ExternalLink, Play } from 'lucide-react';
import { useState } from 'react';
import styles from './PostCard.module.css';
import clsx from 'clsx';

import { Post } from '@/actions/stash';

interface PostCardProps {
    post: Post;
    onDelete?: (id: string) => void;
}

function getPlatform(url: string) {
    if (url.includes('instagram.com')) return 'instagram';
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
    return 'other';
}

function getReelCode(url: string) {
    const match = url.match(/\/(reel|p|shorts)\/([^/?]+)/);
    return match ? match[2].slice(0, 11) : '';
}

export default function PostCard({ post, onDelete }: PostCardProps) {
    const [isSaved, setIsSaved] = useState(true);
    const platform = getPlatform(post.url);
    const code = getReelCode(post.url);

    return (
        <div className={styles.card}>
            {/* Reel-style preview */}
            <a
                href={post.url}
                target="_blank"
                rel="noopener noreferrer"
                className={clsx(styles.preview, styles[platform])}
            >
                {/* Top bar */}
                <div className={styles.topBar}>
                    <div className={styles.platformPill}>
                        {platform === 'instagram' && (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                            </svg>
                        )}
                        {platform === 'youtube' && (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                            </svg>
                        )}
                        <span>{platform === 'instagram' ? 'Reel' : platform === 'youtube' ? 'Short' : 'Link'}</span>
                    </div>
                    {code && <span className={styles.codeBadge}>/{code}</span>}
                </div>

                {/* Center play */}
                <div className={styles.playArea}>
                    <div className={styles.playBtn}>
                        <Play size={24} fill="white" strokeWidth={0} />
                    </div>
                    <span className={styles.tapLabel}>Tap to watch</span>
                </div>

                {/* Bottom bar */}
                <div className={styles.bottomBar}>
                    <ExternalLink size={12} />
                    <span>Opens in {platform === 'instagram' ? 'Instagram' : platform === 'youtube' ? 'YouTube' : 'browser'}</span>
                </div>
            </a>

            {/* Footer */}
            <div className={styles.footer}>
                <div className={styles.topRow}>
                    <span className={styles.category}>{post.category}</span>
                    <div className={styles.actions}>
                        <button
                            onClick={() => setIsSaved(!isSaved)}
                            className={clsx(styles.actionBtn, isSaved && styles.active)}
                        >
                            <Bookmark size={14} fill={isSaved ? "currentColor" : "none"} />
                        </button>
                        <button
                            onClick={() => onDelete?.(post.id)}
                            className={clsx(styles.actionBtn, styles.delete)}
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                </div>
                <span className={styles.meta}>
                    by <strong>{post.saved_by}</strong> • {new Date(post.created_at).toLocaleDateString()}
                </span>
            </div>
        </div>
    );
}
