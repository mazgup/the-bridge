import React, { useState } from 'react';
import { GlassCard } from '../GlassCard';
import { Map, Flag, CheckCircle, ArrowRight, Target, Coffee, Shield, Copy, Zap, MessageSquare, Battery } from 'lucide-react';

interface SprintPhase {
    id: string;
    weeks: string;
    theme: string;
    focus: string;
    deliverable: {
        title: string;
        desc: string;
        content: string; // The copy/paste script or template
    };
    isLocked?: boolean;
}

interface First90DaysProps {
    mode?: 'pivot' | 'return'; // Pivot = Standard/New Job, Return = Post-Maternity
}

const PIVOT_SPRINT: SprintPhase[] = [
    {
        id: '1',
        weeks: 'Weeks 1-4',
        theme: 'The Map',
        focus: 'Identify Real Power vs. Influence',
        deliverable: {
            title: 'The Stakeholder Audit',
            desc: 'A template to categorize colleagues as "Champions," "Blockers," or "Mentors."',
            content: "STAKEHOLDER AUDIT TEMPLATE\n\n1. Name: [Name]\n   Role: [Official Title]\n   Influence Score (1-10): [Score]\n   Category: Champion / Blocker / Mentor\n   Key Driver: [What do they care about? Revenue? Speed? Safety?]\n   Strategy: [e.g., Weekly coffee, email update only]"
        }
    },
    {
        id: '2',
        weeks: 'Weeks 5-8',
        theme: 'The Voice',
        focus: 'Secure a Quick Win & Be Visible',
        deliverable: {
            title: 'The "Meeting Script" Bank',
            desc: 'Pre-written prompts for "Asking the smart question" when you don\'t know the tech yet.',
            content: "SCRIPT: THE STRATEGIC CLARIFIER\n\n\"That’s a great point about [Topic]. Before we commit resources, how does this align with our Q3 goal of [Goal]? I want to ensure we aren't creating tech debt for the future.\""
        }
    },
    {
        id: '3',
        weeks: 'Weeks 9-12',
        theme: 'The Proof',
        focus: 'Aggregate Micro-Wins for Probation',
        deliverable: {
            title: 'The ROI Tracker',
            desc: 'Log that converts daily tasks into "Business Value" language.',
            content: "ROI TRACKER LOG\n\nTask: [e.g., Organized Folder System]\nBusiness Value: [e.g., Reduced search time by 20% for team]\nStrategic Link: Operational Efficiency"
        }
    }
];

const RETURN_SPRINT: SprintPhase[] = [
    {
        id: '1',
        weeks: 'Weeks 1-4',
        theme: 'The Shield',
        focus: 'Re-establish Work-Self without Guilt',
        deliverable: {
            title: 'The "Availability Memo"',
            desc: 'Professional template for setting comms expectations (e.g., Deep work 9-11).',
            content: "Hi Team,\n\nTo ensure I'm delivering my best work on [Project X], I'm blocking 9:00 AM - 11:00 AM daily for deep work. I'll be offline on Slack during this window to focus on execution.\n\nFor urgent matters, please call. Otherwise, I'll respond by 11:30 AM.\n\nThanks,\n[Name]"
        }
    },
    {
        id: '2',
        weeks: 'Weeks 5-8',
        theme: 'The Update',
        focus: 'Narrative Re-Sync (Internal Lore)',
        deliverable: {
            title: 'Coffee Chat Cheat Sheet',
            desc: '5 high-impact questions to download office politics.',
            content: "THE DOWNLOAD QUESTIONS:\n\n1. \"What’s the biggest change in the team dynamic since [Month]?\"\n2. \"Who has really stepped up recently?\"\n3. \"Is [Old Priority] still the main focus, or has the needle moved to [New Priority]?\""
        }
    },
    {
        id: '3',
        weeks: 'Weeks 9-12',
        theme: 'The Ascent',
        focus: 'Efficiency Optimization',
        deliverable: {
            title: 'The Energy Audit',
            desc: 'Identify "low-value/high-effort" tasks to delegate.',
            content: "ENERGY AUDIT MATRIX\n\nTask: [Task Name]\nEffort (1-10): [High]\nValue (1-10): [Low]\nAction: AUTOMATE / DELEGATE / DELETE"
        }
    }
];

