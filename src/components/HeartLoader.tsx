"use client";
import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import styles from './HeartLoader.module.css';

export default function HeartLoader({ onComplete }: { onComplete?: () => void }) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            if (onComplete) onComplete();
        }, 2500); // 2.5s duration

        return () => clearTimeout(timer);
    }, [onComplete]);

    if (!isVisible) return null;

    return (
        <div className={styles.loaderContainer}>
            <div className={styles.HeartWrapper}>
                <Heart size={80} fill="#FFB3D4" stroke="black" strokeWidth={1.5} className={styles.pulse} />
            </div>
            <p className={styles.loadingText}>loading love...</p>
        </div>
    );
}
