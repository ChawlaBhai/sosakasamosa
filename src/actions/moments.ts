'use server';

import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { Database } from '@/lib/database.types';
import { revalidatePath } from 'next/cache';

export type Moment = Database['public']['Tables']['moments']['Row'];
export type NewMoment = Database['public']['Tables']['moments']['Insert'];

export async function getMoments() {
    if (!isSupabaseConfigured()) {
        console.warn("Supabase not configured, using dummy data");
        return [];
    }
    const sb = supabase as any;
    const { data, error } = await sb
        .from('moments')
        .select('*')
        .order('date', { ascending: false }); // Newest moments first

    if (error) {
        console.error('Error fetching moments:', error);
        return [];
    }

    return data;
}

export async function createMoment(moment: NewMoment) {
    if (!isSupabaseConfigured()) {
        console.warn("Supabase not configured, cannot create moment");
        return null; // Or throw, but for now silent fail is better for demo
    }
    const sb = supabase as any;
    const { data, error } = await sb
        .from('moments')
        .insert(moment)
        .select()
        .single();

    if (error) {
        console.error('Error creating moment:', error);
        throw new Error('Failed to create moment');
    }

    revalidatePath('/');
    return data;
}

export async function deleteMoment(id: string) {
    if (!isSupabaseConfigured()) {
        console.warn("Supabase not configured, cannot delete moment");
        return false;
    }
    const sb = supabase as any;
    const { error } = await sb
        .from('moments')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting moment:', error);
        throw new Error('Failed to delete moment');
    }

    revalidatePath('/');
    return true;
}

export async function updateMoment(id: string, updates: Partial<Database['public']['Tables']['moments']['Update']>) {
    if (!isSupabaseConfigured()) {
        console.warn("Supabase not configured, cannot update moment");
        return null;
    }
    const sb = supabase as any;
    const { data, error } = await sb
        .from('moments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating moment:', error);
        throw new Error('Failed to update moment');
    }

    revalidatePath('/');
    revalidatePath('/moments');
    return data;
}

