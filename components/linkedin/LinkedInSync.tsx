import React, { useState, useEffect } from 'react';
import { GlassCard } from '../GlassCard';
import { 
    Linkedin, Copy, CheckCircle, Sparkles, User, Briefcase, 
    FileText, ArrowRight, RefreshCw, AlertCircle
} from 'lucide-react';
import { CVData } from '../cv/CVTypes';
import { generateLinkedInContent, LinkedInContent } from '../../services/geminiService';

interface LinkedInSyncProps {
    cvData: CVData;
}

export const LinkedInSync: React.FC<LinkedInSyncProps> = ({ cvData }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [content, setContent] = useState<LinkedInContent | null>(null);
    const [copiedSection, setCopiedSection] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'headline' | 'about' | 'experience'>('headline');

    const hasCVData = cvData.experience.length > 0 || cvData.summary;

    const handleGenerate = async () => {
        if (!hasCVData) return;
        
        setIsGenerating(true);
        const result = await generateLinkedInContent(cvData);
        setContent(result);
        setIsGenerating(false);
    };

    const handleCopy = (section: string, text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedSection(section);
        setTimeout(() => setCopiedSection(null), 2000);
    };

    // Auto-generate on load if CV data exists
    useEffect(() => {
        if (hasCVData && !content) {
            handleGenerate();
        }
    }, []);

    if (!hasCVData) {
        return (
            <div className="h-full flex flex-col items-center justify-center animate-fade-in text-center p-8">
                <div className="w-20 h-20 bg-[#0077b5]/10 rounded-full flex items-center justify-center mb-6">
                    <Linkedin size={40} className="text-[#0077b5]" />
                </div>
                <h2 className="text-2xl font-serif text-bridge-slate mb-2">No CV Data Found</h2>
                <p className="text-slate-500 max-w-md mb-6">
                    Complete your CV in the CV Audit or CV Builder first, then come back to generate LinkedIn content.
                </p>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                    <AlertCircle size={16} />
                    Your LinkedIn content will be generated from your finalized CV
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col animate-fade-in pb-12">
            <header className="flex justify-between items-end mb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-[#0077b5] rounded-lg">
                            <Linkedin size={24} className="text-white" />
                        </div>
                        <h2 className="text-3xl font-serif text-bridge-slate">LinkedIn Sync</h2>
                    </div>
                    <p className="text-slate-500">Transform your CV into optimized LinkedIn content. Copy directly to your profile.</p>
                </div>
                <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="flex items-center gap-2 px-4 py-2 bg-[#0077b5] hover:bg-[#006097] text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
                >
                    {isGenerating ? <Sparkles size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                    Regenerate
                </button>
            </header>

            {isGenerating ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-4 relative">
                            <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-t-[#0077b5] rounded-full animate-spin"></div>
                        </div>
                        <p className="text-slate-600">Generating LinkedIn-optimized content...</p>
                    </div>
                </div>
            ) : content ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Tab Navigation */}
                    <div className="lg:col-span-3 flex gap-2 p-1 bg-white/50 rounded-2xl border border-slate-200">
                        <button
                            onClick={() => setActiveTab('headline')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
                                activeTab === 'headline' 
                                    ? 'bg-[#0077b5] text-white shadow-md' 
                                    : 'text-slate-600 hover:bg-white'
                            }`}
                        >
                            <User size={16} /> Headline & Bio
                        </button>
                        <button
                            onClick={() => setActiveTab('about')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
                                activeTab === 'about' 
                                    ? 'bg-[#0077b5] text-white shadow-md' 
                                    : 'text-slate-600 hover:bg-white'
                            }`}
                        >
                            <FileText size={16} /> About Section
                        </button>
                        <button
                            onClick={() => setActiveTab('experience')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
                                activeTab === 'experience' 
                                    ? 'bg-[#0077b5] text-white shadow-md' 
                                    : 'text-slate-600 hover:bg-white'
                            }`}
                        >
                            <Briefcase size={16} /> Experience
                        </button>
                    </div>

                    {/* Content Display */}
                    <div className="lg:col-span-2 space-y-6">
                        {activeTab === 'headline' && (
                            <>
                                <GlassCard className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-bold text-slate-800 mb-1">Professional Headline</h3>
                                            <p className="text-xs text-slate-500">Max 220 characters • Appears below your name</p>
                                        </div>
                                        <button
                                            onClick={() => handleCopy('headline', content.headline)}
                                            className={`p-2 rounded-lg transition-colors ${
                                                copiedSection === 'headline' 
                                                    ? 'bg-emerald-100 text-emerald-600' 
                                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                            }`}
                                        >
                                            {copiedSection === 'headline' ? <CheckCircle size={18} /> : <Copy size={18} />}
                                        </button>
                                    </div>
                                    <div className="bg-white p-4 rounded-xl border border-slate-200 text-lg font-medium text-slate-800">
                                        {content.headline}
                                    </div>
                                    <div className="mt-2 text-xs text-slate-400 text-right">
                                        {content.headline.length}/220 characters
                                    </div>
                                </GlassCard>

                                <GlassCard className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-bold text-slate-800 mb-1">Bio / Tagline</h3>
                                            <p className="text-xs text-slate-500">Short summary for your intro section</p>
                                        </div>
                                        <button
                                            onClick={() => handleCopy('bio', content.bio)}
                                            className={`p-2 rounded-lg transition-colors ${
                                                copiedSection === 'bio' 
                                                    ? 'bg-emerald-100 text-emerald-600' 
                                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                            }`}
                                        >
                                            {copiedSection === 'bio' ? <CheckCircle size={18} /> : <Copy size={18} />}
                                        </button>
                                    </div>
                                    <div className="bg-white p-4 rounded-xl border border-slate-200 text-slate-700">
                                        {content.bio}
                                    </div>
                                </GlassCard>
                            </>
                        )}

                        {activeTab === 'about' && (
                            <GlassCard className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-slate-800 mb-1">About Section</h3>
                                        <p className="text-xs text-slate-500">Your professional story • Max 2,600 characters</p>
                                    </div>
                                    <button
                                        onClick={() => handleCopy('about', content.about)}
                                        className={`p-2 rounded-lg transition-colors ${
                                            copiedSection === 'about' 
                                                ? 'bg-emerald-100 text-emerald-600' 
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                    >
                                        {copiedSection === 'about' ? <CheckCircle size={18} /> : <Copy size={18} />}
                                    </button>
                                </div>
                                <div className="bg-white p-4 rounded-xl border border-slate-200 text-slate-700 whitespace-pre-wrap leading-relaxed">
                                    {content.about}
                                </div>
                                <div className="mt-2 text-xs text-slate-400 text-right">
                                    {content.about.length}/2,600 characters
                                </div>
                            </GlassCard>
                        )}

                        {activeTab === 'experience' && (
                            <div className="space-y-4">
                                {content.experiences.map((exp, i) => (
                                    <GlassCard key={i} className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="font-bold text-slate-800">{exp.title}</h3>
                                                <p className="text-sm text-slate-500">{exp.company}</p>
                                            </div>
                                            <button
                                                onClick={() => handleCopy(`exp-${i}`, exp.description)}
                                                className={`p-2 rounded-lg transition-colors ${
                                                    copiedSection === `exp-${i}` 
                                                        ? 'bg-emerald-100 text-emerald-600' 
                                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                }`}
                                            >
                                                {copiedSection === `exp-${i}` ? <CheckCircle size={18} /> : <Copy size={18} />}
                                            </button>
                                        </div>
                                        <div className="bg-white p-4 rounded-xl border border-slate-200 text-slate-700 whitespace-pre-wrap text-sm leading-relaxed">
                                            {exp.description}
                                        </div>
                                    </GlassCard>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Tips Sidebar */}
                    <div className="space-y-6">
                        <GlassCard className="p-6 bg-gradient-to-br from-[#0077b5] to-[#005582] text-white">
                            <h3 className="font-bold mb-4 flex items-center gap-2">
                                <Linkedin size={18} /> LinkedIn Tips
                            </h3>
                            <ul className="space-y-3 text-sm text-blue-100">
                                <li className="flex items-start gap-2">
                                    <CheckCircle size={14} className="mt-0.5 shrink-0" />
                                    Use keywords from your target roles in your headline
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle size={14} className="mt-0.5 shrink-0" />
                                    Start your About with a hook that grabs attention
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle size={14} className="mt-0.5 shrink-0" />
                                    Include metrics and achievements in experience
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle size={14} className="mt-0.5 shrink-0" />
                                    Update regularly to stay visible in searches
                                </li>
                            </ul>
                        </GlassCard>

                        <GlassCard className="p-6 border-l-4 border-l-amber-400">
                            <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                                <AlertCircle size={16} className="text-amber-500" />
                                Profile Strength
                            </h4>
                            <p className="text-sm text-slate-600 mb-4">
                                Profiles with complete About sections get 40% more views.
                            </p>
                            <div className="bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div className="h-full w-4/5 bg-gradient-to-r from-amber-400 to-emerald-500 rounded-full"></div>
                            </div>
                            <div className="text-xs text-slate-500 mt-2 text-right">80% complete</div>
                        </GlassCard>

                        <GlassCard className="p-6">
                            <h4 className="font-bold text-slate-800 mb-3">How to Apply</h4>
                            <ol className="space-y-3 text-sm text-slate-600">
                                <li className="flex items-start gap-3">
                                    <span className="w-6 h-6 rounded-full bg-[#0077b5]/10 text-[#0077b5] flex items-center justify-center text-xs font-bold shrink-0">1</span>
                                    Click the copy button for each section
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="w-6 h-6 rounded-full bg-[#0077b5]/10 text-[#0077b5] flex items-center justify-center text-xs font-bold shrink-0">2</span>
                                    Go to your LinkedIn profile
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="w-6 h-6 rounded-full bg-[#0077b5]/10 text-[#0077b5] flex items-center justify-center text-xs font-bold shrink-0">3</span>
                                    Edit and paste into each section
                                </li>
                            </ol>
                        </GlassCard>
                    </div>
                </div>
            ) : null}
        </div>
    );
};
