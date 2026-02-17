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

            {/* Invites list moved to AdminDashboard */}
        </div>
    );
};
