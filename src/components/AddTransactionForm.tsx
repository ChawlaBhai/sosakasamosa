"use client";
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import styles from './AddTransactionForm.module.css';

import { createTransaction } from '@/actions/transactions';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AddTransactionForm() {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [paidBy, setPaidBy] = useState('Sahaj'); // Default
    const [splitType, setSplitType] = useState('equal'); // 'equal' or 'full'
    const [forWho, setForWho] = useState('Somya'); // For Full split: who is it for?
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!description || !amount) return;
        setIsSubmitting(true);

        try {
            let finalDesc = description;

            // If it's a "Full" expense (Gift/Settlement), append [FULL] tag
            if (splitType === 'full') {
                finalDesc = `${description} [FULL]`;
            }

            await createTransaction({
                description: finalDesc,
                amount: parseFloat(amount),
                paid_by: paidBy,
                date: new Date().toLocaleDateString(),
                category: 'other',
            });
            setDescription('');
            setAmount('');
            router.refresh();
            // Optional: Show success toast
        } catch (error) {
            console.error('Failed to add transaction:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Auto-set "For Who" based on "Paid By" to avoid "Sahaj paid for Sahaj"
    const handlePaidByChange = (val: string) => {
        setPaidBy(val);
        setForWho(val === 'Sahaj' ? 'Somya' : 'Sahaj');
    };

    return (
        <form className={styles.formContainer} onSubmit={handleSubmit}>
            <h4 className={styles.header}>Add Expense</h4>

            <div className={styles.row}>
                <input
                    type="text"
                    placeholder="Moment..."
                    className={styles.input}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                />
                <input
                    type="number"
                    placeholder="₹0"
                    className={styles.amountInput}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                />
            </div>

            <div className={styles.optionsRow}>
                {/* Paid By */}
                <div className={styles.selectGroup}>
                    <span className={styles.label}>Paid by</span>
                    <select
                        value={paidBy}
                        onChange={(e) => handlePaidByChange(e.target.value)}
                        className={styles.select}
                    >
                        <option value="Sahaj">Sahaj</option>
                        <option value="Somya">Somya</option>
                    </select>
                </div>

                {/* Split Type Toggle */}
                <div className={styles.splitToggle}>
                    <button
                        type="button"
                        className={`${styles.toggleBtn} ${splitType === 'equal' ? styles.active : ''}`}
                        onClick={() => setSplitType('equal')}
                    >
                        Split ½
                    </button>
                    <button
                        type="button"
                        className={`${styles.toggleBtn} ${splitType === 'full' ? styles.active : ''}`}
                        onClick={() => setSplitType('full')}
                    >
                        For {paidBy === 'Sahaj' ? 'Somya' : 'Sahaj'}
                    </button>
                </div>

                <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                </button>
            </div>
        </form>
    );
}
