"use client";
import { useState, useRef } from 'react';
import { X, Edit2, Trash2, Camera, Save, Loader2, Play } from 'lucide-react';
import styles from './MomentDetailModal.module.css';
import { Moment, updateMoment, deleteMoment } from '@/actions/moments';
import { supabase } from '@/lib/supabaseClient';
import clsx from 'clsx';

interface MomentMedia {
    id: string;
    type: 'image' | 'video';
    url: string;
    thumbnail?: string;
}

interface MomentDetailModalProps {
    moment: Moment;
    onClose: () => void;
}

export default function MomentDetailModal({ moment, onClose }: MomentDetailModalProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Form state
    const [title, setTitle] = useState(moment.title);
    const [date, setDate] = useState(moment.date);
    const [description, setDescription] = useState(moment.description || '');
    const [tags, setTags] = useState<string[]>(moment.tags || []);
    const [media, setMedia] = useState<MomentMedia[]>(moment.media_urls as unknown as MomentMedia[] || []);

    const [activeIndex, setActiveIndex] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateMoment(moment.id, {
                title,
                date,
                description,
                tags,
                media_urls: media as any
            });
            setIsEditing(false);
            window.location.reload(); // Simple way to refresh UI
        } catch (error) {
            console.error("Update failed", error);
            alert("Failed to save changes");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this memory? It's precious! 🥺")) return;
        setIsDeleting(true);
        try {
            await deleteMoment(moment.id);
            onClose();
            window.location.reload();
        } catch (error) {
            console.error("Delete failed", error);
            alert("Failed to delete");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleFileAdd = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;
        setIsSaving(true);

        const files = Array.from(e.target.files);
        const newMedia: MomentMedia[] = [...media];

        for (const file of files) {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
            const { error } = await supabase.storage.from('moments').upload(fileName, file);

            if (error) {
                console.error("Upload failed", error);
                continue;
            }

            const { data: { publicUrl } } = supabase.storage.from('moments').getPublicUrl(fileName);
            newMedia.push({
                id: Math.random().toString(36).substring(2),
                type: file.type.startsWith('video') ? 'video' : 'image',
                url: publicUrl
            });
        }

        setMedia(newMedia);
        setIsSaving(false);
    };

    const removeMedia = (id: string) => {
        setMedia(media.filter(m => m.id !== id));
        if (activeIndex >= media.length - 1 && activeIndex > 0) {
            setActiveIndex(activeIndex - 1);
        }
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <button className={styles.closeBtn} onClick={onClose}><X size={20} /></button>

                <div className={styles.content}>
                    {/* Media Section */}
                    <div className={styles.mediaSection}>
                        <div className={styles.mainMedia}>
                            {media.length > 0 ? (
                                media[activeIndex].type === 'video' ? (
                                    <video src={media[activeIndex].url} controls />
                                ) : (
                                    <img src={media[activeIndex].url} alt={title} />
                                )
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-400">No media</div>
                            )}
                        </div>

                        <div className={styles.thumbnails}>
                            {media.map((item, idx) => (
                                <div
                                    key={item.id}
                                    className={clsx(styles.thumbItem, idx === activeIndex && styles.thumbItemActive)}
                                    onClick={() => setActiveIndex(idx)}
                                >
                                    <img src={item.type === 'video' ? (item.thumbnail || item.url) : item.url} alt="" />
                                    {item.type === 'video' && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                            <Play size={16} fill="white" />
                                        </div>
                                    )}
                                    {isEditing && (
                                        <button
                                            className={styles.removeMedia}
                                            onClick={(e) => { e.stopPropagation(); removeMedia(item.id); }}
                                        >
                                            <X size={10} />
                                        </button>
                                    )}
                                </div>
                            ))}
                            {isEditing && (
                                <div className={styles.uploadMore} onClick={() => fileInputRef.current?.click()}>
                                    <Camera size={24} />
                                    <input
                                        type="file"
                                        multiple
                                        className="hidden"
                                        ref={fileInputRef}
                                        onChange={handleFileAdd}
                                        style={{ display: 'none' }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Info Section */}
                    <div className={styles.infoSection}>
                        {isEditing ? (
                            <div className={styles.editForm}>
                                <input
                                    className={styles.editInput}
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    placeholder="Moment Title"
                                />
                                <input
                                    type="date"
                                    className={styles.editDate}
                                    value={date}
                                    onChange={e => setDate(e.target.value)}
                                />
                                <textarea
                                    className={styles.editTextarea}
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    rows={5}
                                    placeholder="Tell the story..."
                                />
                            </div>
                        ) : (
                            <>
                                <div className={styles.header}>
                                    <h2 className={styles.title}>{title}</h2>
                                    <span className={styles.date}>{new Date(date).toLocaleDateString()}</span>
                                </div>
                                <p className={styles.description}>{description || "No description provided."}</p>
                                <div className={styles.tags}>
                                    {tags.map(tag => (
                                        <span key={tag} className={styles.tag}>{tag}</span>
                                    ))}
                                </div>
                            </>
                        )}

                        <div className={styles.footer}>
                            {isEditing ? (
                                <>
                                    <button className={styles.saveBtn} onClick={handleSave} disabled={isSaving}>
                                        {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                        Save Changes
                                    </button>
                                    <button className={styles.cancelBtn} onClick={() => setIsEditing(false)}>Cancel</button>
                                </>
                            ) : (
                                <>
                                    <button className={styles.editBtn} onClick={() => setIsEditing(true)}>
                                        <Edit2 size={18} /> Edit
                                    </button>
                                    <button className={styles.deleteBtn} onClick={handleDelete} disabled={isDeleting}>
                                        <Trash2 size={18} /> {isDeleting ? "Deleting..." : "Delete"}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
