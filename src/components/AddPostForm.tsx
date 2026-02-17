"use client";
import { useState } from 'react';
import { Plus, X, Send } from 'lucide-react';
import styles from './AddPostForm.module.css';
import { createStashPost } from '@/actions/stash';

const CATEGORIES = ["Food 🍜", "Travel ✈️", "Funny 😂", "Inspo ✨", "Date Ideas 💌", "Misc 🌀"];

interface AddPostFormProps {
    onPostAdded?: () => void;
}

export default function AddPostForm({ onPostAdded }: AddPostFormProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [url, setUrl] = useState('');
    const [category, setCategory] = useState('Funny 😂');
    const [savedBy, setSavedBy] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url.trim()) return;

        setIsSubmitting(true);
        try {
            const type = url.includes('/reel/') || url.includes('shorts') ? 'reel' : 'post';
            await createStashPost({
                url: url.trim(),
                category,
                saved_by: savedBy || 'Anonymous',
                type,
            });
            setUrl('');
            setSavedBy('');
            setIsOpen(false);
            onPostAdded?.();
        } catch (error) {
            console.error('Failed to add post:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) {
        return (
            <button className={styles.addBtn} onClick={() => setIsOpen(true)}>
                <Plus size={18} strokeWidth={3} />
            </button>
        );
    }

    return (
        <div className={styles.formOverlay}>
            <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.formHeader}>
                    <h3 className={styles.formTitle}>Add to Stash ✨</h3>
                    <button type="button" className={styles.closeBtn} onClick={() => setIsOpen(false)}>
                        <X size={18} />
                    </button>
                </div>

                <input
                    type="url"
                    className={styles.urlInput}
                    placeholder="Paste Instagram / YouTube link..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    required
                    autoFocus
                />

                <div className={styles.categoryRow}>
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            type="button"
                            className={`${styles.catBtn} ${category === cat ? styles.catActive : ''}`}
                            onClick={() => setCategory(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                <div className={styles.bottomRow}>
                    <input
                        type="text"
                        className={styles.nameInput}
                        placeholder="Saved by..."
                        value={savedBy}
                        onChange={(e) => setSavedBy(e.target.value)}
                    />
                    <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                        <Send size={16} />
                        {isSubmitting ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </form>
        </div>
    );
}
