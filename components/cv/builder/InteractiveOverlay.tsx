import React from 'react';
import { CVPhase } from '../../../stores/cvStore';
import { CVData } from '../CVTypes';
import { Edit2, User, FileText, Briefcase, GraduationCap, Code2 } from 'lucide-react';
import { SectionPositions } from '../../../hooks/usePDFLayout';

interface InteractiveOverlayProps {
    cvData: CVData;
    onSelectSection: (section: CVPhase) => void;
    layoutPositions?: SectionPositions;
}

const SECTIONS: { id: CVPhase; label: string; icon: React.FC<any> }[] = [
    { id: 'contact', label: 'Contact', icon: User },
    { id: 'summary', label: 'Summary', icon: FileText },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'skills', label: 'Skills', icon: Code2 },
];

export const InteractiveOverlay: React.FC<InteractiveOverlayProps> = ({ cvData, onSelectSection, layoutPositions }) => {

    // Fallback defaults if analysis is running or failed
    // (Used only briefly during initial load)
    const defaults: Record<string, string> = {
        contact: '2%',
        summary: '15%',
        experience: '35%',
        education: '70%',
        skills: '85%'
    };

    const getPosition = (id: string) => {
        // 1. Use Deep Research layout if available (Exact Y%)
        if (layoutPositions && layoutPositions[id] !== undefined) {
            // Add a small offset (-1%) to center-align with header
            return `${layoutPositions[id] - 1}% `;
        }
        // 2. Fallback
        return defaults[id] || '0%';
    };

    return (
        <div className="absolute right-0 top-0 bottom-0 w-12 flex flex-col bg-transparent pointer-events-none z-30">
            {SECTIONS.map((section) => (
                <button
                    key={section.id}
                    onClick={() => onSelectSection(section.id)}
                    className="
                        absolute right-2
                        group flex items-center justify-center w-8 h-8 
                        bg-white/90 border border-[#9FBFA0]/30 shadow-sm rounded-full backdrop-blur-sm
                        text-[#9FBFA0] hover:bg-[#9FBFA0] hover:text-white hover:border-[#9FBFA0] hover:shadow-md hover:scale-110
                        transition-all duration-300 pointer-events-auto
                    "
                    style={{ top: getPosition(section.id) }}
                    title={`Edit ${section.label} `}
                >
                    <section.icon size={14} />

                    {/* Tooltip Label (Left side now) */}
                    <span className="
                        absolute right-full mr-2 px-2 py-1 
                        bg-slate-800 text-white text-[10px] font-medium rounded opacity-0 
                        group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-sm
                        transform translate-x-2 group-hover:translate-x-0 transition-transform z-50
                    ">
                        Edit {section.label}
                    </span>
                </button>
            ))}
        </div>
    );
};
