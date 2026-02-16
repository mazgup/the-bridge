import React, { useState, useEffect } from 'react';
import { GlassCard } from '../GlassCard';
import {
    Linkedin, ArrowLeft, Sparkles, Copy, CheckCircle,
    User, Briefcase, FileText, RefreshCcw, Download
} from 'lucide-react';
import { CVData } from './CVTypes';
import { generateLinkedInContent, LinkedInContent } from '../../services/geminiService';

interface LinkedInSyncProps {
    cvData: CVData;
    onNavigate: (path: string) => void;
}

export const LinkedInSync: React.FC<LinkedInSyncProps> = ({ cvData, onNavigate }) => {
    const [linkedInContent, setLinkedInContent] = useState<LinkedInContent | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [copiedSection, setCopiedSection] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'headline' | 'about' | 'experience'>('headline');

    const handleGenerate = async () => {
        setIsGenerating(true);
        const content = await generateLinkedInContent(cvData);
        setLinkedInContent(content);
        setIsGenerating(false);
    };

    const handleCopy = (text: string, section: string) => {
        navigator.clipboard.writeText(text);
        setCopiedSection(section);
        setTimeout(() => setCopiedSection(null), 2000);
    };

    useEffect(() => {
        if (cvData.experience.length > 0 || cvData.summary) {
            handleGenerate();
        }
    }, []);

    const tabs = [
        { id: 'headline', label: 'Headline & Bio', icon: User },
        { id: 'about', label: 'About Section', icon: FileText },
        { id: 'experience', label: 'Experience', icon: Briefcase },
    ];

    return (
        <div className="max-w-4xl mx-auto pb-12 animate-fade-in">
            <button
                onClick={() => onNavigate('/cv-audit')}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-6"
            >
                <ArrowLeft size={18} /> Back to CV Audit
            </button>

            <header className="mb-8">
                <div className="flex items-center gap-4 mb-2">
                    <div className="p-3 bg-[#0077b5] rounded-xl text-white">
                        <Linkedin size={28} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-serif text-bridge-slate">LinkedIn Profile Optimizer</h1>
                        <p className="text-slate-500">AI-generated content tailored from your CV</p>
                    </div>
                </div>
            </header>

            {/* Warning if no CV data */}
            {(!cvData.experience.length && !cvData.summary) && (
                <GlassCard className="mb-6 border-amber-200 bg-amber-50/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                            <FileText size={20} />
                        </div>
                        <div>
                            <p className="font-bold text-amber-800">No CV Data Found</p>
                            <p className="text-sm text-amber-700">
                                Complete your CV in the CV Audit or CV Builder first for personalized LinkedIn content.
                            </p>
                        </div>
                    </div>
                </GlassCard>
            )}

            {/* Tab Navigation */}
            <div className="flex gap-2 mb-6 bg-white/50 p-1 rounded-2xl border border-slate-200">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as typeof activeTab)}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id
                                ? 'bg-[#0077b5] text-white shadow-md'
                                : 'text-slate-500 hover:bg-white hover:text-slate-700'
                                }`}
                        >
                            <Icon size={16} /> {tab.label}
                        </button>
                    );
                })}
            </div>

            {isGenerating ? (
                <GlassCard className="text-center py-16">
                    <div className="w-20 h-20 mx-auto mb-6 relative">
                        <div className="absolute inset-0 border-4 border-slate-200 rounded-full" />
                        <div className="absolute inset-0 border-4 border-t-[#0077b5] rounded-full animate-spin" />
                        <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#0077b5]" size={28} />
                    </div>
                    <h3 className="text-xl font-serif text-bridge-slate mb-2">Optimizing for LinkedIn</h3>
                    <p className="text-slate-500">Crafting professional content from your CV...</p>
                </GlassCard>
            ) : linkedInContent ? (
                <div className="space-y-6">
                    {/* Headline & Bio Tab */}
                    {activeTab === 'headline' && (
                        <>
                            <GlassCard>
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-slate-700 mb-1">Professional Headline</h3>
                                        <p className="text-xs text-slate-400">120 characters max • Appears below your name</p>
                                    </div>
                                    <button
                                        onClick={() => handleCopy(linkedInContent.headline, 'headline')}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${copiedSection === 'headline'
                                            ? 'bg-emerald-100 text-emerald-700'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                            }`}
                                    >
                                        {copiedSection === 'headline' ? <CheckCircle size={14} /> : <Copy size={14} />}
                                        {copiedSection === 'headline' ? 'Copied!' : 'Copy'}
                                    </button>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                    <p className="text-lg font-medium text-slate-800">{linkedInContent.headline}</p>
                                </div>
                                <p className="text-xs text-slate-400 mt-2 text-right">
                                    {linkedInContent.headline.length}/120 characters
                                </p>
                            </GlassCard>

                            <GlassCard>
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-slate-700 mb-1">Profile Summary (Short Bio)</h3>
                                        <p className="text-xs text-slate-400">First 300 characters appear before "see more"</p>
                                    </div>
                                    <button
                                        onClick={() => handleCopy(linkedInContent.summary, 'summary')}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${copiedSection === 'summary'
                                            ? 'bg-emerald-100 text-emerald-700'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                            }`}
                                    >
                                        {copiedSection === 'summary' ? <CheckCircle size={14} /> : <Copy size={14} />}
                                        {copiedSection === 'summary' ? 'Copied!' : 'Copy'}
                                    </button>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                    <p className="text-slate-700 leading-relaxed">{linkedInContent.summary}</p>
                                </div>
                            </GlassCard>
                        </>
                    )}

                    {/* About Section Tab */}
                    {activeTab === 'about' && (
                        <GlassCard>
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-slate-700 mb-1">About Section</h3>
                                    <p className="text-xs text-slate-400">Full "About" section with professional narrative</p>
                                </div>
                                <button
                                    onClick={() => handleCopy(linkedInContent.about, 'about')}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${copiedSection === 'about'
                                        ? 'bg-emerald-100 text-emerald-700'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                >
                                    {copiedSection === 'about' ? <CheckCircle size={14} /> : <Copy size={14} />}
                                    {copiedSection === 'about' ? 'Copied!' : 'Copy'}
                                </button>
                            </div>
                            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                                <p className="text-slate-700 leading-relaxed whitespace-pre-line">{linkedInContent.about}</p>
                            </div>
                        </GlassCard>
                    )}

                    {/* Experience Tab */}
                    {activeTab === 'experience' && (
                        <div className="space-y-4">
                            {linkedInContent.experiences.map((exp, idx) => (
                                <GlassCard key={idx}>
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-bold text-slate-800">{exp.role}</h3>
                                            <p className="text-slate-500 text-sm">{exp.company}</p>
                                        </div>
                                        <button
                                            onClick={() => handleCopy(exp.bullets.join('\n'), `exp-${idx}`)}
                                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${copiedSection === `exp-${idx}`
                                                ? 'bg-emerald-100 text-emerald-700'
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                }`}
                                        >
                                            {copiedSection === `exp-${idx}` ? <CheckCircle size={14} /> : <Copy size={14} />}
                                            {copiedSection === `exp-${idx}` ? 'Copied!' : 'Copy'}
                                        </button>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                        <p className="text-slate-700 leading-relaxed whitespace-pre-line">{exp.bullets.join('\n')}</p>
                                    </div>
                                </GlassCard>
                            ))}
                        </div>
                    )}

                    {/* Regenerate Button */}
                    <div className="flex justify-center gap-4 pt-4">
                        <button
                            onClick={handleGenerate}
                            className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-colors"
                        >
                            <RefreshCcw size={18} /> Regenerate Content
                        </button>
                        <button
                            onClick={() => {
                                const fullContent = `LINKEDIN PROFILE CONTENT\n\n` +
                                    `HEADLINE:\n${linkedInContent.headline}\n\n` +
                                    `SUMMARY:\n${linkedInContent.summary}\n\n` +
                                    `ABOUT:\n${linkedInContent.about}\n\n` +
                                    `EXPERIENCE:\n${linkedInContent.experiences.map((e: any) => `${e.role} at ${e.company}:\n${e.bullets ? e.bullets.join('\n') : e.description}`).join('\n\n')}`;
                                handleCopy(fullContent, 'all');
                            }}
                            className="flex items-center gap-2 px-6 py-3 bg-[#0077b5] text-white rounded-xl font-bold hover:bg-[#006699] transition-colors"
                        >
                            <Download size={18} /> Copy All Content
                        </button>
                    </div>
                </div>
            ) : (
                <GlassCard className="text-center py-16">
                    <Linkedin size={48} className="mx-auto text-slate-300 mb-4" />
                    <h3 className="text-xl font-serif text-slate-600 mb-2">Ready to Optimize</h3>
                    <p className="text-slate-400 mb-6">Generate LinkedIn-optimized content from your CV</p>
                    <button
                        onClick={handleGenerate}
                        className="px-6 py-3 bg-[#0077b5] text-white rounded-xl font-bold hover:bg-[#006699] transition-colors"
                    >
                        Generate Content
                    </button>
                </GlassCard>
            )}
        </div>
    );
};
