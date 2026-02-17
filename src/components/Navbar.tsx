"use client";
import Link from 'next/link';
import { Menu } from 'lucide-react';
import clsx from 'clsx';
import styles from './Navbar.module.css';

export default function Navbar() {
    return (
        <nav className={clsx(styles.nav, "glass-nav")}>
            <Link href="/" className={styles.logo}>
                SoSaKaSamosa
            </Link>

            {/* Desktop Links */}
            <div className={styles.desktopLinks}>
                {['Stash', 'Moments', 'Plans', 'Kaun Kitna'].map((item) => (
                    <Link
                        key={item}
                        href={`#${item.toLowerCase().replace(' ', '-')}`}
                        className={styles.link}
                    >
                        {item}
                        <span className={styles.indicator}></span>
                    </Link>
                ))}
            </div>


        </nav>
    );
}
