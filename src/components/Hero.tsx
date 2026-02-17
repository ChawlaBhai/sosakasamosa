"use client";
import { useEffect, useState, useRef } from 'react';
import { Heart, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import styles from './Hero.module.css';
import clsx from 'clsx';

export default function Hero() {
    const [isPlaying, setIsPlaying] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    const togglePlay = () => {
        if (!videoRef.current) return;

        if (isPlaying) {
            videoRef.current.pause();
        } else {
            videoRef.current.play();
            videoRef.current.muted = false; // Unmute when playing
        }
        setIsPlaying(!isPlaying);
    };

    return (
        <section className={styles.section}>
            {/* Header / Brand */}
            <div className={styles.header}>
                <h1 className={styles.brandTitle}>
                    <span className={styles.wordBold} style={{ animationDelay: '0s' }}>Sosa</span>
                    <span className={styles.wordScript} style={{ animationDelay: '0.3s' }}>ka</span>
                    <span className={styles.wordBold} style={{ animationDelay: '0.6s' }}>Samosa</span>
                </h1>
                <p className={styles.brandSubtitle}>our little world 🌍</p>
            </div>

            {/* Decorated Video Container */}
            <div className={styles.videoWrapper}>
                <div className={styles.videoFrame}>
                    <video
                        ref={videoRef}
                        src="/sosa.mp4"
                        className={styles.video}
                        loop
                        playsInline
                    // No autoPlay, starts paused
                    />

                    {/* Overlay Play Button */}
                    {!isPlaying && (
                        <div className={styles.playOverlay} onClick={togglePlay}>
                            <div className={styles.playBtn}>
                                <Play size={32} fill="currentColor" />
                            </div>
                            <span className={styles.playText}>play our loading screen</span>
                        </div>
                    )}
                </div>

                {/* Controls (visible when playing) */}
                {isPlaying && (
                    <button className={styles.controlBtn} onClick={togglePlay}>
                        <Pause size={20} fill="currentColor" />
                    </button>
                )}

                {/* Decorative Stickers */}
                <span className={clsx(styles.sticker, styles.sticker1)}>✨</span>
                <span className={clsx(styles.sticker, styles.sticker2)}>💖</span>
                <span className={clsx(styles.sticker, styles.sticker3)}>🌸</span>
            </div>

            {/* Bottom Scroller */}
            <div className={styles.scrollHint}>
                <span>scroll to explore</span>
                <div className={styles.arrow}>↓</div>
            </div>
        </section>
    );
}

