import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Bot, Loader2, Sparkles, HelpCircle } from 'lucide-react';
import { ChatMessage, streamCVConversation, AIResponse } from '../../../services/geminiService';
import { useCVStore } from '../../../stores/cvStore';

// ============================================================
// CVChatAgent — The Conversational Career Architect UI
// ============================================================

export const CVChatAgent: React.FC = () => {
    const { cvData, mergeFromAI } = useCVStore();

    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            role: 'model',
            content:
                "Hi there! \ud83d\udc4b I'm your Career Architect \u2014 think of me as a friendly mentor who's here to help you build a brilliant CV.\n\n" +
                "Don't worry if you're unsure about anything \u2014 we'll figure it out together, one step at a time.\n\n" +
                "To get started, **what kind of work are you looking for?** It's okay if you're not 100% sure yet \u2014 just give me a rough idea and we'll go from there.",
        },
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [explanation, setExplanation] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        const userMsg: ChatMessage = { role: 'user', content: userMessage };

        // Snapshot history BEFORE adding new messages
        const historySnapshot = [...messages];

        // Add user message + empty AI placeholder immediately
        setMessages((prev) => [
            ...prev,
            userMsg,
            { role: 'model', content: '' },
        ]);
        setInput('');
        setIsLoading(true);
        setExplanation(null);

        // The AI placeholder is at index: historySnapshot.length + 1
        const aiIdx = historySnapshot.length + 1;

        try {
            const response = await streamCVConversation(
                historySnapshot,
                cvData,
                userMessage,
                (partialText: string) => {
                    // Strip json_cv_update blocks from visible text during streaming
                    const cleanText = partialText
                        .replace(/```json_cv_update[\s\S]*?```/g, '')
                        .replace(/```json_cv_update[\s\S]*/g, '')
                        .trim();
                    setMessages((prev) => {
                        const updated = [...prev];
                        if (updated[aiIdx]) {
                            updated[aiIdx] = { role: 'model', content: cleanText };
                        }
                        return updated;
                    });
                }
            );

            // Finalize with the parsed clean message
            setMessages((prev) => {
                const updated = [...prev];
                if (updated[aiIdx]) {
                    updated[aiIdx] = { role: 'model', content: response.message };
                }
                return updated;
            });

            if (response.explanation) {
                setExplanation(response.explanation);
            }

            if (response.cvUpdate) {
                mergeFromAI(response.cvUpdate);
            }
        } catch (error) {
            console.error('Chat error:', error);
            setMessages((prev) => {
                const updated = [...prev];
                if (updated[aiIdx]) {
                    updated[aiIdx] = { role: 'model', content: 'Something went wrong. Please try again.' };
                }
                return updated;
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Simple markdown-lite renderer for **bold** and \n
    const renderText = (text: string) => {
        return text.split('\n').map((line, i) => {
            const parts = line.split(/(\*\*.*?\*\*)/g);
            return (
                <p key={i} className="mb-1 last:mb-0">
                    {parts.map((part, j) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                            return <strong key={j} className="font-semibold">{part.slice(2, -2)}</strong>;
                        }
                        return part;
                    })}
                </p>
            );
        });
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {/* ========== HEADER ========== */}
            <div className="bg-[#1a1a2e] text-white px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/10 rounded-xl">
                        <Bot size={20} className="text-emerald-400" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-sm">Career Architect</h3>
                        <p className="text-[10px] text-slate-400 tracking-wide uppercase">Gemini 2.5 Flash</p>
                    </div>
                </div>

                {/* Strategy Pill */}
                {cvData.meta.target_role && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full text-xs">
                        <Sparkles size={12} className="text-amber-400" />
                        <span className="text-slate-300">
                            {cvData.meta.target_industry || 'General'} / {cvData.meta.target_role} / {cvData.meta.target_pages}-Page
                        </span>
                    </div>
                )}
            </div>

            {/* ========== STRATEGY EXPLANATION BANNER ========== */}
            {explanation && (
                <div className="px-5 py-3 bg-blue-50 border-b border-blue-100 text-xs text-blue-800 flex items-start gap-2">
                    <Sparkles size={14} className="text-blue-500 mt-0.5 flex-shrink-0" />
                    <div>
                        <span className="font-semibold">Strategy Update: </span>
                        {explanation}
                    </div>
                    <button
                        onClick={() => setExplanation(null)}
                        className="ml-auto text-blue-400 hover:text-blue-600 text-xs flex-shrink-0"
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* ========== CHAT LOG ========== */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#FAFBFC]">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {/* Skip empty placeholder messages */}
                        {msg.content ? (
                            <div
                                className={`
                                    max-w-[85%] p-4 text-sm leading-relaxed
                                    ${msg.role === 'user'
                                        ? 'bg-[#1a1a2e] text-white rounded-2xl rounded-br-md'
                                        : 'bg-white border border-slate-200 text-slate-700 rounded-2xl rounded-bl-md shadow-sm'
                                    }
                                `}
                            >
                                {renderText(msg.content)}
                            </div>
                        ) : msg.role === 'model' && isLoading ? (
                            <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-bl-md shadow-sm flex items-center gap-3">
                                <Loader2 size={16} className="animate-spin text-emerald-500" />
                                <span className="text-xs text-slate-400 italic">Thinking...</span>
                            </div>
                        ) : null}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* ========== INPUT AREA ========== */}
            <div className="p-4 bg-white border-t border-slate-100">
                {/* Help Me Answer button */}
                <button
                    onClick={() => setInput("I worked at [Company] as a [Role]. I mostly did [Task 1] and [Task 2]. I'm not sure what my achievements were.")}
                    disabled={isLoading}
                    className="mb-2 flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-600 transition-colors disabled:opacity-40"
                >
                    <HelpCircle size={13} />
                    <span>Help me answer</span>
                </button>
                <div className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type your answer... it's okay to be rough!"
                        className="w-full pl-4 pr-14 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/40 transition-all"
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleSend}
                        disabled={isLoading || !input.trim()}
                        className="absolute right-2 top-2 p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <Send size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};
