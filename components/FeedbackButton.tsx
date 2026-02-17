import React, { useState } from 'react';
import { MessageSquarePlus, X, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

interface FeedbackButtonProps {
    currentPage: string;
}

export const FeedbackButton: React.FC<FeedbackButtonProps> = ({ currentPage }) => {
    const { user, isAuthorized } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    if (!isAuthorized || !user) return null;

    const handleSubmit = async () => {
        if (!message.trim()) return;

        setIsSubmitting(true);
        try {
            await addDoc(collection(db, 'feedback'), {
                userId: user.uid,
                userEmail: user.email,
                userName: user.displayName || '',
                page: currentPage,
                message: message.trim(),
                createdAt: new Date().toISOString(),
                userAgent: navigator.userAgent,
            });
            setSubmitted(true);
            setMessage('');
            setTimeout(() => {
                setSubmitted(false);
                setIsOpen(false);
            }, 2000);
        } catch (error) {
            console.error('Error submitting feedback:', error);
            alert('Failed to submit feedback. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            {/* Floating Button */}
            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-8 right-8 z-[90] flex items-center gap-2 px-4 py-3 bg-[#1a1a2e] text-white rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all group font-medium text-sm"
                title="Send Feedback"
            >
                <div className="bg-emerald-500/20 p-1.5 rounded-full">
                    <MessageSquarePlus size={18} className="text-emerald-400 group-hover:text-emerald-300 transition-colors" />
                </div>
                <span className="pr-1">Feedback</span>
            </button>

            {/* Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
                    <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
                        {/* Header */}
                        <div className="flex items-center justify-between p-5 border-b border-slate-100">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">Send Feedback</h3>
                                <p className="text-xs text-slate-400 mt-0.5">Page: {currentPage}</p>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-5">
                            {submitted ? (
                                <div className="text-center py-8">
                                    <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <MessageSquarePlus size={24} className="text-emerald-500" />
                                    </div>
                                    <p className="text-slate-700 font-medium">Thank you for your feedback!</p>
                                </div>
                            ) : (
                                <>
                                    <textarea
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="What's on your mind? Bug reports, feature requests, or general feedback..."
                                        className="w-full h-32 p-4 border border-slate-200 rounded-xl text-sm text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                                        autoFocus
                                    />
                                    <button
                                        onClick={handleSubmit}
                                        disabled={!message.trim() || isSubmitting}
                                        className="mt-3 w-full h-11 flex items-center justify-center gap-2 bg-emerald-500 text-white rounded-xl text-sm font-bold hover:bg-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Send size={14} />
                                        {isSubmitting ? 'Sending...' : 'Send Feedback'}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
