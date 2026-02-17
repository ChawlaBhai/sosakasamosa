import { useState, useRef } from 'react';
import { Camera, Plus, Loader2, X } from 'lucide-react';
import styles from './AddMomentForm.module.css';
import { createMoment } from '@/actions/moments';
import { supabase } from '@/lib/supabaseClient';
// import { v4 as uuidv4 } from 'uuid'; // Removed unused import

export default function AddMomentForm() {
    const [title, setTitle] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [description, setDescription] = useState('');
    const [tags, setTags] = useState<string[]>([]);

    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    const TAG_OPTIONS = ["Anniversary 💑", "Trip ✈️", "Date Night 🍽️", "Milestone 🏆", "Random Joy ✨"];

    const toggleTag = (tag: string) => {
        if (tags.includes(tag)) {
            setTags(tags.filter(t => t !== tag));
        } else {
            setTags([...tags, tag]);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedFiles(prev => [...prev, ...Array.from(e.target.files || [])]);
        }
    };

    const removeFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (!title || !date) return;
        setIsUploading(true);

        try {
            const uploadedMedia = [];

            // 1. Upload files to Supabase Storage
            for (const file of selectedFiles) {
                const fileExt = file.name.split('.').pop();
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
                const filePath = `${fileName}`;

                const { data, error } = await supabase.storage
                    .from('moments')
                    .upload(filePath, file);

                if (error) {
                    console.error('Upload error:', error);
                    continue;
                }

                const { data: { publicUrl } } = supabase.storage
                    .from('moments')
                    .getPublicUrl(filePath);

                uploadedMedia.push({
                    id: Math.random().toString(36).substring(2),
                    type: file.type.startsWith('video') ? 'video' : 'image',
                    url: publicUrl
                });
            }

            // 2. Save Moment to Database
            await createMoment({
                title,
                date,
                description,
                tags,
                media_urls: uploadedMedia, // Store as JSON
            });

            // Reset form
            setTitle('');
            setDescription('');
            setTags([]);
            setSelectedFiles([]);
            alert('Moment saved! ✨');

        } catch (error) {
            console.error('Error saving moment:', error);
            alert('Failed to save moment. Check console.');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className={styles.formCard}>
            <div className={styles.header}>
                <span className={styles.sparkle}>✦</span>
                <span className={styles.subtext}>capture a new moment</span>
            </div>

            <div className={styles.inputGroup}>
                <input
                    type="text"
                    placeholder="what do we call this one? 🌟"
                    className={styles.titleInput}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
            </div>

            <div className={styles.row}>
                <div className={styles.inputGroup}>
                    <label className={styles.label}>When?</label>
                    <input
                        type="date"
                        className={styles.dateInput}
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                    />
                </div>
            </div>

            <div className={styles.inputGroup}>
                <textarea
                    placeholder="tell the story... or don't, it's okay too 🤍"
                    rows={3}
                    className={styles.textarea}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
            </div>

            <div className={styles.tagsContainer}>
                {TAG_OPTIONS.map(tag => (
                    <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`${styles.tagBtn} ${tags.includes(tag) ? styles.activeTag : ''}`}
                    >
                        {tag}
                    </button>
                ))}
                <button className={styles.addTagBtn}>+ Add</button>
            </div>

            <div className={styles.mediaUpload}>
                <div
                    className={styles.uploadBox}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <Camera size={24} className={styles.uploadIcon} />
                    <span>{selectedFiles.length > 0 ? `${selectedFiles.length} files selected` : 'Add photos or videos'}</span>
                    <input
                        type="file"
                        multiple
                        accept="image/*,video/*"
                        className="hidden"
                        style={{ display: 'none' }}
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                    />
                </div>
                {selectedFiles.length > 0 && (
                    <div className={styles.fileList} style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', overflowX: 'auto' }}>
                        {selectedFiles.map((file, i) => (
                            <div key={i} className={styles.filePreview} style={{ position: 'relative', background: '#eee', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>
                                {file.name.substring(0, 15)}...
                                <button onClick={(e) => { e.stopPropagation(); removeFile(i); }} style={{ marginLeft: '0.5rem', color: 'red' }}>
                                    <X size={12} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className={styles.actions}>
                <button
                    className={styles.clearBtn}
                    onClick={() => {
                        setTitle('');
                        setDescription('');
                        setTags([]);
                        setSelectedFiles([]);
                    }}
                >
                    clear all
                </button>
                <button
                    className={styles.saveBtn}
                    onClick={handleSubmit}
                    disabled={isUploading}
                    style={{ opacity: isUploading ? 0.7 : 1, cursor: isUploading ? 'not-allowed' : 'pointer' }}
                >
                    {isUploading ? (
                        <>Saving... <Loader2 className="animate-spin" size={16} /></>
                    ) : (
                        'Save Moment ✦'
                    )}
                </button>
            </div>
        </div>
    );
}
