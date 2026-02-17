"use client";
import styles from './CategoryFilter.module.css';
import clsx from 'clsx';

interface CategoryFilterProps {
    categories: string[];
    selectedCategory: string;
    onSelect: (category: string) => void;
}

export default function CategoryFilter({ categories, selectedCategory, onSelect }: CategoryFilterProps) {
    return (
        <div className={styles.filterContainer}>
            <div className={styles.scrollArea}>
                {categories.map((category) => (
                    <button
                        key={category}
                        onClick={() => onSelect(category)}
                        className={clsx(
                            styles.filterBtn,
                            selectedCategory === category && styles.active
                        )}
                    >
                        {category}
                    </button>
                ))}
            </div>
        </div>
    );
}
