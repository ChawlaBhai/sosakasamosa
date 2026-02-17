import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const title = formData.get('title') as string || '';
        const text = formData.get('text') as string || '';
        const url = formData.get('url') as string || '';

        // Extract the actual URL — when sharing from apps, the URL might be in text or url field
        const sharedUrl = url || extractUrl(text) || extractUrl(title) || '';

        if (!sharedUrl) {
            // Redirect to home with error
            return NextResponse.redirect(new URL('/?share=no-url', request.url));
        }

        // Detect category from URL
        const category = detectCategory(sharedUrl);

        // Save to Supabase
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (supabaseUrl && supabaseKey) {
            const supabase = createClient(supabaseUrl, supabaseKey);
            await supabase.from('stash_posts').insert({
                url: sharedUrl,
                category: category,
                saved_by: 'Shared',
                type: detectType(sharedUrl),
            });
        }

        // Redirect to the stash section
        return NextResponse.redirect(new URL('/?share=success#stash', request.url));
    } catch (error) {
        console.error('Share target error:', error);
        return NextResponse.redirect(new URL('/?share=error', request.url));
    }
}

// Also handle GET for when share target uses GET method
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url') || searchParams.get('text') || '';

    if (url) {
        // Redirect to home with the URL pre-filled for categorization
        return NextResponse.redirect(new URL(`/?add-url=${encodeURIComponent(url)}#stash`, request.url));
    }

    return NextResponse.redirect(new URL('/', request.url));
}

function extractUrl(text: string): string | null {
    if (!text) return null;
    const urlRegex = /(https?:\/\/[^\s]+)/;
    const match = text.match(urlRegex);
    return match ? match[1] : null;
}

function detectCategory(url: string): string {
    if (url.includes('instagram.com') || url.includes('youtube.com') || url.includes('youtu.be')) {
        return 'Funny 😂'; // Default — user can recategorize later
    }
    if (url.includes('zomato') || url.includes('swiggy')) {
        return 'Food 🍜';
    }
    return 'Misc 🌀';
}

function detectType(url: string): string {
    if (url.includes('/reel/') || url.includes('shorts')) {
        return 'reel';
    }
    return 'post';
}
