import React, { useEffect, useState, useMemo } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { InviteGenerator } from './InviteGenerator';
import {
    Users, MessageSquare, Link2, ChevronLeft, Eye,
    FileText, Clock, Mail, User as UserIcon, MessageCircle, ArrowLeft,
    CheckCircle2, XCircle
} from 'lucide-react';
import { PDFViewer } from '@react-pdf/renderer';
import { OxfordStrictPDF } from '../cv/pdf/OxfordStrictPDF';
import { ModernImpactPDF } from '../cv/pdf/ModernImpactPDF';
import { CVData } from '../cv/CVTypes';

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

    const loadAllData = async () => {
        setLoading(true);
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
            setLoading(false);
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
            cvsSnap.forEach((d) => {
                const data = d.data();
                cvs.push({
                    id: d.id,
                    title: data.title || data.cvData?.personal_info?.name || 'Untitled CV',
                    targetRole: data.targetRole || data.cvData?.targetRole || '',
                    status: data.status || 'in_progress',
                    completionPercent: data.completionPercent || 0,
                    lastUpdated: data.lastUpdated || '',
                    cvData: data.cvData || data,
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
        <div className="space-y-6 animate-fade-in pb-12 h-screen flex flex-col">
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
            <div className="flex-1 min-h-0 px-6 pb-6 overflow-hidden flex flex-col">
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
                                        <div className="flex items-center gap-3 mb-1">
                                            <h2 className="text-2xl font-bold text-slate-800">{selectedUser.displayName || 'Unknown'}</h2>
                                            {selectedUser.role === 'admin' && (
                                                <span className="px-2.5 py-0.5 text-xs font-bold uppercase bg-amber-100 text-amber-700 rounded-full">Admin</span>
                                            )}
                                        </div>
                                        <p className="text-slate-500 flex items-center gap-1.5 text-sm mb-4">
                                            <Mail size={14} /> {selectedUser.email}
                                        </p>

                                        <div className="flex gap-6 text-sm border-t border-slate-100 pt-4">
                                            <div>
                                                <span className="text-slate-400 text-xs uppercase tracking-wide block mb-0.5">Joined</span>
                                                <span className="font-medium text-slate-700">{selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString('en-GB') : '-'}</span>
                                            </div>
                                            <div>
                                                <span className="text-slate-400 text-xs uppercase tracking-wide block mb-0.5">Last Active</span>
                                                <span className="font-medium text-slate-700">{selectedUser.lastActive ? new Date(selectedUser.lastActive).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '-'}</span>
                                            </div>
                                            <div>
                                                <span className="text-slate-400 text-xs uppercase tracking-wide block mb-0.5">Invite ID</span>
                                                <code className="text-[11px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">{selectedUser.inviteId || 'N/A'}</code>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* CV List */}
                                <div className="flex-1 bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col shadow-sm">
                                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                            <FileText size={18} />
                                            User Plans & CVs ({userCVs.length})
                                        </h3>
                                    </div>
                                    {loadingUserCVs ? (
                                        <div className="flex-1 flex items-center justify-center">
                                            <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full" />
                                        </div>
                                    ) : userCVs.length === 0 ? (
                                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8">
                                            <FileText size={48} className="opacity-20 mb-3" />
                                            <p>This user hasn't created any CVs yet.</p>
                                        </div>
                                    ) : (
                                        <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
                                            {userCVs.map((cv) => (
                                                <button
                                                    key={cv.id}
                                                    onClick={() => setSelectedCV(cv)}
                                                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left group"
                                                >
                                                    <div className="flex items-start gap-4">
                                                        <div className={`mt-1 w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${cv.status === 'completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                                                            {cv.status === 'completed' ? <CheckCircle2 size={20} /> : <Clock size={20} />}
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-slate-800 group-hover:text-emerald-600 transition-colors">
                                                                {cv.title || 'Untitled CV'}
                                                            </div>
                                                            <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                                                                {cv.targetRole && (
                                                                    <span className="bg-slate-100 px-1.5 py-0.5 rounded">{cv.targetRole}</span>
                                                                )}
                                                                <span className="text-slate-400">• Updated {new Date(cv.lastUpdated || '').toLocaleDateString()}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2 mt-2">
                                                                <div className="h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden">
                                                                    <div className={`h-full rounded-full ${cv.completionPercent === 100 ? 'bg-emerald-500' : 'bg-amber-400'}`} style={{ width: `${cv.completionPercent}%` }} />
                                                                </div>
                                                                <span className="text-[10px] text-slate-400 font-bold">{cv.completionPercent}%</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-slate-300 group-hover:text-emerald-500 transition-colors">
                                                        <ChevronLeft size={20} className="rotate-180" />
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ========= CV DETAIL VIEW (SPLIT SCREEN) ========= */}
                        {activeTab === 'users' && selectedUser && selectedCV && (
                            <div className="flex-1 flex flex-col h-full overflow-hidden">
                                {/* Back Bar */}
                                <div className="shrink-0 flex items-center justify-between pb-4 border-b border-slate-200 mb-0 px-6 pt-6">
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => setSelectedCV(null)}
                                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                                        >
                                            <ArrowLeft size={18} />
                                        </button>
                                        <div>
                                            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                                {selectedCV.title}
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wide border ${selectedCV.status === 'completed'
                                                    ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                                                    : 'bg-amber-50 border-amber-100 text-amber-700'
                                                    }`}>
                                                    {selectedCV.status}
                                                </span>
                                            </h2>
                                            <p className="text-xs text-slate-500">
                                                Viewing details for {selectedUser.displayName}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Split View: Left (Chat) | Right (Preview) */}
                                <div className="flex-1 flex overflow-hidden">
                                    {/* LEFT: Chat Conversation */}
                                    <div className="w-1/3 min-w-[350px] max-w-[500px] border-r border-slate-200 flex flex-col bg-white">
                                        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2 font-medium text-slate-700 text-sm">
                                            <MessageCircle size={16} />
                                            Conversation History
                                            <span className="ml-auto text-xs bg-slate-200 px-1.5 py-0.5 rounded-full">{selectedCV.messages?.length || 0}</span>
                                        </div>
                                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
                                            {(selectedCV.messages || []).map((msg: any, i: number) => (
                                                <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${msg.role === 'user'
                                                        ? 'bg-indigo-600 text-white rounded-tr-none'
                                                        : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none'
                                                        }`}>
                                                        {msg.content}
                                                    </div>
                                                    <span className="text-[10px] text-slate-400 mt-1 px-1">
                                                        {msg.role === 'user' ? 'User' : 'Agent'}
                                                    </span>
                                                </div>
                                            ))}
                                            {(!selectedCV.messages || selectedCV.messages.length === 0) && (
                                                <div className="text-center text-slate-400 py-10 text-sm italic">
                                                    No conversation history found for this CV.
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* RIGHT: Live PDF Preview */}
                                    <div className="flex-1 bg-slate-100 flex flex-col">
                                        <div className="px-4 py-3 border-b border-slate-200 bg-white flex items-center justify-between font-medium text-slate-700 text-sm">
                                            <div className="flex items-center gap-2">
                                                <FileText size={16} />
                                                Live PDF Preview
                                            </div>
                                            <div className="text-xs text-slate-400">
                                                Template: <span className="font-semibold text-slate-600 uppercase">{selectedCV.cvData?.meta?.template || 'Oxford'}</span>
                                            </div>
                                        </div>
                                        <div className="flex-1 p-4 overflow-hidden">
                                            <div className="w-full h-full shadow-lg rounded-lg overflow-hidden border border-slate-300 bg-white">
                                                <PDFViewer
                                                    width="100%"
                                                    height="100%"
                                                    showToolbar={true} // Allow admin to download/print directly from native viewer
                                                    className="border-none w-full h-full"
                                                >
                                                    {PDFPreview}
                                                </PDFViewer>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ========= FEEDBACK TAB ========= */}
                        {activeTab === 'feedback' && (
                            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden flex-1 overflow-y-auto shadow-sm">
                                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 sticky top-0 z-10">
                                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                        <MessageSquare size={18} /> User Feedback
                                    </h3>
                                </div>
                                {feedback.length === 0 ? (
                                    <div className="p-8 text-center text-sm text-slate-400">No feedback received yet.</div>
                                ) : (
                                    <div className="divide-y divide-slate-50">
                                        {feedback.map((f) => (
                                            <div key={f.id} className="px-6 py-4 hover:bg-slate-50 transition-colors">
                                                <div className="flex items-start justify-between gap-4 mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center border border-indigo-100">
                                                            <UserIcon size={14} className="text-indigo-500" />
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-medium text-slate-800">{f.userName || 'Anonymous'}</div>
                                                            <div className="text-xs text-slate-500">{f.userEmail}</div>
                                                        </div>
                                                    </div>
                                                    <div className="text-[10px] text-slate-400 flex items-center gap-1 whitespace-nowrap bg-slate-100 px-2 py-1 rounded-full">
                                                        <Clock size={10} />
                                                        {new Date(f.createdAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </div>
                                                <div className="text-sm text-slate-700 bg-slate-50 rounded-lg p-3 border border-slate-100 mt-2">
                                                    {f.message}
                                                </div>
                                                <div className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
                                                    Source: <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">{f.page}</code>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ========= INVITES TAB ========= */}
                        {activeTab === 'invites' && (
                            <div className="flex-1 overflow-y-auto">
                                <InviteGenerator invites={invites} onRefresh={loadAllData} />
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};
