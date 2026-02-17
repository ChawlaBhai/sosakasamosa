'use server';

import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { Database } from '@/lib/database.types';
import { revalidatePath } from 'next/cache';

export type Transaction = Database['public']['Tables']['transactions']['Row'];
export type NewTransaction = Database['public']['Tables']['transactions']['Insert'];

export async function getTransactions() {
    if (!isSupabaseConfigured()) {
        console.warn("Supabase not configured, using dummy data");
        return [];
    }
    const sb = supabase as any;
    const { data, error } = await sb
        .from('transactions')
        .select('*')
        .order('date', { ascending: false }); // Newest first

    if (error) {
        console.error('Error fetching transactions:', error);
        return [];
    }

    return data;
}

export async function createTransaction(tx: NewTransaction) {
    if (!isSupabaseConfigured()) {
        console.warn("Supabase not configured, cannot create transaction");
        return null;
    }
    const sb = supabase as any;
    const { data, error } = await sb
        .from('transactions')
        .insert(tx)
        .select()
        .single();

    if (error) {
        console.error('Error creating transaction:', error);
        throw new Error('Failed to create transaction');
    }

    revalidatePath('/');
    return data;
}

export async function deleteTransaction(id: string) {
    if (!isSupabaseConfigured()) {
        console.warn("Supabase not configured, cannot delete transaction");
        return false;
    }
    const sb = supabase as any;
    const { error } = await sb
        .from('transactions')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting transaction:', error);
        throw new Error('Failed to delete transaction');
    }

    revalidatePath('/');
    return true;
}

// Helper to calculate balance
// Returns positive if Person B owes Person A, negative if A owes B.
// This assumes only 2 people: Person A and Person B.
// In a real app, you'd use user IDs. Here we use names for simplicity.
export async function getBalance(personA: string, personB: string) {
    if (!isSupabaseConfigured()) {
        console.warn("Supabase not configured, using dummy balance");
        return 0;
    }
    const sb = supabase as any;
    const { data: transactions, error } = await sb
        .from('transactions')
        .select('amount, paid_by');

    if (error || !transactions) return 0;

    let balance = 0;
    // Logic: 
    // If A paid 100, B owes 50. Balance += 50
    // If B paid 100, A owes 50. Balance -= 50

    transactions.forEach((tx: any) => {
        // Assuming equal split for all transactions for MVP
        const share = Number(tx.amount) / 2;
        if (tx.paid_by === personA) {
            balance += share;
        } else if (tx.paid_by === personB) {
            balance -= share;
        }
    });

    return balance;
}
