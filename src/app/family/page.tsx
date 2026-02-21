import FamilyBoard from '@/components/FamilyTree/FamilyBoard';
import Link from 'next/link';
import { Home } from 'lucide-react';
import styles from './page.module.css';

export default function FamilyPage() {
    return (
        <main className={styles.main}>
            <Link
                href="/"
                className={styles.fabHome}
                title="Back to Home"
            >
                <Home size={28} />
            </Link>
            <FamilyBoard />
        </main>
    );
}
