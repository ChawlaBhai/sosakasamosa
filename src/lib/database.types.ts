export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    public: {
        Tables: {
            stash_posts: {
                Row: {
                    id: string
                    created_at: string
                    url: string
                    category: string
                    saved_by: string
                    type: 'reel' | 'post'
                }
                Insert: {
                    id?: string
                    created_at?: string
                    url: string
                    category: string
                    saved_by: string
                    type: 'reel' | 'post'
                }
                Update: {
                    id?: string
                    created_at?: string
                    url?: string
                    category?: string
                    saved_by?: string
                    type?: 'reel' | 'post'
                }
            }
            moments: {
                Row: {
                    id: string
                    created_at: string
                    title: string
                    date: string
                    description: string | null
                    tags: string[]
                    media_urls: Json[] // Stores array of { id, type, url, thumbnail? }
                }
                Insert: {
                    id?: string
                    created_at?: string
                    title: string
                    date: string
                    description?: string | null
                    tags?: string[]
                    media_urls?: Json[]
                }
                Update: {
                    id?: string
                    created_at?: string
                    title?: string
                    date?: string
                    description?: string | null
                    tags?: string[]
                    media_urls?: Json[]
                }
            }
            plans_events: {
                Row: {
                    id: string
                    created_at: string
                    title: string
                    date: string
                    type: 'anniversary' | 'birthday' | 'trip' | 'date' | 'appointment' | 'finance' | 'celebration' | 'reminder'
                }
                Insert: {
                    id?: string
                    created_at?: string
                    title: string
                    date: string
                    type: 'anniversary' | 'birthday' | 'trip' | 'date' | 'appointment' | 'finance' | 'celebration' | 'reminder'
                }
                Update: {
                    id?: string
                    created_at?: string
                    title?: string
                    date?: string
                    type?: 'anniversary' | 'birthday' | 'trip' | 'date' | 'appointment' | 'finance' | 'celebration' | 'reminder'
                }
            }
            transactions: {
                Row: {
                    id: string
                    created_at: string
                    description: string
                    amount: number
                    paid_by: string
                    date: string
                    category: 'food' | 'groceries' | 'bills' | 'transport' | 'other'
                }
                Insert: {
                    id?: string
                    created_at?: string
                    description: string
                    amount: number
                    paid_by: string
                    date: string
                    category: 'food' | 'groceries' | 'bills' | 'transport' | 'other'
                }
                Update: {
                    id?: string
                    created_at?: string
                    description?: string
                    amount?: number
                    paid_by?: string
                    date?: string
                    category?: 'food' | 'groceries' | 'bills' | 'transport' | 'other'
                }
            }
        }
    }
}
