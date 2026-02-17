"use client";
import { useState } from 'react';
import { Film } from 'lucide-react';
import Link from 'next/link';
import styles from './StashSection.module.css';
import CategoryFilter from './CategoryFilter';
import PostCard from './PostCard';
import AddPostForm from './AddPostForm';
import { Post, deleteStashPost } from '@/actions/stash';

interface StashSectionProps {
    initialPosts?: Post[];
}

const CATEGORIES = ["All", "Food 🍜", "Travel ✈️", "Funny 😂", "Inspo ✨", "Date Ideas 💌", "Misc 🌀"];
const PREVIEW_COUNT = 6; // Show 4-6 most recent on homepage

export default function StashSection({ initialPosts = [] }: StashSectionProps) {
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [posts, setPosts] = useState<Post[]>(initialPosts);

    const filteredPosts = selectedCategory === "All"
        ? posts
        : posts.filter(post => post.category === selectedCategory);

    // Show only the most recent posts on homepage
    const previewPosts = filteredPosts.slice(0, PREVIEW_COUNT);
    const hasMore = filteredPosts.length > PREVIEW_COUNT;

    const handleDelete = async (id: string) => {
        setPosts(prev => prev.filter(p => p.id !== id));
        try {
            await deleteStashPost(id);
        } catch (error) {
            console.error("Failed to delete", error);
        }
    };

    return (
        <section id="stash" className={styles.section}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <Film className={styles.icon} size={32} strokeWidth={1.5} />
                    <div className={styles.titleRow}>
                        <h2 className={styles.title}>Our Saved Stash</h2>
                        <AddPostForm onPostAdded={() => window.location.reload()} />
                    </div>
                    <p className={styles.subtitle}>things we sent each other and thought 'we should actually keep this'</p>
                </div>

                <CategoryFilter
                    categories={CATEGORIES}
                    selectedCategory={selectedCategory}
                    onSelect={setSelectedCategory}
                />

                {/* Responsive Grid (no horizontal scroll) */}
                <div className={styles.grid}>
                    {previewPosts.map(post => (
                        <PostCard key={post.id} post={post} onDelete={handleDelete} />
                    ))}
                </div>

                {filteredPosts.length === 0 && (
                    <div className={styles.emptyState}>
                        <p>No posts found in this category.</p>
                    </div>
                )}

                {/* View All button — always visible */}
                <div className={styles.viewAllWrapper}>
                    <Link href="/stash" className={styles.viewAllBtn}>
                        View All Stash →
                    </Link>
                </div>
            </div>
        </section>
    );
}
