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

    const events = (data || []) as PlanEvent[];

    // Fetch Family Birthdays & Anniversaries
    const { data: family, error: fError } = await sb
        .from('family_members')
        .select('id, name, dob, anniversary_date, partner_id');

    if (!fError && family) {
        family.forEach((m: any) => {
            // Birthday
            if (m.dob) {
                const dobDate = new Date(m.dob);
                // We show it in current year for calendar display
                const today = new Date();
                const eventDate = `${today.getFullYear()}-${String(dobDate.getMonth() + 1).padStart(2, '0')}-${String(dobDate.getDate()).padStart(2, '0')}`;
                events.push({
                    id: `bday-${m.id}`,
                    title: `${m.name}'s Birthday 🎂`,
                    date: eventDate,
                    type: 'birthday',
                    created_at: new Date().toISOString()
                } as any);
            }

            // Anniversary
            if (m.anniversary_date && m.partner_id && m.id < m.partner_id) {
                const partner = family.find((p: any) => p.id === m.partner_id);
                const annDate = new Date(m.anniversary_date);
                const today = new Date();
                const eventDate = `${today.getFullYear()}-${String(annDate.getMonth() + 1).padStart(2, '0')}-${String(annDate.getDate()).padStart(2, '0')}`;
                events.push({
                    id: `ann-${m.id}`,
                    title: `${m.name} & ${partner?.name || 'Partner'} Anniversary 💍`,
                    date: eventDate,
                    type: 'anniversary',
                    created_at: new Date().toISOString()
                } as any);
            }
        });
    }

    return events;
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
