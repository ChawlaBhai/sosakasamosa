import React from 'react';
import { FamilyMember } from '@/actions/family';
import styles from './FamilyNode.module.css';
import clsx from 'clsx';

import { Plus, Crown, User } from 'lucide-react';

interface FamilyNodeProps {
    member: FamilyMember;
    isHighlighted?: boolean;
    onAddRelative: (id: string) => void;
    onClick: (member: FamilyMember) => void;
    scale?: number;
}

export default function FamilyNode({ member, isHighlighted, onAddRelative, onClick, scale = 1 }: FamilyNodeProps) {
    return (
        <div
            className={clsx(styles.card, isHighlighted && styles.highlighted)}
            onClick={() => onClick(member)}
            style={{
                transform: `scale(${scale})`,
                transformOrigin: 'center center',
            }}
        >
            <div className={styles.imageWrapper}>
                {member.photo_url ? (
                    <img src={member.photo_url} alt={member.name} className={styles.image} />
                ) : (
                    <div className={styles.placeholder}>
                        <User size={Math.round(40 * scale)} color="#ccc" />
                    </div>
                )}
            </div>

            <div className={styles.info}>
                <h3 className={styles.name} style={{ fontSize: `${Math.max(10, Math.round(18 * scale))}px` }}>
                    {member.name}
                </h3>
                {member.dob && (
                    <p className={styles.dob} style={{ fontSize: `${Math.max(8, Math.round(12 * scale))}px` }}>
                        {new Date(member.dob).toLocaleDateString()}
                    </p>
                )}
            </div>

            <button
                className={styles.addBtn}
                onClick={(e) => {
                    e.stopPropagation();
                    onAddRelative(member.id);
                }}
                title="Add Relative"
                style={{
                    width: `${Math.round(28 * scale)}px`,
                    height: `${Math.round(28 * scale)}px`,
                    bottom: `-${Math.round(14 * scale)}px`,
                }}
            >
                <Plus size={Math.round(16 * scale)} color="white" strokeWidth={3} />
            </button>
        </div>
    );
}
