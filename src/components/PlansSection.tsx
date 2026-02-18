"use client";
import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import styles from './PlansSection.module.css';
import CalendarGrid from './CalendarGrid';
import UpcomingEvents from './UpcomingEvents';
import AddEventModal from './AddEventModal';
import { PlanEvent, createPlanEvent, deletePlanEvent } from '@/actions/plans';

type EventType = PlanEvent['type'];

interface PlansSectionProps {
    initialEvents?: PlanEvent[];
}

const DUMMY_EVENTS: PlanEvent[] = [
    { id: '1', title: 'Coffee Date ☕️', date: '2025-10-15', type: 'date', created_at: '' }, // Dummy format
    // ...
];

export default function PlansSection({ initialEvents = [] }: PlansSectionProps) {
    const events = initialEvents.length > 0 ? initialEvents : DUMMY_EVENTS;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<string | undefined>(undefined);
    const [editingEvent, setEditingEvent] = useState<PlanEvent | null>(null);

    // Generate recurring events for the calendar view (Current Year + Next Year)
    const getAllEventsIncludingRecurring = () => {
        const result: PlanEvent[] = [...events];
        const now = new Date();
        const currentYear = now.getFullYear();

        events.forEach(event => {
            if (event.type === 'birthday' || event.type === 'anniversary') {
                const eventDate = new Date(event.date);
                // Project for current year and next year
                [currentYear, currentYear + 1].forEach(year => {
                    const projectedDate = `${year}-${String(eventDate.getMonth() + 1).padStart(2, '0')}-${String(eventDate.getDate()).padStart(2, '0')}`;

                    // Avoid duplicates if the original event is already this date
                    if (projectedDate !== event.date) {
                        result.push({
                            ...event,
                            date: projectedDate,
                            id: `${event.id}-${year}`, // Temporary ID for display
                        } as PlanEvent);
                    }
                });
            }
        });
        return result;
    };

    const allDisplayEvents = getAllEventsIncludingRecurring();

    const handleDateSelect = (date: string) => {
        setSelectedDate(date);
        setEditingEvent(null);
        setIsModalOpen(true);
    };

    const handleAddEvent = () => {
        setSelectedDate(undefined);
        setEditingEvent(null);
        setIsModalOpen(true);
    };

    const handleEditEvent = (event: PlanEvent) => {
        setEditingEvent(event);
        setIsModalOpen(true);
    };

    return (
        <section id="plans" className={styles.section}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <Calendar className={styles.icon} size={32} strokeWidth={1.5} />
                    <h2 className={styles.title}>Our Plans</h2>
                    <p className={styles.subtitle}>everything we're looking forward to, together</p>
                </div>

                <div className={styles.contentGrid}>
                    <div className={styles.calendarWrapper}>
                        <CalendarGrid events={allDisplayEvents} onDateSelect={handleDateSelect} />
                    </div>
                    <div className={styles.sidebarWrapper}>
                        <UpcomingEvents
                            events={events}
                            onAddEvent={handleAddEvent}
                            onEditEvent={handleEditEvent}
                        />
                    </div>
                </div>

                <AddEventModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    initialDate={selectedDate}
                    eventToEdit={editingEvent}
                />
            </div>
        </section>
    );
}
