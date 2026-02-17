"use client";
import React from 'react';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import styles from './BalanceHero.module.css';
import clsx from 'clsx';

interface BalanceHeroProps {
    personA: string;
    personB: string;
    balance: number; // positive = B owes A, negative = A owes B
    onSettleUp?: () => void;
    onAddTransaction?: () => void;
}

export default function BalanceHero({
    personA,
    personB,
    balance,
    onSettleUp,
    onAddTransaction
}: BalanceHeroProps) {

    const isSettled = balance === 0;
    const debtor = balance > 0 ? personB : personA;
    const creditor = balance > 0 ? personA : personB;
    const amount = Math.abs(balance);

    // Format currency (assuming INR as per brief)
    const formattedAmount = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);

    return (
        <div className={styles.heroCard}>
            <div className={styles.header}>
                <h3 className={styles.title}>Who Owes Whom</h3>
            </div>

            <div className={styles.balanceDisplay}>
                <div className={styles.people}>
                    <div className={styles.person}>
                        <div className={styles.avatar}>{personA.charAt(0)}</div>
                        <span className={styles.name}>{personA}</span>
                    </div>

                    <div className={styles.person}>
                        <div className={styles.avatar}>{personB.charAt(0)}</div>
                        <span className={styles.name}>{personB}</span>
                    </div>
                </div>

                {isSettled ? (
                    <div className={styles.settledState}>
                        <span className={styles.settledText}>You're all square! 🎉</span>
                    </div>
                ) : (
                    <div className={styles.debtVariable}>
                        <div className={clsx(styles.arrowContainer, balance < 0 ? styles.arrowLeft : styles.arrowRight)}>
                            {balance < 0 ? <ArrowLeft /> : <ArrowRight />}
                            <span className={styles.amount}>{formattedAmount}</span>
                        </div>
                        <p className={styles.summaryText}>
                            <span className={styles.highlight}>{debtor}</span> owes <span className={styles.highlight}>{creditor}</span>
                        </p>
                    </div>
                )}
            </div>

            <div className={styles.actions}>
                {!isSettled && (
                    <button className={styles.settleBtn} onClick={onSettleUp}>
                        <Check size={16} /> Settle Up
                    </button>
                )}
                <button className={styles.addBtn} onClick={onAddTransaction}>
                    Add Transaction +
                </button>
            </div>
        </div>
    );
}
