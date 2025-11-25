import React, { useState, useEffect, FormEvent } from 'react';
import type { TreatmentPlan } from '../types';
import { getTreatmentPlans, saveTreatmentPlans } from '../services/treatmentPlanService';
import { XIcon } from './IconComponents';

const TreatmentPlanManagement: React.FC = () => {
    const [plans, setPlans] = useState<TreatmentPlan[]>([]);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [editingPlan, setEditingPlan] = useState<TreatmentPlan | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Form state
    const [patientName, setPatientName] = useState('');
    const [condition, setCondition] = useState('');
    const [goals, setGoals] = useState('');
    const [exercises, setExercises] = useState<{ name: string; sets: number; reps: number; frequency: string; }[]>([]);

    useEffect(() => {
        const loadPlans = async () => {
            setIsLoading(true);
            const fetchedPlans = await getTreatmentPlans();
            setPlans(fetchedPlans);
            setIsLoading(false);
        };
        loadPlans();
    }, []);

    const handleSaveChanges = async (updatedPlans: TreatmentPlan[]) => {
        setPlans(updatedPlans);
        await saveTreatmentPlans(updatedPlans);
    };

    const resetForm = () => {
        setPatientName('');
        setCondition('');
        setGoals('');
        setExercises([]);
        setEditingPlan(null);
    };

    const handleEdit = (plan: TreatmentPlan) => {
        setEditingPlan(plan);
        setPatientName(plan.patientName);
        setCondition(plan.condition);
        setGoals(plan.goals);
        setExercises(plan.exercises);
        setIsFormVisible(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this treatment plan?')) {
            const updatedPlans = plans.filter(p => p.id !== id);
            await handleSaveChanges(updatedPlans);
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
        const planData = { patientName, condition, goals, exercises };

        let updatedPlans;
        if (editingPlan) {
            updatedPlans = plans.map(p => p.id === editingPlan.id ? { ...p, ...planData } : p);
        } else {
            const newPlan: TreatmentPlan = {
                id: Date.now().toString(),
                ...planData
            };
            updatedPlans = [newPlan, ...plans];
        }
        await handleSaveChanges(updatedPlans);
        setIsFormVisible(false);
        resetForm();
    };

    const handleExerciseChange = (index: number, field: string, value: string | number) => {
        const newExercises = [...exercises];
        (newExercises[index] as any)[field] = value;
        setExercises(newExercises);
    };

    const addExercise = () => {
        setExercises([...exercises, { name: '', sets: 3, reps: 10, frequency: '' }]);
    };

    const removeExercise = (index: number) => {
        setExercises(exercises.filter((_, i) => i !== index));
    };

    return (
        <div className="bg-slate-800 p-8 rounded-xl border border-slate-700">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Treatment Plan Management</h1>
                {!isFormVisible && (
                    <button onClick={handleAddNew} className="bg-cyan-500 text-white px-4 py-2 rounded-lg hover:bg-cyan-400">
                        Create New Plan
                    </button>
                )}
            </div>

            {isFormVisible ? (
                <form onSubmit={handleSubmit} className="space-y-6 bg-slate-700/50 p-6 rounded-lg">
                    <h2 className="text-xl font-semibold">{editingPlan ? 'Edit Plan' : 'Create New Plan'}</h2>
                    {/* Form fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="tp-patientName" className="block text-slate-300 mb-1">Patient Name</label>
                            <input id="tp-patientName" type="text" value={patientName} onChange={e => setPatientName(e.target.value)} required className="w-full bg-slate-700 rounded-lg p-2 focus:ring-2 focus:ring-cyan-500 outline-none" />
                        </div>
                        <div>
                            <label htmlFor="tp-condition" className="block text-slate-300 mb-1">Condition</label>
                            <input id="tp-condition" type="text" value={condition} onChange={e => setCondition(e.target.value)} required className="w-full bg-slate-700 rounded-lg p-2 focus:ring-2 focus:ring-cyan-500 outline-none" />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="tp-goals" className="block text-slate-300 mb-1">Goals</label>
                        <textarea id="tp-goals" value={goals} onChange={e => setGoals(e.target.value)} rows={3} required className="w-full bg-slate-700 rounded-lg p-2 focus:ring-2 focus:ring-cyan-500 outline-none" />
                    </div>

                    {/* Exercises section */}
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Exercises</h3>
                        <div className="space-y-3">
                            {exercises.map((ex, index) => (
                                <div key={index} className="grid grid-cols-12 gap-2 items-center bg-slate-600/50 p-2 rounded">
                                    <input type="text" placeholder="Name" value={ex.name} onChange={e => handleExerciseChange(index, 'name', e.target.value)} className="col-span-4 bg-slate-700 rounded p-1 text-sm" />
                                    <input type="number" placeholder="Sets" value={ex.sets} onChange={e => handleExerciseChange(index, 'sets', parseInt(e.target.value) || 0)} className="col-span-1 bg-slate-700 rounded p-1 text-sm" />
                                    <input type="number" placeholder="Reps" value={ex.reps} onChange={e => handleExerciseChange(index, 'reps', parseInt(e.target.value) || 0)} className="col-span-1 bg-slate-700 rounded p-1 text-sm" />
                                    <input type="text" placeholder="Frequency" value={ex.frequency} onChange={e => handleExerciseChange(index, 'frequency', e.target.value)} className="col-span-5 bg-slate-700 rounded p-1 text-sm" />
                                    <button type="button" onClick={() => removeExercise(index)} className="col-span-1 text-red-400 hover:text-red-300"><XIcon className="h-5 w-5 mx-auto" /></button>
                                </div>
                            ))}
                        </div>
                        <button type="button" onClick={addExercise} className="mt-3 text-sm text-cyan-400 hover:text-cyan-300 font-semibold">+ Add Exercise</button>
                    </div>

                    <div className="flex gap-4 pt-4 border-t border-slate-600">
                        <button type="submit" className="bg-cyan-500 text-white px-4 py-2 rounded-lg hover:bg-cyan-400">
                            {editingPlan ? 'Update Plan' : 'Save Plan'}
                        </button>
                        <button type="button" onClick={handleCancel} className="bg-slate-600 text-white px-4 py-2 rounded-lg hover:bg-slate-500">
                            Cancel
                        </button>
                    </div>
                </form>
            ) : (
                <div className="space-y-4">
                    {isLoading ? (
                        <p className="text-slate-400 text-center py-4">Loading plans...</p>
                    ) : plans.map(plan => (
                        <div key={plan.id} className="bg-slate-700/50 p-4 rounded-lg">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-lg">{plan.patientName} - <span className="text-cyan-400">{plan.condition}</span></h3>
                                    <p className="text-sm text-slate-400 mt-1">Goals: {plan.goals}</p>
                                </div>
                                <div className="flex gap-4 flex-shrink-0 ml-4">
                                    <button onClick={() => handleEdit(plan)} className="font-semibold text-cyan-400 hover:text-cyan-300">Edit</button>
                                    <button onClick={() => handleDelete(plan.id)} className="font-semibold text-red-400 hover:text-red-300">Delete</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TreatmentPlanManagement;
