import { create } from 'zustand';
import { CVData, CVMeta, CVContent, INITIAL_CV_DATA } from '../components/cv/CVTypes';

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
// Store
// ============================================================
interface CVStore {
    // State
    cvData: CVData;
    isScreeningComplete: boolean;
    editingSection: CVPhase | null; // null = chat mode, string = form editor

    // Actions
    updateMeta: (meta: Partial<CVMeta>) => void;
    updateContent: (content: Partial<CVContent>) => void;
    mergeFromAI: (partial: Partial<CVData>) => void;
    setScreeningComplete: (complete: boolean) => void;
    setEditingSection: (section: CVPhase | null) => void;
    reset: () => void;
}

export const useCVStore = create<CVStore>((set) => ({
    // Initial state  
    cvData: { ...INITIAL_CV_DATA },
    isScreeningComplete: false,
    editingSection: null,

    // Update only meta fields
    updateMeta: (meta) =>
        set((state) => ({
            cvData: {
                ...state.cvData,
                meta: { ...state.cvData.meta, ...meta },
            },
        })),

    // Update only content fields
    updateContent: (content) =>
        set((state) => ({
            cvData: {
                ...state.cvData,
                content: { ...state.cvData.content, ...content },
            },
        })),

    // Merge a partial CVData from AI response (can update both meta and content)
    // Deep-merges personal to prevent wiping contact/links when AI only sends name
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
                        contact: c.personal.contact ?? merged.content.personal.contact ?? [],
                        links: c.personal.links ?? merged.content.personal.links ?? [],
                    };
                }
                if (c.summary !== undefined) {
                    merged.content.summary = c.summary;
                }
                if (c.education) {
                    merged.content.education = c.education;
                }
                if (c.experience) {
                    merged.content.experience = c.experience;
                }
                if (c.projects) {
                    merged.content.projects = c.projects;
                }
                if (c.skills) {
                    merged.content.skills = c.skills;
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

    setEditingSection: (section) =>
        set({ editingSection: section }),

    reset: () =>
        set({ cvData: { ...INITIAL_CV_DATA }, isScreeningComplete: false, editingSection: null }),
}));
