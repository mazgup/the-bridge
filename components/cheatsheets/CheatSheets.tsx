import React, { useState, useEffect } from 'react';
import { GlassCard } from '../GlassCard';
import {
    ClipboardList, FileText, Target, Sparkles, Download, Copy,
    CheckCircle, Building, Users, Lightbulb, MessageSquare,
    AlertCircle, Clock, Star, Briefcase
} from 'lucide-react';
import { CVData } from '../cv/CVTypes';
import { generateInterviewCheatSheet, CheatSheet } from '../../services/geminiService';

interface CheatSheetsProps {
    cvData: CVData;
}

export const CheatSheets: React.FC<CheatSheetsProps> = ({ cvData }) => {
    const [cvText, setCvText] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [cheatSheet, setCheatSheet] = useState<CheatSheet | null>(null);
    const [copied, setCopied] = useState(false);

    // Auto-populate CV
    useEffect(() => {
        if (cvData.experience.length > 0 || cvData.summary) {
            const cvContent = `
Name: ${cvData.fullName}
Target Role: ${cvData.targetRole}
Summary: ${cvData.summary}
Experience:
${cvData.experience.map(e => `- ${e.title} at ${e.company} (${e.dates}): ${e.description}`).join('\n')}
Skills: ${cvData.skills.join(', ')}
            `.trim();
            setCvText(cvContent);
        }
    }, [cvData]);

    const handleGenerate = async () => {
        if (!cvText.trim() || !jobDescription.trim()) return;

        setIsGenerating(true);
        const result = await generateInterviewCheatSheet(jobDescription, cvText);
        setCheatSheet(result);
        setIsGenerating(false);
    };

    const handleCopy = () => {
        if (!cheatSheet) return;

        const text = `
INTERVIEW CHEAT SHEET
=====================

ROLE: ${cheatSheet.roleSummary}
COMPANY FOCUS: ${cheatSheet.companyFocus}

KEY TALKING POINTS:
${cheatSheet.talkingPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}

QUESTIONS TO ASK:
${cheatSheet.questionsToAsk.map((q, i) => `${i + 1}. ${q}`).join('\n')}

YOUR UNIQUE VALUE:
${cheatSheet.uniqueValue}

POTENTIAL CONCERNS TO ADDRESS:
${cheatSheet.potentialConcerns.map((c, i) => `${i + 1}. ${c}`).join('\n')}

INDUSTRY BUZZWORDS:
${cheatSheet.buzzwords.join(', ')}

60-SECOND PITCH:
${cheatSheet.elevatorPitch}
        `.trim();

        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="h-full flex flex-col animate-fade-in pb-12">
            <header className="flex justify-between items-end mb-8">
                <div>
                    <h2 className="text-3xl font-serif text-bridge-slate">Interview Cheat Sheets</h2>
                    <p className="text-slate-500">One-page briefing documents for interview prep. Upload your CV and the job spec.</p>
                </div>
                {cheatSheet && (
                    <div className="flex gap-2">
                        <button
                            onClick={handleCopy}
                            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-600 rounded-xl text-sm font-bold border border-slate-200 transition-colors"
                        >
                            {copied ? <CheckCircle size={16} className="text-emerald-500" /> : <Copy size={16} />}
                            {copied ? 'Copied!' : 'Copy All'}
                        </button>
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 px-4 py-2 bg-bridge-slate text-white rounded-xl text-sm font-bold transition-colors hover:bg-slate-700"
                        >
                            <Download size={16} /> Print / PDF
                        </button>
                    </div>
                )}
            </header>

            {!cheatSheet ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Input Section */}
                    <div className="space-y-6">
                        <GlassCard className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-bridge-sage/20 rounded-lg">
                                    <FileText size={20} className="text-bridge-sage" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800">Your CV</h3>
                                    <p className="text-xs text-slate-500">Paste your CV or use saved data</p>
                                </div>
                            </div>
                            <textarea
                                className="w-full h-48 bg-white/50 border border-slate-200 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-bridge-sage/50 resize-none"
                                placeholder="Paste your CV content here..."
                                value={cvText}
                                onChange={(e) => setCvText(e.target.value)}
                            />
                            {cvData.experience.length > 0 && (
                                <div className="mt-2 flex items-center gap-2 text-xs text-bridge-sage">
                                    <CheckCircle size={14} />
                                    <span>CV data loaded from your profile</span>
                                </div>
                            )}
                        </GlassCard>

                        <GlassCard className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-bridge-lilac/30 rounded-lg">
                                    <Target size={20} className="text-bridge-slate" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800">Job Description</h3>
                                    <p className="text-xs text-slate-500">Paste the job you're interviewing for</p>
                                </div>
                            </div>
                            <textarea
                                className="w-full h-48 bg-white/50 border border-slate-200 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-bridge-lilac/50 resize-none"
                                placeholder="Paste the full job description here..."
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                            />
                        </GlassCard>

                        <button
                            onClick={handleGenerate}
                            disabled={!cvText.trim() || !jobDescription.trim() || isGenerating}
                            className="w-full bg-bridge-slate text-white py-4 rounded-xl font-bold shadow-lg hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                        >
                            {isGenerating ? (
                                <>
                                    <Sparkles size={20} className="animate-spin" />
                                    Generating Cheat Sheet...
                                </>
                            ) : (
                                <>
                                    <ClipboardList size={20} />
                                    Generate Cheat Sheet
                                </>
                            )}
                        </button>
                    </div>

                    {/* Preview Info */}
                    <div className="space-y-6">
                        <GlassCard className="p-8 bg-gradient-to-br from-bridge-slate to-slate-800 text-white">
                            <div className="flex items-start gap-4 mb-6">
                                <div className="p-3 bg-white/10 rounded-xl">
                                    <Lightbulb size={24} className="text-yellow-300" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg mb-2">What You'll Get</h3>
                                    <p className="text-slate-300 text-sm">A comprehensive one-page briefing tailored to this specific role.</p>
                                </div>
                            </div>

                            <ul className="space-y-3 text-sm">
                                <li className="flex items-center gap-3 text-slate-200">
                                    <CheckCircle size={16} className="text-bridge-sage" />
                                    Role & company summary
                                </li>
                                <li className="flex items-center gap-3 text-slate-200">
                                    <CheckCircle size={16} className="text-bridge-sage" />
                                    Key talking points from your experience
                                </li>
                                <li className="flex items-center gap-3 text-slate-200">
                                    <CheckCircle size={16} className="text-bridge-sage" />
                                    Smart questions to ask
                                </li>
                                <li className="flex items-center gap-3 text-slate-200">
                                    <CheckCircle size={16} className="text-bridge-sage" />
                                    Your unique value proposition
                                </li>
                                <li className="flex items-center gap-3 text-slate-200">
                                    <CheckCircle size={16} className="text-bridge-sage" />
                                    Potential concerns to address
                                </li>
                                <li className="flex items-center gap-3 text-slate-200">
                                    <CheckCircle size={16} className="text-bridge-sage" />
                                    Industry buzzwords to use
                                </li>
                                <li className="flex items-center gap-3 text-slate-200">
                                    <CheckCircle size={16} className="text-bridge-sage" />
                                    60-second elevator pitch
                                </li>
                            </ul>
                        </GlassCard>

                        <GlassCard className="p-6 border-l-4 border-l-amber-400">
                            <div className="flex items-start gap-3">
                                <Clock size={20} className="text-amber-500 mt-0.5" />
                                <div>
                                    <h4 className="font-bold text-slate-800 mb-1">Pro Tip</h4>
                                    <p className="text-sm text-slate-600">
                                        Review your cheat sheet 30 minutes before the interview.
                                        Focus on 2-3 key talking points rather than memorizing everything.
                                    </p>
                                </div>
                            </div>
                        </GlassCard>
                    </div>
                </div>
            ) : (
                /* Cheat Sheet Display */
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:block print:space-y-4">
                    {/* Role Overview */}
                    <GlassCard className="p-6 print:break-inside-avoid">
                        <div className="flex items-center gap-2 text-bridge-sage font-bold text-xs uppercase tracking-widest mb-4">
                            <Briefcase size={14} /> Role Overview
                        </div>
                        <h3 className="text-xl font-serif text-slate-800 mb-2">{cheatSheet.roleSummary}</h3>
                        <div className="flex items-start gap-2 mt-4 p-3 bg-bridge-sage/10 rounded-xl">
                            <Building size={16} className="text-bridge-sage mt-0.5" />
                            <p className="text-sm text-slate-700">{cheatSheet.companyFocus}</p>
                        </div>
                    </GlassCard>

                    {/* Talking Points */}
                    <GlassCard className="p-6 print:break-inside-avoid">
                        <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-widest mb-4">
                            <MessageSquare size={14} /> Key Talking Points
                        </div>
                        <ul className="space-y-3">
                            {cheatSheet.talkingPoints.map((point, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                                    <Star size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                                    {point}
                                </li>
                            ))}
                        </ul>
                    </GlassCard>

                    {/* Questions to Ask */}
                    <GlassCard className="p-6 print:break-inside-avoid">
                        <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-widest mb-4">
                            <Lightbulb size={14} /> Questions to Ask
                        </div>
                        <ul className="space-y-3">
                            {cheatSheet.questionsToAsk.map((q, i) => (
                                <li key={i} className="text-sm text-slate-700 p-2 bg-blue-50/50 rounded-lg border border-blue-100">
                                    "{q}"
                                </li>
                            ))}
                        </ul>
                    </GlassCard>

                    {/* Unique Value */}
                    <GlassCard className="lg:col-span-2 p-6 bg-gradient-to-br from-bridge-slate to-slate-800 text-white print:break-inside-avoid">
                        <div className="flex items-center gap-2 text-yellow-300 font-bold text-xs uppercase tracking-widest mb-4">
                            <Star size={14} /> Your Unique Value
                        </div>
                        <p className="text-lg leading-relaxed text-slate-100">
                            {cheatSheet.uniqueValue}
                        </p>
                    </GlassCard>

                    {/* Buzzwords */}
                    <GlassCard className="p-6 print:break-inside-avoid">
                        <div className="flex items-center gap-2 text-purple-600 font-bold text-xs uppercase tracking-widest mb-4">
                            <Target size={14} /> Industry Buzzwords
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {cheatSheet.buzzwords.map((word, i) => (
                                <span key={i} className="px-3 py-1 bg-purple-50 text-purple-700 text-sm font-medium rounded-full border border-purple-100">
                                    {word}
                                </span>
                            ))}
                        </div>
                    </GlassCard>

                    {/* Potential Concerns */}
                    <GlassCard className="lg:col-span-2 p-6 border-l-4 border-l-amber-400 print:break-inside-avoid">
                        <div className="flex items-center gap-2 text-amber-600 font-bold text-xs uppercase tracking-widest mb-4">
                            <AlertCircle size={14} /> Potential Concerns to Address
                        </div>
                        <ul className="space-y-2">
                            {cheatSheet.potentialConcerns.map((concern, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                                    <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold shrink-0">
                                        {i + 1}
                                    </span>
                                    {concern}
                                </li>
                            ))}
                        </ul>
                    </GlassCard>

                    {/* Elevator Pitch */}
                    <GlassCard className="p-6 print:break-inside-avoid">
                        <div className="flex items-center gap-2 text-bridge-sage font-bold text-xs uppercase tracking-widest mb-4">
                            <Clock size={14} /> 60-Second Pitch
                        </div>
                        <p className="text-sm text-slate-700 leading-relaxed italic">
                            "{cheatSheet.elevatorPitch}"
                        </p>
                    </GlassCard>

                    {/* Action Button */}
                    <div className="lg:col-span-3 flex justify-center print:hidden">
                        <button
                            onClick={() => setCheatSheet(null)}
                            className="px-6 py-3 bg-white/50 hover:bg-white text-slate-600 rounded-xl text-sm font-bold border border-slate-200 transition-colors"
                        >
                            Generate Another Cheat Sheet
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
