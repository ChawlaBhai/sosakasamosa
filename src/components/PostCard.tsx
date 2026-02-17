"use client";
import { Bookmark, Trash2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
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

// Load Instagram embed.js once globally — returns a promise
let igScriptPromise: Promise<void> | null = null;
function loadInstagramScript(): Promise<void> {
    if (igScriptPromise) return igScriptPromise;
    igScriptPromise = new Promise((resolve) => {
        // Check if already loaded
        if (window.instgrm) {
            resolve();
            return;
        }
        const script = document.createElement('script');
        script.src = 'https://www.instagram.com/embed.js';
        script.async = true;
        script.onload = () => {
            resolve();
        };
        document.body.appendChild(script);
    });
    return igScriptPromise;
}

function processEmbeds() {
    if (window.instgrm) {
        window.instgrm.Embeds.process();
    }
}

function getEmbedHtml(url: string): string {
    let cleanUrl = url.trim().split('?')[0];
    if (!cleanUrl.endsWith('/')) cleanUrl += '/';
    const embedLink = `${cleanUrl}?utm_source=ig_embed&utm_campaign=loading`;

    return `<blockquote class="instagram-media" data-instgrm-captioned data-instgrm-permalink="${embedLink}" data-instgrm-version="14" style="background:#FFF; border:0; border-radius:3px; box-shadow:0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15); margin:0; max-width:540px; min-width:200px; padding:0; width:100%;"><div style="padding:16px;"><a href="${embedLink}" style="background:#FFFFFF; line-height:0; padding:0; text-align:center; text-decoration:none; width:100%;" target="_blank"><div style="display:flex;align-items:center;"><div style="background-color:#F4F4F4;border-radius:50%;height:40px;margin-right:14px;width:40px;"></div><div style="display:flex;flex-direction:column;flex-grow:1;justify-content:center;"><div style="background-color:#F4F4F4;border-radius:4px;height:14px;margin-bottom:6px;width:100px;"></div><div style="background-color:#F4F4F4;border-radius:4px;height:14px;width:60px;"></div></div></div><div style="padding:19% 0;"></div><div style="display:block;height:50px;margin:0 auto 12px;width:50px;"><svg width="50px" height="50px" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><g stroke="none" fill="none" fill-rule="evenodd"><g transform="translate(-511,-20)" fill="#000"><path d="M556.869,30.41 C554.814,30.41 553.148,32.076 553.148,34.131 C553.148,36.186 554.814,37.852 556.869,37.852 C558.924,37.852 560.59,36.186 560.59,34.131 C560.59,32.076 558.924,30.41 556.869,30.41 M541,60.657 C535.114,60.657 530.342,55.887 530.342,50 C530.342,44.114 535.114,39.342 541,39.342 C546.887,39.342 551.658,44.114 551.658,50 C551.658,55.887 546.887,60.657 541,60.657 M541,33.886 C532.1,33.886 524.886,41.1 524.886,50 C524.886,58.899 532.1,66.113 541,66.113 C549.9,66.113 557.115,58.899 557.115,50 C557.115,41.1 549.9,33.886 541,33.886"></path></g></g></svg></div><div style="padding-top:8px;"><div style="color:#3897f0;font-family:Arial,sans-serif;font-size:14px;font-weight:550;line-height:18px;">View this post on Instagram</div></div></a></div></blockquote>`;
}

export default function PostCard({ post, onDelete }: PostCardProps) {
    const [isSaved, setIsSaved] = useState(true);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadInstagramScript().then(() => {
            // Instagram script loaded — process embeds with retries
            processEmbeds();
            // Retry a few times since the script can be slow to fully initialize
            const t1 = setTimeout(processEmbeds, 500);
            const t2 = setTimeout(processEmbeds, 1500);
            const t3 = setTimeout(processEmbeds, 3000);
            return () => {
                clearTimeout(t1);
                clearTimeout(t2);
                clearTimeout(t3);
            };
        });
    }, [post.url]);

    const isInstagram = post.url.includes('instagram.com');

    return (
        <div className={styles.card}>
            {/* Instagram embed via blockquote */}
            <div
                className={styles.embedContainer}
                ref={containerRef}
                dangerouslySetInnerHTML={{ __html: getEmbedHtml(post.url) }}
            />

            {/* Card Footer */}
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
                <div className={styles.bottomRow}>
                    <span className={styles.meta}>
                        by <strong>{post.saved_by}</strong> • {new Date(post.created_at).toLocaleDateString()}
                    </span>
                </div>
            </div>
        </div>
    );
}
