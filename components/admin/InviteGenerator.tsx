import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';
import { Link2, Copy, Check, Clock, CheckCircle2, XCircle } from 'lucide-react';

interface InviteData {
    id: string;
    createdAt: string;
    expiresAt: string;
    used: boolean;
    usedByEmail?: string;
    usedAt?: string;
}

interface InviteGeneratorProps {
    invites: InviteData[];
    onRefresh: () => void;
}

export const InviteGenerator: React.FC<InviteGeneratorProps> = ({ invites, onRefresh }) => {
    const { user } = useAuth();
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedLink, setGeneratedLink] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const generateInvite = async () => {
        if (!user) return;
        setIsGenerating(true);

        try {
            const now = new Date();
            const expiresAt = new Date(now.getTime() + 48 * 60 * 60 * 1000); // 48 hours

            const docRef = await addDoc(collection(db, 'invites'), {
                createdBy: user.uid,
                createdByEmail: user.email,
                createdAt: now.toISOString(),
                expiresAt: expiresAt.toISOString(),
                used: false,
                usedBy: null,
                usedByEmail: null,
                usedAt: null,
            });

            const baseUrl = window.location.origin;
            const link = `${baseUrl}/invite/${docRef.id}`;
            setGeneratedLink(link);
            onRefresh();
        } catch (error) {
            console.error('Error generating invite:', error);
            alert('Failed to generate invite link.');
        } finally {
            setIsGenerating(false);
        }
    };

    const copyLink = () => {
        if (generatedLink) {
            navigator.clipboard.writeText(generatedLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const getInviteStatus = (invite: InviteData) => {
        if (invite.used) return 'used';
        const expires = new Date(invite.expiresAt);
        if (expires < new Date()) return 'expired';
        return 'active';
    };

    return (
        <div className="space-y-6">
            {/* Generate Button */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <Link2 size={18} />
                    Generate Invite Link
                </h3>
                <p className="text-sm text-slate-500 mb-4">
                    Create a unique invite link that can be used once and expires after 48 hours.
                </p>

                <button
                    onClick={generateInvite}
                    disabled={isGenerating}
                    className="h-10 px-6 bg-emerald-500 text-white rounded-lg text-sm font-bold hover:bg-emerald-600 transition-all disabled:opacity-50"
                >
                    {isGenerating ? 'Generating...' : 'Generate New Link'}
                </button>

                {generatedLink && (
                    <div className="mt-4 flex items-center gap-2 bg-slate-50 rounded-lg p-3 border border-slate-200">
                        <input
                            type="text"
                            value={generatedLink}
                            readOnly
                            className="flex-1 bg-transparent text-xs text-slate-600 font-mono focus:outline-none"
                        />
                        <button
                            onClick={copyLink}
                            className="h-8 px-3 flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                            {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                            {copied ? 'Copied' : 'Copy'}
                        </button>
                    </div>
                )}
            </div>

            {/* Invites List */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100">
                    <h3 className="font-bold text-slate-800">All Invites ({invites.length})</h3>
                </div>
                {invites.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-sm">No invites generated yet.</div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {invites.map((invite) => {
                            const status = getInviteStatus(invite);
                            return (
                                <div key={invite.id} className="px-6 py-4 flex items-center justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <code className="text-xs text-slate-500 font-mono truncate">{invite.id}</code>
                                        </div>
                                        <div className="flex items-center gap-3 text-[10px] text-slate-400">
                                            <span className="flex items-center gap-1">
                                                <Clock size={10} />
                                                Created: {new Date(invite.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            {invite.usedByEmail && (
                                                <span>Used by: {invite.usedByEmail}</span>
                                            )}
                                        </div>
                                    </div>
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide flex items-center gap-1 ${status === 'active' ? 'bg-emerald-50 text-emerald-700' :
                                            status === 'used' ? 'bg-blue-50 text-blue-700' :
                                                'bg-slate-100 text-slate-500'
                                        }`}>
                                        {status === 'active' && <CheckCircle2 size={10} />}
                                        {status === 'used' && <Check size={10} />}
                                        {status === 'expired' && <XCircle size={10} />}
                                        {status}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};
