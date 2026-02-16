import React, { useState } from 'react';
import { GlassCard } from '../GlassCard';
import { 
    Zap, Download, TrendingUp, MessageSquare, 
    Shield, FileText, DollarSign, Users, 
    Play, ChevronRight, Lock, Layout,
    Briefcase, Radio, Keyboard, Search
} from 'lucide-react';

// --- Mock Data ---

const PULSE_DATA = {
    trends: [
        { title: "Agentic Workflows", desc: "Moving from chat-bots to autonomous agents." },
        { title: "Sustainable AI", desc: "ESG focus on compute power consumption." },
        { title: "Hybrid 3.0", desc: "Asynchronous-first collaboration models." }
    ],
    buzzwords: [
        { term: "Human-in-the-loop", context: "Quality assurance for AI outputs." },
        { term: "Token Economics", context: "Cost management for LLM integration." },
        { term: "Groked", context: "Deeply understood (making a comeback)." }
    ],
    tools: [
        { name: "Jasper Enterprise", cat: "Marketing" },
        { name: "Linear", cat: "Project Mgmt" },
        { name: "Perplexity", cat: "Research" }
    ]
};

const CHEAT_SHEETS = [
    {
        id: '1',
        title: "The Meeting Lead",
        tag: "Leadership",
        desc: "5 phrases to reclaim the floor when interrupted.",
        icon: Users
    },
    {
        id: '2',
        title: "Tech-Stack Quick-Start",
        tag: "Productivity",
        desc: "Keyboard shortcuts for Slack, Notion, and Linear.",
        icon: Keyboard
    },
    {
        id: '3',
        title: "JD Decoder",
        tag: "Strategy",
        desc: "Analyze job descriptions to find pain points.",
        icon: Search
    }
];

// --- Sub-Components ---

const PulseCard = ({ title, children, icon: Icon }: { title: string, children: React.ReactNode, icon: any }) => (
    <GlassCard className="h-full flex flex-col">
        <div className="flex items-center gap-2 mb-4 text-bridge-slate">
            <Icon size={18} />
            <h4 className="font-serif font-bold text-sm uppercase tracking-wide">{title}</h4>
        </div>
        <div className="flex-1 space-y-3">
            {children}
        </div>
    </GlassCard>
);

