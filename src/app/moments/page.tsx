import { getMoments } from '@/actions/moments';
import MomentsTimeline from './MomentsTimeline';

export const dynamic = 'force-dynamic';

export default async function MomentsPage() {
    const moments = await getMoments();
    return <MomentsTimeline initialMoments={moments || []} />;
}
