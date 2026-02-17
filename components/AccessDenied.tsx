import React from 'react';
import { ShieldX, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AccessDenied: React.FC = () => {
    const { logout, user } = useAuth();

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F5F5F0] p-6">
            <div className="max-w-md w-full text-center">
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShieldX size={40} className="text-red-400" />
                </div>

                <h1 className="text-3xl font-serif text-[#1a1a2e] mb-3">Access Denied</h1>

                <p className="text-slate-500 mb-2">
                    Sorry, <strong>{user?.email}</strong> is not authorized to access The Bridge.
                </p>
                <p className="text-slate-400 text-sm mb-8">
                    This platform is currently invite-only. If you believe you should have access, please contact the administrator.
                </p>

                <button
                    onClick={logout}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#1a1a2e] text-white rounded-xl text-sm font-medium hover:bg-slate-700 transition-colors"
                >
                    <LogOut size={16} />
                    Sign Out
                </button>
            </div>
        </div>
    );
};
