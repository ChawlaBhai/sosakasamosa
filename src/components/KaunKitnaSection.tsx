"use client";
import React, { useState } from 'react';
import { Wallet } from 'lucide-react';
import styles from './KaunKitnaSection.module.css';
import BalanceHero from './BalanceHero';
import AddTransactionForm from './AddTransactionForm';
import TransactionHistory from './TransactionHistory';
import { Transaction, deleteTransaction } from '@/actions/transactions';

interface KaunKitnaSectionProps {
    initialTransactions?: Transaction[];
    initialBalance?: number;
}

const DUMMY_TRANSACTIONS: Transaction[] = [
    { id: '1', description: 'Dinner @ Burma Burma', amount: 1800, paid_by: 'Person A', date: 'Yesterday', category: 'food', created_at: '' },
    { id: '2', description: 'Movie Tickets', amount: 900, paid_by: 'Person B', date: '2 days ago', category: 'other', created_at: '' },
    // ...
];

export default function KaunKitnaSection({ initialTransactions = [], initialBalance = 0 }: KaunKitnaSectionProps) {
    const transactions = initialTransactions.length > 0 ? initialTransactions : DUMMY_TRANSACTIONS;
    const balance = initialTransactions.length > 0 ? initialBalance : 1500; // Fallback dummy balance

    return (
        <section id="kaun-kitna" className={styles.section}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <Wallet className={styles.icon} size={32} strokeWidth={1.5} />
                    <h2 className={styles.title}>Kaun Kitna</h2>
                    <p className={styles.subtitle}>love is free. samosa isn't. 🫶</p>
                </div>

                <div className={styles.content}>
                    <BalanceHero
                        personA="Sadhu"
                        personB="Sosa"
                        balance={balance}
                    />

                    <div className={styles.trackerArea}>
                        <div className={styles.formWrapper}>
                            <AddTransactionForm />
                        </div>
                        <div className={styles.historyWrapper}>
                            <TransactionHistory transactions={transactions} />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
