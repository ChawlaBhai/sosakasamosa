
import MobileTabbar from "@/components/MobileTabbar";
import Hero from "@/components/Hero";
import StashSection from "@/components/StashSection";
import MomentsSection from "@/components/MomentsSection";
import PlansSection from "@/components/PlansSection";
import KaunKitnaSection from "@/components/KaunKitnaSection";
import ScrollReveal from "@/components/ScrollReveal";
import HeartLoader from "@/components/HeartLoader";
import SkyBackground from "@/components/SkyBackground";
import styles from "./page.module.css";
import { getStashPosts } from '@/actions/stash';
import { getMoments } from '@/actions/moments';
import { getPlanEvents } from '@/actions/plans';
import { getTransactions, getBalance } from '@/actions/transactions';

export const dynamic = 'force-dynamic';

export default async function Home() {
    const stashPosts = await getStashPosts();
    const moments = await getMoments();
    const planEvents = await getPlanEvents();
    const transactions = await getTransactions();
    const balance = await getBalance('Person A', 'Person B');

    return (
        <>
            <SkyBackground />
            <HeartLoader />
            <main className={styles.main}>
                <Hero />
                <ScrollReveal>
                    <StashSection initialPosts={stashPosts || []} />
                </ScrollReveal>
                <ScrollReveal>
                    <MomentsSection initialMoments={moments || []} />
                </ScrollReveal>
                <ScrollReveal>
                    <PlansSection initialEvents={planEvents || []} />
                </ScrollReveal>
                <ScrollReveal>
                    <KaunKitnaSection
                        initialTransactions={transactions || []}
                        initialBalance={balance || 0}
                    />
                </ScrollReveal>
            </main>
            <MobileTabbar />
        </>
    );
}
