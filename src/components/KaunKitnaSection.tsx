"use client";
import React, { useState } from 'react';
import { Wallet } from 'lucide-react';
import styles from './KaunKitnaSection.module.css';
import BalanceHero from './BalanceHero';
import AddTransactionForm from './AddTransactionForm';
import TransactionHistory from './TransactionHistory';
import { Transaction, createTransaction } from '@/actions/transactions';

interface KaunKitnaSectionProps {
    initialTransactions?: Transaction[];
    initialBalance?: number;
}

const DUMMY_TRANSACTIONS: Transaction[] = [
    { id: '1', description: 'Dinner @ Burma Burma', amount: 1800, paid_by: 'Sahaj', date: 'Yesterday', category: 'food', created_at: '' },
    { id: '2', description: 'Movie Tickets', amount: 900, paid_by: 'Somya', date: '2 days ago', category: 'other', created_at: '' },
];

export default function KaunKitnaSection({ initialTransactions = [], initialBalance = 0 }: KaunKitnaSectionProps) {
    const transactions = initialTransactions.length > 0 ? initialTransactions : DUMMY_TRANSACTIONS;
    const balance = initialTransactions.length > 0 ? initialBalance : 0;

    const [isSettling, setIsSettling] = useState(false);

    const handleSettleUp = async () => {
        if (!confirm('Are you sure you want to settle all debts?')) return;
        setIsSettling(true);
        try {
            // Determine who owes whom based on balance
            // balance > 0 : Somya owes Sahaj. Somya pays Sahaj.
            // balance < 0 : Sahaj owes Somya. Sahaj pays Somya.
            const amount = Math.abs(balance);
            if (amount === 0) return;

            const payer = balance > 0 ? 'Somya' : 'Sahaj';
            const description = `Settlement [FULL]`;

            await createTransaction({
                description,
                amount,
                paid_by: payer,
                date: new Date().toLocaleDateString(),
                category: 'bills'
            });

        } catch (e) {
            console.error(e);
            alert('Failed to settle up');
        } finally {
            setIsSettling(false);
        }
    };

    return (
        <section id="kaun-kitna" className={styles.section}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <Wallet className={styles.icon} size={32} strokeWidth={1.5} />
                    <h2 className={styles.title}>Kaun Kisko Kitna</h2>
                    <p className={styles.subtitle}>love is free. samosa isn't. 🫶</p>
                </div>

                <div className={styles.content}>
                    <BalanceHero
                        personA="Sahaj"
                        personB="Somya"
                        balance={balance}
                        onSettleUp={handleSettleUp}
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
