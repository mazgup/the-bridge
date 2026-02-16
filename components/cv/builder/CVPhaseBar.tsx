import React from 'react';
import { User, Briefcase, GraduationCap, Wrench, FileText, CheckCircle2, Check } from 'lucide-react';
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
        <div className="flex items-center gap-1 px-4 py-2.5 bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
            {phases.map((phase, idx) => {
                const Icon = PHASE_ICONS[phase.id];
                const isActive = phase.status === 'active';
                const isDone = phase.status === 'done';
                const isEditing = editingSection === phase.id;
                const isClickable = isDone || isActive;

                return (
                    <React.Fragment key={phase.id}>
                        {/* Connector line */}
                        {idx > 0 && (
                            <div
                                className={`h-[2px] flex-1 min-w-[12px] max-w-[40px] transition-colors duration-300 ${isDone ? 'bg-emerald-400' : 'bg-slate-200'
                                    }`}
                            />
                        )}

                        {/* Phase pill */}
                        <button
                            onClick={() => handleClick(phase.id, phase.status)}
                            disabled={!isClickable}
                            className={`
                                flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
                                transition-all duration-300 whitespace-nowrap
                                ${isEditing
                                    ? 'bg-emerald-500 text-white shadow-md ring-2 ring-emerald-200'
                                    : isDone
                                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 cursor-pointer'
                                        : isActive
                                            ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200 cursor-pointer'
                                            : 'bg-slate-50 text-slate-400 cursor-default'
                                }
                            `}
                            title={isDone ? `Click to edit ${phase.label}` : isActive ? `Currently working on ${phase.label}` : ''}
                        >
                            {/* Status indicator */}
                            {isDone && !isEditing ? (
                                <Check size={12} className="text-emerald-500" />
                            ) : isActive ? (
                                <span className="relative flex h-2 w-2">
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
