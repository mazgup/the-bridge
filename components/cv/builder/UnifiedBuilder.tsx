import React, { useMemo } from 'react';
import { CVChatAgent } from './CVChatAgent';
import { CVPhaseBar } from './CVPhaseBar';
import { CVSectionEditor } from './CVSectionEditor';
import { OxfordStrictPDF } from '../pdf/OxfordStrictPDF';
import { ModernImpactPDF } from '../pdf/ModernImpactPDF';
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import { ArrowLeft, Download, FileText, Upload, SlidersHorizontal } from 'lucide-react';
import { useCVStore } from '../../../stores/cvStore';
import { TemplateType } from '../CVTypes';

// ============================================================
// UnifiedBuilder — The Main CV Builder Page
// ============================================================
// Landing → Phase Bar + 50/50 Split (Chat/Editor + Live PDF)
// ============================================================

interface UnifiedBuilderProps {
    onNavigate: (path: string) => void;
}

export const UnifiedBuilder: React.FC<UnifiedBuilderProps> = ({ onNavigate }) => {
    const { cvData, updateMeta, editingSection, reset } = useCVStore();
    const [hasStarted, setHasStarted] = React.useState(false);

    // Template override
    const template = cvData.meta.template;
    const setTemplate = (t: TemplateType) => updateMeta({ template: t });

    // Memoize PDF component
    const PDFDocument = useMemo(() => {
        if (template === 'modern') {
            return <ModernImpactPDF data={cvData} />;
        }
        return <OxfordStrictPDF data={cvData} />;
    }, [cvData, template]);

    // ========== LANDING PAGE ==========
    if (!hasStarted) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-8">
                <div className="w-full max-w-2xl text-center">
                    <h1 className="text-4xl font-serif text-[#1a1a2e] mb-3 tracking-tight">CV Architect</h1>
                    <p className="text-slate-500 mb-10 text-lg">
                        Build an industry-standard, ATS-optimized CV with your personal Career Strategist.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Create from Scratch */}
                        <button
                            onClick={() => {
                                reset();
                                setHasStarted(true);
                            }}
                            className="group p-10 bg-white border-2 border-slate-100 rounded-2xl hover:border-emerald-400 hover:shadow-lg transition-all duration-300"
                        >
                            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                                <FileText size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">Create from Scratch</h3>
                            <p className="text-slate-500 text-sm">
                                Start fresh with a guided AI interview. Your strategist will ask the right questions.
                            </p>
                        </button>

                        {/* Import Resume */}
                        <button
                            onClick={() => alert('Import Resume coming soon!')}
                            className="group p-10 bg-white border-2 border-slate-100 rounded-2xl hover:border-indigo-400 hover:shadow-lg transition-all duration-300"
                        >
                            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300">
                                <Upload size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">Import Resume</h3>
                            <p className="text-slate-500 text-sm">
                                Upload an existing CV. The AI will parse, reformat, and improve it.
                            </p>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ========== BUILDER MODE ==========
    return (
        <div className="h-[calc(100vh-100px)] flex flex-col gap-3">
            {/* Top Toolbar */}
            <div className="flex justify-between items-center px-4 py-2.5 bg-white rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setHasStarted(false)}
                        className="text-slate-400 hover:text-[#1a1a2e] transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <span className="text-sm font-semibold text-slate-700">CV Architect</span>
                    {cvData.meta.target_role && (
                        <span className="text-xs text-slate-400 border-l border-slate-200 pl-3 ml-1">
                            {cvData.meta.target_role}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    {/* Template Switcher */}
                    <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                        <SlidersHorizontal size={14} className="text-slate-400" />
                        <select
                            value={template}
                            onChange={(e) => setTemplate(e.target.value as TemplateType)}
                            className="bg-transparent text-sm text-slate-600 font-medium focus:outline-none cursor-pointer"
                        >
                            <option value="oxford">Oxford (Finance/Law)</option>
                            <option value="modern">Modern (Tech/Startup)</option>
                        </select>
                    </div>

                    {/* Export PDF */}
                    <PDFDownloadLink
                        document={PDFDocument}
                        fileName={`${cvData.content.personal.name || 'My_CV'}.pdf`}
                        className="flex items-center gap-2 px-4 py-2 bg-[#1a1a2e] text-white rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors"
                    >
                        {({ loading }) =>
                            loading ? (
                                '...'
                            ) : (
                                <>
                                    <Download size={14} /> Export PDF
                                </>
                            )
                        }
                    </PDFDownloadLink>
                </div>
            </div>

            {/* Phase Progress Bar */}
            <CVPhaseBar />

            {/* Split Content */}
            <div className="flex-1 flex gap-3 overflow-hidden">
                {/* Left Panel: Chat or Section Editor (50%) */}
                <div className="w-1/2 min-w-[400px]">
                    {editingSection ? (
                        <CVSectionEditor section={editingSection} />
                    ) : (
                        <CVChatAgent />
                    )}
                </div>

                {/* PDF Preview (50%) */}
                <div className="w-1/2 bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden relative hidden lg:block">
                    <div className="absolute top-3 right-3 z-10 bg-black/60 text-white text-[10px] px-3 py-1 rounded-full uppercase tracking-widest pointer-events-none font-medium">
                        Live Preview ({template === 'oxford' ? 'Oxford' : 'Modern'})
                    </div>
                    <PDFViewer width="100%" height="100%" className="w-full h-full border-none">
                        {PDFDocument}
                    </PDFViewer>
                </div>
            </div>
        </div>
    );
};
