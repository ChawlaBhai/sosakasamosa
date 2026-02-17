"use client";
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import styles from './AddTransactionForm.module.css';

import { createTransaction } from '@/actions/transactions';
import { Loader2 } from 'lucide-react';

export default function AddTransactionForm() {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [paidBy, setPaidBy] = useState('Person A'); // Default, would come from user context
    const [splitType, setSplitType] = useState('equal');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!description || !amount) return;
        setIsSubmitting(true);

        try {
            await createTransaction({
                description,
                amount: parseFloat(amount),
                paid_by: paidBy,
                date: new Date().toLocaleDateString(), // Or add date input
                category: 'other', // Default or add selector
            });
            setDescription('');
            setAmount('');
            // Optional: Show success toast
        } catch (error) {
            console.error('Failed to add transaction:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form className={styles.formContainer} onSubmit={handleSubmit}>
            <h4 className={styles.header}>Add Expense</h4>

            <div className={styles.row}>
                <input
                    type="text"
                    placeholder="What was it for?"
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
                <div className={styles.selectGroup}>
                    <span className={styles.label}>Paid by</span>
                    <select
                        value={paidBy}
                        onChange={(e) => setPaidBy(e.target.value)}
                        className={styles.select}
                    >
                        <option value="Person A">Person A</option>
                        <option value="Person B">Person B</option>
                    </select>
                </div>

                <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                </button>
            </div>
        </form>
    );
}
