'use server';

import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { revalidatePath } from 'next/cache';

export type FamilyMember = {
    id: string;
    name: string;
    photo_url: string | null;
    dob: string | null;
    gender: string | null;
    partner_id: string | null;
    parent_ids: string[] | null;
    anniversary_date: string | null;
    created_at: string;
};

export type NewFamilyMember = Omit<FamilyMember, 'id' | 'created_at'>;

export async function getFamilyMembers() {
    if (!isSupabaseConfigured()) {
        console.warn("Supabase not configured, returning empty family");
        return [];
    }
    const sb = supabase as any;
    const { data, error } = await sb
        .from('family_members')
        .select('*');

    if (error) {
        console.error('Error fetching family:', error);
        return [];
    }
    return data as FamilyMember[];
}

export async function addFamilyMember(member: NewFamilyMember) {
    if (!isSupabaseConfigured()) return null;
    const sb = supabase as any;

    const { data, error } = await sb
        .from('family_members')
        .insert(member)
        .select()
        .single();

    if (error) {
        console.error('Error adding family member:', error);
        throw new Error('Failed to add member');
    }

    revalidatePath('/family');
    return data;
}

export async function updateFamilyMember(id: string, updates: Partial<FamilyMember>) {
    if (!isSupabaseConfigured()) return null;
    const sb = supabase as any;

    const { error } = await sb
        .from('family_members')
        .update(updates)
        .eq('id', id);

    if (error) {
        console.error('Error updating family member:', error);
        throw new Error('Failed to update member');
    }

    revalidatePath('/family');
    return true;
}

export async function deleteFamilyMember(id: string) {
    if (!isSupabaseConfigured()) return null;
    const sb = supabase as any;

    const { error } = await sb
        .from('family_members')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting family member:', error);
        throw new Error('Failed to delete member');
    }

    revalidatePath('/family');
    return true;
}
