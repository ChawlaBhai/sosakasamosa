"use client";
import React from 'react';
import { Film, Image as ImageIcon, Calendar, Wallet } from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';
import styles from './MobileTabbar.module.css';

export default function MobileTabbar() {
    const tabs = [
        { icon: Film, label: 'Stash', href: '#stash' },
        { icon: ImageIcon, label: 'Moments', href: '#moments' },
        { icon: Calendar, label: 'Plans', href: '#plans' },
        { icon: Wallet, label: 'Kaun Kitna', href: '#kaun-kitna' },
    ];

    return (
        <div className={clsx(styles.tabbar, "glass-nav")}>
            {tabs.map(({ icon: Icon, label, href }) => (
                <Link
                    key={label}
                    href={href}
                    className={styles.tab}
                >
                    <Icon size={20} strokeWidth={2} />
                    <span className={styles.label}>{label}</span>
                </Link>
            ))}
        </div>
    );
}
