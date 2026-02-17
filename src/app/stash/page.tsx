import { getStashPosts } from '@/actions/stash';
import StashFullPage from './StashFullPage';

export const dynamic = 'force-dynamic';

export default async function StashPage() {
    const posts = await getStashPosts();
    return <StashFullPage initialPosts={posts || []} />;
}
