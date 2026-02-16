import React, { useState, useEffect, useRef } from 'react';
import { GlassCard } from '../GlassCard';
import {
    Mic, Send, Activity, User, AlertCircle, Zap, Upload, FileText,
    ArrowLeft, Play, BookOpen, Download, MessageSquare, Bot,
    Keyboard, Volume2, CheckCircle, XCircle, Target, Sparkles
} from 'lucide-react';
import { CVData } from '../cv/CVTypes';
import {
    startInterviewSimulation,
    getNextInterviewQuestion,
    analyzeInterviewAnswer,
    generateInterviewCheatSheet,
    InterviewFeedback,
    CheatSheet
} from '../../services/geminiService';

interface InterviewSimulationLabProps {
    cvData: CVData;
}

type ViewState = 'menu' | 'setup' | 'simulation' | 'feedback' | 'cheatsheet-setup' | 'cheatsheet-result';
type InputMode = 'text' | 'voice';

interface SimulationHistory {
    role: 'ai' | 'user';
    content: string;
    feedback?: InterviewFeedback;
}

export const InterviewSimulationLab: React.FC<InterviewSimulationLabProps> = ({ cvData }) => {
    const [view, setView] = useState<ViewState>('menu');
    const [inputMode, setInputMode] = useState<InputMode>('text');

    // Setup state
    const [jobDescription, setJobDescription] = useState('');
    const [uploadedCV, setUploadedCV] = useState<string>(cvData.experience.map(e => `${e.role} at ${e.company}: ${e.bullets.join(' ')}`).join('\n'));

    // Simulation state
    const [currentQuestion, setCurrentQuestion] = useState('');
    const [userAnswer, setUserAnswer] = useState('');
    const [conversationHistory, setConversationHistory] = useState<SimulationHistory[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [questionCount, setQuestionCount] = useState(0);
    const [detectedHedges, setDetectedHedges] = useState<string[]>([]);
    const [overallScore, setOverallScore] = useState(0);

    // Cheat sheet state
    const [cheatSheet, setCheatSheet] = useState<CheatSheet | null>(null);
    const [isGeneratingCheatSheet, setIsGeneratingCheatSheet] = useState(false);

    const scrollRef = useRef<HTMLDivElement>(null);
    const MAX_QUESTIONS = 6;

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [conversationHistory]);

    // Real-time hedge detection
    useEffect(() => {
        const hedges = ["just", "maybe", "I think", "sort of", "kind of", "try to", "basically", "probably", "might"];
        const found = hedges.filter(h => userAnswer.toLowerCase().includes(h.toLowerCase()));
        setDetectedHedges(found);
    }, [userAnswer]);

    const handleStartSimulation = async () => {
        if (!jobDescription.trim()) return;

        setIsProcessing(true);
        setView('simulation');
        setConversationHistory([]);
        setQuestionCount(0);
        setOverallScore(0);

        const cvText = uploadedCV || `${cvData.personal_info.name}, ${cvData.targetRole}. ${cvData.summary}. Skills: ${cvData.skills.join(', ')}`;

        const firstQuestion = await startInterviewSimulation(jobDescription, cvText);
        setCurrentQuestion(firstQuestion);
        setConversationHistory([{ role: 'ai', content: firstQuestion }]);
        setQuestionCount(1);
        setIsProcessing(false);
    };

    const handleSubmitAnswer = async () => {
        if (!userAnswer.trim() || isProcessing) return;

        setIsProcessing(true);
        const answer = userAnswer;
        setUserAnswer('');

        // Add user answer to history
        const newHistory: SimulationHistory[] = [...conversationHistory, { role: 'user', content: answer }];
        setConversationHistory(newHistory);

        // Analyze the answer
        const feedback = await analyzeInterviewAnswer(answer, currentQuestion, jobDescription);

        // Update user's answer with feedback
        setConversationHistory(prev => {
            const updated = [...prev];
            updated[updated.length - 1].feedback = feedback;
            return updated;
        });

        // Update overall score (weighted average)
        setOverallScore(prev => {
            const newAvg = ((prev * (questionCount - 1)) + feedback.authorityScore) / questionCount;
            return Math.round(newAvg);
        });

        // Check if simulation should end
        if (questionCount >= MAX_QUESTIONS) {
            setView('feedback');
            setIsProcessing(false);
            return;
        }

        // Get next question
        const historyText = newHistory.map(h => `${h.role === 'ai' ? 'Interviewer' : 'Candidate'}: ${h.content}`).join('\n');
        const nextQ = await getNextInterviewQuestion(jobDescription, historyText, answer);

        setCurrentQuestion(nextQ);
        setConversationHistory(prev => [...prev, { role: 'ai', content: nextQ }]);
        setQuestionCount(prev => prev + 1);
        setIsProcessing(false);
    };

    const handleGenerateCheatSheet = async () => {
        if (!jobDescription.trim()) return;

        setIsGeneratingCheatSheet(true);
        const cvText = uploadedCV || `${cvData.personal_info.name}, ${cvData.targetRole}. ${cvData.summary}. Skills: ${cvData.skills.join(', ')}`;

        const sheet = await generateInterviewCheatSheet(jobDescription, cvText);
        setCheatSheet(sheet);
        setIsGeneratingCheatSheet(false);
        setView('cheatsheet-result');
    };

    const renderSetupForm = (forCheatSheet: boolean = false) => (
        <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
            <button
                onClick={() => setView('menu')}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-4"
            >
                <ArrowLeft size={18} /> Back to Menu
            </button>

            <GlassCard className="p-8">
                <h3 className="text-2xl font-serif text-bridge-slate mb-6">
                    {forCheatSheet ? 'Generate Interview Cheat Sheet' : 'Setup Your Interview'}
                </h3>

                {/* Job Description Input */}
                <div className="mb-6">
                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-3">
                        <FileText size={16} /> Job Description / Specification
                    </label>
                    <textarea
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        placeholder="Paste the full job description here. Include role requirements, responsibilities, and any company information..."
                        className="w-full h-48 bg-white/50 border border-slate-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-bridge-sage/50 resize-none text-sm"
                    />
                </div>

                {/* CV Input */}
                <div className="mb-6">
                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-3">
                        <Upload size={16} /> Your CV / Experience Summary
                    </label>
                    <textarea
                        value={uploadedCV}
                        onChange={(e) => setUploadedCV(e.target.value)}
                        placeholder="Paste your CV content or summarize your key experience, skills, and achievements..."
                        className="w-full h-32 bg-white/50 border border-slate-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-bridge-sage/50 resize-none text-sm"
                    />
                    {cvData.experience.length > 0 && !uploadedCV && (
                        <button
                            onClick={() => setUploadedCV(cvData.experience.map(e => `${e.role} at ${e.company}: ${e.bullets.join(' ')}`).join('\n'))}
                            className="mt-2 text-xs text-bridge-sage hover:text-bridge-slate flex items-center gap-1"
                        >
                            <Sparkles size={12} /> Use CV from CV Studio
                        </button>
                    )}
                </div>

                {!forCheatSheet && (
                    <div className="mb-6">
                        <label className="text-sm font-bold text-slate-700 mb-3 block">Input Mode</label>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setInputMode('text')}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${inputMode === 'text'
                                        ? 'bg-bridge-slate text-white border-bridge-slate'
                                        : 'bg-white/50 text-slate-600 border-slate-200 hover:bg-white'
                                    }`}
                            >
                                <Keyboard size={18} /> Text Input
                            </button>
                            <button
                                onClick={() => setInputMode('voice')}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${inputMode === 'voice'
                                        ? 'bg-bridge-slate text-white border-bridge-slate'
                                        : 'bg-white/50 text-slate-600 border-slate-200 hover:bg-white'
                                    }`}
                            >
                                <Volume2 size={18} /> Voice (Coming Soon)
                            </button>
                        </div>
                    </div>
                )}

                <button
                    onClick={forCheatSheet ? handleGenerateCheatSheet : handleStartSimulation}
                    disabled={!jobDescription.trim() || (forCheatSheet && isGeneratingCheatSheet)}
                    className="w-full bg-bridge-slate text-white py-4 rounded-xl font-bold shadow-lg hover:bg-slate-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {forCheatSheet ? (
                        isGeneratingCheatSheet ? (
                            <><Sparkles size={20} className="animate-spin" /> Generating Cheat Sheet...</>
                        ) : (
                            <><BookOpen size={20} /> Generate Cheat Sheet</>
                        )
                    ) : (
                        <><Play size={20} /> Start Interview Simulation</>
                    )}
                </button>
            </GlassCard>
        </div>
    );

    const renderSimulation = () => (
        <div className="h-full flex flex-col gap-4 animate-fade-in">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-serif text-bridge-slate">Interview in Progress</h2>
                    <p className="text-slate-500 text-sm">Question {questionCount} of {MAX_QUESTIONS}</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <div className="text-xs text-slate-400 uppercase tracking-widest">Authority Score</div>
                        <div className={`text-2xl font-bold ${overallScore >= 70 ? 'text-emerald-600' : overallScore >= 50 ? 'text-amber-600' : 'text-red-500'}`}>
                            {overallScore}%
                        </div>
                    </div>
                    <button
                        onClick={() => setView('feedback')}
                        className="px-4 py-2 bg-white/50 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-white"
                    >
                        End Interview
                    </button>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                    className="h-full bg-bridge-sage transition-all duration-500"
                    style={{ width: `${(questionCount / MAX_QUESTIONS) * 100}%` }}
                />
            </div>

            {/* Chat Area */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-[400px]">
                {/* Conversation Panel */}
                <div className="lg:col-span-2 flex flex-col">
                    <GlassCard className="flex-1 flex flex-col overflow-hidden">
                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                            {conversationHistory.map((msg, idx) => (
                                <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'ai' ? 'bg-bridge-slate text-white' : 'bg-slate-200 text-slate-600'
                                        }`}>
                                        {msg.role === 'ai' ? <Bot size={20} /> : <User size={20} />}
                                    </div>
                                    <div className={`max-w-[75%] ${msg.role === 'user' ? 'text-right' : ''}`}>
                                        <div className={`p-4 rounded-2xl text-sm leading-relaxed ${msg.role === 'ai'
                                                ? 'bg-slate-100 text-slate-800 rounded-tl-none'
                                                : 'bg-bridge-slate text-white rounded-tr-none'
                                            }`}>
                                            {msg.content}
                                        </div>
                                        {msg.feedback && (
                                            <div className="mt-2 p-3 bg-amber-50 border border-amber-100 rounded-xl text-left">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Zap size={12} className="text-amber-600" />
                                                    <span className="text-xs font-bold text-amber-700">Coach Tip</span>
                                                    <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded ${msg.feedback.authorityScore >= 70 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                                        }`}>
                                                        {msg.feedback.authorityScore}%
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-600">{msg.feedback.powerMove}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {isProcessing && (
                                <div className="flex gap-3">
                                    <div className="w-10 h-10 rounded-full bg-bridge-slate text-white flex items-center justify-center">
                                        <Bot size={20} />
                                    </div>
                                    <div className="bg-slate-100 p-4 rounded-2xl rounded-tl-none">
                                        <div className="flex gap-1">
                                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Hedge Warning */}
                        {detectedHedges.length > 0 && !isProcessing && (
                            <div className="mx-4 mb-2 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-2 rounded-xl text-sm flex items-center gap-2">
                                <AlertCircle size={16} />
                                <span>Hedge detected: <strong>"{detectedHedges[0]}"</strong> - Consider more assertive language</span>
                            </div>
                        )}

                        {/* Input Area */}
                        <div className="p-4 border-t border-slate-100 bg-white/50">
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    value={userAnswer}
                                    onChange={(e) => setUserAnswer(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSubmitAnswer()}
                                    placeholder="Type your response..."
                                    disabled={isProcessing}
                                    className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-bridge-sage/50"
                                />
                                <button
                                    onClick={handleSubmitAnswer}
                                    disabled={!userAnswer.trim() || isProcessing}
                                    className="p-3 bg-bridge-slate text-white rounded-xl hover:bg-slate-700 disabled:opacity-50"
                                >
                                    <Send size={20} />
                                </button>
                            </div>
                        </div>
                    </GlassCard>
                </div>

                {/* Side Panel - Tips */}
                <div className="hidden lg:flex flex-col gap-4">
                    <GlassCard className="flex-1">
                        <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                            <Target size={16} /> Interview Tips
                        </h4>
                        <ul className="space-y-3 text-sm text-slate-600">
                            <li className="flex gap-2">
                                <CheckCircle size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                                Use STAR method: Situation, Task, Action, Result
                            </li>
                            <li className="flex gap-2">
                                <CheckCircle size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                                Quantify achievements with metrics
                            </li>
                            <li className="flex gap-2">
                                <CheckCircle size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                                Avoid hedge words: "maybe", "sort of", "I think"
                            </li>
                            <li className="flex gap-2">
                                <XCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
                                Don't speak negatively about past employers
                            </li>
                        </ul>
                    </GlassCard>

                    <GlassCard className="bg-bridge-slate text-white">
                        <div className="text-xs text-slate-300 uppercase tracking-widest mb-2">Live Analysis</div>
                        <div className="text-3xl font-serif font-bold mb-1">{overallScore}%</div>
                        <div className="text-sm text-slate-300">Current Authority Score</div>
                        <div className="mt-4 h-2 bg-white/20 rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all duration-500 ${overallScore >= 70 ? 'bg-emerald-400' : 'bg-amber-400'}`}
                                style={{ width: `${overallScore}%` }}
                            />
                        </div>
                    </GlassCard>
                </div>
            </div>
        </div>
    );

    const renderFeedback = () => {
        const avgScore = overallScore;
        const userAnswers = conversationHistory.filter(h => h.role === 'user');

        return (
            <div className="max-w-4xl mx-auto animate-fade-in">
                <GlassCard className="p-8">
                    <div className="text-center mb-8">
                        <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-4 ${avgScore >= 70 ? 'bg-emerald-100 text-emerald-600' : avgScore >= 50 ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'
                            }`}>
                            <span className="text-3xl font-bold">{avgScore}%</span>
                        </div>
                        <h2 className="text-3xl font-serif text-bridge-slate mb-2">Interview Complete</h2>
                        <p className="text-slate-500">
                            {avgScore >= 70 ? "Excellent performance! You demonstrated strong authority." :
                                avgScore >= 50 ? "Good effort. Focus on the feedback to improve." :
                                    "Keep practicing. Review the tips below."}
                        </p>
                    </div>

                    <div className="space-y-4 mb-8">
                        <h3 className="font-bold text-slate-700">Question-by-Question Feedback</h3>
                        {userAnswers.map((answer, idx) => (
                            <div key={idx} className="bg-slate-50 p-4 rounded-xl">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-sm font-bold text-slate-600">Question {idx + 1}</span>
                                    {answer.feedback && (
                                        <span className={`text-xs font-bold px-2 py-1 rounded ${answer.feedback.authorityScore >= 70 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                            }`}>
                                            {answer.feedback.authorityScore}%
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-slate-600 mb-2 line-clamp-2">{answer.content}</p>
                                {answer.feedback && (
                                    <p className="text-xs text-bridge-sage font-medium">
                                        💡 {answer.feedback.powerMove}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={() => {
                                setView('setup');
                                setConversationHistory([]);
                                setQuestionCount(0);
                                setOverallScore(0);
                            }}
                            className="flex-1 bg-bridge-slate text-white py-3 rounded-xl font-bold hover:bg-slate-700"
                        >
                            Try Again
                        </button>
                        <button
                            onClick={() => setView('menu')}
                            className="flex-1 bg-white border border-slate-200 text-slate-600 py-3 rounded-xl font-bold hover:bg-slate-50"
                        >
                            Back to Menu
                        </button>
                    </div>
                </GlassCard>
            </div>
        );
    };

    const renderCheatSheetResult = () => (
        <div className="max-w-4xl mx-auto animate-fade-in">
            <button
                onClick={() => setView('menu')}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-4"
            >
                <ArrowLeft size={18} /> Back to Menu
            </button>

            {cheatSheet && (
                <GlassCard className="p-8">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-2xl font-serif text-bridge-slate mb-1">Interview Cheat Sheet</h2>
                            <p className="text-slate-500 text-sm">{cheatSheet.roleTitle}</p>
                        </div>
                        <button
                            onClick={() => window.print()}
                            className="flex items-center gap-2 px-4 py-2 bg-bridge-slate text-white rounded-xl text-sm font-bold hover:bg-slate-700"
                        >
                            <Download size={16} /> Print / Save PDF
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        {/* Company Intel */}
                        <div className="bg-emerald-50 p-5 rounded-xl border border-emerald-100">
                            <h4 className="font-bold text-emerald-800 mb-3 flex items-center gap-2">
                                <Target size={16} /> The Hidden Agenda
                            </h4>
                            <p className="text-sm text-slate-700 leading-relaxed">{cheatSheet.hiddenAgenda}</p>
                        </div>

                        {/* Key Requirements */}
                        <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
                            <h4 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
                                <CheckCircle size={16} /> Key Requirements
                            </h4>
                            <ul className="space-y-2">
                                {cheatSheet.keyRequirements.map((req, idx) => (
                                    <li key={idx} className="text-sm text-slate-700 flex gap-2">
                                        <span className="text-blue-500">•</span> {req}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Questions to Ask */}
                    <div className="bg-purple-50 p-5 rounded-xl border border-purple-100 mb-6">
                        <h4 className="font-bold text-purple-800 mb-3 flex items-center gap-2">
                            <MessageSquare size={16} /> High-Impact Questions to Ask
                        </h4>
                        <ul className="space-y-3">
                            {cheatSheet.questionsToAsk.map((q, idx) => (
                                <li key={idx} className="text-sm text-slate-700 bg-white/50 p-3 rounded-lg">
                                    "{q}"
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Your Talking Points */}
                    <div className="bg-amber-50 p-5 rounded-xl border border-amber-100 mb-6">
                        <h4 className="font-bold text-amber-800 mb-3 flex items-center gap-2">
                            <Zap size={16} /> Your Talking Points
                        </h4>
                        <ul className="space-y-2">
                            {cheatSheet.talkingPoints.map((point, idx) => (
                                <li key={idx} className="text-sm text-slate-700 flex gap-2">
                                    <span className="font-bold text-amber-600">{idx + 1}.</span> {point}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Industry Buzzwords */}
                    <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                        <h4 className="font-bold text-slate-700 mb-3">Industry Buzzwords to Use</h4>
                        <div className="flex flex-wrap gap-2">
                            {cheatSheet.buzzwords.map((word, idx) => (
                                <span key={idx} className="px-3 py-1 bg-white border border-slate-200 rounded-full text-sm text-slate-600">
                                    {word}
                                </span>
                            ))}
                        </div>
                    </div>
                </GlassCard>
            )}
        </div>
    );

    // Main Menu
    if (view === 'menu') {
        return (
            <div className="h-full flex flex-col gap-6 animate-fade-in pb-12">
                <header>
                    <h2 className="text-3xl font-serif text-bridge-slate">Interview Simulation Lab</h2>
                    <p className="text-slate-500">Practice high-stakes interviews with AI-powered feedback</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
                    {/* Interview Simulation Card */}
                    <GlassCard
                        interactive
                        onClick={() => setView('setup')}
                        className="group flex flex-col p-8 hover:border-bridge-sage/50"
                    >
                        <div className="w-16 h-16 bg-bridge-slate/5 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-bridge-slate group-hover:text-white transition-colors">
                            <Mic size={32} />
                        </div>
                        <h3 className="text-2xl font-serif text-bridge-slate mb-2">Interview Simulation</h3>
                        <p className="text-slate-500 mb-6 flex-1">
                            Upload your CV and job spec. Face a realistic interview with real-time feedback on your responses.
                        </p>
                        <div className="flex items-center gap-2 text-bridge-slate font-bold">
                            Start Simulation <Play size={16} />
                        </div>
                    </GlassCard>

                    {/* Cheat Sheet Card */}
                    <GlassCard
                        interactive
                        onClick={() => setView('cheatsheet-setup')}
                        className="group flex flex-col p-8 hover:border-bridge-lilac/50"
                    >
                        <div className="w-16 h-16 bg-bridge-lilac/20 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-bridge-lilac transition-colors text-slate-600">
                            <BookOpen size={32} />
                        </div>
                        <h3 className="text-2xl font-serif text-bridge-slate mb-2">Interview Cheat Sheet</h3>
                        <p className="text-slate-500 mb-6 flex-1">
                            Generate a one-page briefing document with key talking points, questions to ask, and industry insights.
                        </p>
                        <div className="flex items-center gap-2 text-bridge-slate font-bold">
                            Generate Briefing <BookOpen size={16} />
                        </div>
                    </GlassCard>
                </div>
            </div>
        );
    }

    if (view === 'setup') return renderSetupForm(false);
    if (view === 'cheatsheet-setup') return renderSetupForm(true);
    if (view === 'simulation') return renderSimulation();
    if (view === 'feedback') return renderFeedback();
    if (view === 'cheatsheet-result') return renderCheatSheetResult();

    return null;
};
