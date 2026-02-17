import React, { useEffect, useState, useMemo } from 'react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { InviteGenerator } from './InviteGenerator';
import {
    Users, MessageSquare, Link2, ChevronLeft, Eye,
    FileText, Clock, Mail, User as UserIcon, MessageCircle, ArrowLeft,
    CheckCircle2, XCircle, Trash2
} from 'lucide-react';
import { PDFViewer } from '@react-pdf/renderer';
import { OxfordStrictPDF } from '../cv/pdf/OxfordStrictPDF';
import { ModernImpactPDF } from '../cv/pdf/ModernImpactPDF';
import { CVData, INITIAL_CV_DATA } from '../cv/CVTypes';

// =============== Types ===============

interface AllowedUser {
    email: string;
    role: string;
    uid?: string;
    displayName?: string;
    photoURL?: string;
    createdAt?: string;
    lastActive?: string;
    inviteId?: string;
}

interface UserCV {
    id: string;
    title?: string;
    targetRole?: string;
    status?: string;
    completionPercent?: number;
    lastUpdated?: string;
    cvData?: CVData;
    messages?: any[];
}

interface FeedbackEntry {
    id: string;
    userId: string;
    userEmail: string;
    userName?: string;
    page: string;
    message: string;
    createdAt: string;
}

interface InviteEntry {
    id: string;
    createdBy: string;
    createdByEmail?: string;
    createdAt: string;
    expiresAt: string;
    used: boolean;
    usedBy?: string;
    usedByEmail?: string;
    usedAt?: string;
}

// Helper to render markdown-lite text (matching CVChatAgent)
const renderText = (text: string) => {
    return text.split('\n').map((line, i) => {
        const parts = line.split(/(\*\*.*?\*\*)/g);
        return (
            <p key={i} className="mb-3 last:mb-0 text-slate-700 leading-relaxed">
                {parts.map((part, j) => {
                    if (part.startsWith('**') && part.endsWith('**')) {
                        return <span key={j} className="font-extrabold text-slate-900">{part.slice(2, -2)}</span>;
                    }
                    return <span key={j}>{part}</span>;
                })}
            </p>
        );
    });
};

// =============== Component ===============

interface AdminDashboardProps {
    onNavigate: (path: string) => void;
}

