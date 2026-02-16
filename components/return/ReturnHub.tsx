import React, { useState } from 'react';
import { GlassCard } from '../GlassCard';
import {
    RefreshCcw, ShieldCheck, TrendingUp, Clock, Map,
    ArrowLeft, Calendar, Coffee, Sparkles, BrainCircuit,
    User, Building, CheckCircle, AlertCircle, Play, Target,
    MessageSquare, ThumbsUp, ThumbsDown, Zap
} from 'lucide-react';
// CVAudit removed — no longer part of the build
import { CVProfile } from '../cv/CVTypes';
import {
    evaluateFlexRequest,
    getFlexSimulationStart,
    getFlexSimulationResponse,
    generateReturnRoadmap,
    FlexEvaluation,
    ReturnRoadmap
} from '../../services/geminiService';

interface ReturnHubProps {
    cvData: CVProfile;
    setCvData: React.Dispatch<React.SetStateAction<CVProfile>>;
    onNavigate?: (path: string) => void;
}

type ViewState = 'menu' | 'cv' | 'flex-setup' | 'flex-evaluation' | 'flex-simulation' | 'roadmap-setup' | 'roadmap';

interface FlexContext {
    jobRole: string;
    company: string;
    tenure: string;
    currentArrangement: string;
    desiredArrangement: string;
    reason: string;
    managerStyle: string;
}

interface SimulationMessage {
    role: 'user' | 'hr' | 'manager';
    content: string;
}

interface RoadmapContext {
    role: string;
    industry: string;
    timeAway: string;
    priorities: string[];
    challenges: string;
}

