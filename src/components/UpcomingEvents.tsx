"use client";
import React from 'react';
import { PlanEvent, deletePlanEvent } from '@/actions/plans';
import { Plus, Trash2 } from 'lucide-react';
import styles from './UpcomingEvents.module.css';
import clsx from 'clsx';

type EventType = PlanEvent['type'];

interface UpcomingEventsProps {
    events: PlanEvent[];
    onAddEvent?: () => void;
}

export default function UpcomingEvents({ events, onAddEvent }: UpcomingEventsProps) {
    const getEventColor = (type: EventType) => {
        switch (type) {
            case 'anniversary': return '#D4899A';
            case 'birthday': return '#E8856A';
            case 'trip': return '#7DAA92';
            case 'date': return '#D4A853';
            case 'finance': return '#6BB8A0';
            default: return '#B0A8A4';
        }
    };

    const getEventEmoji = (type: EventType) => {
        switch (type) {
            case 'anniversary': return '💕';
            case 'birthday': return '🎂';
            case 'trip': return '✈️';
            case 'date': return '💌';
            case 'finance': return '💰';
            default: return '📅';
        }
    };

    // Generate recurring events for birthdays and anniversaries
    const getUpcomingEvents = (): (PlanEvent & { isRecurring?: boolean })[] => {
        const now = new Date();
        const twoMonthsLater = new Date(now.getFullYear(), now.getMonth() + 2, now.getDate());
        const result: (PlanEvent & { isRecurring?: boolean })[] = [];

        for (const event of events) {
            const eventDate = new Date(event.date);

            // For birthdays and anniversaries, generate this year's occurrence
            if (event.type === 'birthday' || event.type === 'anniversary') {
                const thisYear = new Date(now.getFullYear(), eventDate.getMonth(), eventDate.getDate());
                const nextYear = new Date(now.getFullYear() + 1, eventDate.getMonth(), eventDate.getDate());

                if (thisYear >= now && thisYear <= twoMonthsLater) {
                    result.push({
                        ...event,
                        date: thisYear.toISOString().split('T')[0],
                        isRecurring: true
                    });
                } else if (nextYear >= now && nextYear <= twoMonthsLater) {
                    result.push({
                        ...event,
                        date: nextYear.toISOString().split('T')[0],
                        isRecurring: true
                    });
                }
            } else {
                // Regular events — only show if within next 2 months
                if (eventDate >= now && eventDate <= twoMonthsLater) {
                    result.push(event);
                }
            }
        }

        // Sort by date
        result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        return result;
    };

    const upcomingEvents = getUpcomingEvents();

    const handleDelete = async (id: string) => {
        try {
            await deletePlanEvent(id);
            // Page will revalidate from server action
        } catch (error) {
            console.error("Failed to delete event", error);
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const getDaysUntil = (dateStr: string) => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const target = new Date(dateStr);
        target.setHours(0, 0, 0, 0);
        const diff = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (diff === 0) return 'Today!';
        if (diff === 1) return 'Tomorrow';
        return `in ${diff} days`;
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3 className={styles.title}>Coming Up 🗓️</h3>
                <button className={styles.addBtn} onClick={onAddEvent}>
                    <Plus size={16} />
                </button>
            </div>

            <div className={styles.list}>
                {upcomingEvents.length === 0 ? (
                    <p className={styles.empty}>No upcoming plans in the next 2 months.</p>
                ) : (
                    upcomingEvents.map(event => (
                        <div key={`${event.id}-${event.date}`} className={styles.eventItem}>
                            <div
                                className={styles.eventDot}
                                style={{ backgroundColor: getEventColor(event.type) }}
                            >
                                <span className={styles.emoji}>{getEventEmoji(event.type)}</span>
                            </div>
                            <div className={styles.details}>
                                <h4 className={styles.eventTitle}>
                                    {event.title}
                                    {event.isRecurring && <span className={styles.recurringBadge}>🔁</span>}
                                </h4>
                                <div className={styles.eventMeta}>
                                    <span className={styles.eventDate}>{formatDate(event.date)}</span>
                                    <span className={styles.daysUntil}>{getDaysUntil(event.date)}</span>
                                </div>
                            </div>
                            <button
                                className={styles.deleteBtn}
                                onClick={() => handleDelete(event.id)}
                                title="Delete event"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
