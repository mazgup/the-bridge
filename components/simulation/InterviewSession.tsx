import React, { useState, useEffect, useRef } from 'react';
import { GlassCard } from '../GlassCard';
import { Mic, Send, Activity, User, AlertCircle, Zap } from 'lucide-react';
import {
    analyzeInterviewAnswer,
    startInterviewSimulation,
    getNextInterviewQuestion,
    getFlexSimulationStart,
    getFlexSimulationResponse,
    InterviewFeedback
} from '../../services/geminiService';

interface InterviewSessionProps {
    type: 'interview' | 'salary' | 'flex';
    context: string;
    persona: string;
}

export const InterviewSession: React.FC<InterviewSessionProps> = ({ type, context, persona }) => {
    const [userAnswer, setUserAnswer] = useState('');
    const [aiQuestion, setAiQuestion] = useState('Initializing simulation...');
    const [conversationHistory, setConversationHistory] = useState('');
    const [feedback, setFeedback] = useState<InterviewFeedback | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [detectedHedges, setDetectedHedges] = useState<string[]>([]);
    const [isInitializing, setIsInitializing] = useState(true);

    // Initial Setup
    useEffect(() => {
        let mounted = true;
        const init = async () => {
            setIsInitializing(true);
            let startMsg = '';

            if (type === 'flex') {
                startMsg = await getFlexSimulationStart(persona as 'hr' | 'manager', context);
            } else {
                // Default to interview simulation
                startMsg = await startInterviewSimulation(context, "Candidate CV Placeholder");
            }

            if (mounted) {
                setAiQuestion(startMsg);
                setConversationHistory(`AI: ${startMsg}\n`);
                setIsInitializing(false);
            }
        };
        init();
        return () => { mounted = false; };
    }, [type, context, persona]);

    // Simulated real-time hedge detection
    useEffect(() => {
        const hedges = ["just", "maybe", "I think", "sort of", "kind of", "try to", "basically"];
        const found = hedges.filter(h => userAnswer.toLowerCase().includes(h));
        setDetectedHedges(found);
    }, [userAnswer]);

    const handleSubmitAnswer = async () => {
        if (!userAnswer.trim()) return;

        setIsProcessing(true);
        setFeedback(null); // Reset feedback for new turn

        // 1. Analyze the answer (Feedback)
        const analysis = await analyzeInterviewAnswer(userAnswer, aiQuestion, context);
        setFeedback(analysis);

        // 2. Get next AI turn
        const updatedHistory = `${conversationHistory}User: ${userAnswer}\n`;
        let nextQ = '';

        if (type === 'flex') {
            nextQ = await getFlexSimulationResponse(persona as 'hr' | 'manager', context, updatedHistory, userAnswer);
        } else {
            nextQ = await getNextInterviewQuestion(context, updatedHistory, userAnswer);
        }

        setAiQuestion(nextQ);
        setConversationHistory(`${updatedHistory}AI: ${nextQ}\n`);
        setUserAnswer('');
        setIsProcessing(false);
    };

    return (
        <div className="h-full flex flex-col gap-4 animate-fade-in">
            {/* Split Screen Container */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-[400px]">

                {/* Left Pane: AI Interviewer */}
                <div className="relative bg-slate-800 rounded-3xl overflow-hidden flex flex-col items-center justify-center p-6 text-center shadow-inner transition-all duration-500">
                    <div className="w-32 h-32 rounded-full bg-slate-700 mb-6 flex items-center justify-center border-4 border-slate-600 shadow-xl relative">
                        <User size={64} className="text-slate-400" />
                        {isProcessing && (
                            <div className="absolute inset-0 border-4 border-t-bridge-sage rounded-full animate-spin"></div>
                        )}
                    </div>
                    <div className="absolute top-4 left-4 bg-slate-900/50 px-3 py-1 rounded-full text-xs text-slate-300 backdrop-blur-md uppercase tracking-wider border border-white/10">
                        {persona}
                    </div>

                    <div className="max-w-md w-full">
                        {isInitializing ? (
                            <div className="text-slate-400 animate-pulse">Calibrating Persona...</div>
                        ) : (
                            <h3 className="text-xl md:text-2xl font-serif text-white mb-4 leading-relaxed animate-fade-in">
                                "{aiQuestion}"
                            </h3>
                        )}
                    </div>

                    {!isProcessing && !isInitializing && (
                        <div className="flex gap-2 mt-4 bg-slate-900/50 px-3 py-1 rounded-full">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse self-center"></div>
                            <span className="text-xs text-green-400 font-mono font-bold tracking-widest">LISTENING</span>
                        </div>
                    )}
                </div>

                {/* Right Pane: User Video Feed (Simulated) */}
                <div className="relative bg-slate-900 rounded-3xl overflow-hidden shadow-2xl group border border-slate-700">
                    {/* Simulated Video Feed */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-900/90 z-10"></div>
                    <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                        <span className="text-slate-600 font-medium flex items-col gap-2 opacity-50">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div> REC
                        </span>
                    </div>

                    {/* Authority Gauge Overlay */}
                    <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-1">
                        <span className="text-[10px] text-white/70 uppercase tracking-widest font-bold">Authority Gauge</span>
                        <div className="w-32 h-2 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                            <div
                                className={`h-full transition-all duration-1000 ease-out ${feedback ? (feedback.authorityScore > 70 ? 'bg-emerald-400 shadow-[0_0_10px_#34d399]' : 'bg-amber-400') : 'bg-slate-500'}`}
                                style={{ width: feedback ? `${feedback.authorityScore}%` : '0%' }}
                            ></div>
                        </div>
                    </div>

                    {/* Real-time Hedge Warning Overlay */}
                    {detectedHedges.length > 0 && !isProcessing && (
                        <div className="absolute bottom-40 left-0 right-0 flex justify-center z-20 pointer-events-none">
                            <div className="bg-rose-500/90 backdrop-blur-md text-white px-4 py-2 rounded-xl text-sm font-bold animate-bounce shadow-lg flex items-center gap-2 border border-white/20">
                                <AlertCircle size={16} /> Minimize: "{detectedHedges[0]}"
                            </div>
                        </div>
                    )}

                    {/* Power Move Overlay (Post-Answer) */}
                    {feedback && (
                        <div className="absolute bottom-24 left-6 right-6 z-20">
                            <GlassCard className="!bg-bridge-slate/95 !text-white !p-4 border-none shadow-2xl animate-slide-up ring-1 ring-white/10">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-yellow-400/20 rounded-lg text-yellow-300">
                                        <Zap size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm text-yellow-300 mb-1 uppercase tracking-wide">Coach Tip</h4>
                                        <p className="text-sm text-slate-200 leading-relaxed">{feedback.powerMove}</p>
                                    </div>
                                </div>
                            </GlassCard>
                        </div>
                    )}
                </div>
            </div>

            {/* Interaction Bar */}
            <GlassCard className="p-4 flex gap-4 items-center relative z-30">
                <button className={`p-3 rounded-full transition-colors ${isProcessing ? 'bg-slate-200 text-slate-400' : 'bg-red-50 text-red-500 hover:bg-red-100'}`}>
                    <Mic size={20} />
                </button>
                <input
                    type="text"
                    placeholder="Type your answer..."
                    className="flex-1 bg-transparent text-lg text-slate-700 placeholder-slate-400 focus:outline-none font-medium"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmitAnswer()}
                    disabled={isProcessing || isInitializing}
                    autoFocus
                />
                <button
                    onClick={handleSubmitAnswer}
                    disabled={!userAnswer.trim() || isProcessing || isInitializing}
                    className="p-3 bg-bridge-slate text-white rounded-full hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:scale-100 hover:scale-105 active:scale-95 shadow-md"
                >
                    {isProcessing ? <Activity size={20} className="animate-spin" /> : <Send size={20} />}
                </button>
            </GlassCard>
        </div>
    );
};