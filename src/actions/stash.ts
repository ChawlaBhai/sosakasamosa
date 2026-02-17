'use server';

import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { Database } from '@/lib/database.types';
import { revalidatePath } from 'next/cache';

export type Post = Database['public']['Tables']['stash_posts']['Row'];
export type NewPost = Database['public']['Tables']['stash_posts']['Insert'];

export async function getStashPosts() {
    if (!isSupabaseConfigured()) {
        console.warn("Supabase not configured, using dummy data");
        return [];
    }
    const sb = supabase as any;
    const { data, error } = await sb
        .from('stash_posts')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching stash posts:', error);
        return [];
    }

    return data;
}

export async function createStashPost(post: NewPost) {
    if (!isSupabaseConfigured()) {
        console.warn("Supabase not configured, cannot create post");
        return null;
    }
    const sb = supabase as any;
    const { data, error } = await sb
        .from('stash_posts')
        .insert(post)
        .select()
        .single();

    if (error) {
        console.error('Error creating stash post:', error);
        throw new Error('Failed to create post');
    }

    revalidatePath('/');
    return data;
}

export async function deleteStashPost(id: string) {
    if (!isSupabaseConfigured()) {
        console.warn("Supabase not configured, cannot delete post");
        return false;
    }
    const sb = supabase as any;
    const { error } = await sb
        .from('stash_posts')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting stash post:', error);
        throw new Error('Failed to delete post');
    }

    revalidatePath('/');
    return true;
}
