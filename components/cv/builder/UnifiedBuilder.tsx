import React, { useMemo, useEffect, useRef, useState } from 'react';
import { CVChatAgent } from './CVChatAgent';
// CVPhaseBar removed
import { CVSectionEditor } from './CVSectionEditor';
import { InteractiveOverlay } from './InteractiveOverlay';
import { OxfordStrictPDF } from '../pdf/OxfordStrictPDF';
import { ModernImpactPDF } from '../pdf/ModernImpactPDF';
import { PDFCanvasPreview } from './PDFCanvasPreview';
import { PDFDownloadLink, usePDF } from '@react-pdf/renderer';
import { usePDFLayout } from '../../../hooks/usePDFLayout';
import { ArrowLeft, Download, FileText, Upload, SlidersHorizontal, RotateCcw, Save, ZoomIn, ZoomOut, CheckCircle2, Trash2, Clock, Plus, Briefcase, Sparkles } from 'lucide-react';
import { useCVStore, getPhases } from '../../../stores/cvStore';
import { TemplateType, CVSummary } from '../CVTypes';
import { doc, getDoc, setDoc, getDocs, collection, deleteDoc } from 'firebase/firestore';
import { db } from '../../../services/firebase';
import { useAuth } from '../../../context/AuthContext';
import { DocRenderer } from './DocRenderer';


// ============================================================
// UnifiedBuilder — The Main CV Builder Page
// ============================================================
// Gallery → Builder Mode (Chat/Editor + Live PDF)
// ============================================================

interface UnifiedBuilderProps {
    onNavigate: (path: string) => void;
}

