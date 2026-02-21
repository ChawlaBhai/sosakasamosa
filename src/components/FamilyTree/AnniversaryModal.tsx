'use client';
import React, { useState } from 'react';
import { X, Heart, Save, Loader2 } from 'lucide-react';
import styles from './MemberEditModal.module.css'; // Reusing modal styles
import { FamilyMember, updateFamilyMember } from '@/actions/family';

interface AnniversaryModalProps {
    p1: FamilyMember;
    p2: FamilyMember;
    onClose: () => void;
    onUpdate: () => void;
}

export default function AnniversaryModal({ p1, p2, onClose, onUpdate }: AnniversaryModalProps) {
    const [date, setDate] = useState(p1.anniversary_date || '');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            // Update both partners with the same anniversary date
            await updateFamilyMember(p1.id, { anniversary_date: date });
            await updateFamilyMember(p2.id, { anniversary_date: date });
            onUpdate();
            onClose();
        } catch (error) {
            console.error(error);
            alert('Failed to update anniversary');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.header}>
                    <h3>Set Anniversary</h3>
                    <button onClick={onClose} className={styles.closeBtn}><X /></button>
                </div>

                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <p style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                        {p1.name} & {p2.name}
                    </p>
                    <Heart fill="#ff69b4" color="#ff69b4" size={32} style={{ margin: '10px auto' }} />
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label>Marriage Date</label>
                        <input
                            type="date"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            required
                        />
                    </div>

                    <div className={styles.actions} style={{ justifyContent: 'center' }}>
                        <button type="submit" className={styles.saveBtn} disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                            {isSubmitting ? " Saving..." : " Save Anniversary"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
