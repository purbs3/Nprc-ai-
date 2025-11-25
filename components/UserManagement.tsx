import React, { useState, useEffect } from 'react';
import type { User } from '../types';
import { getUsers } from '../services/authService';

const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            const allUsers = await getUsers();
            setUsers(allUsers.filter(u => u.role === 'user')); // Only show standard users
            setIsLoading(false);
        };
        loadData();
    }, []);

    const formatDate = (isoString: string) => {
        return new Date(isoString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <div className="bg-slate-800 p-8 rounded-xl border border-slate-700">
            <h1 className="text-2xl font-bold mb-6">User Management</h1>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-700/50 text-sm uppercase text-slate-300">
                        <tr>
                            <th className="p-3">Username</th>
                            <th className="p-3">Email</th>
                            <th className="p-3">Joined On</th>
                            <th className="p-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={4} className="text-center p-6 text-slate-400">Loading users...</td>
                            </tr>
                        ) : users.length > 0 ? (
                            users.map(user => (
                                <tr key={user.id} className="border-b border-slate-700">
                                    <td className="p-3 font-medium">{user.username}</td>
                                    <td className="p-3 text-slate-400">{user.email}</td>
                                    <td className="p-3 text-slate-400">{formatDate(user.createdAt)}</td>
                                    <td className="p-3 text-right">
                                        <button className="font-semibold text-red-400 hover:text-red-300 disabled:opacity-50" disabled>Delete</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className="text-center p-6 text-slate-400">No users found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserManagement;
