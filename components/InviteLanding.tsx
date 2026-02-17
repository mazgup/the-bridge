import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { Ticket, LogIn, AlertCircle, CheckCircle2 } from 'lucide-react';

interface InviteLandingProps {
    inviteId: string;
    onNavigate: (path: string) => void;
}

export const InviteLanding: React.FC<InviteLandingProps> = ({ inviteId, onNavigate }) => {
    const { user, signInWithGoogle, isAuthorized } = useAuth();
    const [status, setStatus] = useState<'loading' | 'valid' | 'expired' | 'used' | 'not_found'>('loading');

    useEffect(() => {
        const validateInvite = async () => {
            try {
                const inviteRef = doc(db, 'invites', inviteId);
                const inviteDoc = await getDoc(inviteRef);

                if (!inviteDoc.exists()) {
                    setStatus('not_found');
                    return;
                }

                const data = inviteDoc.data();

                if (data.used) {
                    setStatus('used');
                    return;
                }

                const expiresAt = data.expiresAt?.toDate?.() || new Date(data.expiresAt);
                if (expiresAt < new Date()) {
                    setStatus('expired');
                    return;
                }

                setStatus('valid');
                // Store invite ID for use after sign-in
                sessionStorage.setItem('pendingInviteId', inviteId);
            } catch (error) {
                console.error('Error validating invite:', error);
                setStatus('not_found');
            }
        };

        validateInvite();
    }, [inviteId]);

    // If user just got authorized, redirect to home
    useEffect(() => {
        if (isAuthorized) {
            onNavigate('/');
        }
    }, [isAuthorized, onNavigate]);

    const handleSignIn = async () => {
        sessionStorage.setItem('pendingInviteId', inviteId);
        await signInWithGoogle();
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F5F5F0] p-6">
            <div className="max-w-md w-full text-center">
                {status === 'loading' && (
                    <>
                        <div className="animate-spin w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto mb-6" />
                        <p className="text-slate-500">Validating invite link...</p>
                    </>
                )}

                {status === 'valid' && (
                    <>
                        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Ticket size={40} className="text-emerald-500" />
                        </div>
                        <h1 className="text-3xl font-serif text-[#1a1a2e] mb-3">You're Invited!</h1>
                        <p className="text-slate-500 mb-8">
                            You've been invited to join <strong>The Bridge</strong> — your personal career platform.
                            Sign in with Google to get started.
                        </p>
                        {!user && (
                            <button
                                onClick={handleSignIn}
                                className="inline-flex items-center gap-2 px-8 py-4 bg-[#1a1a2e] text-white rounded-xl text-sm font-bold hover:bg-slate-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                            >
                                <LogIn size={18} />
                                Sign In with Google
                            </button>
                        )}
                        {user && !isAuthorized && (
                            <div className="flex items-center gap-2 justify-center text-emerald-600">
                                <div className="animate-spin w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full" />
                                <span className="text-sm">Setting up your account...</span>
                            </div>
                        )}
                    </>
                )}

                {status === 'expired' && (
                    <>
                        <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertCircle size={40} className="text-amber-500" />
                        </div>
                        <h1 className="text-3xl font-serif text-[#1a1a2e] mb-3">Invite Expired</h1>
                        <p className="text-slate-500">
                            This invite link has expired. Please ask the administrator for a new one.
                        </p>
                    </>
                )}

                {status === 'used' && (
                    <>
                        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 size={40} className="text-blue-500" />
                        </div>
                        <h1 className="text-3xl font-serif text-[#1a1a2e] mb-3">Invite Already Used</h1>
                        <p className="text-slate-500 mb-6">
                            This invite link has already been used. If you already have an account, sign in below.
                        </p>
                        {!user && (
                            <button
                                onClick={signInWithGoogle}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-[#1a1a2e] text-white rounded-xl text-sm font-medium hover:bg-slate-700 transition-colors"
                            >
                                <LogIn size={16} />
                                Sign In
                            </button>
                        )}
                    </>
                )}

                {status === 'not_found' && (
                    <>
                        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertCircle size={40} className="text-red-400" />
                        </div>
                        <h1 className="text-3xl font-serif text-[#1a1a2e] mb-3">Invalid Invite</h1>
                        <p className="text-slate-500">
                            This invite link is invalid. Please check the link and try again.
                        </p>
                    </>
                )}
            </div>
        </div>
    );
};
