import { NextRequest, NextResponse } from 'next/server';

// Decode HTML entities in extracted meta tag values
function decodeEntities(str: string): string {
    return str
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
        .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec)));
}

// Server-side proxy to fetch Instagram/YouTube thumbnails
// Instagram blocks all client-side embedding, so we fetch the og:image server-side
export async function GET(request: NextRequest) {
    const url = request.nextUrl.searchParams.get('url');
    if (!url) {
        return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
    }

    try {
        // Fetch the page HTML server-side (no CORS on server)
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
                'Accept': 'text/html,application/xhtml+xml',
                'Accept-Language': 'en-US,en;q=0.9',
            },
            redirect: 'follow',
        });

        const html = await response.text();

        // Extract og:image
        const ogImageMatch = html.match(/<meta\s+(?:property|name)="og:image"\s+content="([^"]+)"/i)
            || html.match(/content="([^"]+)"\s+(?:property|name)="og:image"/i);

        // Extract og:title
        const ogTitleMatch = html.match(/<meta\s+(?:property|name)="og:title"\s+content="([^"]+)"/i)
            || html.match(/content="([^"]+)"\s+(?:property|name)="og:title"/i);

        // Extract og:description
        const ogDescMatch = html.match(/<meta\s+(?:property|name)="og:description"\s+content="([^"]+)"/i)
            || html.match(/content="([^"]+)"\s+(?:property|name)="og:description"/i);

        // Try to extract video thumbnail from og:video meta tags
        const ogVideoThumb = html.match(/<meta\s+(?:property|name)="og:video:thumbnail"\s+content="([^"]+)"/i);

        const thumbnail = ogImageMatch?.[1] || ogVideoThumb?.[1] || null;
        const title = ogTitleMatch?.[1] || '';
        const description = ogDescMatch?.[1] || '';

        return NextResponse.json({
            thumbnail: thumbnail ? decodeEntities(thumbnail) : null,
            title: decodeEntities(title),
            description: decodeEntities(description),
        }, {
            headers: {
                // Cache for 1 hour
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
            },
        });
    } catch (error) {
        console.error('Failed to fetch thumbnail:', error);
        return NextResponse.json({ thumbnail: null, title: '', description: '' });
    }
}