type Tab = 'users' | 'feedback' | 'invites';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
    const [activeTab, setActiveTab] = useState<Tab>('users');
    const [users, setUsers] = useState<AllowedUser[]>([]);
    const [feedback, setFeedback] = useState<FeedbackEntry[]>([]);
    const [invites, setInvites] = useState<InviteEntry[]>([]);
    const [loading, setLoading] = useState(true);

    // User detail drawer
    const [selectedUser, setSelectedUser] = useState<AllowedUser | null>(null);
    const [userCVs, setUserCVs] = useState<UserCV[]>([]);
    const [selectedCV, setSelectedCV] = useState<UserCV | null>(null);
    const [loadingUserCVs, setLoadingUserCVs] = useState(false);

    const loadAllData = async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            // Load users
            const usersSnap = await getDocs(collection(db, 'allowedUsers'));
            const usersData: AllowedUser[] = [];
            usersSnap.forEach((d) => usersData.push({ ...d.data() as AllowedUser }));
            usersData.sort((a, b) => (b.lastActive || '').localeCompare(a.lastActive || ''));
            setUsers(usersData);

            // Load feedback
            const feedbackSnap = await getDocs(collection(db, 'feedback'));
            const feedbackData: FeedbackEntry[] = [];
            feedbackSnap.forEach((d) => feedbackData.push({ id: d.id, ...d.data() as Omit<FeedbackEntry, 'id'> }));
            feedbackData.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
            setFeedback(feedbackData);

            // Load invites
            const invitesSnap = await getDocs(collection(db, 'invites'));
            const invitesData: InviteEntry[] = [];
            invitesSnap.forEach((d) => invitesData.push({ id: d.id, ...d.data() as Omit<InviteEntry, 'id'> }));
            invitesData.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
            setInvites(invitesData);
        } catch (error) {
            console.error('Error loading admin data:', error);
        } finally {
            if (!silent) setLoading(false);
        }
    };

    useEffect(() => { loadAllData(); }, []);

    const loadUserCVs = async (user: AllowedUser) => {
        if (!user.uid) {
            setUserCVs([]);
            return;
        }
        setLoadingUserCVs(true);
        try {
            const cvsSnap = await getDocs(collection(db, 'users', user.uid, 'cvs'));
            const cvs: UserCV[] = [];

            // Helper to deep merge with initial data
            const mergeWithInitial = (data: any): CVData => {
                // If legacy structure
                let base = data.cvData || data;

                // Deep merge is complex, for now we ensure top-level keys exist
                // Ideally this should use a deep merge utility, but standard spread works for 1-level
                // We will trust the types mostly, but ensure content object exists
                if (!base.content) base.content = INITIAL_CV_DATA.content;
                if (!base.meta) base.meta = INITIAL_CV_DATA.meta;

                return base as CVData;
            };

            cvsSnap.forEach((d) => {
                const data = d.data();
                cvs.push({
                    id: d.id,
                    title: data.title || data.cvData?.content?.personal?.name || 'Untitled CV',
                    targetRole: data.targetRole || data.cvData?.meta?.target_role || '',
                    status: data.status || 'in_progress',
                    completionPercent: data.completionPercent || 0,
                    lastUpdated: data.lastUpdated || '',
                    cvData: mergeWithInitial(data),
                    messages: data.messages || [],
                });
            });
            // Sort by last updated
            cvs.sort((a, b) => (b.lastUpdated || '').localeCompare(a.lastUpdated || ''));
            setUserCVs(cvs);
        } catch (error) {
            console.error('Error loading user CVs:', error);
            setUserCVs([]);
        } finally {
            setLoadingUserCVs(false);
        }
    };

    const handleSelectUser = (user: AllowedUser) => {
        setSelectedUser(user);
        setSelectedCV(null);
        loadUserCVs(user);
    };


    const handleDeleteUser = async (user: AllowedUser) => {
        if (!confirm(`Are you sure you want to delete ${user.displayName || user.email}? This will delete their database record. NOTE: You must also delete them from Firebase Auth in the console.`)) {
            return;
        }
        try {
            if (user.uid) {
                await deleteDoc(doc(db, 'allowedUsers', user.uid));
                await deleteDoc(doc(db, 'users', user.uid));
                alert('User database record deleted.');
                setSelectedUser(null);
                loadAllData();
            }
        } catch (e) {
            console.error(e);
            alert('Error deleting user: ' + e);
        }
    };

    const handleDeleteInvite = async (inviteId: string) => {
        if (!confirm('Are you sure you want to delete this invite?')) return;
        try {
            await deleteDoc(doc(db, 'invites', inviteId));
            loadAllData(true); // Silent refresh
        } catch (error: any) {
            console.error('Error deleting invite:', error);
            alert('Failed to delete invite: ' + (error.message || error));
        }
    };

    const tabs: { id: Tab; label: string; icon: React.ReactNode; count: number }[] = [
        { id: 'users', label: 'Users', icon: <Users size={16} />, count: users.length },
        { id: 'feedback', label: 'Feedback', icon: <MessageSquare size={16} />, count: feedback.length },
        { id: 'invites', label: 'Invites', icon: <Link2 size={16} />, count: invites.length },
    ];

    // PDF Preview Component Helper
    const PDFPreview = useMemo(() => {
        if (!selectedCV || !selectedCV.cvData) return null;
        const template = selectedCV.cvData.meta?.template || 'oxford';
        if (template === 'modern') {
            return <ModernImpactPDF data={selectedCV.cvData} />;
        }
        return <OxfordStrictPDF data={selectedCV.cvData} />;
    }, [selectedCV]);

    return (
        <div className="animate-fade-in pb-12 min-h-screen flex flex-col">
            {/* Main Header (Dashboard Level) - hidden if viewing specific CV to save space, or kept small */}
            {!selectedCV && (
                <div className="shrink-0 px-6 pt-6">
                    <div className="flex items-center gap-4 mb-6">
                        <button
                            onClick={() => onNavigate('/')}
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-lg transition-colors"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-3xl font-serif text-[#1a1a2e]">Admin Dashboard</h1>
                            <p className="text-slate-500 text-sm">Manage users, invites, and view feedback</p>
                        </div>
                    </div>

                    {/* Stats Bar */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        {[
                            { label: 'Total Users', value: users.length, color: 'emerald' },
                            { label: 'Feedback', value: feedback.length, color: 'indigo' },
                            { label: 'Active Invites', value: invites.filter(i => !i.used && new Date(i.expiresAt) > new Date()).length, color: 'amber' },
                        ].map((stat) => (
                            <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-4 text-center shadow-sm">
                                <div className="text-2xl font-bold text-slate-800">{stat.value}</div>
                                <div className="text-xs text-slate-400 font-medium uppercase tracking-wide">{stat.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-1 bg-slate-100 rounded-xl p-1 mb-6">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => { setActiveTab(tab.id); setSelectedUser(null); setSelectedCV(null); }}
                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                                    ? 'bg-white text-slate-800 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                {tab.icon}
                                {tab.label}
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${activeTab === tab.id ? 'bg-slate-100 text-slate-600' : 'bg-slate-200 text-slate-500'}`}>
                                    {tab.count}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 px-6 pb-6 flex flex-col">
                {loading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full" />
                    </div>
                ) : (
                    <>
                        {/* ========= USERS TAB ========= */}
                        {activeTab === 'users' && !selectedUser && (
                            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden flex-1 overflow-y-auto shadow-sm">
                                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 sticky top-0 z-10">
                                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                        <Users size={18} /> All Users
                                    </h3>
                                </div>
                                {users.length === 0 ? (
                                    <div className="p-8 text-center text-sm text-slate-400">No users yet.</div>
                                ) : (
                                    <div className="divide-y divide-slate-50">
                                        {users.map((u) => (
                                            <button
                                                key={u.email}
                                                onClick={() => handleSelectUser(u)}
                                                className="w-full px-6 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors text-left group"
                                            >
                                                {u.photoURL ? (
                                                    <img src={u.photoURL} alt="" className="w-10 h-10 rounded-full border border-slate-200" />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                                                        <UserIcon size={18} className="text-slate-400" />
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-medium text-slate-800 truncate group-hover:text-emerald-600 transition-colors">{u.displayName || u.email}</span>
                                                        {u.role === 'admin' && (
                                                            <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide bg-amber-100 text-amber-700 rounded-full">Admin</span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                                                        <span className="flex items-center gap-1"><Mail size={10} />{u.email}</span>
                                                        {u.lastActive && (
                                                            <span className="flex items-center gap-1">
                                                                <Clock size={10} />
                                                                {new Date(u.lastActive).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <Eye size={16} className="text-slate-300 group-hover:text-emerald-500" />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ========= USER DETAIL VIEW ========= */}
                        {activeTab === 'users' && selectedUser && !selectedCV && (
                            <div className="flex-1 flex flex-col gap-6 overflow-hidden">
                                <div className="shrink-0 flex items-center gap-2">
                                    <button
                                        onClick={() => setSelectedUser(null)}
                                        className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 transition-colors"
                                    >
                                        <ArrowLeft size={16} /> Back to Users
                                    </button>
                                </div>

                                {/* User Info Card */}
                                <div className="shrink-0 bg-white rounded-xl border border-slate-200 p-6 flex items-start gap-6 shadow-sm">
                                    {selectedUser.photoURL ? (
                                        <img src={selectedUser.photoURL} alt="" className="w-16 h-16 rounded-full border-4 border-slate-50" />
                                    ) : (
                                        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                            <UserIcon size={28} />
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <h2 className="text-2xl font-bold text-slate-800">{selectedUser.displayName || 'Unnamed User'}</h2>
                                        <div className="flex items-center gap-2 text-slate-500 text-sm mt-1">
                                            <Mail size={14} /> {selectedUser.email}
                                        </div>
                                        <div className="flex items-center gap-4 mt-4 text-xs font-mono text-slate-400">
                                            <span>JOINED: {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : 'N/A'}</span>
                                            <span>LAST ACTIVE: {selectedUser.lastActive ? new Date(selectedUser.lastActive).toLocaleDateString() : 'N/A'}</span>
                                            <span className="bg-slate-100 px-2 py-0.5 rounded">INVITE ID: {selectedUser.inviteId || 'N/A'}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <button
                                            onClick={() => window.location.href = `mailto:${selectedUser.email}`}
                                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-bold transition-colors"
                                        >
                                            Contact User
                                        </button>
                                        <button
                                            onClick={() => handleDeleteUser(selectedUser)}
                                            className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-bold transition-colors border border-red-200 flex items-center gap-2"
                                        >
                                            <Trash2 size={14} /> Delete User
                                        </button>
                                    </div>
                                </div>

                                {/* User CVs List */}
                                <div className="flex-1 bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col shadow-sm">
                                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                            <FileText size={18} /> User Plans & CVs ({userCVs.length})
                                        </h3>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-0">
                                        {loadingUserCVs ? (
                                            <div className="p-8 text-center"><div className="animate-spin w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto" /></div>
                                        ) : userCVs.length === 0 ? (
                                            <div className="p-8 text-center text-slate-400">No CVs found for this user.</div>
                                        ) : (
                                            <div className="divide-y divide-slate-50">
                                                {userCVs.map((cv) => (
                                                    <div key={cv.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center gap-4 group">
                                                        <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-lg flex items-center justify-center shrink-0">
                                                            <FileText size={24} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="font-bold text-slate-800 truncate">{cv.title}</h4>
                                                            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                                                                <span className={`px-1.5 py-0.5 rounded-full font-bold uppercase ${cv.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                                                    {cv.status}
                                                                </span>
                                                                <span>• {cv.completionPercent}% Complete</span>
                                                                <span>• Updated {new Date(cv.lastUpdated || '').toLocaleDateString()}</span>
                                                            </div>
                                                        </div>
                                                        {/* Fix: removed opacity-0 to ensure button is always visible on all devices */}
                                                        <button
                                                            onClick={() => setSelectedCV(cv)}
                                                            className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-bold hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-all shadow-sm whitespace-nowrap"
                                                        >
                                                            View Chat & CV
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ========= CV VIEWER (CHAT + PDF) - MATCHING UNIFIED BUILDER STYLE ========= */}
                        {selectedCV && (
                            <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col font-sans">
                                {/* Top Toolbar — Sticky & Glassmorphic (Matching Builder) */}
                                <div className="px-6 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center h-20 gap-4 shrink-0">
                                    <div className="flex items-center gap-4 shrink-0">
                                        <button
                                            onClick={() => setSelectedCV(null)}
                                            className="h-9 flex items-center gap-2 px-3 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg text-xs font-medium transition-colors"
                                        >
                                            <ArrowLeft size={14} />
                                            <span>Back to Dashboard</span>
                                        </button>

                                        <div className="h-9 flex items-center gap-2 px-4 bg-slate-100 rounded-lg border border-slate-200">
                                            <span className="text-sm font-semibold text-slate-700">
                                                {selectedCV.title}
                                            </span>
                                        </div>

                                        <div className="h-9 flex items-center gap-2 px-3 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-100">
                                            <span className="text-xs font-bold uppercase tracking-wide">
                                                {selectedCV.cvData?.meta?.template || 'Unknown Template'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Center Spacer */}
                                    <div className="flex-1"></div>

                                    {/* Right: Info */}
                                    <div className="text-xs text-slate-400 font-mono">
                                        Read-Only Admin View
                                    </div>
                                </div>

                                {/* Split Content */}
                                <div className="flex-1 flex overflow-hidden">
                                    {/* Left Panel: Chat History (50%) */}
                                    <div className="w-1/2 bg-white border-r border-slate-200 flex flex-col min-w-0">
                                        {/* Header */}
                                        <div className="bg-white border-b border-slate-100 px-5 py-4 flex items-center gap-3">
                                            <div className="p-2 bg-[#9FBFA0]/10 text-[#9FBFA0] rounded-xl">
                                                <MessageCircle size={20} />
                                            </div>
                                            <div className="flex flex-col">
                                                <h3 className="font-semibold text-sm leading-none text-slate-800">Conversation History</h3>
                                                <span className="text-[10px] text-slate-400">Read Only</span>
                                            </div>
                                        </div>

                                        {/* Messages */}
                                        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#FAFBFC]">
                                            {selectedCV.messages?.map((msg: any, idx: number) => (
                                                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                                    <div className={`
                                                        max-w-[75%] p-4 text-sm leading-relaxed shadow-sm
                                                        ${msg.role === 'user'
                                                            ? 'bg-[#9FBFA0] text-white rounded-2xl rounded-br-none shadow-md'
                                                            : 'bg-white border border-slate-100 text-slate-700 rounded-2xl rounded-bl-none shadow-sm'
                                                        }
                                                    `}>
                                                        {renderText(msg.content)}
                                                    </div>
                                                </div>
                                            ))}
                                            {(!selectedCV.messages || selectedCV.messages.length === 0) && (
                                                <div className="text-center text-slate-400 py-12">
                                                    <MessageSquare size={24} className="mx-auto mb-2 opacity-50" />
                                                    No chat history found.
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Right: PDF Preview (50%) - Frameless White Theme */}
                                    <div className="w-1/2 bg-slate-50 relative flex flex-col items-center justify-start p-8 overflow-y-auto">
                                        <div className="relative shadow-2xl bg-white w-full max-w-[90%] transition-all duration-300">
                                            <PDFViewer
                                                width="100%"
                                                style={{ aspectRatio: `1 / ${1.45 * (selectedCV.cvData?.meta?.target_pages || 1)}` }}
                                                showToolbar={true}
                                                className="w-full h-full border-none"
                                            >
                                                {PDFPreview}
                                            </PDFViewer>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ========= OTHER TABS ========= */}
                        {activeTab === 'feedback' && (
                            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                                <div className="divide-y divide-slate-100">
                                    {feedback.map((f) => (
                                        <div key={f.id} className="p-6 hover:bg-slate-50 transition-colors">
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <span className="text-xs font-bold text-indigo-500 bg-indigo-50 px-2 py-1 rounded mb-2 inline-block">
                                                        Page: {f.page}
                                                    </span>
                                                    <p className="text-slate-800 mt-1">{f.message}</p>
                                                </div>
                                                <span className="text-xs text-slate-400 whitespace-nowrap ml-4">
                                                    {new Date(f.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <div className="text-xs text-slate-400 flex items-center gap-2 mt-3">
                                                <UserIcon size={12} /> {f.userEmail}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'invites' && (
                            <div className="flex-1 overflow-y-auto min-h-0 space-y-6 pb-6">
                                <InviteGenerator invites={invites} onRefresh={() => loadAllData(true)} />
                                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
                                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
                                        <h3 className="font-bold text-slate-800">All Invites ({invites.length})</h3>
                                    </div>
                                    <div className="divide-y divide-slate-100">
                                        {invites.length === 0 ? (
                                            <div className="p-8 text-center text-slate-400 text-sm">No invites generated yet.</div>
                                        ) : (
                                            invites.map((invite) => {
                                                const isExpired = new Date(invite.expiresAt) < new Date();
                                                const status = invite.used ? 'used' : isExpired ? 'expired' : 'active';

                                                return (
                                                    <div key={invite.id} className="p-4 flex items-center justify-between hover:bg-slate-50 group transition-colors">
                                                        <div>
                                                            <div className="font-mono text-sm font-bold text-slate-800 select-all flex items-center gap-2">
                                                                {invite.id}
                                                                <span className="text-slate-300 font-normal">|</span>
                                                                <span className="text-xs font-sans text-slate-500 font-normal">
                                                                    expires {new Date(invite.expiresAt).toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                            <div className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                                                                <span className="flex items-center gap-1">
                                                                    <Clock size={10} />
                                                                    Created: {new Date(invite.createdAt).toLocaleDateString()}
                                                                </span>
                                                                {invite.usedByEmail && (
                                                                    <span className="text-indigo-600 font-medium bg-indigo-50 px-1.5 py-0.5 rounded">
                                                                        Used by: {invite.usedByEmail}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                                status === 'used' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                                                    'bg-slate-100 text-slate-500 border-slate-200'
                                                                }`}>
                                                                {status === 'active' && <CheckCircle2 size={12} />}
                                                                {status === 'used' && <CheckCircle2 size={12} />}
                                                                {status === 'expired' && <XCircle size={12} />}
                                                                {status.charAt(0).toUpperCase() + status.slice(1)}
                                                            </span>

                                                            {/* Delete button visible for unused invites (active or expired) */}
                                                            {!invite.used && (
                                                                <button
                                                                    onClick={() => handleDeleteInvite(invite.id)}
                                                                    title="Delete Invite"
                                                                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};