const WarRoomCard = ({ title, desc, icon: Icon, action, isPrimary = false }: { title: string, desc: string, icon: any, action: string, isPrimary?: boolean }) => (
    <GlassCard className={`relative overflow-hidden group cursor-pointer transition-all hover:scale-[1.01] ${isPrimary ? 'bg-bridge-slate text-white' : ''}`}>
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl ${isPrimary ? 'bg-white/10 text-white' : 'bg-bridge-sage/20 text-bridge-slate'}`}>
                <Icon size={24} />
            </div>
            {isPrimary && <div className="px-2 py-1 bg-rose-500 text-white text-[10px] font-bold uppercase rounded tracking-widest animate-pulse">High Impact</div>}
        </div>
        <h3 className={`text-xl font-serif font-bold mb-2 ${isPrimary ? 'text-white' : 'text-slate-800'}`}>{title}</h3>
        <p className={`text-sm mb-6 ${isPrimary ? 'text-slate-300' : 'text-slate-500'}`}>{desc}</p>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
            {action} <ChevronRight size={14} />
        </div>
    </GlassCard>
);

// --- Main Component ---

export const CareerVault: React.FC = () => {
    return (
        <div className="h-full flex flex-col gap-8 animate-fade-in pb-12">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end">
                <div>
                    <h2 className="text-3xl font-serif text-bridge-slate">The Career Vault</h2>
                    <p className="text-slate-500 text-lg">Performance Support. Not just learning.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-slate-200 text-xs font-bold text-slate-500 shadow-sm hover:text-bridge-slate transition-colors">
                        <Download size={14} /> Download All Briefs
                    </button>
                </div>
            </header>

            {/* 1. INDUSTRY PULSE (Anti-FOMO) */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Radio size={20} className="text-rose-500 animate-pulse" />
                        <h3 className="text-xl font-serif text-bridge-slate">Industry Pulse</h3>
                        <span className="text-xs text-slate-400 border border-slate-200 rounded px-2 py-0.5 ml-2">Bi-Weekly Intel</span>
                    </div>
                    <button className="text-xs font-bold text-bridge-slate flex items-center gap-1 hover:gap-2 transition-all">
                        <Play size={12} fill="currentColor" /> Play Audio-Snap (3m)
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <PulseCard title="3 Major Trends" icon={TrendingUp}>
                        {PULSE_DATA.trends.map((t, i) => (
                            <div key={i} className="pb-2 border-b border-slate-100 last:border-0">
                                <div className="font-bold text-sm text-slate-800">{t.title}</div>
                                <div className="text-xs text-slate-500">{t.desc}</div>
                            </div>
                        ))}
                    </PulseCard>
                    <PulseCard title="3 New Buzzwords" icon={MessageSquare}>
                        {PULSE_DATA.buzzwords.map((t, i) => (
                            <div key={i} className="flex justify-between items-center pb-2 border-b border-slate-100 last:border-0">
                                <span className="font-bold text-sm text-bridge-slate bg-bridge-slate/5 px-2 py-1 rounded">{t.term}</span>
                                <span className="text-xs text-slate-500 text-right">{t.context}</span>
                            </div>
                        ))}
                    </PulseCard>
                    <PulseCard title="3 Tools to Watch" icon={Zap}>
                        {PULSE_DATA.tools.map((t, i) => (
                            <div key={i} className="flex items-center gap-3 pb-2 border-b border-slate-100 last:border-0">
                                <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-500">
                                    {t.name[0]}
                                </div>
                                <div>
                                    <div className="font-bold text-sm text-slate-800">{t.name}</div>
                                    <div className="text-[10px] uppercase font-bold text-slate-400">{t.cat}</div>
                                </div>
                            </div>
                        ))}
                    </PulseCard>
                </div>
            </section>

            {/* 2. NEGOTIATION WAR ROOM (ROI) */}
            <section>
                <div className="flex items-center gap-2 mb-4">
                    <Shield size={20} className="text-bridge-slate" />
                    <h3 className="text-xl font-serif text-bridge-slate">Negotiation War Room</h3>
                    <span className="text-xs text-slate-400 border border-slate-200 rounded px-2 py-0.5 ml-2">Strategy Engine</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <WarRoomCard 
                        title="Scenario Simulator" 
                        desc="Roleplay with an AI CFO or HR Director to practice your pitch."
                        icon={Users}
                        action="Enter Simulation"
                        isPrimary
                    />
                    <WarRoomCard 
                        title="Benefit Modeler" 
                        desc="Calculate the real value of 4-day weeks, WFH, and equity."
                        icon={DollarSign}
                        action="Calculate ROI"
                    />
                </div>
            </section>

            {/* 3. TACTICAL CHEAT SHEETS (Performance Support) */}
            <section>
                <div className="flex items-center gap-2 mb-4">
                    <FileText size={20} className="text-bridge-slate" />
                    <h3 className="text-xl font-serif text-bridge-slate">Tactical Cheat Sheets</h3>
                    <span className="text-xs text-slate-400 border border-slate-200 rounded px-2 py-0.5 ml-2">One-Pagers</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {CHEAT_SHEETS.map((sheet) => {
                        const Icon = sheet.icon;
                        return (
                            <GlassCard key={sheet.id} interactive className="group">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="p-2 bg-slate-100 rounded-lg text-slate-600 group-hover:bg-bridge-sage group-hover:text-white transition-colors">
                                        <Icon size={20} />
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 border border-slate-200 px-2 py-1 rounded">{sheet.tag}</span>
                                </div>
                                <h4 className="font-bold text-slate-800 mb-1">{sheet.title}</h4>
                                <p className="text-xs text-slate-500 mb-4">{sheet.desc}</p>
                                <button className="w-full py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-300 flex items-center justify-center gap-2 transition-all">
                                    <Download size={14} /> PDF
                                </button>
                            </GlassCard>
                        );
                    })}
                </div>
            </section>
        </div>
    );
};