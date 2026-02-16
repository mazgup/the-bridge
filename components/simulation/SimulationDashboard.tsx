import React, { useState } from 'react';
import { InterviewSession } from './InterviewSession';
import { NegotiationCenter } from './NegotiationCenter';
import { SOSButton } from './SOSButton';
import { GlassCard } from '../GlassCard';
import { Mic, DollarSign, Clock, LayoutGrid, ArrowLeft, ShieldAlert, Telescope, Heart } from 'lucide-react';

type SimulationType = 'interview' | 'salary' | 'flex';
type ViewState = 'menu' | 'config' | 'active' | 'tools';

export const SimulationDashboard: React.FC = () => {
    const [view, setView] = useState<ViewState>('menu');
    const [selectedType, setSelectedType] = useState<SimulationType | null>(null);
    const [selectedPersona, setSelectedPersona] = useState<string>('The Skeptic');
    const [context, setContext] = useState('');

    const handleSelectType = (type: SimulationType) => {
        setSelectedType(type);
        setView('config');
        setContext(''); // Reset context
    };

    const handleStartSimulation = () => {
        if (selectedType && context) {
            setView('active');
        }
    };

    const handleBack = () => {
        if (view === 'config' || view === 'tools') {
            setView('menu');
            setSelectedType(null);
        } else if (view === 'active') {
            // Confirm exit? For now just go back to config
            setView('config');
        }
    };

    const getContextLabel = () => {
        switch (selectedType) {
            case 'interview': return "Job Description";
            case 'salary': return "Current Offer & Target Salary";
            case 'flex': return "Desired Schedule & Role Context";
            default: return "Context";
        }
    };

    const getContextPlaceholder = () => {
        switch (selectedType) {
            case 'interview': return "Paste the JD here to calibrate the AI...";
            case 'salary': return "e.g., Offered £80k, targeting £95k. Bonus details...";
            case 'flex': return "e.g., Requesting 4-day week (Mon-Thu). Role is Client Manager...";
            default: return "";
        }
    };

    const renderPersonaCard = (name: string, icon: React.ElementType, desc: string) => (
        <button 
            onClick={() => setSelectedPersona(name)}
            className={`p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col gap-2 relative overflow-hidden group
                ${selectedPersona === name 
                    ? 'bg-bridge-slate text-white border-bridge-slate shadow-lg scale-[1.02]' 
                    : 'bg-white/50 border-slate-200 text-slate-600 hover:bg-white hover:border-bridge-sage'}
            `}
        >
            <div className={`p-2 rounded-lg w-fit ${selectedPersona === name ? 'bg-white/20' : 'bg-slate-100 group-hover:bg-bridge-sage/20'}`}>
                {React.createElement(icon, { size: 20 })}
            </div>
            <div>
                <div className="font-bold text-sm">{name}</div>
                <div className={`text-xs ${selectedPersona === name ? 'text-slate-300' : 'text-slate-400'}`}>{desc}</div>
            </div>
        </button>
    );

    return (
        <div className="h-[calc(100vh-140px)] min-h-[600px] flex flex-col relative animate-fade-in pb-12">
            <header className="flex justify-between items-end mb-6">
                <div>
                    <h2 className="text-3xl font-serif text-bridge-slate">Simulation Lab</h2>
                    <p className="text-slate-500">Low-latency coaching environment. Zero judgment.</p>
                </div>
                {view !== 'menu' && (
                    <button 
                        onClick={handleBack}
                        className="flex items-center gap-2 px-4 py-2 bg-white/50 hover:bg-white text-slate-600 rounded-xl text-sm font-bold border border-slate-200 transition-colors"
                    >
                        <ArrowLeft size={16} /> Exit
                    </button>
                )}
            </header>

            <div className="flex-1 overflow-hidden">
                {/* MENU VIEW */}
                {view === 'menu' && (
                    <div className="h-full flex flex-col justify-center">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <GlassCard 
                                interactive 
                                onClick={() => handleSelectType('interview')}
                                className="group flex flex-col items-center text-center py-10 gap-4"
                            >
                                <div className="w-16 h-16 bg-bridge-slate/5 rounded-full flex items-center justify-center group-hover:bg-bridge-slate group-hover:text-white transition-colors duration-300">
                                    <Mic size={32} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-bridge-slate mb-1">Interview Mastery</h3>
                                    <p className="text-sm text-slate-500">Practice behavioral questions with real-time feedback.</p>
                                </div>
                            </GlassCard>

                            <GlassCard 
                                interactive 
                                onClick={() => handleSelectType('salary')}
                                className="group flex flex-col items-center text-center py-10 gap-4"
                            >
                                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
                                    <DollarSign size={32} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-bridge-slate mb-1">Salary Negotiation</h3>
                                    <p className="text-sm text-slate-500">Roleplay with hiring managers to maximize your comp.</p>
                                </div>
                            </GlassCard>

                            <GlassCard 
                                interactive 
                                onClick={() => handleSelectType('flex')}
                                className="group flex flex-col items-center text-center py-10 gap-4"
                            >
                                <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300">
                                    <Clock size={32} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-bridge-slate mb-1">Flexible Working</h3>
                                    <p className="text-sm text-slate-500">Pitch your 4-day week or hybrid model confidently.</p>
                                </div>
                            </GlassCard>
                        </div>

                        <div className="text-center">
                            <button 
                                onClick={() => setView('tools')}
                                className="inline-flex items-center gap-2 text-slate-500 hover:text-bridge-slate transition-colors font-medium border-b border-transparent hover:border-bridge-slate pb-0.5"
                            >
                                <LayoutGrid size={16} /> Open Negotiation Command Center (Tools)
                            </button>
                        </div>
                    </div>
                )}

                {/* CONFIG VIEW */}
                {view === 'config' && selectedType && (
                    <div className="h-full flex items-center justify-center">
                        <GlassCard className="max-w-3xl w-full p-8 md:p-10 animate-slide-up">
                            <h3 className="text-2xl font-serif text-bridge-slate mb-6 text-center">
                                Configure {selectedType === 'interview' ? 'Interview' : selectedType === 'salary' ? 'Negotiation' : 'Pitch'}
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <label className="block text-sm font-bold text-slate-700">{getContextLabel()}</label>
                                    <textarea 
                                        className="w-full h-48 bg-white/50 border border-slate-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-bridge-sage/50 resize-none"
                                        placeholder={getContextPlaceholder()}
                                        value={context}
                                        onChange={(e) => setContext(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-4">
                                    <label className="block text-sm font-bold text-slate-700">Select Persona</label>
                                    <div className="grid grid-cols-1 gap-3">
                                        {renderPersonaCard('The Skeptic', ShieldAlert, 'Drills into gaps. Challenges your claims.')}
                                        {renderPersonaCard('The Visionary', Telescope, 'Focuses on big picture and future potential.')}
                                        {renderPersonaCard('Empathetic HR', Heart, 'Focuses on culture fit and soft skills.')}
                                    </div>
                                </div>
                            </div>

                            <button 
                                onClick={handleStartSimulation}
                                disabled={!context.trim()}
                                className="w-full mt-8 bg-bridge-slate text-white py-4 rounded-xl font-bold shadow-lg hover:scale-[1.01] transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <Mic size={20} /> Enter Simulation
                            </button>
                        </GlassCard>
                    </div>
                )}

                {/* ACTIVE SIMULATION VIEW */}
                {view === 'active' && selectedType && (
                    <InterviewSession 
                        type={selectedType}
                        context={context}
                        persona={selectedPersona}
                    />
                )}

                {/* TOOLS VIEW */}
                {view === 'tools' && (
                    <NegotiationCenter />
                )}
            </div>

            {/* SOS Overlay Button */}
            <SOSButton />
        </div>
    );
};