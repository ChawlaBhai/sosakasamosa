'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Plus, X, User, Heart, Baby, Link as LinkIcon, ArrowUp, Camera, Loader2 } from 'lucide-react';
import styles from './AddMemberForm.module.css';
import { NewFamilyMember, FamilyMember, addFamilyMember, updateFamilyMember } from '@/actions/family';
import { supabase } from '@/lib/supabaseClient';

interface AddMemberFormProps {
    existingMembers: FamilyMember[];
    onMemberAdded: () => void;
    onClose: () => void;
    initialValues?: { type: 'partner' | 'child' | 'parent', relativeId: string } | null;
    onDataFix?: () => void;
}

export default function AddMemberForm({ existingMembers, onMemberAdded, onClose, initialValues, onDataFix }: AddMemberFormProps) {
    const [name, setName] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [dob, setDob] = useState('');
    const [relationType, setRelationType] = useState<'partner' | 'child' | 'parent' | 'none'>('none');
    const [relativeId, setRelativeId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // If initialValues provided, use them
    useEffect(() => {
        if (initialValues) {
            setRelationType(initialValues.type);
            setRelativeId(initialValues.relativeId);
        } else if (existingMembers.length === 0) {
            setRelationType('none');
        } else if (relationType === 'none') {
            // Default to partner if members exist but no initialValue
            setRelationType('partner');
            setRelativeId(existingMembers[0]?.id || '');
        }
    }, [initialValues, existingMembers.length]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            let photoUrl = null;

            // Upload Photo if selected
            if (selectedFile) {
                const fileExt = selectedFile.name.split('.').pop();
                const fileName = `${Date.now()}-${name.replace(/\s+/g, '-').toLowerCase()}.${fileExt}`;
                const filePath = `${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('family-photos')
                    .upload(filePath, selectedFile);

                if (uploadError) {
                    console.error('Upload error:', uploadError);
                    alert('Failed to upload photo. Please check if "family-photos" bucket exists and is public.');
                    setIsSubmitting(false);
                    return;
                }

                const { data: { publicUrl } } = supabase.storage
                    .from('family-photos')
                    .getPublicUrl(filePath);

                photoUrl = publicUrl;
            }

            const newMember: NewFamilyMember = {
                name,
                photo_url: photoUrl,
                dob: dob || null,
                gender: null, // Optional for now
                partner_id: null,
                parent_ids: [],
                anniversary_date: null,
            };

            if (relationType === 'partner') {
                newMember.partner_id = relativeId;
            } else if (relationType === 'child') {
                newMember.parent_ids = [relativeId];
                // Check if X has a partner, AUTOMATICALLY add them as parent too
                const parent = existingMembers.find(m => m.id === relativeId);
                if (parent?.partner_id) {
                    newMember.parent_ids.push(parent.partner_id);
                }
            }

            const createdMember = await addFamilyMember(newMember);

            // POST-CREATION FIXUPS

            // 1. If adding as Partner, update the original person to link back
            if (relationType === 'partner' && createdMember) {
                await updateFamilyMember(relativeId, {
                    partner_id: createdMember.id
                });
            }

            // 2. If adding as Parent (Reverse logic)
            if (relationType === 'parent' && createdMember) {
                const child = existingMembers.find(m => m.id === relativeId);
                if (child) {
                    const currentParents = child.parent_ids || [];
                    const newParentIds = [...currentParents, createdMember.id];
                    await updateFamilyMember(child.id, {
                        parent_ids: newParentIds
                    });

                    // AUTO-FIX: If child now has 2 parents, link those parents as partners
                    if (newParentIds.length === 2) {
                        const p1Id = newParentIds[0];
                        const p2Id = newParentIds[1];
                        console.log("Linking parents as partners automatically");
                        await updateFamilyMember(p1Id, { partner_id: p2Id });
                        await updateFamilyMember(p2Id, { partner_id: p1Id });
                    }
                }
            }

            // 3. If adding as Child, and we automatically added a second parent (partner of relativeId)
            // Ensure that second parent is also linked back to the relativeId
            if (relationType === 'child' && createdMember && newMember.parent_ids?.length === 2) {
                const p1Id = newMember.parent_ids[0];
                const p2Id = newMember.parent_ids[1];
                const p1 = existingMembers.find(m => m.id === p1Id);
                const p2 = existingMembers.find(m => m.id === p2Id);
                if (p1 && p2 && (!p1.partner_id || !p2.partner_id)) {
                    await updateFamilyMember(p1Id, { partner_id: p2Id });
                    await updateFamilyMember(p2Id, { partner_id: p1Id });
                }
            }

            onMemberAdded();
            onClose();
        } catch (error) {
            console.error(error);
            alert('Failed to add member');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFixData = async () => {
        setIsSubmitting(true);
        try {
            // 1. Double check partners
            for (const m of existingMembers) {
                if (m.partner_id) {
                    const partner = existingMembers.find(p => p.id === m.partner_id);
                    if (partner && partner.partner_id !== m.id) {
                        console.log(`Fixing partner for ${partner.name}`);
                        await updateFamilyMember(partner.id, { partner_id: m.id });
                    }
                }
            }

            // 2. Double check parents (Co-parenting)
            // If a child has parent A, and A has partner B, ensure B is also parent.
            for (const m of existingMembers) {
                if (m.parent_ids && m.parent_ids.length > 0) {
                    const newParents = new Set(m.parent_ids);
                    let changed = false;
                    for (const pid of m.parent_ids) {
                        const parent = existingMembers.find(p => p.id === pid);
                        if (parent?.partner_id) {
                            if (!newParents.has(parent.partner_id)) {
                                newParents.add(parent.partner_id);
                                changed = true;
                            }
                        }
                    }
                    if (changed) {
                        console.log(`Fixing parents for ${m.name}`);
                        await updateFamilyMember(m.id, { parent_ids: Array.from(newParents) });
                    }
                }
            }
            alert("Relationships fixed!");
            if (onDataFix) onDataFix();
        } catch (e) {
            console.error(e);
            alert("Failed to fix data");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h3>Add Family Member</h3>
                    <button onClick={onClose}><X /></button>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.field}>
                        <label>Name</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Name"
                        />
                    </div>

                    <div className={styles.field}>
                        <label>Photo</label>
                        <div
                            className={styles.uploadBox}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {selectedFile ? (
                                <div className={styles.filePreview}>
                                    <span className={styles.fileName}>{selectedFile.name}</span>
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ) : (
                                <div className={styles.placeholder}>
                                    <Camera size={20} />
                                    <span>Upload Photo</span>
                                </div>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                onChange={e => {
                                    if (e.target.files?.[0]) setSelectedFile(e.target.files[0]);
                                }}
                            />
                        </div>
                    </div>

                    <div className={styles.field}>
                        <label>Date of Birth (Optional)</label>
                        <input
                            type="date"
                            value={dob}
                            onChange={e => setDob(e.target.value)}
                        />
                    </div>

                    {existingMembers.length > 0 && (
                        <div className={styles.section}>
                            <label>Relation</label>
                            <div className={styles.relationTypes}>
                                <button
                                    type="button"
                                    className={relationType === 'partner' ? styles.active : ''}
                                    onClick={() => setRelationType('partner')}
                                >
                                    <Heart size={16} /> Partner
                                </button>
                                <button
                                    type="button"
                                    className={relationType === 'child' ? styles.active : ''}
                                    onClick={() => setRelationType('child')}
                                >
                                    <Baby size={16} /> Child
                                </button>
                                <button
                                    type="button"
                                    className={relationType === 'parent' ? styles.active : ''}
                                    onClick={() => setRelationType('parent')}
                                >
                                    <ArrowUp size={16} /> Parent
                                </button>
                            </div>

                            <select
                                value={relativeId}
                                onChange={e => setRelativeId(e.target.value)}
                                className={styles.select}
                            >
                                {existingMembers.map(m => (
                                    <option key={m.id} value={m.id}>
                                        {relationType === 'partner' ? `Partner of ${m.name}` :
                                            relationType === 'child' ? `Child of ${m.name}` :
                                                `Parent of ${m.name}`}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <button type="submit" disabled={isSubmitting} className={styles.submitBtn}>
                        {isSubmitting ? <Loader2 className="animate-spin" /> : 'Add Member'}
                    </button>
                </form>
            </div>
        </div>
    );
}
