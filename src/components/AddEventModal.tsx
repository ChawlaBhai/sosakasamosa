"use client";
import React, { useState } from 'react';
import { X, Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { createPlanEvent, updatePlanEvent, PlanEvent } from '@/actions/plans';
import styles from './AddEventModal.module.css';

interface AddEventModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialDate?: string;
    eventToEdit?: PlanEvent | null;
}

export default function AddEventModal({ isOpen, onClose, initialDate, eventToEdit }: AddEventModalProps) {
    const [title, setTitle] = useState(eventToEdit?.title || '');
    const [date, setDate] = useState(eventToEdit?.date || initialDate || new Date().toISOString().split('T')[0]);
    const [type, setType] = useState<PlanEvent['type']>(eventToEdit?.type || 'date');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reset state when opening/closing or switching event
    // simple effect to sync local state with props when they change
    React.useEffect(() => {
        if (isOpen) {
            setTitle(eventToEdit?.title || '');
            setDate(eventToEdit?.date || initialDate || new Date().toISOString().split('T')[0]);
            setType(eventToEdit?.type || 'date');
        }
    }, [isOpen, eventToEdit, initialDate]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (eventToEdit) {
                await updatePlanEvent(eventToEdit.id, {
                    title,
                    date,
                    type,
                });
            } else {
                await createPlanEvent({
                    title,
                    date,
                    type,
                });
            }
            onClose();
            setTitle('');
        } catch (error) {
            console.error('Failed to save event:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeBtn} onClick={onClose}>
                    <X size={20} />
                </button>

                <h3 className={styles.title}>{eventToEdit ? 'Edit Plan' : 'New Plan'}</h3>

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
                        {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : (eventToEdit ? 'Update Plan' : 'Add to Calendar')}
                    </button>
                </form>
            </div>
        </div>
    );
}
