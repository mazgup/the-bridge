import React from 'react';
import { CVPhase } from '../../../stores/cvStore';
import { Edit2 } from 'lucide-react';

interface InteractiveOverlayProps {
    onSelectSection: (section: CVPhase) => void;
}

const ZONES: { id: CVPhase; label: string; top: string; height: string }[] = [
    { id: 'contact', label: 'Contact Details', top: '0%', height: '12%' },
    { id: 'summary', label: 'Professional Summary', top: '12%', height: '15%' },
    { id: 'experience', label: 'Experience', top: '27%', height: '28%' },
    { id: 'education', label: 'Education', top: '55%', height: '15%' },
    { id: 'skills', label: 'Skills', top: '70%', height: '15%' },
];

export const InteractiveOverlay: React.FC<InteractiveOverlayProps> = ({ onSelectSection }) => {
    return (
        <div className="absolute inset-0 z-30 pointer-events-none">
            {/* We make the container pointer-events-none so we don't block scrolling if needed, 
                but children will be pointer-events-auto */}

            {ZONES.map((zone) => (
                <div
                    key={zone.id}
                    onClick={() => onSelectSection(zone.id)}
                    className="absolute w-full flex items-center justify-center group cursor-pointer pointer-events-auto transition-all duration-200"
                    style={{ top: zone.top, height: zone.height }}
                >
                    {/* Hover Effect */}
                    <div className="absolute inset-0 bg-emerald-500/0 group-hover:bg-emerald-500/10 border-2 border-transparent group-hover:border-emerald-400 transition-all duration-200 rounded-sm" />

                    {/* Edit Button (Visible on Hover) */}
                    <div className="opacity-0 group-hover:opacity-100 transform scale-90 group-hover:scale-100 transition-all duration-200 bg-emerald-500 text-white px-3 py-1.5 rounded-full shadow-lg flex items-center gap-2 font-medium text-xs z-10">
                        <Edit2 size={12} />
                        Edit {zone.label}
                    </div>
                </div>
            ))}
        </div>
    );
};
