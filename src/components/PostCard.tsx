"use client";
import { Bookmark, Trash2 } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './PostCard.module.css';
import clsx from 'clsx';

import { Post } from '@/actions/stash';

declare global {
    interface Window {
        instgrm?: {
            Embeds: {
                process: () => void;
            };
        };
    }
}

interface PostCardProps {
    post: Post;
    onDelete?: (id: string) => void;
}

// Load Instagram embed.js once — returns promise
let igScriptPromise: Promise<void> | null = null;
function loadInstagramEmbed(): Promise<void> {
    if (igScriptPromise) return igScriptPromise;
    igScriptPromise = new Promise((resolve) => {
        if (window.instgrm) { resolve(); return; }
        const s = document.createElement('script');
        s.src = 'https://www.instagram.com/embed.js';
        s.async = true;
        s.onload = () => resolve();
        document.body.appendChild(s);
    });
    return igScriptPromise;
}

export default function PostCard({ post, onDelete }: PostCardProps) {
    const [isSaved, setIsSaved] = useState(true);
    const embedRef = useRef<HTMLDivElement>(null);
    const processed = useRef(false);

    useEffect(() => {
        const container = embedRef.current;
        if (!container || processed.current) return;

        // Clean URL
        let cleanUrl = post.url.trim().split('?')[0];
        if (!cleanUrl.endsWith('/')) cleanUrl += '/';

        // Create the blockquote element directly via DOM
        const blockquote = document.createElement('blockquote');
        blockquote.className = 'instagram-media';
        blockquote.setAttribute('data-instgrm-permalink', cleanUrl);
        blockquote.setAttribute('data-instgrm-version', '14');
        blockquote.style.cssText = 'background:#FFF; border:0; border-radius:3px; box-shadow:0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15); margin:0; padding:0; width:100%;';

        // Add placeholder content inside the blockquote
        const placeholder = document.createElement('div');
        placeholder.style.cssText = 'padding:16px;';
        placeholder.innerHTML = `<a href="${cleanUrl}" style="background:#FFFFFF;line-height:0;padding:0;text-align:center;text-decoration:none;width:100%;" target="_blank"><div style="display:flex;align-items:center;"><div style="background:#F4F4F4;border-radius:50%;height:40px;width:40px;margin-right:14px;"></div><div><div style="background:#F4F4F4;border-radius:4px;height:14px;width:100px;margin-bottom:6px;"></div><div style="background:#F4F4F4;border-radius:4px;height:14px;width:60px;"></div></div></div><div style="padding:19% 0;"></div><div style="padding-top:8px;"><div style="color:#3897f0;font-family:Arial,sans-serif;font-size:14px;font-weight:550;">View this post on Instagram</div></div></a>`;
        blockquote.appendChild(placeholder);

        // Clear and append
        container.innerHTML = '';
        container.appendChild(blockquote);
        processed.current = true;

        // Load script and process
        loadInstagramEmbed().then(() => {
            // Give the DOM a tick, then process
            setTimeout(() => {
                if (window.instgrm) window.instgrm.Embeds.process();
            }, 100);
            setTimeout(() => {
                if (window.instgrm) window.instgrm.Embeds.process();
            }, 1000);
            setTimeout(() => {
                if (window.instgrm) window.instgrm.Embeds.process();
            }, 3000);
        });

        return () => {
            processed.current = false;
        };
    }, [post.url]);

    return (
        <div className={styles.card}>
            {/* Instagram embed — created via DOM ref, not dangerouslySetInnerHTML */}
            <div ref={embedRef} className={styles.embedContainer} />

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
