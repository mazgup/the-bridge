import { create } from 'zustand';
import { CVData, CVMeta, CVContent, CVSkillGroup, CVEducation, CVExperience, CVLink, INITIAL_CV_DATA, CVSummary, computeCompletionPercent, deriveCVTitle } from '../components/cv/CVTypes';

// ============================================================
// Normalisation Helpers — handle AI outputting wrong formats
// ============================================================

/** Normalise skills: AI may send flat strings, objects with string items, etc. */
function normaliseSkills(raw: any): CVSkillGroup[] {
    if (!raw || !Array.isArray(raw)) return [];

    // Case 1: flat string array like ["Sage", "Xero", "Excel"]
    if (raw.length > 0 && typeof raw[0] === 'string') {
        return [{ category: 'General', items: raw as string[] }];
    }

    // Case 2: array of objects — normalise each
    return raw.map((group: any) => {
        const category = group.category || group.name || 'General';
        let items: string[] = [];

        if (Array.isArray(group.items)) {
            items = group.items.map((i: any) => String(i));
        } else if (typeof group.items === 'string') {
            // "Sage, Xero, Excel" → split
            items = group.items.split(/,\s*/).filter(Boolean);
        } else if (Array.isArray(group.skills)) {
            items = group.skills.map((i: any) => String(i));
        }

        return { category, items };
    }).filter((g: CVSkillGroup) => g.items.length > 0);
}

/** Normalise education: AI may use degree/school instead of qualification/institution */
function normaliseEducation(raw: any): CVEducation[] {
    if (!raw || !Array.isArray(raw)) return [];
    return raw.map((edu: any) => ({
        institution: edu.institution || edu.school || edu.university || '',
        qualification: edu.qualification || edu.degree || edu.course || '',
        date_range: edu.date_range || edu.dates || '',
        grade: edu.grade || undefined,
    }));
}

/** Normalise experience: ensure bullets is always an array */
function normaliseExperience(raw: any): CVExperience[] {
    if (!raw || !Array.isArray(raw)) return [];
    return raw.map((exp: any) => ({
        company: exp.company || '',
        role: exp.role || exp.title || exp.position || '',
        date_range: exp.date_range || exp.dates || '',
        location: exp.location || '',
        bullets: Array.isArray(exp.bullets)
            ? exp.bullets.map((b: any) => String(b))
            : typeof exp.bullets === 'string'
                ? [exp.bullets]
                : [],
    }));
}

/** Normalise contact: AI may send objects like {type: "email", value: "x@y.com"} instead of flat strings */
function normaliseContact(raw: any): string[] {
    if (!raw || !Array.isArray(raw)) return [];
    return raw.map((item: any) => {
        if (typeof item === 'string') return item;
        // Handle {type, value} or {label, value} objects
        if (typeof item === 'object' && item !== null) {
            return item.value || item.label || item.text || JSON.stringify(item);
        }
        return String(item);
    }).filter(Boolean);
}

/** Normalise links: AI may send strings or objects in various formats */
function normaliseLinks(raw: any): CVLink[] {
    if (!raw || !Array.isArray(raw)) return [];
    return raw.map((link: any) => {
        if (typeof link === 'string') return { label: link, url: link };
        return {
            label: link.label || link.name || link.type || 'Link',
            url: link.url || link.value || link.href || '',
        };
    }).filter((l: CVLink) => l.url);
}

// ============================================================
// Phase Types
// ============================================================
export type CVPhase = 'contact' | 'experience' | 'education' | 'skills' | 'summary' | 'review';
export type PhaseStatus = 'done' | 'active' | 'upcoming';

export interface PhaseInfo {
    id: CVPhase;
    label: string;
    status: PhaseStatus;
}

const PHASE_ORDER: { id: CVPhase; label: string }[] = [
    { id: 'contact', label: 'Contact' },
    { id: 'experience', label: 'Experience' },
    { id: 'education', label: 'Education' },
    { id: 'skills', label: 'Skills' },
    { id: 'summary', label: 'Summary' },
    { id: 'review', label: 'Review' },
];