export const ReturnHub: React.FC<ReturnHubProps> = ({ cvData, setCvData, onNavigate }) => {
    const [view, setView] = useState<ViewState>('menu');

    // Flex Negotiator State
    const [flexContext, setFlexContext] = useState<FlexContext>({
        jobRole: '',
        company: '',
        tenure: '',
        currentArrangement: '',
        desiredArrangement: '',
        reason: '',
        managerStyle: ''
    });
    const [flexEvaluation, setFlexEvaluation] = useState<FlexEvaluation | null>(null);
    const [isEvaluating, setIsEvaluating] = useState(false);
    const [simulationPersona, setSimulationPersona] = useState<'hr' | 'manager'>('hr');
    const [simulationMessages, setSimulationMessages] = useState<SimulationMessage[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isSimulating, setIsSimulating] = useState(false);

    // Roadmap State
    const [roadmapContext, setRoadmapContext] = useState<RoadmapContext>({
        role: '',
        industry: '',
        timeAway: '',
        priorities: [],
        challenges: ''
    });
    const [roadmap, setRoadmap] = useState<ReturnRoadmap | null>(null);
    const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState(false);

    // Flex Negotiator Handlers
    const handleEvaluateFlexRequest = async () => {
        setIsEvaluating(true);
        const evaluation = await evaluateFlexRequest(flexContext);
        setFlexEvaluation(evaluation);
        setIsEvaluating(false);
        setView('flex-evaluation');
    };

    const handleStartFlexSimulation = async (persona: 'hr' | 'manager') => {
        setSimulationPersona(persona);
        setSimulationMessages([]);
        setIsSimulating(true);
        setView('flex-simulation');

        const opening = await getFlexSimulationStart(persona, flexContext);
        setSimulationMessages([{ role: persona, content: opening }]);
        setIsSimulating(false);
    };

    const handleSimulationSend = async () => {
        if (!userInput.trim() || isSimulating) return;

        const message = userInput;
        setUserInput('');
        setSimulationMessages(prev => [...prev, { role: 'user', content: message }]);
        setIsSimulating(true);

        const history = simulationMessages.map(m => `${m.role === 'user' ? 'You' : m.role.toUpperCase()}: ${m.content}`).join('\n');
        const response = await getFlexSimulationResponse(simulationPersona, flexContext, history, message);

        setSimulationMessages(prev => [...prev, { role: simulationPersona, content: response }]);
        setIsSimulating(false);
    };

    // Roadmap Handlers
    const handleGenerateRoadmap = async () => {
        setIsGeneratingRoadmap(true);
        const result = await generateReturnRoadmap(roadmapContext);
        setRoadmap(result);
        setIsGeneratingRoadmap(false);
        setView('roadmap');
    };

    const renderMenuCard = (
        title: string,
        desc: string,
        icon: React.ElementType,
        onClick: () => void,
        colorClass: string
    ) => (
        <button
            onClick={onClick}
            className="group relative overflow-hidden rounded-3xl p-8 text-left transition-all hover:scale-[1.02] hover:shadow-xl bg-white/40 border border-white/60"
        >
            <div className={`absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity ${colorClass}`}>
                {React.createElement(icon, { size: 100 })}
            </div>
            <div className={`mb-6 inline-flex p-4 rounded-2xl ${colorClass} bg-opacity-20 text-slate-700`}>
                {React.createElement(icon, { size: 32 })}
            </div>
            <h3 className="text-2xl font-serif text-slate-800 mb-2">{title}</h3>
            <p className="text-slate-600 leading-relaxed max-w-xs">{desc}</p>
        </button>
    );

    // --- Sub-View Renders ---

    if (view === 'cv') {
        return (
            <div className="h-full flex flex-col animate-fade-in bg-bridge-lilac/5 -m-4 md:-m-8 lg:-m-10 p-4 md:p-8 lg:p-10">
                <div className="flex items-center gap-4 mb-4">
                    <button onClick={() => setView('menu')} className="p-2 hover:bg-white/50 rounded-full transition-colors">
                        <ArrowLeft size={24} className="text-slate-600" />
                    </button>
                    <h2 className="text-2xl font-serif text-bridge-slate">Re:Turn CV Audit</h2>
                </div>
                <div className="p-8 text-center text-slate-500">
                    <p className="text-lg font-serif">CV Audit has been replaced by the new CV Architect.</p>
                    <button onClick={() => onNavigate?.('/cv-builder')} className="mt-4 px-6 py-2 bg-bridge-slate text-white rounded-lg text-sm font-bold hover:bg-slate-700 transition-colors">
                        Open CV Architect
                    </button>
                </div>
            </div>
        );
    }

    // Flex Setup View
    if (view === 'flex-setup') {
        return (
            <div className="h-full flex flex-col animate-fade-in pb-12">
                <div className="flex items-center gap-4 mb-6">
                    <button onClick={() => setView('menu')} className="p-2 hover:bg-white/50 rounded-full transition-colors">
                        <ArrowLeft size={24} className="text-slate-600" />
                    </button>
                    <div>
                        <h2 className="text-2xl font-serif text-bridge-slate">Flexible Working Negotiator</h2>
                        <p className="text-slate-500 text-sm">Let's understand your situation before we practice</p>
                    </div>
                </div>

                <div className="max-w-2xl mx-auto w-full space-y-6">
                    <GlassCard className="p-6">
                        <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                            <User size={18} /> About Your Role
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1">Your Job Role</label>
                                <input
                                    type="text"
                                    value={flexContext.jobRole}
                                    onChange={(e) => setFlexContext({ ...flexContext, jobRole: e.target.value })}
                                    placeholder="e.g. Marketing Manager"
                                    className="w-full bg-white/50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-bridge-sage/50"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1">Company/Industry</label>
                                <input
                                    type="text"
                                    value={flexContext.company}
                                    onChange={(e) => setFlexContext({ ...flexContext, company: e.target.value })}
                                    placeholder="e.g. Tech startup"
                                    className="w-full bg-white/50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-bridge-sage/50"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1">Time in Role</label>
                                <input
                                    type="text"
                                    value={flexContext.tenure}
                                    onChange={(e) => setFlexContext({ ...flexContext, tenure: e.target.value })}
                                    placeholder="e.g. 2 years"
                                    className="w-full bg-white/50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-bridge-sage/50"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1">Current Arrangement</label>
                                <select
                                    value={flexContext.currentArrangement}
                                    onChange={(e) => setFlexContext({ ...flexContext, currentArrangement: e.target.value })}
                                    className="w-full bg-white/50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
                                >
                                    <option value="">Select...</option>
                                    <option value="5 days office">5 days in office</option>
                                    <option value="Hybrid 3-2">Hybrid (3 office, 2 home)</option>
                                    <option value="Hybrid 2-3">Hybrid (2 office, 3 home)</option>
                                    <option value="Fully remote">Fully remote</option>
                                </select>
                            </div>
                        </div>
                    </GlassCard>

                    <GlassCard className="p-6">
                        <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                            <Clock size={18} /> What You're Requesting
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-2">Desired Flexible Arrangement</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {['4-day week', 'Compressed hours', 'More remote days', 'Flexible start/finish', 'Job share', 'Term-time only'].map(option => (
                                        <button
                                            key={option}
                                            onClick={() => setFlexContext({ ...flexContext, desiredArrangement: option })}
                                            className={`p-3 rounded-lg text-sm font-medium border transition-all ${flexContext.desiredArrangement === option
                                                ? 'bg-bridge-sage text-white border-bridge-sage'
                                                : 'bg-white/50 text-slate-600 border-slate-200 hover:border-bridge-sage'
                                                }`}
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1">Reason for Request</label>
                                <textarea
                                    value={flexContext.reason}
                                    onChange={(e) => setFlexContext({ ...flexContext, reason: e.target.value })}
                                    placeholder="e.g. Childcare responsibilities, caring duties, health reasons..."
                                    rows={3}
                                    className="w-full bg-white/50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-bridge-sage/50 resize-none"
                                />
                            </div>
                        </div>
                    </GlassCard>

                    <GlassCard className="p-6">
                        <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                            <Building size={18} /> Manager Context
                        </h3>
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-2">How would you describe your manager's style?</label>
                            <div className="grid grid-cols-3 gap-2">
                                {['Supportive', 'By-the-book', 'Results-focused', 'Skeptical', 'Flexible', 'Traditional'].map(style => (
                                    <button
                                        key={style}
                                        onClick={() => setFlexContext({ ...flexContext, managerStyle: style })}
                                        className={`p-3 rounded-lg text-sm font-medium border transition-all ${flexContext.managerStyle === style
                                            ? 'bg-bridge-slate text-white border-bridge-slate'
                                            : 'bg-white/50 text-slate-600 border-slate-200 hover:border-bridge-slate'
                                            }`}
                                    >
                                        {style}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </GlassCard>

                    <button
                        onClick={handleEvaluateFlexRequest}
                        disabled={!flexContext.jobRole || !flexContext.desiredArrangement || isEvaluating}
                        className="w-full bg-bridge-slate text-white py-4 rounded-xl font-bold shadow-lg hover:bg-slate-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isEvaluating ? (
                            <><Sparkles size={20} className="animate-spin" /> Evaluating Your Request...</>
                        ) : (
                            <><Target size={20} /> Evaluate My Request</>
                        )}
                    </button>
                </div>
            </div>
        );
    }

    // Flex Evaluation View
    if (view === 'flex-evaluation' && flexEvaluation) {
        return (
            <div className="h-full flex flex-col animate-fade-in pb-12">
                <div className="flex items-center gap-4 mb-6">
                    <button onClick={() => setView('flex-setup')} className="p-2 hover:bg-white/50 rounded-full transition-colors">
                        <ArrowLeft size={24} className="text-slate-600" />
                    </button>
                    <div>
                        <h2 className="text-2xl font-serif text-bridge-slate">Request Evaluation</h2>
                        <p className="text-slate-500 text-sm">AI assessment of your flexible working request</p>
                    </div>
                </div>

                <div className="max-w-2xl mx-auto w-full space-y-6">
                    {/* Likelihood Score */}
                    <GlassCard className="p-6 text-center">
                        <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-4 ${flexEvaluation.likelihood >= 70 ? 'bg-emerald-100 text-emerald-600' :
                            flexEvaluation.likelihood >= 40 ? 'bg-amber-100 text-amber-600' :
                                'bg-red-100 text-red-600'
                            }`}>
                            <span className="text-3xl font-bold">{flexEvaluation.likelihood}%</span>
                        </div>
                        <h3 className="text-xl font-serif text-bridge-slate mb-2">Approval Likelihood</h3>
                        <p className="text-slate-500">
                            {flexEvaluation.likelihood >= 70 ? 'Strong chance of approval with the right approach' :
                                flexEvaluation.likelihood >= 40 ? 'Moderate chance - prepare strong justification' :
                                    'Challenging - consider alternative approaches'}
                        </p>
                    </GlassCard>

                    {/* Strengths */}
                    <GlassCard className="p-6">
                        <h4 className="font-bold text-emerald-700 mb-3 flex items-center gap-2">
                            <ThumbsUp size={18} /> Your Strengths
                        </h4>
                        <ul className="space-y-2">
                            {flexEvaluation.strengths.map((s, i) => (
                                <li key={i} className="flex gap-2 text-sm text-slate-700">
                                    <CheckCircle size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                                    {s}
                                </li>
                            ))}
                        </ul>
                    </GlassCard>

                    {/* Challenges */}
                    <GlassCard className="p-6">
                        <h4 className="font-bold text-amber-700 mb-3 flex items-center gap-2">
                            <AlertCircle size={18} /> Potential Challenges
                        </h4>
                        <ul className="space-y-2">
                            {flexEvaluation.challenges.map((c, i) => (
                                <li key={i} className="flex gap-2 text-sm text-slate-700">
                                    <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                                    {c}
                                </li>
                            ))}
                        </ul>
                    </GlassCard>

                    {/* Recommendations */}
                    <GlassCard className="p-6 bg-bridge-sage/10 border-bridge-sage/20">
                        <h4 className="font-bold text-bridge-slate mb-3 flex items-center gap-2">
                            <Zap size={18} /> Recommended Approach
                        </h4>
                        <p className="text-sm text-slate-700 leading-relaxed">{flexEvaluation.recommendation}</p>
                    </GlassCard>

                    {/* Simulation Options */}
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => handleStartFlexSimulation('hr')}
                            className="p-6 bg-white/50 border border-slate-200 rounded-xl hover:bg-white hover:border-bridge-sage transition-all text-left"
                        >
                            <User size={24} className="text-slate-400 mb-3" />
                            <h4 className="font-bold text-slate-700">Practice with HR</h4>
                            <p className="text-xs text-slate-500 mt-1">Formal policy-focused conversation</p>
                        </button>
                        <button
                            onClick={() => handleStartFlexSimulation('manager')}
                            className="p-6 bg-white/50 border border-slate-200 rounded-xl hover:bg-white hover:border-bridge-sage transition-all text-left"
                        >
                            <Building size={24} className="text-slate-400 mb-3" />
                            <h4 className="font-bold text-slate-700">Practice with Manager</h4>
                            <p className="text-xs text-slate-500 mt-1">{flexContext.managerStyle} style simulation</p>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Flex Simulation View
    if (view === 'flex-simulation') {
        return (
            <div className="h-full flex flex-col animate-fade-in">
                <div className="flex items-center gap-4 mb-4">
                    <button onClick={() => setView('flex-evaluation')} className="p-2 hover:bg-white/50 rounded-full transition-colors">
                        <ArrowLeft size={24} className="text-slate-600" />
                    </button>
                    <div>
                        <h2 className="text-xl font-serif text-bridge-slate">
                            {simulationPersona === 'hr' ? 'HR Department Simulation' : 'Line Manager Simulation'}
                        </h2>
                        <p className="text-slate-500 text-sm">Practice your {flexContext.desiredArrangement} request</p>
                    </div>
                </div>

                <GlassCard className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {simulationMessages.map((msg, idx) => (
                            <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-slate-200 text-slate-600' : 'bg-bridge-slate text-white'
                                    }`}>
                                    {msg.role === 'user' ? <User size={18} /> : msg.role === 'hr' ? <User size={18} /> : <Building size={18} />}
                                </div>
                                <div className={`max-w-[75%] p-4 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                                    ? 'bg-bridge-slate text-white rounded-tr-none'
                                    : 'bg-slate-100 text-slate-800 rounded-tl-none'
                                    }`}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {isSimulating && (
                            <div className="flex gap-3">
                                <div className="w-10 h-10 rounded-full bg-bridge-slate text-white flex items-center justify-center">
                                    {simulationPersona === 'hr' ? <User size={18} /> : <Building size={18} />}
                                </div>
                                <div className="bg-slate-100 p-4 rounded-2xl rounded-tl-none flex gap-1">
                                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-4 border-t border-slate-100">
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSimulationSend()}
                                placeholder="Type your response..."
                                disabled={isSimulating}
                                className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-bridge-sage/50"
                            />
                            <button
                                onClick={handleSimulationSend}
                                disabled={!userInput.trim() || isSimulating}
                                className="px-4 bg-bridge-slate text-white rounded-xl hover:bg-slate-700 disabled:opacity-50"
                            >
                                <MessageSquare size={20} />
                            </button>
                        </div>
                    </div>
                </GlassCard>
            </div>
        );
    }

    // Roadmap Setup View
    if (view === 'roadmap-setup') {
        return (
            <div className="h-full flex flex-col animate-fade-in pb-12">
                <div className="flex items-center gap-4 mb-6">
                    <button onClick={() => setView('menu')} className="p-2 hover:bg-white/50 rounded-full transition-colors">
                        <ArrowLeft size={24} className="text-slate-600" />
                    </button>
                    <div>
                        <h2 className="text-2xl font-serif text-bridge-slate">90-Day Return Roadmap</h2>
                        <p className="text-slate-500 text-sm">Let's tailor your first 90 days back</p>
                    </div>
                </div>

                <div className="max-w-2xl mx-auto w-full space-y-6">
                    <GlassCard className="p-6">
                        <h3 className="font-bold text-slate-700 mb-4">Tell us about your return</h3>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1">Role Returning To</label>
                                    <input
                                        type="text"
                                        value={roadmapContext.role}
                                        onChange={(e) => setRoadmapContext({ ...roadmapContext, role: e.target.value })}
                                        placeholder="e.g. Project Manager"
                                        className="w-full bg-white/50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-bridge-sage/50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1">Industry</label>
                                    <input
                                        type="text"
                                        value={roadmapContext.industry}
                                        onChange={(e) => setRoadmapContext({ ...roadmapContext, industry: e.target.value })}
                                        placeholder="e.g. Technology"
                                        className="w-full bg-white/50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-bridge-sage/50"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1">Time Away from Work</label>
                                <select
                                    value={roadmapContext.timeAway}
                                    onChange={(e) => setRoadmapContext({ ...roadmapContext, timeAway: e.target.value })}
                                    className="w-full bg-white/50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
                                >
                                    <option value="">Select...</option>
                                    <option value="6 months">6 months</option>
                                    <option value="1 year">1 year</option>
                                    <option value="2 years">2 years</option>
                                    <option value="3+ years">3+ years</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-2">Your Top Priorities</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {['Rebuild confidence', 'Update skills', 'Prove value quickly', 'Work-life balance', 'Build relationships', 'Career progression'].map(priority => (
                                        <button
                                            key={priority}
                                            onClick={() => {
                                                const current = roadmapContext.priorities;
                                                if (current.includes(priority)) {
                                                    setRoadmapContext({ ...roadmapContext, priorities: current.filter(p => p !== priority) });
                                                } else if (current.length < 3) {
                                                    setRoadmapContext({ ...roadmapContext, priorities: [...current, priority] });
                                                }
                                            }}
                                            className={`p-2 rounded-lg text-sm font-medium border transition-all ${roadmapContext.priorities.includes(priority)
                                                ? 'bg-bridge-sage text-white border-bridge-sage'
                                                : 'bg-white/50 text-slate-600 border-slate-200 hover:border-bridge-sage'
                                                }`}
                                        >
                                            {priority}
                                        </button>
                                    ))}
                                </div>
                                <p className="text-xs text-slate-400 mt-1">Select up to 3</p>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1">Biggest Concern</label>
                                <textarea
                                    value={roadmapContext.challenges}
                                    onChange={(e) => setRoadmapContext({ ...roadmapContext, challenges: e.target.value })}
                                    placeholder="What are you most worried about?"
                                    rows={3}
                                    className="w-full bg-white/50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-bridge-sage/50 resize-none"
                                />
                            </div>
                        </div>
                    </GlassCard>

                    <button
                        onClick={handleGenerateRoadmap}
                        disabled={!roadmapContext.role || !roadmapContext.timeAway || isGeneratingRoadmap}
                        className="w-full bg-bridge-slate text-white py-4 rounded-xl font-bold shadow-lg hover:bg-slate-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isGeneratingRoadmap ? (
                            <><Sparkles size={20} className="animate-spin" /> Creating Your Roadmap...</>
                        ) : (
                            <><Map size={20} /> Generate My Roadmap</>
                        )}
                    </button>
                </div>
            </div>
        );
    }

    // Roadmap View
    if (view === 'roadmap' && roadmap) {
        return (
            <div className="h-full flex flex-col animate-fade-in pb-12 overflow-y-auto">
                <div className="flex items-center gap-4 mb-6">
                    <button onClick={() => setView('roadmap-setup')} className="p-2 hover:bg-white/50 rounded-full transition-colors">
                        <ArrowLeft size={24} className="text-slate-600" />
                    </button>
                    <div>
                        <h2 className="text-2xl font-serif text-bridge-slate">Your 90-Day Roadmap</h2>
                        <p className="text-slate-500 text-sm">Personalized plan for {roadmapContext.role}</p>
                    </div>
                </div>

                <div className="space-y-6">
                    {roadmap.phases.map((phase, idx) => (
                        <GlassCard key={idx} className={`p-6 border-l-4 ${idx === 0 ? 'border-l-emerald-500' :
                            idx === 1 ? 'border-l-blue-500' :
                                'border-l-purple-500'
                            }`}>
                            <div className="flex items-center gap-3 mb-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${idx === 0 ? 'bg-emerald-500' :
                                    idx === 1 ? 'bg-blue-500' :
                                        'bg-purple-500'
                                    }`}>
                                    {idx + 1}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800">{phase.title}</h3>
                                    <p className="text-xs text-slate-500">{phase.weeks}</p>
                                </div>
                            </div>
                            <p className="text-sm text-slate-600 mb-4">{phase.focus}</p>
                            <div className="space-y-2">
                                {phase.actions.map((action, aIdx) => (
                                    <div key={aIdx} className="flex gap-2 text-sm text-slate-700 bg-white/50 p-3 rounded-lg">
                                        <CheckCircle size={16} className="text-bridge-sage shrink-0 mt-0.5" />
                                        {action}
                                    </div>
                                ))}
                            </div>
                        </GlassCard>
                    ))}

                    {roadmap.keyTip && (
                        <GlassCard className="p-6 bg-bridge-sage/10 border-bridge-sage/20">
                            <h4 className="font-bold text-bridge-slate mb-2 flex items-center gap-2">
                                <Zap size={18} /> Golden Rule
                            </h4>
                            <p className="text-sm text-slate-700">{roadmap.keyTip}</p>
                        </GlassCard>
                    )}
                </div>
            </div>
        );
    }

    // --- Main Menu View ---
    return (
        <div className="h-full flex flex-col gap-8 animate-fade-in pb-12">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end">
                <div>
                    <h2 className="text-4xl font-serif text-bridge-slate mb-2">Re:Turn Hub</h2>
                    <p className="text-slate-500 text-lg">Your sanctuary for the return journey.</p>
                </div>
                <div className="bg-white/50 px-4 py-2 rounded-full border border-slate-200 flex items-center gap-2 text-sm text-slate-600 font-medium">
                    <Coffee size={16} className="text-bridge-sage" />
                    <span>You've got this.</span>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
                {renderMenuCard(
                    "CV Audit",
                    "Upload your current CV and get AI-powered feedback to refresh your narrative.",
                    ShieldCheck,
                    () => setView('cv'),
                    "bg-purple-100 text-purple-600"
                )}

                {renderMenuCard(
                    "Flex Negotiator",
                    "Practice your flexible working request with HR and your manager simulations.",
                    Clock,
                    () => setView('flex-setup'),
                    "bg-orange-100 text-orange-600"
                )}

                {renderMenuCard(
                    "90-Day Roadmap",
                    "Get a tailored tactical plan for your first 90 days back at work.",
                    Map,
                    () => setView('roadmap-setup'),
                    "bg-emerald-100 text-emerald-600"
                )}
            </div>
        </div>
    );
};
