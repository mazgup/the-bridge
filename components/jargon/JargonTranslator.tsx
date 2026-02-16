import React, { useState } from 'react';
import { GlassCard } from '../GlassCard';
import { Search, Sparkles, Briefcase, Users, Languages, X } from 'lucide-react';

interface Term {
    id: string;
    term: string;
    definition: string;
    boardroomVibe: string;
    teamVibe: string;
}

const MOCK_TERMS: Term[] = [
    {
        id: '1',
        term: 'Agile',
        definition: 'An iterative approach to project management and software development.',
        boardroomVibe: '"We need to be faster and cheaper." Usually means cutting process overhead to ship revenue-generating features.',
        teamVibe: '"Daily standups and Jira tickets." Often means chaotic pivots and changing requirements mid-sprint.'
    },
    {
        id: '2',
        term: 'Blue Sky Thinking',
        definition: 'Creative brainstorming without limits or constraints.',
        boardroomVibe: '"Show me the 5-year vision that gets us acquired." High-level strategy, ignore budget for now.',
        teamVibe: '"The boss is dreaming again." Usually ignored until a concrete project plan exists.'
    },
    {
        id: '3',
        term: 'Circle Back',
        definition: 'To discuss an issue at a later time.',
        boardroomVibe: '"This is not a priority right now, stop talking about it."',
        teamVibe: '"I don\'t have the answer yet, let me check and tell you later."'
    }
];

export const JargonTranslator: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTerm, setSelectedTerm] = useState<Term | null>(null);

    const filtered = MOCK_TERMS.filter(t => t.term.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="h-full flex flex-col gap-6 animate-fade-in pb-12">
            <header className="mb-4">
                <h2 className="text-3xl font-serif text-bridge-slate mb-2">Jargon & Vibe Translator</h2>
                <p className="text-slate-500 text-lg">Decode the "Relevancy Gap". Understand the subtext.</p>
            </header>

            <div className="max-w-xl w-full mx-auto relative z-10">
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-bridge-sage via-bridge-lilac to-bridge-sage rounded-2xl opacity-30 group-hover:opacity-60 transition-opacity blur duration-500"></div>
                    <GlassCard className="p-2 flex items-center gap-3 relative !bg-white">
                        <Search size={20} className="text-slate-400 ml-3" />
                        <input 
                            type="text" 
                            placeholder="Type a corporate buzzword (e.g. 'Agile')..." 
                            className="flex-1 text-lg py-2 focus:outline-none text-slate-700 font-medium bg-transparent"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <button onClick={() => setSearchTerm('')} className="p-1 hover:bg-slate-100 rounded-full text-slate-400">
                                <X size={16} />
                            </button>
                        )}
                    </GlassCard>
                </div>
                
                {searchTerm && !selectedTerm && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden animate-slide-down">
                        {filtered.length > 0 ? filtered.map(term => (
                            <button 
                                key={term.id}
                                onClick={() => { setSelectedTerm(term); setSearchTerm(''); }}
                                className="w-full text-left px-6 py-4 hover:bg-slate-50 border-b border-slate-50 last:border-0 flex justify-between items-center group"
                            >
                                <span className="font-bold text-slate-700">{term.term}</span>
                                <span className="text-xs text-slate-400 group-hover:text-bridge-slate">Translate</span>
                            </button>
                        )) : (
                            <div className="p-6 text-center text-slate-500 text-sm">No terms found. Try "Agile" or "Blue Sky".</div>
                        )}
                    </div>
                )}
            </div>

            {selectedTerm ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 animate-slide-up">
                    <div className="col-span-1 md:col-span-2 text-center">
                        <h1 className="text-5xl font-serif text-bridge-slate mb-4">{selectedTerm.term}</h1>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto italic border-l-4 border-bridge-sage pl-4">
                            "{selectedTerm.definition}"
                        </p>
                    </div>

                    <GlassCard className="bg-slate-800 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Briefcase size={80} />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="p-2 bg-white/10 rounded-lg"><Briefcase size={20} /></span>
                                <h3 className="font-bold uppercase tracking-widest text-sm text-slate-300">Boardroom Vibe</h3>
                            </div>
                            <p className="text-xl leading-relaxed font-serif">
                                {selectedTerm.boardroomVibe}
                            </p>
                        </div>
                    </GlassCard>

                    <GlassCard className="bg-white relative overflow-hidden border-bridge-sage/50">
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <Users size={80} />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="p-2 bg-bridge-sage/20 text-bridge-slate rounded-lg"><Users size={20} /></span>
                                <h3 className="font-bold uppercase tracking-widest text-sm text-slate-500">Team Vibe</h3>
                            </div>
                            <p className="text-xl leading-relaxed font-serif text-slate-700">
                                {selectedTerm.teamVibe}
                            </p>
                        </div>
                    </GlassCard>

                    <div className="col-span-1 md:col-span-2 flex justify-center mt-4">
                        <button 
                            onClick={() => setSelectedTerm(null)}
                            className="text-slate-500 hover:text-bridge-slate font-bold text-sm"
                        >
                            Translate Another Term
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
                    <Languages size={64} className="mb-4 opacity-50" />
                    <p>Search a term to bridge the gap.</p>
                </div>
            )}
        </div>
    );
};