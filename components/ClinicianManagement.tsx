import React, { useState, useEffect, FormEvent } from 'react';
import type { Clinician } from '../types';
import { getClinicians, addClinician, deleteClinician } from '../services/clinicianService';

const ClinicianManagement: React.FC = () => {
    const [clinicians, setClinicians] = useState<Clinician[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormVisible, setIsFormVisible] = useState(false);

    // Form state for adding/editing a clinician
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [title, setTitle] = useState('');
    const [bio, setBio] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        loadClinicians();
    }, []);

    const loadClinicians = async () => {
        setIsLoading(true);
        const fetchedClinicians = await getClinicians();
        setClinicians(fetchedClinicians);
        setIsLoading(false);
    };

    const resetForm = () => {
        setUsername('');
        setPassword('');
        setName('');
        setTitle('');
        setBio('');
        setImageUrl('');
        setError('');
    };

    const handleAddNew = () => {
        resetForm();
        setIsFormVisible(true);
    };

    const handleCancel = () => {
        setIsFormVisible(false);
        resetForm();
    };

    const handleDelete = async (id: string, clinicianName: string) => {
        if (window.confirm(`Are you sure you want to delete the clinician "${clinicianName}"?`)) {
            await deleteClinician(id);
            loadClinicians(); // Refresh the list
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        if (password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }

        const result = await addClinician({
            username,
            passwordHash: password,
            name,
            title,
            bio,
            imageUrl,
        });

        if (result.success) {
            setIsFormVisible(false);
            resetForm();
            loadClinicians(); // Refresh the list
        } else {
            setError(result.message);
        }
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
                    <h2 className="text-xl font-semibold">Create New Clinician Account</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="cl-name" className="block text-slate-300 mb-1">Full Name</label>
                            <input id="cl-name" type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full bg-slate-700 rounded-lg p-2 focus:ring-2 focus:ring-cyan-500 outline-none" />
                        </div>
                        <div>
                            <label htmlFor="cl-title" className="block text-slate-300 mb-1">Title (e.g., DPT)</label>
                            <input id="cl-title" type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full bg-slate-700 rounded-lg p-2 focus:ring-2 focus:ring-cyan-500 outline-none" />
                        </div>
                        <div>
                            <label htmlFor="cl-username" className="block text-slate-300 mb-1">Username (for login)</label>
                            <input id="cl-username" type="text" value={username} onChange={e => setUsername(e.target.value)} required className="w-full bg-slate-700 rounded-lg p-2 focus:ring-2 focus:ring-cyan-500 outline-none" />
                        </div>
                        <div>
                            <label htmlFor="cl-password" className="block text-slate-300 mb-1">Password</label>
                            <input id="cl-password" type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full bg-slate-700 rounded-lg p-2 focus:ring-2 focus:ring-cyan-500 outline-none" />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="cl-imageUrl" className="block text-slate-300 mb-1">Image URL</label>
                        <input id="cl-imageUrl" type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)} required className="w-full bg-slate-700 rounded-lg p-2 focus:ring-2 focus:ring-cyan-500 outline-none" placeholder="https://i.pravatar.cc/150?u=unique-id" />
                    </div>
                    <div>
                        <label htmlFor="cl-bio" className="block text-slate-300 mb-1">Bio</label>
                        <textarea id="cl-bio" value={bio} onChange={e => setBio(e.target.value)} rows={3} required className="w-full bg-slate-700 rounded-lg p-2 focus:ring-2 focus:ring-cyan-500 outline-none" />
                    </div>
                    {error && <p className="text-red-400 text-sm">{error}</p>}
                    <div className="flex gap-4 pt-4">
                        <button type="submit" className="bg-cyan-500 text-white px-4 py-2 rounded-lg hover:bg-cyan-400">Save Clinician</button>
                        <button type="button" onClick={handleCancel} className="bg-slate-600 text-white px-4 py-2 rounded-lg hover:bg-slate-500">Cancel</button>
                    </div>
                </form>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-700/50 text-sm uppercase text-slate-300">
                            <tr>
                                <th className="p-3">Name</th>
                                <th className="p-3">Username</th>
                                <th className="p-3">Password</th>
                                <th className="p-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan={4} className="text-center p-6 text-slate-400">Loading clinicians...</td></tr>
                            ) : clinicians.length > 0 ? (
                                clinicians.map(clinician => (
                                    <tr key={clinician.id} className="border-b border-slate-700">
                                        <td className="p-3 font-medium">{clinician.name} <span className="text-xs text-slate-400">({clinician.title})</span></td>
                                        <td className="p-3 text-slate-400">{clinician.username}</td>
                                        <td className="p-3 text-slate-400">{clinician.passwordHash}</td>
                                        <td className="p-3 text-right">
                                            <button onClick={() => handleDelete(clinician.id, clinician.name)} className="font-semibold text-red-400 hover:text-red-300">Delete</button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={4} className="text-center p-6 text-slate-400">No clinicians found. Click "Add New Clinician" to get started.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ClinicianManagement;