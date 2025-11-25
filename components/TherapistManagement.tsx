import React, { useState, useEffect, FormEvent } from 'react';
import type { Therapist } from '../types';
import { getTherapists, saveTherapists } from '../services/therapistService';
import { fileToBase64 } from '../utils/image';

const TherapistManagement: React.FC = () => {
    const [therapists, setTherapists] = useState<Therapist[]>([]);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [editingTherapist, setEditingTherapist] = useState<Therapist | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Form state
    const [name, setName] = useState('');
    const [title, setTitle] = useState('');
    const [bio, setBio] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [whatsappNumber, setWhatsappNumber] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);


    useEffect(() => {
        const loadTherapists = async () => {
            setIsLoading(true);
            const fetchedTherapists = await getTherapists();
            setTherapists(fetchedTherapists);
            setIsLoading(false);
        };
        loadTherapists();
    }, []);

    const handleSaveChanges = async (updatedTherapists: Therapist[]) => {
        setTherapists(updatedTherapists);
        await saveTherapists(updatedTherapists);
    };

    const resetForm = () => {
        setName('');
        setTitle('');
        setBio('');
        setImageUrl('');
        setWhatsappNumber('');
        setImageFile(null);
        setEditingTherapist(null);
    };

    const handleEdit = (therapist: Therapist) => {
        setEditingTherapist(therapist);
        setName(therapist.name);
        setTitle(therapist.title);
        setBio(therapist.bio);
        setImageUrl(therapist.imageUrl);
        setWhatsappNumber(therapist.whatsappNumber);
        setImageFile(null);
        setIsFormVisible(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this therapist?')) {
            const updatedTherapists = therapists.filter(t => t.id !== id);
            await handleSaveChanges(updatedTherapists);
        }
    };

    const handleAddNew = () => {
        resetForm();
        setIsFormVisible(true);
    };

    const handleCancel = () => {
        setIsFormVisible(false);
        resetForm();
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setImageUrl(URL.createObjectURL(file)); // Set preview URL
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        let finalImageUrl = imageUrl;
        if (imageFile) {
            const base64String = await fileToBase64(imageFile);
            finalImageUrl = `data:${imageFile.type};base64,${base64String}`;
        }

        const therapistData = { name, title, bio, imageUrl: finalImageUrl, whatsappNumber };

        let updatedTherapists;
        if (editingTherapist) {
            updatedTherapists = therapists.map(t => t.id === editingTherapist.id ? { ...t, ...therapistData } : t);
        } else {
            const newTherapist: Therapist = {
                id: Date.now().toString(),
                ...therapistData
            };
            updatedTherapists = [newTherapist, ...therapists];
        }
        await handleSaveChanges(updatedTherapists);
        setIsFormVisible(false);
        resetForm();
    };

    return (
        <div className="bg-slate-800 p-8 rounded-xl border border-slate-700">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Clinician Management</h1>
                {!isFormVisible && (
                    <button onClick={handleAddNew} className="bg-cyan-500 text-white px-4 py-2 rounded-lg hover:bg-cyan-400">
                        Add New Clinician
                    </button>
                )}
            </div>

            {isFormVisible ? (
                <form onSubmit={handleSubmit} className="space-y-4 bg-slate-700/50 p-6 rounded-lg">
                    <h2 className="text-xl font-semibold">{editingTherapist ? 'Edit Clinician' : 'Add New Clinician'}</h2>
                    <div>
                        <label htmlFor="th-name" className="block text-slate-300 mb-1">Name</label>
                        <input id="th-name" type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full bg-slate-700 rounded-lg p-2 focus:ring-2 focus:ring-cyan-500 outline-none" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="th-title" className="block text-slate-300 mb-1">Title</label>
                            <input id="th-title" type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full bg-slate-700 rounded-lg p-2 focus:ring-2 focus:ring-cyan-500 outline-none" />
                        </div>
                        <div>
                            <label htmlFor="th-whatsapp" className="block text-slate-300 mb-1">WhatsApp Number</label>
                            <input id="th-whatsapp" type="tel" value={whatsappNumber} onChange={e => setWhatsappNumber(e.target.value)} required className="w-full bg-slate-700 rounded-lg p-2 focus:ring-2 focus:ring-cyan-500 outline-none" />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="th-imageFile" className="block text-slate-300 mb-1">Profile Picture</label>
                        <div className="flex items-center gap-4">
                            {imageUrl && <img src={imageUrl} alt="preview" className="h-16 w-16 rounded-full object-cover" />}
                            <input id="th-imageFile" type="file" accept="image/*" onChange={handleImageChange} className="w-full bg-slate-700 rounded-lg p-2 focus:ring-2 focus:ring-cyan-500 outline-none file:mr-4 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-500/20 file:text-cyan-300 hover:file:bg-cyan-500/30" />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="th-bio" className="block text-slate-300 mb-1">Bio</label>
                        <textarea id="th-bio" value={bio} onChange={e => setBio(e.target.value)} rows={3} required className="w-full bg-slate-700 rounded-lg p-2 focus:ring-2 focus:ring-cyan-500 outline-none" />
                    </div>
                    <div className="flex gap-4 pt-4">
                        <button type="submit" className="bg-cyan-500 text-white px-4 py-2 rounded-lg hover:bg-cyan-400">
                            {editingTherapist ? 'Update Clinician' : 'Save Clinician'}
                        </button>
                        <button type="button" onClick={handleCancel} className="bg-slate-600 text-white px-4 py-2 rounded-lg hover:bg-slate-500">
                            Cancel
                        </button>
                    </div>
                </form>
            ) : (
                <div className="space-y-4">
                    {isLoading ? (
                        <p className="text-slate-400 text-center py-4">Loading clinicians...</p>
                    ) : therapists.length > 0 ? (
                        therapists.map(therapist => (
                            <div key={therapist.id} className="bg-slate-700/50 p-4 rounded-lg flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <img src={therapist.imageUrl} alt={therapist.name} className="h-12 w-12 rounded-full object-cover" />
                                    <div>
                                        <h3 className="font-bold">{therapist.name}</h3>
                                        <p className="text-sm text-slate-400">{therapist.title}</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <button onClick={() => handleEdit(therapist)} className="font-semibold text-cyan-400 hover:text-cyan-300">Edit</button>
                                    <button onClick={() => handleDelete(therapist.id)} className="font-semibold text-red-400 hover:text-red-300">Delete</button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-slate-400 text-center py-4">No clinicians found. Click "Add New Clinician" to get started.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default TherapistManagement;