// ============================================================
// Compute which phase is active based on what data exists
// ============================================================
function computeActivePhase(cv: CVData): CVPhase {
    const c = cv.content;
    if (!c.personal?.name) return 'contact';
    if ((c.experience || []).length === 0) return 'experience';
    if ((c.education || []).length === 0) return 'education';
    if ((c.skills || []).length === 0) return 'skills';
    if (!c.summary) return 'summary';
    return 'review';
}

export function getPhases(cv: CVData): PhaseInfo[] {
    const active = computeActivePhase(cv);
    const activeIdx = PHASE_ORDER.findIndex((p) => p.id === active);

    return PHASE_ORDER.map((phase, idx) => ({
        id: phase.id,
        label: phase.label,
        status: idx < activeIdx ? 'done' : idx === activeIdx ? 'active' : 'upcoming',
    }));
}

// ============================================================
// UUID Helper
// ============================================================
function generateId(): string {
    return crypto.randomUUID?.() ?? `cv_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

// ============================================================
// Default messages for new CVs
// ============================================================
const INITIAL_MESSAGES: ChatMessage[] = [{
    role: 'model',
    content:
        "Hi there! 👋 I'm your Career Architect — think of me as a friendly mentor.\n\n" +
        "Just **talk to me like a friend** — rough answers are absolutely fine. I'll handle all the professional wording for you.\n\n" +
        "To kick things off, **what kind of work are you looking for?**",
}];

// ============================================================
// Saved CVs Index — localStorage helpers
// ============================================================
const SAVED_CVS_KEY = 'cv-saved-list';

function loadSavedCvsFromStorage(): CVSummary[] {
    try {
        const raw = localStorage.getItem(SAVED_CVS_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch { return []; }
}

function saveCvsToStorage(cvs: CVSummary[]): void {
    localStorage.setItem(SAVED_CVS_KEY, JSON.stringify(cvs));
}

// ============================================================
// Active CV Session — localStorage helpers
// ============================================================
const ACTIVE_CV_KEY = 'cv-active-session';

interface ActiveCVSession {
    id: string;
    cvData: CVData;
    messages: ChatMessage[];
}

function loadActiveSession(): ActiveCVSession | null {
    try {
        const raw = localStorage.getItem(ACTIVE_CV_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch { return null; }
}

function saveActiveSession(session: ActiveCVSession): void {
    localStorage.setItem(ACTIVE_CV_KEY, JSON.stringify(session));
}

function clearActiveSession(): void {
    localStorage.removeItem(ACTIVE_CV_KEY);
}

// ============================================================
// Store
// ============================================================
import { ChatMessage } from '../services/geminiService';

interface CVStore {
    // Active CV editing state
    activeCvId: string | null;
    cvData: CVData;
    isBuilderActive: boolean;       // true = user is editing a CV
    isScreeningComplete: boolean;
    editingSection: CVPhase | null;
    messages: ChatMessage[];
    uploadedCVText: string | null;

    // Gallery state
    savedCvs: CVSummary[];

    // Active CV actions
    updateMeta: (meta: Partial<CVMeta>) => void;
    updateContent: (content: Partial<CVContent>) => void;
    mergeFromAI: (partial: Partial<CVData>) => void;
    setScreeningComplete: (complete: boolean) => void;
    setBuilderActive: (active: boolean) => void;
    setEditingSection: (section: CVPhase | null) => void;
    addMessage: (msg: ChatMessage) => void;
    setMessages: (msgs: ChatMessage[]) => void;
    setUploadedCVText: (text: string | null) => void;

    // Multi-CV actions
    createNewCV: () => string;                              // returns new CV id
    loadCV: (id: string, data: CVData, msgs: ChatMessage[]) => void;
    saveCurrentToIndex: () => void;                          // snapshot current CV to savedCvs
    deleteCV: (id: string) => void;
    setSavedCvs: (cvs: CVSummary[]) => void;
    returnToGallery: () => void;                             // exit builder, go back to gallery

    // Legacy
    hydrate: (data: CVData, msgs: ChatMessage[]) => void;
    reset: () => void;
}

export const useCVStore = create<CVStore>()(
    (set, get) => ({
        activeCvId: null,
        cvData: { ...INITIAL_CV_DATA },
        isScreeningComplete: false,
        isBuilderActive: false,
        editingSection: null,
        uploadedCVText: null,
        messages: [...INITIAL_MESSAGES],
        savedCvs: loadSavedCvsFromStorage(),

        // ========================================
        // Active CV field updates
        // ========================================
        updateMeta: (meta) =>
            set((state) => ({
                cvData: {
                    ...state.cvData,
                    meta: { ...state.cvData.meta, ...meta },
                },
            })),

        updateContent: (content) =>
            set((state) => ({
                cvData: {
                    ...state.cvData,
                    content: { ...state.cvData.content, ...content },
                },
            })),

        mergeFromAI: (partial) =>
            set((state) => {
                const merged = { ...state.cvData };

                if (partial.meta) {
                    merged.meta = { ...merged.meta, ...partial.meta };
                }

                if (partial.content) {
                    const c = partial.content;
                    merged.content = { ...merged.content };

                    if (c.personal) {
                        merged.content.personal = {
                            name: c.personal.name ?? merged.content.personal.name,
                            contact: c.personal.contact ? normaliseContact(c.personal.contact) : merged.content.personal.contact ?? [],
                            links: c.personal.links ? normaliseLinks(c.personal.links) : merged.content.personal.links ?? [],
                        };
                    }
                    if (c.summary !== undefined) {
                        merged.content.summary = c.summary;
                    }
                    if (c.education) {
                        merged.content.education = normaliseEducation(c.education);
                    }
                    if (c.experience) {
                        merged.content.experience = normaliseExperience(c.experience);
                    }
                    if (c.projects) {
                        merged.content.projects = c.projects;
                    }
                    if (c.skills) {
                        const incoming = normaliseSkills(c.skills);
                        const existing = merged.content.skills || [];
                        const categoryMap = new Map<string, string[]>();
                        for (const g of existing) {
                            categoryMap.set(g.category.toLowerCase(), [...g.items]);
                        }
                        for (const g of incoming) {
                            const key = g.category.toLowerCase();
                            if (categoryMap.has(key)) {
                                const existingItems = categoryMap.get(key)!;
                                for (const item of g.items) {
                                    if (!existingItems.some(e => e.toLowerCase() === item.toLowerCase())) {
                                        existingItems.push(item);
                                    }
                                }
                                categoryMap.set(key, existingItems);
                            } else {
                                categoryMap.set(key, [...g.items]);
                            }
                        }
                        const catCasing = new Map<string, string>();
                        for (const g of [...existing, ...incoming]) {
                            catCasing.set(g.category.toLowerCase(), g.category);
                        }
                        merged.content.skills = Array.from(categoryMap.entries()).map(([key, items]) => ({
                            category: catCasing.get(key) || key,
                            items,
                        }));
                    }
                }

                if (import.meta.env.DEV) {
                    console.log('[cvStore] mergeFromAI:', JSON.stringify(partial, null, 2));
                    console.log('[cvStore] result:', JSON.stringify(merged, null, 2));
                }

                return { cvData: merged };
            }),

        setScreeningComplete: (complete) =>
            set({ isScreeningComplete: complete }),

        setBuilderActive: (active) =>
            set({ isBuilderActive: active }),

        setEditingSection: (section) =>
            set({ editingSection: section }),

        addMessage: (msg) =>
            set((state) => ({ messages: [...state.messages, msg] })),

        setMessages: (msgs) =>
            set({ messages: msgs }),

        setUploadedCVText: (text) =>
            set({ uploadedCVText: text }),

        // ========================================
        // Multi-CV actions
        // ========================================
        createNewCV: () => {
            const id = generateId();
            const now = new Date().toISOString();
            set({
                activeCvId: id,
                cvData: { ...INITIAL_CV_DATA },
                messages: [...INITIAL_MESSAGES],
                isBuilderActive: true,
                isScreeningComplete: false,
                editingSection: null,
                uploadedCVText: null,
            });

            // Add to savedCvs index
            const summary: CVSummary = {
                id,
                title: 'Untitled CV',
                status: 'in_progress',
                createdAt: now,
                lastUpdated: now,
                targetRole: '',
                completionPercent: 0,
            };
            const updated = [summary, ...get().savedCvs];
            set({ savedCvs: updated });
            saveCvsToStorage(updated);
            saveActiveSession({ id, cvData: { ...INITIAL_CV_DATA }, messages: [...INITIAL_MESSAGES] });

            return id;
        },

        loadCV: (id, data, msgs) => {
            set({
                activeCvId: id,
                cvData: data,
                messages: msgs,
                isBuilderActive: true,
                isScreeningComplete: false,
                editingSection: null,
                uploadedCVText: null,
            });
            saveActiveSession({ id, cvData: data, messages: msgs });
        },

        saveCurrentToIndex: () => {
            const { activeCvId, cvData, messages, savedCvs } = get();
            if (!activeCvId) return;

            const now = new Date().toISOString();
            const title = deriveCVTitle(cvData);
            const completion = computeCompletionPercent(cvData);
            const status = completion >= 100 ? 'completed' : 'in_progress';

            // Update the index entry for this CV
            const idx = savedCvs.findIndex(s => s.id === activeCvId);
            const summary: CVSummary = {
                id: activeCvId,
                title,
                status: status as 'in_progress' | 'completed',
                createdAt: idx >= 0 ? savedCvs[idx].createdAt : now,
                lastUpdated: now,
                targetRole: cvData.meta.target_role || '',
                completionPercent: completion,
            };

            let updated: CVSummary[];
            if (idx >= 0) {
                updated = [...savedCvs];
                updated[idx] = summary;
            } else {
                updated = [summary, ...savedCvs];
            }

            set({ savedCvs: updated });
            saveCvsToStorage(updated);
            saveActiveSession({ id: activeCvId, cvData, messages });
        },

        deleteCV: (id) => {
            const { savedCvs, activeCvId } = get();
            const updated = savedCvs.filter(s => s.id !== id);
            set({ savedCvs: updated });
            saveCvsToStorage(updated);

            // If deleting the active CV, reset
            if (activeCvId === id) {
                set({
                    activeCvId: null,
                    cvData: { ...INITIAL_CV_DATA },
                    messages: [...INITIAL_MESSAGES],
                    isBuilderActive: false,
                    editingSection: null,
                    uploadedCVText: null,
                });
                clearActiveSession();
            }
        },

        setSavedCvs: (cvs) => {
            set({ savedCvs: cvs });
            saveCvsToStorage(cvs);
        },

        returnToGallery: () => {
            // Save current work before returning
            get().saveCurrentToIndex();
            set({
                isBuilderActive: false,
                editingSection: null,
            });
        },

        // ========================================
        // Legacy / compat
        // ========================================
        hydrate: (data, msgs) =>
            set({ cvData: data, messages: msgs, isBuilderActive: true }),

        reset: () => {
            const id = generateId();
            set({
                activeCvId: id,
                cvData: { ...INITIAL_CV_DATA },
                isScreeningComplete: false,
                isBuilderActive: false,
                editingSection: null,
                uploadedCVText: null,
                messages: [...INITIAL_MESSAGES],
            });
        },
    })
);

// ============================================================
// Boot: restore active session from localStorage
// ============================================================
const savedSession = loadActiveSession();
if (savedSession) {
    useCVStore.setState({
        activeCvId: savedSession.id,
        cvData: savedSession.cvData,
        messages: savedSession.messages,
        // Don't auto-activate builder — let user see gallery first
        isBuilderActive: false,
    });
}

// ============================================================
// Auto-save subscriber: persist active session to localStorage
// ============================================================
let saveTimer: ReturnType<typeof setTimeout> | null = null;
useCVStore.subscribe((state, prevState) => {
    if (!state.activeCvId) return;
    // Only save if cvData or messages actually changed
    if (state.cvData === prevState.cvData && state.messages === prevState.messages) return;

    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
        saveActiveSession({ id: state.activeCvId!, cvData: state.cvData, messages: state.messages });
        // Also update the gallery index
        state.saveCurrentToIndex();
    }, 1000);
});

