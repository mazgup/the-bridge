import React from 'react';
import { User, Briefcase, GraduationCap, Wrench, FileText, CheckCircle2, Check, Edit2 } from 'lucide-react';
import { useCVStore, getPhases, CVPhase, PhaseStatus } from '../../../stores/cvStore';

// ============================================================
// CVPhaseBar — Horizontal progress stepper
// ============================================================
// Shows: Contact → Experience → Education → Skills → Summary → Review
// Auto-updates based on what data exists in the store.
// Clicking a completed phase opens the section editor.
// ============================================================

const PHASE_ICONS: Record<CVPhase, React.ElementType> = {
    contact: User,
    experience: Briefcase,
    education: GraduationCap,
    skills: Wrench,
    summary: FileText,
    review: CheckCircle2,
};

export const CVPhaseBar: React.FC = () => {
    const { cvData, editingSection, setEditingSection } = useCVStore();
    const phases = getPhases(cvData);

    const handleClick = (id: CVPhase, status: PhaseStatus) => {
        if (status === 'upcoming') return; // can't click future phases
        if (editingSection === id) {
            setEditingSection(null); // toggle off — back to chat
        } else {
            setEditingSection(id);
        }
    };

    return (
        <div className="flex flex-wrap justify-center items-center gap-2 py-1 max-w-[60vw]">
            {phases.map((phase, idx) => {
                const Icon = PHASE_ICONS[phase.id];
                const isActive = phase.status === 'active';
                const isDone = phase.status === 'done';
                const isEditing = editingSection === phase.id;
                const isClickable = isDone || isActive;

                return (
                    <React.Fragment key={phase.id}>
                        {/* Connector line (Hidden on small screens if wrapping occurs heavily, but useful visually) */}
                        {/* Actually, with wrapping, lines look weird. Let's hide lines or make them very subtle short dashes */}
                        {/* We'll remove lines for cleaner 'pill' look in wrapped mode */}

                        {/* Phase pill */}
                        <button
                            onClick={() => handleClick(phase.id, phase.status)}
                            disabled={!isClickable}
                            className={`
                                group flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
                                transition-all duration-300 whitespace-nowrap border
                                ${isEditing
                                    ? 'bg-emerald-500 text-white border-emerald-600 shadow-md ring-2 ring-emerald-200'
                                    : isDone
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100 hover:border-emerald-300 cursor-pointer'
                                        : isActive
                                            ? 'bg-blue-50 text-blue-700 border-blue-200 ring-1 ring-blue-200 cursor-pointer shadow-sm'
                                            : 'bg-slate-50 text-slate-400 border-transparent cursor-default'
                                }
                            `}
                            title={isDone ? `Click to edit ${phase.label}` : isActive ? `Currently working on ${phase.label}` : ''}
                        >
                            {/* Status indicator */}
                            {isDone && !isEditing ? (
                                <div className="flex items-center">
                                    <Check size={12} className="group-hover:hidden" />
                                    <Edit2 size={12} className="hidden group-hover:block" />
                                </div>
                            ) : isActive ? (
                                <span className="relative flex h-2 w-2 mr-0.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
                                </span>
                            ) : null}

                            <Icon size={13} />
                            <span className="hidden sm:inline">{phase.label}</span>
                        </button>
                    </React.Fragment>
                );
            })}
        </div>
    );
};
