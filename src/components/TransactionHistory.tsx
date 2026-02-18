"use client";
import React from 'react';
import { Coffee, ShoppingBag, Utensils, Zap, Car, Trash2, Loader2 } from 'lucide-react';
import styles from './TransactionHistory.module.css';
import { Transaction, deleteTransaction } from '@/actions/transactions';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface TransactionHistoryProps {
    transactions: Transaction[];
}

export default function TransactionHistory({ transactions }: TransactionHistoryProps) {
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const router = useRouter();

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this?')) {
            setDeletingId(id);
            try {
                await deleteTransaction(id);
                router.refresh();
            } catch (error) {
                console.error('Failed to delete', error);
                alert('Failed to delete transaction');
            } finally {
                setDeletingId(null);
            }
        }
    };

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
                    transactions.map(tx => {
                        const isFull = tx.description.includes('[FULL]');
                        const cleanDesc = tx.description.replace(' [FULL]', '');

                        return (
                            <div key={tx.id} className={styles.item}>
                                <div className={styles.iconBox}>
                                    {getCategoryIcon(tx.category)}
                                </div>
                                <div className={styles.details}>
                                    <span className={styles.description}>
                                        {cleanDesc}
                                        {isFull && <span className={styles.fullBadge}>FULL</span>}
                                    </span>
                                    <span className={styles.meta}>
                                        {tx.paid_by === 'Person A' ? 'Sahaj' : tx.paid_by === 'Person B' ? 'Somya' : tx.paid_by} paid • {new Date(tx.created_at || '').toLocaleDateString()}
                                    </span>
                                </div>
                                <div className={styles.rightSide}>
                                    <div className={styles.amount}>
                                        ₹{tx.amount}
                                    </div>
                                    <button
                                        className={styles.deleteBtn}
                                        onClick={() => handleDelete(tx.id)}
                                        disabled={deletingId === tx.id}
                                    >
                                        {deletingId === tx.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
