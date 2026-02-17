"use client";
import { useState } from 'react';
import { Film } from 'lucide-react';
import styles from './StashSection.module.css';
import CategoryFilter from './CategoryFilter';
import PostCard from './PostCard';
import AddPostForm from './AddPostForm';
import { Post, createStashPost, deleteStashPost } from '@/actions/stash';

interface StashSectionProps {
    initialPosts?: Post[];
}

const DUMMY_POSTS: Post[] = [
    {
        id: '1',
        url: 'https://www.instagram.com/reel/DEv4OQZzJ14/',
        category: 'Funny 😂',
        saved_by: 'Person A',
        created_at: new Date().toISOString(),
        type: 'reel'
    },
    // ... other dummy posts can be removed as we now fetch real data, but keeping one for safety if no props passed
];

const CATEGORIES = ["All", "Food 🍜", "Travel ✈️", "Funny 😂", "Inspo ✨", "Date Ideas 💌", "Misc 🌀"];

export default function StashSection({ initialPosts = [] }: StashSectionProps) {
    const [selectedCategory, setSelectedCategory] = useState("All");
    // Use initialPosts if available, else fallback
    const [posts, setPosts] = useState<Post[]>(initialPosts.length > 0 ? initialPosts : DUMMY_POSTS);

    const filteredPosts = selectedCategory === "All"
        ? posts
        : posts.filter(post => post.category === selectedCategory);

    const handleDelete = async (id: string) => {
        // Optimistic update
        setPosts(prev => prev.filter(p => p.id !== id));
        try {
            await deleteStashPost(id);
        } catch (error) {
            console.error("Failed to delete", error);
            // Revert if needed, but for MVP we assume success
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

                {/* Horizontal Scroll */}
                <div className={styles.horizontalScroll}>
                    {filteredPosts.map(post => (
                        <PostCard key={post.id} post={post} onDelete={handleDelete} />
                    ))}
                </div>
                {filteredPosts.length === 0 && (
                    <div className={styles.emptyState}>
                        <p>No posts found in this category.</p>
                    </div>
                )}
            </div>
        </section>
    );
}
