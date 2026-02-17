"use client";
import { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, Film } from 'lucide-react';
import Link from 'next/link';
import PostCard from '@/components/PostCard';
import CategoryFilter from '@/components/CategoryFilter';
import AddPostForm from '@/components/AddPostForm';
import { Post, deleteStashPost } from '@/actions/stash';
import styles from './stash.module.css';

const CATEGORIES = ["All", "Food 🍜", "Travel ✈️", "Funny 😂", "Inspo ✨", "Date Ideas 💌", "Misc 🌀"];
const ITEMS_PER_PAGE = 20;

interface StashFullPageProps {
    initialPosts: Post[];
}

export default function StashFullPage({ initialPosts }: StashFullPageProps) {
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [posts, setPosts] = useState<Post[]>(initialPosts);
    const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
    const loaderRef = useRef<HTMLDivElement>(null);

    const filteredPosts = selectedCategory === "All"
        ? posts
        : posts.filter(post => post.category === selectedCategory);

    const visiblePosts = filteredPosts.slice(0, visibleCount);
    const hasMore = visibleCount < filteredPosts.length;

    // Infinite scroll observer
    useEffect(() => {
        if (!loaderRef.current || !hasMore) return;
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setVisibleCount(prev => prev + ITEMS_PER_PAGE);
                }
            },
            { rootMargin: '200px' }
        );
        observer.observe(loaderRef.current);
        return () => observer.disconnect();
    }, [hasMore, filteredPosts.length]);

    // Reset visible count when category changes
    useEffect(() => {
        setVisibleCount(ITEMS_PER_PAGE);
    }, [selectedCategory]);

    const handleDelete = async (id: string) => {
        setPosts(prev => prev.filter(p => p.id !== id));
        try {
            await deleteStashPost(id);
        } catch (error) {
            console.error("Failed to delete", error);
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                {/* Header */}
                <div className={styles.header}>
                    <Link href="/#stash" className={styles.backLink}>
                        <ArrowLeft size={18} />
                        <span>Back</span>
                    </Link>
                    <div className={styles.titleArea}>
                        <Film className={styles.icon} size={28} strokeWidth={1.5} />
                        <h1 className={styles.title}>Our Saved Stash</h1>
                        <AddPostForm onPostAdded={() => window.location.reload()} />
                    </div>
                    <p className={styles.subtitle}>
                        every reel, post, and link we couldn't let go of
                    </p>
                </div>

                {/* Filters */}
                <CategoryFilter
                    categories={CATEGORIES}
                    selectedCategory={selectedCategory}
                    onSelect={setSelectedCategory}
                />

                {/* Grid */}
                <div className={styles.grid}>
                    {visiblePosts.map(post => (
                        <PostCard key={post.id} post={post} onDelete={handleDelete} />
                    ))}
                </div>

                {filteredPosts.length === 0 && (
                    <div className={styles.emptyState}>
                        <p>Nothing saved here yet. Share a reel! 📱</p>
                    </div>
                )}

                {/* Infinite scroll trigger */}
                {hasMore && (
                    <div ref={loaderRef} className={styles.loader}>
                        <span>Loading more...</span>
                    </div>
                )}

                {!hasMore && filteredPosts.length > 0 && (
                    <div className={styles.endMessage}>
                        <span>That's everything we've saved! 💕</span>
                    </div>
                )}
            </div>
        </div>
    );
}
