import React, { useState, useEffect, FormEvent } from 'react';
import type { Workshop } from '../types';
import { getWorkshops, saveWorkshops } from '../services/workshopService';

export default function WorkshopManagement(): React.ReactElement {
    const [workshops, setWorkshops] = useState<Workshop[]>([]);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [editingWorkshop, setEditingWorkshop] = useState<Workshop | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [instructor, setInstructor] = useState('');
    const [registrationLink, setRegistrationLink] = useState('');

    useEffect(() => {
        const loadWorkshops = async () => {
            setIsLoading(true);
            const fetchedWorkshops = await getWorkshops();
            setWorkshops(fetchedWorkshops);
            setIsLoading(false);
        };
        loadWorkshops();
    }, []);

    const handleSaveChanges = async (updatedWorkshops: Workshop[]) => {
        setWorkshops(updatedWorkshops);
        await saveWorkshops(updatedWorkshops);
    };

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setDate('');
        setTime('');
        setInstructor('');
        setRegistrationLink('');
        setEditingWorkshop(null);
    };

    const handleEdit = (workshop: Workshop) => {
        setEditingWorkshop(workshop);
        setTitle(workshop.title);
        setDescription(workshop.description);
        setDate(workshop.date);
        setTime(workshop.time);
        setInstructor(workshop.instructor);
        setRegistrationLink(workshop.registrationLink);
        setIsFormVisible(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this workshop?')) {
            const updatedWorkshops = workshops.filter(w => w.id !== id);
            await handleSaveChanges(updatedWorkshops);
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

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const workshopData = { title, description, date, time, instructor, registrationLink };

        let updatedWorkshops;
        if (editingWorkshop) {
            updatedWorkshops = workshops.map(w => w.id === editingWorkshop.id ? { ...w, ...workshopData } : w);
        } else {
            const newWorkshop: Workshop = {
                id: Date.now().toString(),
                ...workshopData
            };
            updatedWorkshops = [newWorkshop, ...workshops];
        }
        await handleSaveChanges(updatedWorkshops);
        setIsFormVisible(false);
        resetForm();
    };

    return (
        <div className="bg-slate-800 p-8 rounded-xl border border-slate-700">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Workshop Management</h1>
                {!isFormVisible && (
                    <button onClick={handleAddNew} className="bg-cyan-500 text-white px-4 py-2 rounded-lg hover:bg-cyan-400">
                        Add New Workshop
                    </button>
                )}
            </div>

            {isFormVisible ? (
                <form onSubmit={handleSubmit} className="space-y-4 bg-slate-700/50 p-6 rounded-lg">
                    <h2 className="text-xl font-semibold">{editingWorkshop ? 'Edit Workshop' : 'Create New Workshop'}</h2>
                    <div>
                        <label htmlFor="ws-title" className="block text-slate-300 mb-1">Title</label>
                        <input id="ws-title" type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full bg-slate-700 rounded-lg p-2 focus:ring-2 focus:ring-cyan-500 outline-none" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="ws-date" className="block text-slate-300 mb-1">Date</label>
                            <input id="ws-date" type="date" value={date} onChange={e => setDate(e.target.value)} required className="w-full bg-slate-700 rounded-lg p-2 focus:ring-2 focus:ring-cyan-500 outline-none" />
                        </div>
                        <div>
                            <label htmlFor="ws-time" className="block text-slate-300 mb-1">Time</label>
                            <input id="ws-time" type="time" value={time} onChange={e => setTime(e.target.value)} required className="w-full bg-slate-700 rounded-lg p-2 focus:ring-2 focus:ring-cyan-500 outline-none" />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="ws-instructor" className="block text-slate-300 mb-1">Instructor</label>
                        <input id="ws-instructor" type="text" value={instructor} onChange={e => setInstructor(e.target.value)} required className="w-full bg-slate-700 rounded-lg p-2 focus:ring-2 focus:ring-cyan-500 outline-none" />
                    </div>
                    <div>
                        <label htmlFor="ws-desc" className="block text-slate-300 mb-1">Description</label>
                        <textarea id="ws-desc" value={description} onChange={e => setDescription(e.target.value)} rows={4} required className="w-full bg-slate-700 rounded-lg p-2 focus:ring-2 focus:ring-cyan-500 outline-none" />
                    </div>
                    <div>
                        <label htmlFor="ws-link" className="block text-slate-300 mb-1">Registration Link</label>
                        <input id="ws-link" type="url" value={registrationLink} onChange={e => setRegistrationLink(e.target.value)} required className="w-full bg-slate-700 rounded-lg p-2 focus:ring-2 focus:ring-cyan-500 outline-none" />
                    </div>
                    <div className="flex gap-4 pt-4">
                        <button type="submit" className="bg-cyan-500 text-white px-4 py-2 rounded-lg hover:bg-cyan-400">
                            {editingWorkshop ? 'Update Workshop' : 'Save Workshop'}
                        </button>
                        <button type="button" onClick={handleCancel} className="bg-slate-600 text-white px-4 py-2 rounded-lg hover:bg-slate-500">
                            Cancel
                        </button>
                    </div>
                </form>
            ) : (
                <div className="space-y-4">
                    {isLoading ? (
                        <p className="text-slate-400 text-center py-4">Loading workshops...</p>
                    ) : workshops.map(ws => (
                        <div key={ws.id} className="bg-slate-700/50 p-4 rounded-lg flex justify-between items-center">
                            <div>
                                <h3 className="font-bold">{ws.title}</h3>
                                <p className="text-sm text-slate-400">{ws.date} at {ws.time} - by {ws.instructor}</p>
                            </div>
                            <div className="flex gap-4">
                                <button onClick={() => handleEdit(ws)} className="font-semibold text-cyan-400 hover:text-cyan-300">Edit</button>
                                <button onClick={() => handleDelete(ws.id)} className="font-semibold text-red-400 hover:text-red-300">Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
