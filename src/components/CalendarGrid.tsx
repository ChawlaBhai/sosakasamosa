"use client";
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './CalendarGrid.module.css';
import clsx from 'clsx';

import { PlanEvent } from '@/actions/plans';

type EventType = PlanEvent['type'];

interface CalendarGridProps {
    events: PlanEvent[];
    onDateSelect?: (date: string) => void;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function CalendarGrid({ events, onDateSelect }: CalendarGridProps) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [hoveredDay, setHoveredDay] = useState<number | null>(null);

    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDay = (year: number, month: number) => new Date(year, month, 1).getDay();

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDay(currentYear, currentMonth);

    const getEventsForDay = (day: number) => {
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return events.filter(e => e.date === dateStr);
    };

    const getEventTypeColor = (type: EventType) => {
        switch (type) {
            case 'anniversary': return '#D4899A';
            case 'birthday': return '#E8856A';
            case 'trip': return '#7DAA92';
            case 'date': return '#D4A853';
            case 'finance': return '#6BB8A0';
            default: return '#B0A8A4';
        }
    };

    const today = new Date();
    const isToday = (day: number) =>
        day === today.getDate() &&
        currentMonth === today.getMonth() &&
        currentYear === today.getFullYear();

    return (
        <div className={styles.calendarContainer}>
            <div className={styles.header}>
                <button onClick={prevMonth} className={styles.navBtn}><ChevronLeft size={20} /></button>
                <h3 className={styles.monthTitle}>{MONTHS[currentMonth]} {currentYear}</h3>
                <button onClick={nextMonth} className={styles.navBtn}><ChevronRight size={20} /></button>
            </div>

            <div className={styles.grid}>
                {WEEKDAYS.map(day => (
                    <div key={day} className={styles.weekday}>{day}</div>
                ))}

                {/* Empty cells for start of month */}
                {Array.from({ length: firstDay }).map((_, i) => (
                    <div key={`empty-${i}`} className={styles.emptyDay}></div>
                ))}

                {/* Days */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const dayEvents = getEventsForDay(day);
                    const hasEvents = dayEvents.length > 0;

                    return (
                        <div
                            key={day}
                            className={clsx(
                                styles.day,
                                isToday(day) && styles.today,
                                hasEvents && styles.hasEvent
                            )}
                            style={hasEvents ? {
                                '--event-color': getEventTypeColor(dayEvents[0].type)
                            } as React.CSSProperties : undefined}
                            onClick={() => onDateSelect?.(`${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`)}
                            onMouseEnter={() => hasEvents && setHoveredDay(day)}
                            onMouseLeave={() => setHoveredDay(null)}
                        >
                            <span className={styles.dayNumber}>{day}</span>
                            {hasEvents && hoveredDay === day && (
                                <div className={styles.tooltip}>
                                    {dayEvents.map(event => (
                                        <div key={event.id} className={styles.tooltipItem}>
                                            <span
                                                className={styles.tooltipDot}
                                                style={{ backgroundColor: getEventTypeColor(event.type) }}
                                            />
                                            <span>{event.title}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