export const UnifiedBuilder: React.FC<UnifiedBuilderProps> = ({ onNavigate }) => {
    const store = useCVStore();
    const {
        cvData, updateMeta, editingSection, setEditingSection,
        isBuilderActive, setBuilderActive,
        messages, activeCvId, savedCvs, setSavedCvs,
        createNewCV, loadCV, deleteCV, returnToGallery, saveCurrentToIndex,
        uploadedCVText, setUploadedCVText, reset,
    } = store;

    const { user } = useAuth();
    const hasHydratedRef = useRef(false);
    const [zoom, setZoom] = useState(0.85); // Default fit
    const [isSaving, setIsSaving] = React.useState(false);
    const [isLoadingGallery, setIsLoadingGallery] = useState(false);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

    // ============================================================
    // Firestore Sync — Multi-CV
    // ============================================================

    // 1. Load CV list from Firestore on mount (if user is logged in)
    useEffect(() => {
        const loadCvsFromFirestore = async () => {
            if (!user || hasHydratedRef.current) return;
            setIsLoadingGallery(true);

            try {
                const cvsRef = collection(db, 'users', user.uid, 'cvs');
                const snapshot = await getDocs(cvsRef);

                if (!snapshot.empty) {
                    const firestoreCvs: CVSummary[] = [];
                    const localCvIds = new Set(savedCvs.map(s => s.id));

                    snapshot.forEach(docSnap => {
                        const data = docSnap.data();
                        const id = docSnap.id;

                        // Build summary from Firestore data
                        const summary: CVSummary = {
                            id,
                            title: data.title || 'Untitled CV',
                            status: data.status || 'in_progress',
                            createdAt: data.createdAt || new Date().toISOString(),
                            lastUpdated: data.lastUpdated || new Date().toISOString(),
                            targetRole: data.targetRole || '',
                            completionPercent: data.completionPercent || 0,
                        };
                        firestoreCvs.push(summary);
                    });

                    // Merge: Firestore CVs win, but keep local-only CVs too
                    const firestoreIds = new Set(firestoreCvs.map(s => s.id));
                    const localOnly = savedCvs.filter(s => !firestoreIds.has(s.id));
                    const merged = [...firestoreCvs, ...localOnly];

                    // Sort by lastUpdated desc
                    merged.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());

                    setSavedCvs(merged);
                }

                // Migrate legacy 'draft' doc if it exists
                const draftRef = doc(db, 'users', user.uid, 'cvs', 'draft');
                const draftSnap = await getDoc(draftRef);
                if (draftSnap.exists()) {
                    const draftData = draftSnap.data();
                    if (draftData.cvData) {
                        // Migrate to a new UUID-based doc
                        const newId = crypto.randomUUID?.() ?? `cv_${Date.now()}`;
                        await setDoc(doc(db, 'users', user.uid, 'cvs', newId), {
                            cvData: draftData.cvData,
                            messages: draftData.messages || [],
                            title: draftData.cvData?.content?.personal?.name || 'Migrated CV',
                            status: 'in_progress',
                            createdAt: draftData.lastUpdated || new Date().toISOString(),
                            lastUpdated: draftData.lastUpdated || new Date().toISOString(),
                            targetRole: draftData.cvData?.meta?.target_role || '',
                            completionPercent: 0,
                        });
                        // Delete the old draft doc
                        await deleteDoc(draftRef);
                        console.log('[UnifiedBuilder] Migrated legacy draft to', newId);

                        // Refresh the list
                        const refreshSnapshot = await getDocs(collection(db, 'users', user.uid, 'cvs'));
                        const refreshCvs: CVSummary[] = [];
                        refreshSnapshot.forEach(docSnap => {
                            const data = docSnap.data();
                            refreshCvs.push({
                                id: docSnap.id,
                                title: data.title || 'Untitled CV',
                                status: data.status || 'in_progress',
                                createdAt: data.createdAt || new Date().toISOString(),
                                lastUpdated: data.lastUpdated || new Date().toISOString(),
                                targetRole: data.targetRole || '',
                                completionPercent: data.completionPercent || 0,
                            });
                        });
                        refreshCvs.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
                        setSavedCvs(refreshCvs);
                    }
                }

                hasHydratedRef.current = true;
            } catch (error) {
                console.error('Error loading CVs from Firestore:', error);
            } finally {
                setIsLoadingGallery(false);
            }
        };

        loadCvsFromFirestore();
    }, [user]);

    // 2. Auto-save active CV to Firestore (debounced)
    useEffect(() => {
        if (!user || !activeCvId || !isBuilderActive) return;

        const saveData = async () => {
            setIsSaving(true);
            try {
                const { computeCompletionPercent, deriveCVTitle } = await import('../CVTypes');
                const title = deriveCVTitle(cvData);
                const completion = computeCompletionPercent(cvData);

                await setDoc(doc(db, 'users', user.uid, 'cvs', activeCvId), {
                    cvData,
                    messages,
                    title,
                    status: completion >= 100 ? 'completed' : 'in_progress',
                    lastUpdated: new Date().toISOString(),
                    targetRole: cvData.meta.target_role || '',
                    completionPercent: completion,
                });

                // Also update local index
                saveCurrentToIndex();
            } catch (error) {
                console.error('Error saving to Firestore:', error);
            } finally {
                setIsSaving(false);
            }
        };

        const timeoutId = setTimeout(saveData, 2000);
        return () => clearTimeout(timeoutId);
    }, [cvData, messages, isBuilderActive, user, activeCvId]);

    // 3. Warn on tab close/refresh if unsaved (or just generally in builder)
    // 3. Warn on tab close/refresh if unsaved (or just generally in builder)
    // 3. Warn on tab close/refresh if unsaved
    useEffect(() => {
        if (!isBuilderActive) return;

        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            // Always warn if in builder mode to prevent accidental loss
            e.preventDefault();
            e.returnValue = 'You have unsaved changes.';
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isBuilderActive]);

    // Load a specific CV from Firestore
    const handleResumeCV = async (cvId: string) => {
        // FAST PATH: If this CV is already loaded in memory (from localStorage restore), just open it.
        // This prevents overwriting fresh local data with stale Firestore data.
        if (activeCvId === cvId && cvData) {
            setBuilderActive(true);
            return;
        }

        if (user) {
            try {
                const docRef = doc(db, 'users', user.uid, 'cvs', cvId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    loadCV(cvId, data.cvData, data.messages || []);
                    return;
                }
            } catch (error) {
                console.error('Error loading CV from Firestore:', error);
            }
        }

        // Fallback: try localStorage active session
        try {
            const raw = localStorage.getItem('cv-active-session');
            if (raw) {
                const session = JSON.parse(raw);
                if (session.id === cvId) {
                    loadCV(cvId, session.cvData, session.messages || []);
                    return;
                }
            }
        } catch { }

        // Nothing found — just create a new one
        console.warn('CV not found:', cvId);
        alert('Could not find this CV. It may have been deleted.');
    };

    // Delete a CV from Firestore
    const handleDeleteCV = async (cvId: string) => {
        deleteCV(cvId);

        if (user) {
            try {
                await deleteDoc(doc(db, 'users', user.uid, 'cvs', cvId));
            } catch (error) {
                console.error('Error deleting from Firestore:', error);
            }
        }
        setDeleteConfirmId(null);
    };

    // Handle PDF upload
    const handleUploadCV = async (file: File) => {
        try {
            const pdfjsLib = await import('pdfjs-dist');
            pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

            let fullText = '';
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items
                    .map((item: any) => item.str)
                    .join(' ');
                fullText += pageText + '\n';
            }

            const trimmed = fullText.trim();
            if (!trimmed) {
                alert('Could not extract text from this PDF. It may be a scanned image. Please try a different file.');
                return;
            }

            // Create a new CV for the upload
            const newId = createNewCV();
            useCVStore.setState({
                uploadedCVText: trimmed,
                messages: [{
                    role: 'model',
                    content:
                        "I've received your CV! 📄 Give me a moment to review it and extract all the key details.\n\n" +
                        "I'll then walk through each section with you to **clarify, improve, and fill any gaps** — just like building from scratch, but with a head start.",
                }],
            });
        } catch (err) {
            console.error('PDF parsing error:', err);
            alert('Error reading PDF. Please try a different file.');
        }
    };

    // Template override
    const template = cvData.meta.template;
    const setTemplate = (t: TemplateType) => {
        console.log('[UnifiedBuilder] Setting template to:', t);
        updateMeta({ template: t });
    };

    if (import.meta.env.DEV) {
        console.log('[UnifiedBuilder] Current template state:', template);
    }

    // Memoize PDF component
    const PDFDocument = useMemo(() => {
        console.log('[UnifiedBuilder] Memoizing PDF. Template:', template);
        if (template === 'modern') {
            console.log('[UnifiedBuilder] Returning ModernImpactPDF');
            return <ModernImpactPDF key="modern" data={cvData} />;
        }
        console.log('[UnifiedBuilder] Returning OxfordStrictPDF');
        return <OxfordStrictPDF key="oxford" data={cvData} />;
    }, [cvData, template]);

    // ============================================================
    // View Logic
    // ============================================================

    // ========== GALLERY PAGE ==========
    if (!isBuilderActive) {
        return (
            <div className="h-full overflow-y-auto">
                <div className="max-w-4xl mx-auto px-6 py-12">
                    {/* Header */}
                    <div className="text-center mb-10">
                        <h1 className="text-4xl font-serif text-[#1a1a2e] mb-3 tracking-tight">CV Architect</h1>
                        <p className="text-slate-500 text-lg">
                            Build industry-standard, ATS-optimized CVs with your personal Career Strategist.
                        </p>
                    </div>

                    {/* Create New Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                        {/* Create from Scratch */}
                        <button
                            onClick={() => {
                                createNewCV({
                                    name: user?.displayName || '',
                                    email: user?.email || ''
                                });
                            }}
                            className="group p-10 bg-white border-2 border-slate-100 rounded-2xl hover:border-[#9FBFA0] hover:shadow-lg transition-all duration-300"
                        >
                            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:bg-[#9FBFA0] group-hover:text-white transition-all duration-300">
                                <Plus size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">Create from Scratch</h3>
                            <p className="text-slate-500 text-sm">
                                Start fresh with a guided AI interview. Your strategist will ask the right questions.
                            </p>
                        </button>

                        {/* Import Resume */}
                        <label
                            className="group p-10 bg-white border-2 border-slate-100 rounded-2xl hover:border-indigo-400 hover:shadow-lg transition-all duration-300 cursor-pointer"
                        >
                            <input
                                type="file"
                                accept=".pdf"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleUploadCV(file);
                                }}
                            />
                            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300">
                                <Upload size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">Upload CV to Improve</h3>
                            <p className="text-slate-500 text-sm">
                                Upload an existing CV. The AI will parse, reformat, and improve it.
                            </p>
                        </label>
                    </div>

                    {/* Saved CVs Section */}
                    {isLoadingGallery ? (
                        <div className="text-center py-16">
                            <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4" />
                            <p className="text-slate-400 text-sm">Loading your CVs...</p>
                        </div>
                    ) : savedCvs.length > 0 ? (
                        <div>
                            <h2 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
                                <Briefcase size={18} className="text-slate-400" />
                                Your CVs
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {savedCvs.map((cv) => (
                                    <div
                                        key={cv.id}
                                        className="group bg-white border border-slate-200 rounded-xl p-5 hover:border-emerald-300 hover:shadow-md transition-all duration-200"
                                    >
                                        {/* CV Info */}
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-slate-800 truncate">{cv.title}</h3>
                                                {cv.targetRole && (
                                                    <p className="text-xs text-slate-400 mt-0.5 truncate">{cv.targetRole}</p>
                                                )}
                                            </div>
                                            <span className={`ml-3 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide flex-shrink-0 ${cv.status === 'completed'
                                                ? 'bg-emerald-50 text-emerald-700'
                                                : 'bg-amber-50 text-amber-700'
                                                }`}>
                                                {cv.status === 'completed' ? 'Complete' : 'In Progress'}
                                            </span>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="mb-3">
                                            <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                                                <span>Completion</span>
                                                <span>{cv.completionPercent}%</span>
                                            </div>
                                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-500 ${cv.completionPercent >= 100 ? 'bg-emerald-500' : 'bg-indigo-400'
                                                        }`}
                                                    style={{ width: `${cv.completionPercent}%` }}
                                                />
                                            </div>
                                        </div>

                                        {/* Last Updated */}
                                        <div className="flex items-center gap-1 text-[10px] text-slate-400 mb-4">
                                            <Clock size={10} />
                                            <span>
                                                {new Date(cv.lastUpdated).toLocaleDateString('en-GB', {
                                                    day: 'numeric', month: 'short', year: 'numeric',
                                                    hour: '2-digit', minute: '2-digit',
                                                })}
                                            </span>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleResumeCV(cv.id)}
                                                className="flex-1 h-9 flex items-center justify-center gap-2 bg-emerald-500 text-white rounded-lg text-xs font-bold hover:bg-emerald-600 transition-all"
                                            >
                                                <FileText size={14} />
                                                {cv.status === 'completed' ? 'Edit' : 'Resume'}
                                            </button>

                                            {deleteConfirmId === cv.id ? (
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => handleDeleteCV(cv.id)}
                                                        className="h-9 px-3 bg-red-500 text-white rounded-lg text-xs font-bold hover:bg-red-600 transition-all"
                                                    >
                                                        Confirm
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteConfirmId(null)}
                                                        className="h-9 px-3 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-200 transition-all"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setDeleteConfirmId(cv.id)}
                                                    className="h-9 w-9 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all border border-transparent hover:border-red-100"
                                                    title="Delete CV"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12 text-slate-400">
                            <FileText size={48} className="mx-auto mb-4 opacity-30" />
                            <p className="text-sm">No CVs yet. Create one above to get started!</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // ========== BUILDER MODE ==========
    return (
        <div className="flex flex-col h-screen bg-slate-50 font-sans">
            {/* Top Toolbar — Sticky & Glassmorphic */}
            <div className="sticky top-0 z-50 px-6 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center transition-all h-20 gap-4">
                {/* Left: Back + Job Title + Saving */}
                <div className="flex items-center gap-4 shrink-0">
                    <button
                        onClick={async () => {
                            // Force save before leaving
                            if (user && activeCvId) {
                                try {
                                    setIsSaving(true);
                                    const { computeCompletionPercent, deriveCVTitle } = await import('../CVTypes');
                                    const title = deriveCVTitle(cvData);
                                    const completion = computeCompletionPercent(cvData);
                                    await setDoc(doc(db, 'users', user.uid, 'cvs', activeCvId), {
                                        cvData,
                                        messages,
                                        title,
                                        status: completion >= 100 ? 'completed' : 'in_progress',
                                        lastUpdated: new Date().toISOString(),
                                        targetRole: cvData.meta.target_role || '',
                                        completionPercent: completion,
                                    });
                                    saveCurrentToIndex();
                                } catch (e) { console.error("Save failed on exit", e); }
                            }
                            returnToGallery();
                        }}
                        className="h-9 flex items-center gap-2 px-3 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg text-xs font-medium transition-colors"
                        title="Back to Gallery"
                    >
                        <ArrowLeft size={14} />
                        <span>All CVs</span>
                    </button>

                    {cvData.meta.target_role && (
                        <div className="h-9 flex items-center gap-2 px-4 bg-slate-100 rounded-lg border border-slate-200">
                            <span className="text-sm font-semibold text-slate-700">
                                {cvData.meta.target_role}
                            </span>
                        </div>
                    )}

                    {/* Archetype Badge */}
                    {cvData.meta.archetype && (
                        <div className="h-9 flex items-center gap-2 px-3 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-100">
                            <Sparkles size={14} />
                            <span className="text-xs font-bold uppercase tracking-wide">
                                {cvData.meta.archetype}
                            </span>
                        </div>
                    )}

                    {user && (
                        <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-400">
                            {isSaving ? (
                                <span className="animate-pulse">Saving...</span>
                            ) : (
                                <span className="flex items-center gap-1"><CheckCircle2 size={12} className="text-[#9FBFA0]" /> Saved</span>
                            )}
                        </div>
                    )}
                </div>

                {/* Center: Progress Bar */}
                <div className="flex-1 flex justify-center">
                    <div className="flex flex-col items-center gap-1.5 w-full max-w-xs">
                        <div className="flex justify-between w-full text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <span>Completion</span>
                            <span>{Math.min(100, Math.round((getPhases(cvData).filter(p => p.status === 'done').length / Math.max(1, getPhases(cvData).length - 1)) * 100))}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-[#9FBFA0] rounded-full transition-all duration-500 ease-out"
                                style={{ width: `${Math.min(100, Math.round((getPhases(cvData).filter(p => p.status === 'done').length / Math.max(1, getPhases(cvData).length - 1)) * 100))}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Right: Actions */}
                {/* Pages Indicator */}
                <div className="h-9 flex items-center gap-2 bg-slate-50 px-3 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors" title={cvData.meta.explanation || "AI Recommendation"}>
                    <FileText size={14} className="text-slate-400" />
                    <select
                        value={cvData.meta.target_pages || 1}
                        onChange={(e) => updateMeta({ target_pages: parseInt(e.target.value) as 1 | 2 })}
                        className="bg-transparent text-xs text-slate-600 font-medium focus:outline-none cursor-pointer h-full appearance-none pr-2"
                    >
                        <option value={1}>1 Page</option>
                        <option value={2}>2 Pages</option>
                    </select>
                </div>

                <div className="h-9 flex items-center gap-2 bg-slate-50 px-3 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors">
                    <SlidersHorizontal size={14} className="text-slate-400" />
                    <select
                        value={template}
                        onChange={(e) => setTemplate(e.target.value as TemplateType)}
                        className="bg-transparent text-xs text-slate-600 font-medium focus:outline-none cursor-pointer h-full"
                    >
                        <option value="oxford">Oxford (Classic)</option>
                        <option value="modern">Modern (Impact)</option>
                    </select>
                </div>

                <PDFDownloadLink
                    document={PDFDocument}
                    fileName={`${cvData.content.personal.name || 'My_CV'}.pdf`}
                    className="h-9 flex items-center gap-2 px-5 bg-[#9FBFA0] text-white rounded-lg text-xs font-bold hover:bg-[#8CA88D] transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
                >
                    {({ loading }) =>
                        loading ? (
                            'Generating...'
                        ) : (
                            <>
                                <Download size={14} /> Export PDF
                            </>
                        )
                    }
                </PDFDownloadLink>
            </div>

            {/* Split Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Panel: Chat or Section Editor (50%) */}
                <div className="w-full lg:w-1/2 min-w-0 bg-white border-r border-slate-200 relative z-10 flex flex-col transition-all duration-300">
                    {editingSection ? (
                        <div className="flex-1 overflow-y-auto p-8">
                            <CVSectionEditor section={editingSection} />
                        </div>
                    ) : (
                        <div className="flex-1 overflow-hidden">
                            <CVChatAgent />
                        </div>
                    )}
                </div>

                {/* PDF Preview (50%) - Frameless White Theme */}
                <div className="w-1/2 bg-slate-50 relative hidden lg:flex flex-col items-center justify-start p-8 overflow-y-auto overflow-x-hidden">

                    {/* Zoom Controls (Floating - Right side) */}
                    <div className="fixed top-24 right-8 flex flex-col gap-2 bg-white rounded-lg shadow-lg border border-slate-200 p-1.5 z-50">
                        <button
                            onClick={() => setZoom(z => Math.min(z + 0.1, 1.5))}
                            className="p-1.5 text-slate-500 hover:bg-slate-50 hover:text-slate-800 rounded transition-colors"
                            title="Zoom In"
                        >
                            <ZoomIn size={16} />
                        </button>
                        <button
                            onClick={() => setZoom(z => Math.max(z - 0.1, 0.5))}
                            className="p-1.5 text-slate-500 hover:bg-slate-50 hover:text-slate-800 rounded transition-colors"
                            title="Zoom Out"
                        >
                            <ZoomOut size={16} />
                        </button>
                        <div className="text-[10px] text-center text-slate-400 font-medium pb-0.5 select-none">
                            {Math.round(zoom * 100)}%
                        </div>
                    </div>

                    {/* PDF Document Renderer (Keyed by template to force reset) */}
                    <DocRenderer
                        key={`${template}-${cvData.meta.target_pages || 1}`} // Force remount on template or page count change
                        document={PDFDocument}
                        cvData={cvData}
                        zoom={zoom}
                        onSetEditingSection={setEditingSection}
                        templateName={template}
                    />
                </div>
            </div>
        </div >
    );
};
