"use client";
import React from 'react';
import { Coffee, ShoppingBag, Utensils, Zap, Car } from 'lucide-react';
import styles from './TransactionHistory.module.css';
import clsx from 'clsx';

import { Transaction } from '@/actions/transactions';

interface TransactionHistoryProps {
    transactions: Transaction[];
}

export default function TransactionHistory({ transactions }: TransactionHistoryProps) {

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'food': return <Coffee size={18} />;
            case 'groceries': return <ShoppingBag size={18} />;
            case 'bills': return <Zap size={18} />;
            case 'transport': return <Car size={18} />;
            default: return <Utensils size={18} />;
        }
    };

    return (
        <div className={styles.historyContainer}>
            <h4 className={styles.header}>Recent Splits</h4>

            <div className={styles.list}>
                {transactions.length === 0 ? (
                    <p className={styles.empty}>No expenses yet. Time for a date? 😉</p>
                ) : (
                    transactions.map(tx => (
                        <div key={tx.id} className={styles.item}>
                            <div className={styles.iconBox}>
                                {getCategoryIcon(tx.category)}
                            </div>
                            <div className={styles.details}>
                                <span className={styles.description}>{tx.description}</span>
                                <span className={styles.meta}>
                                    {tx.paid_by} paid • {new Date(tx.created_at || '').toLocaleDateString()}
                                </span>
                            </div>
                            <div className={styles.amount}>
                                ₹{tx.amount}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
