
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Loader2, Sparkles, HelpCircle, Bot } from 'lucide-react';
import { ChatMessage, streamCVConversation, AIResponse } from '../../../services/geminiService';
import { useCVStore } from '../../../stores/cvStore';

// ============================================================
// CVChatAgent — The Conversational Career Architect UI
// ============================================================

export const CVChatAgent: React.FC = () => {
    // Access messages and actions from store
    const { cvData, mergeFromAI, messages, addMessage, setMessages, uploadedCVText, setUploadedCVText } = useCVStore();

    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const [explanation, setExplanation] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const hasTriggeredUpload = useRef(false);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    // Core send function used by both manual input and auto-trigger
    const sendMessage = useCallback(async (userMessage: string) => {
        if (isLoading) return;

        const historySnapshot = [...useCVStore.getState().messages];
        const userMsg: ChatMessage = { role: 'user', content: userMessage };

        setMessages([
            ...historySnapshot,
            userMsg,
            { role: 'model', content: '' } // Placeholder
        ]);

        setIsLoading(true);
        setExplanation(null);

        const aiIdx = historySnapshot.length + 1;

        try {
            const currentCV = useCVStore.getState().cvData;
            const response = await streamCVConversation(
                [...historySnapshot, userMsg],
                currentCV,
                userMessage,
                (partialText: string) => {
                    const cleanText = partialText
                        .replace(/```json_cv_update[\s\S]*?```/g, '')
                        .replace(/```json[\s\S]*?```/g, '')
                        .replace(/```json_cv_update[\s\S]*/g, '')
                        .trim();

                    useCVStore.setState(state => {
                        const updated = [...state.messages];
                        if (updated[aiIdx]) {
                            updated[aiIdx] = { ...updated[aiIdx], content: cleanText };
                        }
                        return { messages: updated };
                    });
                }
            );

            useCVStore.setState(state => {
                const updated = [...state.messages];
                if (updated[aiIdx]) {
                    updated[aiIdx] = { role: 'model', content: response.message };
                }
                return { messages: updated };
            });

            if (response.explanation) {
                setExplanation(response.explanation);
            }

            if (response.cvUpdate) {
                mergeFromAI(response.cvUpdate);
            }
        } catch (error) {
            console.error('Chat error:', error);
            useCVStore.setState(state => {
                const updated = [...state.messages];
                if (updated[aiIdx]) {
                    updated[aiIdx] = { role: 'model', content: 'Something went wrong. Please try again.' };
                }
                return { messages: updated };
            });
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, mergeFromAI, setMessages]);

    useEffect(() => {
        if (uploadedCVText && !hasTriggeredUpload.current && !isLoading) {
            hasTriggeredUpload.current = true;
            const cvText = uploadedCVText;
            setUploadedCVText(null); // Clear immediately to prevent re-triggers

            // Small delay to let the greeting message render first
            setTimeout(() => {
                sendMessage(
                    `I've uploaded my existing CV. Here is the full text extracted from it:\n\n---\n${cvText}\n---\n\nPlease review this CV, extract all the structured information (name, contact details, experience, education, skills), and then help me improve it section by section.`
                );
            }, 1500);
        }
    }, [uploadedCVText, isLoading, sendMessage, setUploadedCVText]);

    // Ensure focus returns to input after loading finishes
    useEffect(() => {
        if (!isLoading) {
            // Small timeout to allow DOM updates
            setTimeout(() => {
                inputRef.current?.focus();
            }, 50);
        }
    }, [isLoading]);

    const handleSend = async () => {
        const userMessage = input.trim();
        setInput('');
        await sendMessage(userMessage);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!isLoading) {
                handleSend();
            }
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
            <div className="bg-white border-b border-slate-100 px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                        <Bot size={20} />
                    </div>
                    {/* Simplified Header */}
                    <div className="flex flex-col">
                        <h3 className="font-semibold text-sm leading-none text-slate-800">CV Assistant</h3>
                        <span className="text-[10px] text-slate-400">AI Career Strategist</span>
                    </div>
                </div>
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
                                    max-w-[75%] p-4 text-sm leading-relaxed shadow-sm
                                    ${msg.role === 'user'
                                        ? 'bg-[#0f766e] text-white rounded-2xl rounded-br-none'
                                        : 'bg-white border border-slate-100 text-slate-700 rounded-2xl rounded-bl-none'
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
            <div className="border-t border-slate-100 bg-[#FAFBFC] px-5 pt-3 pb-4">
                {/* Quick Replies */}
                {!isLoading && (
                    <div className="flex justify-end mb-3 pr-1">
                        <button
                            onClick={() => setInput("Can you give me an example or suggestion for this section?")}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium transition-colors border border-emerald-200 shadow-sm"
                        >
                            <Sparkles size={12} /> Help me answer
                        </button>
                    </div>
                )}

                <div className="relative shadow-xl rounded-2xl bg-white">
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={isLoading ? "AI is thinking..." : "Type your answer..."}
                        className="w-full pl-5 pr-14 py-4 bg-white border-0 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-700 placeholder:text-slate-400"
                        autoFocus
                    />
                    <button
                        onClick={handleSend}
                        disabled={isLoading || !input.trim()}
                        className="absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform active:scale-95"
                    >
                        {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                    </button>
                </div>

                <div className="text-center mt-2">
                    <button
                        onClick={() => setInput("Help me answer this...")}
                        className="text-[10px] text-slate-400 hover:text-emerald-500 transition-colors flex items-center justify-center gap-1 mx-auto"
                    >
                        <HelpCircle size={10} /> Not sure what to say?
                    </button>
                </div>
            </div>
        </div>
    );
};
