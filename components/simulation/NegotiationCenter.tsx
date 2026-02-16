import React, { useState } from 'react';
import { GlassCard } from '../GlassCard';
import { DollarSign, Briefcase, TrendingUp, Shield, MessageSquare, ArrowRight } from 'lucide-react';
import { getNegotiationRebuttal } from '../../services/geminiService';

export const NegotiationCenter: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'calculator' | 'partner'>('calculator');

    // Calculator State
    const [baseSalary, setBaseSalary] = useState(120000);
    const [bonus, setBonus] = useState(15);
    const [flexValue, setFlexValue] = useState(5000);

    // Partner State
    const [selectedObjection, setSelectedObjection] = useState<string | null>(null);
    const [rebuttal, setRebuttal] = useState<string | null>(null);
    const [loadingRebuttal, setLoadingRebuttal] = useState(false);

    const totalComp = baseSalary + (baseSalary * (bonus / 100)) + flexValue;
    const noGoZone = 110000;

    const objections = [
        "We don't usually offer 4-day weeks.",
        "That's the top of our budget band.",
        "We need you in the office 5 days a week.",
        "The equity package is standard for everyone."
    ];

    const handleObjectionClick = async (obj: string) => {
        setSelectedObjection(obj);
        setLoadingRebuttal(true);
        const text = await getNegotiationRebuttal({}, obj);
        setRebuttal(text);
        setLoadingRebuttal(false);
    };

    return (
        <div className="h-full flex flex-col gap-6 animate-fade-in">
            {/* Tabs */}
            <div className="flex justify-center">
                <div className="bg-white/50 p-1 rounded-2xl flex gap-2 border border-slate-200 shadow-sm">
                    <button
                        onClick={() => setActiveTab('calculator')}
                        className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'calculator' ? 'bg-bridge-slate text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Total Comp Calculator
                    </button>
                    <button
                        onClick={() => setActiveTab('partner')}
                        className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'partner' ? 'bg-bridge-slate text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Silent Partner
                    </button>
                </div>
            </div>

            {activeTab === 'calculator' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
                    <GlassCard className="flex flex-col gap-8">
                        <div>
                            <label className="flex justify-between text-sm font-bold text-slate-700 mb-4">
                                <span>Base Salary</span>
                                <span className="bg-slate-100 px-2 py-1 rounded text-slate-600">£{baseSalary.toLocaleString()}</span>
                            </label>
                            <input
                                type="range"
                                min="50000"
                                max="200000"
                                step="1000"
                                value={baseSalary}
                                onChange={(e) => setBaseSalary(Number(e.target.value))}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-bridge-slate"
                            />
                        </div>
                        <div>
                            <label className="flex justify-between text-sm font-bold text-slate-700 mb-4">
                                <span>Bonus Potential</span>
                                <span className="bg-slate-100 px-2 py-1 rounded text-slate-600">{bonus}%</span>
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                step="1"
                                value={bonus}
                                onChange={(e) => setBonus(Number(e.target.value))}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-bridge-slate"
                            />
                        </div>
                        <div>
                            <label className="flex justify-between text-sm font-bold text-slate-700 mb-4">
                                <span>Flexibility Value</span>
                                <span className="bg-slate-100 px-2 py-1 rounded text-slate-600">£{flexValue.toLocaleString()}</span>
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="20000"
                                step="500"
                                value={flexValue}
                                onChange={(e) => setFlexValue(Number(e.target.value))}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-bridge-slate"
                            />
                            <p className="text-xs text-slate-400 mt-2">Monetary value of saved commute/childcare time.</p>
                        </div>
                    </GlassCard>

                    <GlassCard className="bg-gradient-to-br from-bridge-slate to-slate-800 text-white flex flex-col justify-center items-center relative overflow-hidden">
                        <div className="relative z-10 text-center">
                            <div className="text-sm font-medium text-slate-300 uppercase tracking-widest mb-2">Real Value</div>
                            <div className="text-5xl font-serif font-bold mb-8">£{totalComp.toLocaleString()}</div>

                            <div className="w-full max-w-xs h-64 flex items-end justify-center gap-4 border-b border-white/20 pb-0 relative">
                                <div className="w-16 bg-red-400/30 rounded-t-lg relative group transition-all" style={{ height: '40%' }}>
                                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs text-red-300 font-bold whitespace-nowrap">No-Go Zone</span>
                                </div>
                                <div className="w-16 bg-bridge-sage rounded-t-lg relative transition-all duration-500" style={{ height: `${(totalComp / 250000) * 100}%` }}>
                                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs text-bridge-sage font-bold whitespace-nowrap">You</span>
                                </div>
                                <div className="absolute bottom-10 w-full border-t border-dashed border-red-400/50"></div>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
                    {/* Objections List */}
                    <div className="space-y-4 overflow-y-auto pr-2">
                        <h3 className="text-lg font-serif text-slate-700 mb-2">Common Objections</h3>
                        {objections.map((obj, idx) => (
                            <GlassCard
                                key={idx}
                                interactive
                                onClick={() => handleObjectionClick(obj)}
                                className={`group cursor-pointer border-l-4 ${selectedObjection === obj ? 'border-l-bridge-slate bg-white' : 'border-l-transparent'}`}
                            >
                                <div className="flex justify-between items-center">
                                    <span className="font-medium text-slate-700 text-sm">"{obj}"</span>
                                    <ArrowRight size={16} className="text-slate-400 group-hover:text-bridge-slate opacity-0 group-hover:opacity-100 transition-all" />
                                </div>
                            </GlassCard>
                        ))}
                    </div>

                    {/* Rebuttal Screen (The Silent Partner) */}
                    <GlassCard className="bg-slate-900 text-white flex flex-col justify-center p-8 md:p-12 shadow-2xl">
                        {!selectedObjection ? (
                            <div className="text-center text-slate-500">
                                <MessageSquare size={48} className="mx-auto mb-4 opacity-20" />
                                <p className="text-sm">Select an objection to see the executive rebuttal.</p>
                            </div>
                        ) : (
                            <div className="animate-fade-in">
                                <div className="text-xs text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-700 pb-2">If they say:</div>
                                <div className="text-lg text-slate-300 italic mb-8">"{selectedObjection}"</div>

                                <div className="text-xs text-bridge-sage uppercase tracking-widest mb-6 font-bold">Then you say:</div>
                                {loadingRebuttal ? (
                                    <div className="animate-pulse h-20 bg-slate-800 rounded-lg"></div>
                                ) : (
                                    <div className="text-2xl md:text-3xl font-serif leading-relaxed text-white">
                                        "{rebuttal}"
                                    </div>
                                )}
                            </div>
                        )}
                    </GlassCard>
                </div>
            )}
        </div>
    );
};