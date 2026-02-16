import React, { useState } from 'react';
import { GlassCard } from '../GlassCard';
import { BrainCircuit, Search, Download, Star, Sparkles, Target, Zap, Briefcase, FileText } from 'lucide-react';
import { generateBattleCard, generateIndustryPulse, BattleCard, IndustryPulse } from '../../services/geminiService';

export const KnowledgeBriefs: React.FC = () => {
    const [mode, setMode] = useState<'jd' | 'industry'>('jd');
    const [inputText, setInputText] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [battleCard, setBattleCard] = useState<BattleCard | null>(null);
    const [industryPulse, setIndustryPulse] = useState<IndustryPulse | null>(null);
    const [starred, setStarred] = useState<string[]>([]);

    const handleGenerate = async () => {
        if (!inputText.trim()) return;
        setIsGenerating(true);
        
        if (mode === 'jd') {
            const result = await generateBattleCard(inputText);
            setBattleCard(result);
            setIndustryPulse(null);
        } else {
            const result = await generateIndustryPulse(inputText);
            setIndustryPulse(result);
            setBattleCard(null);
        }
        
        setIsGenerating(false);
    };

    const toggleStar = (item: string) => {
        if (starred.includes(item)) {
            setStarred(starred.filter(i => i !== item));
        } else {
            setStarred([...starred, item]);
        }
    };

    const handleExport = () => {
        window.print();
    };

    return (
        <div className="h-full flex flex-col gap-6 animate-fade-in pb-12">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h2 className="text-3xl font-serif text-bridge-slate">Knowledge Briefs</h2>
                    <p className="text-slate-500">The Intelligence Hub. Max signal, minimum noise.</p>
                </div>
                { (battleCard || industryPulse) && (
                    <button 
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-600 rounded-xl text-sm font-bold border border-slate-200 transition-colors shadow-sm"
                    >
                        <Download size={16} /> PDF Export
                    </button>
                )}
            </header>

            {/* Magic Input Section */}
            <div className="relative">
                <div className="flex gap-4 mb-4">
                    <button 
                        onClick={() => { setMode('jd'); setInputText(''); setBattleCard(null); }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${mode === 'jd' ? 'bg-bridge-slate text-white' : 'text-slate-500 hover:bg-white/50'}`}
                    >
                        <Target size={16} /> JD Interpreter
                    </button>
                    <button 
                        onClick={() => { setMode('industry'); setInputText(''); setIndustryPulse(null); }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${mode === 'industry' ? 'bg-bridge-slate text-white' : 'text-slate-500 hover:bg-white/50'}`}
                    >
                        <Zap size={16} /> Industry Pulse
                    </button>
                </div>

                <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-bridge-sage via-bridge-lilac to-bridge-sage rounded-2xl opacity-20 group-hover:opacity-40 transition-opacity blur duration-1000 animate-gradient-x"></div>
                    <GlassCard className="relative p-0 overflow-hidden !bg-white">
                        <textarea 
                            className="w-full h-32 p-6 resize-none focus:outline-none text-slate-700 bg-transparent placeholder-slate-400 font-medium text-lg"
                            placeholder={mode === 'jd' ? "Paste Job Description URL or Text here..." : "Enter Industry (e.g. FinTech, Logistics)..."}
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                        />
                        <div className="absolute bottom-4 right-4">
                            <button 
                                onClick={handleGenerate}
                                disabled={!inputText.trim() || isGenerating}
                                className="bg-bridge-slate text-white px-6 py-2 rounded-xl text-sm font-bold shadow-lg hover:scale-105 transition-transform flex items-center gap-2 disabled:opacity-50 disabled:scale-100"
                            >
                                {isGenerating ? <Sparkles size={16} className="animate-spin" /> : <Search size={16} />}
                                {isGenerating ? 'Researching...' : 'Generate Brief'}
                            </button>
                        </div>
                    </GlassCard>
                </div>
            </div>

            {/* Results Grid */}
            {(battleCard || industryPulse) && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
                    
                    {/* Green Cards: Role / JD Match */}
                    {battleCard && (
                        <>
                            <GlassCard className="border-t-4 border-t-emerald-500 flex flex-col gap-4">
                                <div className="flex items-center gap-2 text-emerald-600 font-bold uppercase tracking-wider text-xs mb-2">
                                    <Target size={14} /> The Job Match
                                </div>
                                
                                <div>
                                    <h3 className="text-xl font-serif text-slate-800 mb-1">{battleCard.role}</h3>
                                    <p className="text-xs text-slate-400">Inferred Role Title</p>
                                </div>

                                <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
                                    <h4 className="font-bold text-emerald-800 text-sm mb-2">The Hidden Agenda</h4>
                                    <p className="text-sm text-slate-700 leading-relaxed italic">
                                        "{battleCard.hiddenAgenda}"
                                    </p>
                                </div>
                            </GlassCard>

                            <GlassCard className="border-t-4 border-t-emerald-500 flex flex-col gap-4">
                                <div className="flex items-center gap-2 text-emerald-600 font-bold uppercase tracking-wider text-xs mb-2">
                                    <BrainCircuit size={14} /> High-Impact Questions
                                </div>
                                <ul className="space-y-3">
                                    {battleCard.questions.map((q, idx) => (
                                        <li key={idx} className="relative group cursor-pointer" onClick={() => toggleStar(q)}>
                                            <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm text-sm text-slate-700 pr-8 group-hover:border-bridge-sage transition-colors">
                                                {q}
                                            </div>
                                            <button className={`absolute top-1/2 -translate-y-1/2 right-3 ${starred.includes(q) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300 group-hover:text-yellow-400'}`}>
                                                <Star size={16} />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </GlassCard>

                             {/* Blue Cards: Toolkit */}
                            <GlassCard className="border-t-4 border-t-blue-500 flex flex-col gap-4">
                                <div className="flex items-center gap-2 text-blue-600 font-bold uppercase tracking-wider text-xs mb-2">
                                    <Briefcase size={14} /> The Tool-Kit
                                </div>
                                <p className="text-xs text-slate-500 mb-2">Software & Stacks mentioned.</p>
                                <div className="flex flex-wrap gap-2">
                                    {battleCard.tools.map((t, idx) => (
                                        <span key={idx} className="px-3 py-1.5 bg-blue-50 text-blue-700 text-sm font-bold rounded-lg border border-blue-100">
                                            {t}
                                        </span>
                                    ))}
                                </div>
                            </GlassCard>
                        </>
                    )}

                    {/* Gold Cards: Market Pulse */}
                    {industryPulse && (
                        <>
                            <GlassCard className="border-t-4 border-t-amber-400 flex flex-col gap-4 lg:col-span-2">
                                <div className="flex items-center gap-2 text-amber-600 font-bold uppercase tracking-wider text-xs mb-2">
                                    <Zap size={14} /> The Watercooler Summary
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {industryPulse.watercooler.map((fact, idx) => (
                                        <div key={idx} className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                                            <div className="text-2xl font-bold text-amber-200 mb-2">0{idx + 1}</div>
                                            <p className="text-sm text-slate-700 font-medium leading-relaxed">
                                                {fact}
                                            </p>
                                            <div className="mt-3 flex justify-end">
                                                <button onClick={() => toggleStar(fact)} className={`${starred.includes(fact) ? 'text-amber-500 fill-amber-500' : 'text-amber-300 hover:text-amber-500'}`}>
                                                    <Star size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </GlassCard>

                            <GlassCard className="border-t-4 border-t-amber-400 flex flex-col gap-4">
                                <div className="flex items-center gap-2 text-amber-600 font-bold uppercase tracking-wider text-xs mb-2">
                                    <Target size={14} /> Competitor Snapshot
                                </div>
                                <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm h-full">
                                     <p className="text-sm text-slate-600 leading-relaxed">
                                        {industryPulse.competitorSnapshot}
                                     </p>
                                </div>
                            </GlassCard>
                        </>
                    )}
                </div>
            )}

            {/* Empty State */}
            {!battleCard && !industryPulse && !isGenerating && (
                <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
                    <FileText size={48} className="text-slate-300 mb-4" />
                    <p className="text-slate-400">Ready to research. Enter a JD or Industry above.</p>
                </div>
            )}
        </div>
    );
};