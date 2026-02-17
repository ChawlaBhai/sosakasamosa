"use client";
import { useState } from 'react';
import { X, Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { createPlanEvent, PlanEvent } from '@/actions/plans';
import styles from './AddEventModal.module.css';

interface AddEventModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialDate?: string;
}

export default function AddEventModal({ isOpen, onClose, initialDate }: AddEventModalProps) {
    const [title, setTitle] = useState('');
    const [date, setDate] = useState(initialDate || new Date().toISOString().split('T')[0]);
    const [type, setType] = useState<PlanEvent['type']>('date');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await createPlanEvent({
                title,
                date,
                type,
            });
            onClose();
            setTitle('');
            // Reset date only if not passed as prop, but keeping it simple
        } catch (error) {
            console.error('Failed to create event:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <button className={styles.closeBtn} onClick={onClose}>
                    <X size={20} />
                </button>

                <h3 className={styles.title}>New Plan</h3>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label>What's happening?</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Dinner, Trip, etc."
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>When?</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Type</label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value as any)}
                        >
                            <option value="date">Date Night 🍷</option>
                            <option value="trip">Trip ✈️</option>
                            <option value="anniversary">Anniversary 💖</option>
                            <option value="birthday">Birthday 🎂</option>
                            <option value="finance">Finance 💰</option>
                            <option value="appointment">Appointment 🗓️</option>
                            <option value="other">Other ✨</option>
                        </select>
                    </div>

                    <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : 'Add to Calendar'}
                    </button>
                </form>
            </div>
        </div>
    );
}
