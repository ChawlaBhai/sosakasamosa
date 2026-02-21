'use client';
import React, { useState, useRef } from 'react';
import { X, Camera, Trash2, Loader2, Save } from 'lucide-react';
import styles from './MemberEditModal.module.css';
import { FamilyMember, updateFamilyMember, deleteFamilyMember } from '@/actions/family';
import { supabase } from '@/lib/supabaseClient';

interface MemberEditModalProps {
    member: FamilyMember;
    onClose: () => void;
    onUpdate: () => void;
}

export default function MemberEditModal({ member, onClose, onUpdate }: MemberEditModalProps) {
    const [name, setName] = useState(member.name);
    const [dob, setDob] = useState(member.dob || '');
    const [gender, setGender] = useState(member.gender || 'other');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState(member.photo_url);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            let finalPhotoUrl = member.photo_url;

            if (selectedFile) {
                const fileExt = selectedFile.name.split('.').pop();
                const fileName = `${Math.random()}.${fileExt}`;
                const filePath = `family/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('family-photos')
                    .upload(filePath, selectedFile);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('family-photos')
                    .getPublicUrl(filePath);

                finalPhotoUrl = publicUrl;
            }

            await updateFamilyMember(member.id, {
                name,
                dob,
                gender,
                photo_url: finalPhotoUrl
            });

            onUpdate();
            onClose();
        } catch (error) {
            console.error(error);
            alert('Failed to update member');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm(`Are you sure you want to remove ${member.name}?`)) return;

        setIsDeleting(true);
        try {
            await deleteFamilyMember(member.id);
            onUpdate();
            onClose();
        } catch (error) {
            console.error(error);
            alert('Failed to delete member');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.header}>
                    <h3>Edit Member</h3>
                    <button onClick={onClose} className={styles.closeBtn}><X /></button>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.imageSection}>
                        <div className={styles.preview}>
                            {previewUrl ? (
                                <img src={previewUrl} alt="Preview" />
                            ) : (
                                <Camera size={40} color="#ccc" />
                            )}
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            style={{ display: 'none' }}
                        />
                        <button
                            type="button"
                            className={styles.uploadBtn}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Camera size={16} />
                            Change Photo
                        </button>
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Date of Birth</label>
                        <input
                            type="date"
                            value={dob}
                            onChange={e => setDob(e.target.value)}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Gender</label>
                        <select value={gender} onChange={e => setGender(e.target.value)}>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    <div className={styles.actions}>
                        <button type="button" className={styles.deleteBtn} onClick={handleDelete} disabled={isDeleting}>
                            {isDeleting ? <Loader2 className="animate-spin" /> : <Trash2 size={18} />}
                            {isDeleting ? "" : "Delete"}
                        </button>
                        <button type="submit" className={styles.saveBtn} disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                            {isSubmitting ? " Saving..." : " Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
