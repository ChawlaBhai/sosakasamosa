"use client";
import styles from './SkyBackground.module.css';

const Cloud1 = () => (
    <svg width="200" height="100" viewBox="0 0 200 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.cloudSvg}>
        <path d="M50 70C20 70 0 50 0 50C0 50 10 10 50 10C70 10 80 30 80 30C80 30 110 0 150 10C180 20 200 50 200 50C200 50 190 80 150 80C110 80 100 60 100 60C100 60 80 70 50 70Z" fill="white" fillOpacity="0.85" stroke="black" strokeWidth="1.5" />
    </svg>
);

const Cloud2 = () => (
    <svg width="150" height="80" viewBox="0 0 150 80" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.cloudSvg}>
        <path d="M40 60C10 60 0 40 0 40C0 40 10 10 40 10C60 10 70 25 70 25C70 25 100 0 130 10C150 20 150 40 150 40C150 40 140 70 110 70C80 70 80 50 80 50C80 50 60 60 40 60Z" fill="white" fillOpacity="0.7" stroke="black" strokeWidth="1.2" />
    </svg>
);

const Cloud3 = () => (
    <svg width="120" height="60" viewBox="0 0 120 60" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.cloudSvg}>
        <path d="M30 50C10 50 0 35 0 35C0 35 10 5 30 5C45 5 55 20 55 20C55 20 75 0 100 10C120 20 120 35 120 35C120 35 110 55 90 55C65 55 60 40 60 40C60 40 45 50 30 50Z" fill="white" fillOpacity="0.9" stroke="black" strokeWidth="1.5" />
    </svg>
);

export default function SkyBackground() {
    return (
        <div className={styles.skyContainer}>
            {/* Layer 1: Slow, big clouds */}
            <div className={styles.cloudLayer} style={{ animationDuration: '60s', top: '8%' }}>
                <div className={styles.cloudWrapper}><Cloud1 /></div>
            </div>
            <div className={styles.cloudLayer} style={{ animationDuration: '55s', top: '15%', animationDelay: '-30s' }}>
                <div className={styles.cloudWrapper}><Cloud1 /></div>
            </div>

            {/* Layer 2: Medium speed */}
            <div className={styles.cloudLayer} style={{ animationDuration: '40s', top: '35%' }}>
                <div className={styles.cloudWrapper}><Cloud2 /></div>
            </div>
            <div className={styles.cloudLayer} style={{ animationDuration: '38s', top: '45%', animationDelay: '-20s' }}>
                <div className={styles.cloudWrapper}><Cloud2 /></div>
            </div>

            {/* Layer 3: Fast, small clouds */}
            <div className={styles.cloudLayer} style={{ animationDuration: '28s', top: '65%' }}>
                <div className={styles.cloudWrapper}><Cloud3 /></div>
            </div>
            <div className={styles.cloudLayer} style={{ animationDuration: '25s', top: '75%', animationDelay: '-12s' }}>
                <div className={styles.cloudWrapper}><Cloud3 /></div>
            </div>

            {/* Layer 4: Background scattered */}
            <div className={styles.cloudLayer} style={{ animationDuration: '50s', top: '88%', animationDelay: '-25s' }}>
                <div className={styles.cloudWrapper}><Cloud2 /></div>
            </div>
        </div>
    );
}