export const First90Days: React.FC<First90DaysProps> = ({ mode = 'pivot' }) => {
    const [currentPhase, setCurrentPhase] = useState(0); // 0, 1, 2
    const data = mode === 'return' ? RETURN_SPRINT : PIVOT_SPRINT;
    const activeData = data[currentPhase];

    // Progress Calculation
    // Week 2 of 12 = ~16%
    const progress = Math.round(((currentPhase + 1) * 4) / 12 * 100);

    return (
        <div className="h-full flex flex-col gap-6 animate-fade-in pb-12">
            <header className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-serif text-bridge-slate">
                        {mode === 'return' ? 'The Return Roadmap' : 'The First 90 Days'}
                    </h2>
                    <p className="text-slate-500">
                        {mode === 'return' ? 'Version B: The Returning Mother (Tactical Sprint)' : 'Version A: The Pivot (Tactical Sprint)'}
                    </p>
                </div>
                
                {/* Bionic Boss Brief - Ghost Feature */}
                <GlassCard className="!p-3 !bg-bridge-slate !text-white flex items-center gap-3 cursor-pointer hover:scale-105 transition-transform shadow-lg group">
                    <div className="p-2 bg-white/10 rounded-lg group-hover:bg-white/20">
                        <Zap size={20} className="text-yellow-300" />
                    </div>
                    <div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-300">New: Ghost Feature</div>
                        <div className="font-bold text-sm">The Bionic Boss Brief</div>
                    </div>
                </GlassCard>
            </header>

            {/* Progress Bar / Gamification */}
            <div className="bg-white/50 p-6 rounded-3xl border border-slate-200">
                <div className="flex justify-between items-end mb-2">
                    <div className="text-sm font-bold text-slate-600 uppercase tracking-widest">
                        Probation Trajectory
                    </div>
                    <div className="text-2xl font-serif font-bold text-bridge-sage">{progress}% Complete</div>
                </div>
                <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
                    <div 
                        className="bg-gradient-to-r from-bridge-sage to-emerald-500 h-full transition-all duration-1000 ease-out" 
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
                <div className="flex justify-between mt-4">
                    {data.map((phase, idx) => (
                        <button 
                            key={phase.id}
                            onClick={() => setCurrentPhase(idx)}
                            className={`flex-1 text-center py-2 rounded-xl transition-all ${currentPhase === idx ? 'bg-white shadow-sm font-bold text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <div className="text-xs uppercase tracking-wider mb-1">{phase.weeks}</div>
                            <div className="text-sm">{phase.theme}</div>
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
                {/* Left: The Focus (Strategy) */}
                <div className="lg:col-span-5 flex flex-col gap-6">
                    <GlassCard className="flex-1 bg-gradient-to-br from-white to-bridge-beige/30 border-l-4 border-l-bridge-slate flex flex-col justify-center p-8">
                        <div className="text-sm text-slate-500 font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Target size={18} /> The "12-Minute" Focus
                        </div>
                        <h3 className="text-3xl md:text-4xl font-serif text-slate-800 mb-6 leading-tight">
                            {activeData.focus}
                        </h3>
                        <p className="text-slate-600 leading-relaxed">
                            {mode === 'return' 
                                ? "Stop trying to prove you haven't lost a step. Instead, prove you have gained a new perspective. Your value is now in strategic efficiency, not hours logged."
                                : "The goal isn't just to do the job. It's to be SEEN doing the job. In the first 4 weeks, perception is reality."}
                        </p>
                    </GlassCard>

                    {/* Bionic Boss Brief Contextual */}
                    <GlassCard className="bg-slate-800 text-white p-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Zap size={64} />
                        </div>
                        <div className="relative z-10">
                            <div className="text-xs font-bold text-yellow-400 uppercase tracking-widest mb-2">Friday 4:00 PM Notification</div>
                            <h4 className="text-lg font-bold mb-2">"The 1:1 Script"</h4>
                            <p className="text-slate-300 text-sm mb-4">
                                Exact words to say to your manager on Monday to sound 10 steps ahead.
                            </p>
                            <button className="text-xs font-bold bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg transition-colors flex items-center gap-2">
                                <Copy size={12} /> Copy to Clipboard
                            </button>
                        </div>
                    </GlassCard>
                </div>

                {/* Right: The Tool (Deliverable) */}
                <div className="lg:col-span-7">
                    <GlassCard className="h-full flex flex-col">
                        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
                            <div className={`p-3 rounded-xl ${mode === 'return' ? 'bg-bridge-lilac/30 text-slate-700' : 'bg-bridge-sage/30 text-slate-700'}`}>
                                {mode === 'return' ? <Shield size={24} /> : <Map size={24} />}
                            </div>
                            <div>
                                <div className="text-xs text-slate-400 font-bold uppercase tracking-widest">Tactical Deliverable</div>
                                <h3 className="text-xl font-bold text-slate-800">{activeData.deliverable.title}</h3>
                            </div>
                        </div>

                        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 flex-1 relative group font-mono text-sm text-slate-600 overflow-y-auto">
                            <button className="absolute top-4 right-4 p-2 bg-white rounded-lg shadow-sm text-slate-400 hover:text-bridge-slate transition-colors border border-slate-200" title="Copy Tool">
                                <Copy size={16} />
                            </button>
                            <pre className="whitespace-pre-wrap font-sans leading-relaxed">
                                {activeData.deliverable.content}
                            </pre>
                        </div>

                        <div className="mt-6 flex justify-between items-center text-sm text-slate-500">
                            <span>Use this tool to secure your weekly win.</span>
                            <button className="font-bold text-bridge-slate flex items-center gap-2 hover:gap-3 transition-all">
                                Open Full Template <ArrowRight size={16} />
                            </button>
                        </div>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
};