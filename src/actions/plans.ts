'use server';

import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { Database } from '@/lib/database.types';
import { revalidatePath } from 'next/cache';

export type PlanEvent = Database['public']['Tables']['plans_events']['Row'];
export type NewPlanEvent = Database['public']['Tables']['plans_events']['Insert'];

export async function getPlanEvents() {
    if (!isSupabaseConfigured()) {
        console.warn("Supabase not configured, using dummy data");
        return [];
    }
    const sb = supabase as any;
    const { data, error } = await sb
        .from('plans_events')
        .select('*')
        .order('date', { ascending: true }); // Soonest first

    if (error) {
        console.error('Error fetching plan events:', error);
        return [];
    }

    return data;
}

export async function createPlanEvent(event: NewPlanEvent) {
    if (!isSupabaseConfigured()) {
        console.warn("Supabase not configured, cannot create event");
        return null;
    }
    const sb = supabase as any;
    const { data, error } = await sb
        .from('plans_events')
        .insert(event)
        .select()
        .single();

    if (error) {
        console.error('Error creating plan event:', error);
        throw new Error('Failed to create event');
    }

    revalidatePath('/');
    return data;
}

export async function deletePlanEvent(id: string) {
    if (!isSupabaseConfigured()) {
        console.warn("Supabase not configured, cannot delete event");
        return false;
    }
    const sb = supabase as any;
    const { error } = await sb
        .from('plans_events')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting plan event:', error);
        throw new Error('Failed to delete event');
    }

    revalidatePath('/');
    return true;
}

export async function updatePlanEvent(id: string, updates: Partial<NewPlanEvent>) {
    if (!isSupabaseConfigured()) {
        console.warn("Supabase not configured, cannot update event");
        return null;
    }
    const sb = supabase as any;
    const { data, error } = await sb
        .from('plans_events')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating plan event:', error);
        throw new Error('Failed to update event');
    }

    revalidatePath('/');
    return data;
}
