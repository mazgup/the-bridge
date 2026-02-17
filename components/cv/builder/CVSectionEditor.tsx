import React from 'react';
import { ArrowLeft, Plus, Trash2, MessageSquare } from 'lucide-react';
import { useCVStore, CVPhase } from '../../../stores/cvStore';
import { CVExperience, CVEducation, CVSkillGroup, CVLink } from '../CVTypes';

// ============================================================
// CVSectionEditor — Manual form editors for each CV section
// ============================================================
// Pre-populated from cvStore. Edits go directly to the store,
// so the PDF preview updates in real-time.
// ============================================================

interface SectionEditorProps {
    section: CVPhase;
}

// ============================================================
// Shared styles
// ============================================================
const inputCls = "w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-400 transition-all";
const labelCls = "block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide";
const cardCls = "p-4 bg-white border border-slate-200 rounded-xl mb-3 relative";
const addBtnCls = "flex items-center gap-1.5 text-xs font-medium text-emerald-600 hover:text-emerald-700 px-3 py-2 border border-dashed border-emerald-300 rounded-lg hover:border-emerald-400 hover:bg-emerald-50 transition-all w-full justify-center";
const deleteBtnCls = "absolute top-3 right-3 p-1 text-slate-300 hover:text-red-500 transition-colors";

export const CVSectionEditor: React.FC<SectionEditorProps> = ({ section }) => {
    const { cvData, updateContent, setEditingSection } = useCVStore();
    const content = cvData.content;

    return (
        <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="bg-white border-b border-slate-100 px-5 py-4 flex items-center justify-between gap-3">
                <div>
                    <h3 className="font-semibold text-sm text-slate-800">Edit: {section.charAt(0).toUpperCase() + section.slice(1)}</h3>
                    <p className="text-[10px] text-slate-400 tracking-wide">Changes update the preview in real-time</p>
                </div>
                <button
                    onClick={() => setEditingSection(null)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg transition-colors text-xs font-medium border border-emerald-100"
                    title="Return to Chat"
                >
                    <MessageSquare size={14} />
                    <span>Back to Chat</span>
                </button>
            </div>

            {/* Form Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#FAFBFC]">
                {section === 'contact' && <ContactEditor content={content} updateContent={updateContent} />}
                {section === 'experience' && <ExperienceEditor content={content} updateContent={updateContent} />}
                {section === 'education' && <EducationEditor content={content} updateContent={updateContent} />}
                {section === 'skills' && <SkillsEditor content={content} updateContent={updateContent} />}
                {section === 'summary' && <SummaryEditor content={content} updateContent={updateContent} />}
                {section === 'review' && <ReviewView content={content} setEditingSection={setEditingSection} />}
            </div>
        </div>
    );
};

// ============================================================
// Contact Editor
// ============================================================
const ContactEditor: React.FC<{ content: any; updateContent: any }> = ({ content, updateContent }) => {
    const personal = content.personal || { name: '', contact: [], links: [] };

    const updateName = (name: string) => {
        updateContent({ personal: { ...personal, name } });
    };

    const updateContactItem = (idx: number, value: string) => {
        const updated = [...(personal.contact || [])];
        updated[idx] = value;
        updateContent({ personal: { ...personal, contact: updated } });
    };

    const addContactItem = () => {
        updateContent({ personal: { ...personal, contact: [...(personal.contact || []), ''] } });
    };

    const removeContactItem = (idx: number) => {
        const updated = (personal.contact || []).filter((_: string, i: number) => i !== idx);
        updateContent({ personal: { ...personal, contact: updated } });
    };

    const updateLink = (idx: number, field: keyof CVLink, value: string) => {
        const updated = [...(personal.links || [])];
        updated[idx] = { ...updated[idx], [field]: value };
        updateContent({ personal: { ...personal, links: updated } });
    };

    const addLink = () => {
        updateContent({ personal: { ...personal, links: [...(personal.links || []), { label: '', url: '' }] } });
    };

    const removeLink = (idx: number) => {
        const updated = (personal.links || []).filter((_: CVLink, i: number) => i !== idx);
        updateContent({ personal: { ...personal, links: updated } });
    };

    return (
        <>
            <div>
                <label className={labelCls}>Full Name</label>
                <input className={inputCls} value={personal.name || ''} onChange={(e) => updateName(e.target.value)} placeholder="Your full name" />
            </div>

            <div>
                <label className={labelCls}>Contact Details (email, phone, location)</label>
                {(personal.contact || []).map((item: string, i: number) => (
                    <div key={i} className="flex gap-2 mb-2">
                        <input className={inputCls} value={item} onChange={(e) => updateContactItem(i, e.target.value)} placeholder="e.g. london@email.com" />
                        <button onClick={() => removeContactItem(i)} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                    </div>
                ))}
                <button onClick={addContactItem} className={addBtnCls}><Plus size={14} /> Add contact item</button>
            </div>

            <div>
                <label className={labelCls}>Links (LinkedIn, Portfolio, etc.)</label>
                {(personal.links || []).map((link: CVLink, i: number) => (
                    <div key={i} className={cardCls}>
                        <button onClick={() => removeLink(i)} className={deleteBtnCls}><Trash2 size={14} /></button>
                        <div className="grid grid-cols-2 gap-2">
                            <div><label className={labelCls}>Label</label><input className={inputCls} value={link.label} onChange={(e) => updateLink(i, 'label', e.target.value)} placeholder="LinkedIn" /></div>
                            <div><label className={labelCls}>URL</label><input className={inputCls} value={link.url} onChange={(e) => updateLink(i, 'url', e.target.value)} placeholder="https://..." /></div>
                        </div>
                    </div>
                ))}
                <button onClick={addLink} className={addBtnCls}><Plus size={14} /> Add link</button>
            </div>
        </>
    );
};

// ============================================================
// Experience Editor
// ============================================================
const ExperienceEditor: React.FC<{ content: any; updateContent: any }> = ({ content, updateContent }) => {
    const experiences: CVExperience[] = content.experience || [];

    const updateExp = (idx: number, field: keyof CVExperience, value: any) => {
        const updated = [...experiences];
        updated[idx] = { ...updated[idx], [field]: value };
        updateContent({ experience: updated });
    };

    const addExperience = () => {
        updateContent({
            experience: [...experiences, { company: '', role: '', date_range: '', location: '', bullets: [''] }],
        });
    };

    const removeExperience = (idx: number) => {
        updateContent({ experience: experiences.filter((_, i) => i !== idx) });
    };

    const updateBullet = (expIdx: number, bulletIdx: number, value: string) => {
        const updated = [...experiences];
        const bullets = [...(updated[expIdx].bullets || [])];
        bullets[bulletIdx] = value;
        updated[expIdx] = { ...updated[expIdx], bullets };
        updateContent({ experience: updated });
    };

    const addBullet = (expIdx: number) => {
        const updated = [...experiences];
        updated[expIdx] = { ...updated[expIdx], bullets: [...(updated[expIdx].bullets || []), ''] };
        updateContent({ experience: updated });
    };

    const removeBullet = (expIdx: number, bulletIdx: number) => {
        const updated = [...experiences];
        updated[expIdx] = { ...updated[expIdx], bullets: (updated[expIdx].bullets || []).filter((_, i) => i !== bulletIdx) };
        updateContent({ experience: updated });
    };

    return (
        <>
            {experiences.map((exp, i) => (
                <div key={i} className={cardCls}>
                    <button onClick={() => removeExperience(i)} className={deleteBtnCls}><Trash2 size={14} /></button>
                    <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <div><label className={labelCls}>Company</label><input className={inputCls} value={exp.company} onChange={(e) => updateExp(i, 'company', e.target.value)} /></div>
                            <div><label className={labelCls}>Role</label><input className={inputCls} value={exp.role} onChange={(e) => updateExp(i, 'role', e.target.value)} /></div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div><label className={labelCls}>Date Range</label><input className={inputCls} value={exp.date_range} onChange={(e) => updateExp(i, 'date_range', e.target.value)} placeholder="May 2024 – Present" /></div>
                            <div><label className={labelCls}>Location</label><input className={inputCls} value={exp.location} onChange={(e) => updateExp(i, 'location', e.target.value)} placeholder="London, UK" /></div>
                        </div>
                        <div>
                            <label className={labelCls}>Bullet Points</label>
                            {(exp.bullets || []).map((bullet, j) => (
                                <div key={j} className="flex gap-2 mb-2">
                                    <span className="text-slate-300 mt-2 text-sm">•</span>
                                    <textarea className={inputCls + " min-h-[36px] resize-y"} value={bullet} onChange={(e) => updateBullet(i, j, e.target.value)} rows={1} />
                                    <button onClick={() => removeBullet(i, j)} className="p-2 text-slate-300 hover:text-red-500 transition-colors mt-0.5"><Trash2 size={14} /></button>
                                </div>
                            ))}
                            <button onClick={() => addBullet(i)} className={addBtnCls}><Plus size={14} /> Add bullet</button>
                        </div>
                    </div>
                </div>
            ))}
            <button onClick={addExperience} className={addBtnCls}><Plus size={14} /> Add experience</button>
        </>
    );
};

// ============================================================
// Education Editor
// ============================================================
const EducationEditor: React.FC<{ content: any; updateContent: any }> = ({ content, updateContent }) => {
    const education: CVEducation[] = content.education || [];

    const updateEdu = (idx: number, field: keyof CVEducation, value: string) => {
        const updated = [...education];
        updated[idx] = { ...updated[idx], [field]: value };
        updateContent({ education: updated });
    };

    const addEducation = () => {
        updateContent({
            education: [...education, { institution: '', qualification: '', date_range: '', grade: '' }],
        });
    };

    const removeEducation = (idx: number) => {
        updateContent({ education: education.filter((_, i) => i !== idx) });
    };

    return (
        <>
            {education.map((edu, i) => (
                <div key={i} className={cardCls}>
                    <button onClick={() => removeEducation(i)} className={deleteBtnCls}><Trash2 size={14} /></button>
                    <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <div><label className={labelCls}>Institution</label><input className={inputCls} value={edu.institution} onChange={(e) => updateEdu(i, 'institution', e.target.value)} /></div>
                            <div><label className={labelCls}>Qualification</label><input className={inputCls} value={edu.qualification} onChange={(e) => updateEdu(i, 'qualification', e.target.value)} /></div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div><label className={labelCls}>Date Range</label><input className={inputCls} value={edu.date_range} onChange={(e) => updateEdu(i, 'date_range', e.target.value)} placeholder="2020 – 2023" /></div>
                            <div><label className={labelCls}>Grade (optional)</label><input className={inputCls} value={edu.grade || ''} onChange={(e) => updateEdu(i, 'grade', e.target.value)} placeholder="First Class, 2:1, etc." /></div>
                        </div>
                    </div>
                </div>
            ))}
            <button onClick={addEducation} className={addBtnCls}><Plus size={14} /> Add education</button>
        </>
    );
};

// ============================================================
// Skills Editor
// ============================================================
const SkillsEditor: React.FC<{ content: any; updateContent: any }> = ({ content, updateContent }) => {
    const skills: CVSkillGroup[] = content.skills || [];

    const updateGroup = (idx: number, field: keyof CVSkillGroup, value: any) => {
        const updated = [...skills];
        updated[idx] = { ...updated[idx], [field]: value };
        updateContent({ skills: updated });
    };

    const addGroup = () => {
        updateContent({ skills: [...skills, { category: '', items: [''] }] });
    };

    const removeGroup = (idx: number) => {
        updateContent({ skills: skills.filter((_, i) => i !== idx) });
    };

    return (
        <>
            {skills.map((group, i) => (
                <div key={i} className={cardCls}>
                    <button onClick={() => removeGroup(i)} className={deleteBtnCls}><Trash2 size={14} /></button>
                    <div className="space-y-2">
                        <div><label className={labelCls}>Category</label><input className={inputCls} value={group.category} onChange={(e) => updateGroup(i, 'category', e.target.value)} placeholder="Technical, Languages, etc." /></div>
                        <div>
                            <label className={labelCls}>Skills (comma-separated)</label>
                            <input
                                className={inputCls}
                                value={(group.items || []).join(', ')}
                                onChange={(e) => updateGroup(i, 'items', e.target.value.split(',').map((s) => s.trim()))}
                                onBlur={(e) => updateGroup(i, 'items', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
                                placeholder="Excel, QuickBooks, Financial Reporting"
                            />
                        </div>
                    </div>
                </div>
            ))}
            <button onClick={addGroup} className={addBtnCls}><Plus size={14} /> Add skill group</button>
        </>
    );
};

// ============================================================
// Summary Editor
// ============================================================
const SummaryEditor: React.FC<{ content: any; updateContent: any }> = ({ content, updateContent }) => {
    return (
        <div>
            <label className={labelCls}>Professional Summary</label>
            <textarea
                className={inputCls + " min-h-[120px] resize-y"}
                value={content.summary || ''}
                onChange={(e) => updateContent({ summary: e.target.value })}
                placeholder="A brief professional summary highlighting your key strengths and career objectives..."
                rows={5}
            />
            <p className="text-xs text-slate-400 mt-2">Tip: 2-3 sentences that capture your experience and what you bring to a role.</p>
        </div>
    );
};

// ============================================================
// Review View — Shows all sections at a glance
// ============================================================
const ReviewView: React.FC<{ content: any; setEditingSection: (s: CVPhase) => void }> = ({ content, setEditingSection }) => {
    const sections: { id: CVPhase; label: string; hasData: boolean }[] = [
        { id: 'contact', label: 'Contact Details', hasData: !!content.personal?.name },
        { id: 'experience', label: 'Experience', hasData: (content.experience || []).length > 0 },
        { id: 'education', label: 'Education', hasData: (content.education || []).length > 0 },
        { id: 'skills', label: 'Skills', hasData: (content.skills || []).length > 0 },
        { id: 'summary', label: 'Summary', hasData: !!content.summary },
    ];

    return (
        <div className="space-y-3">
            <p className="text-sm text-slate-600 mb-4">Your CV is complete! Click any section below to make final edits before exporting.</p>
            {sections.map((s) => (
                <button
                    key={s.id}
                    onClick={() => setEditingSection(s.id)}
                    className="w-full text-left p-4 bg-white border border-slate-200 rounded-xl hover:border-emerald-300 hover:bg-emerald-50/50 transition-all flex items-center justify-between group"
                >
                    <span className="font-medium text-sm text-slate-700">{s.label}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${s.hasData ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {s.hasData ? '✓ Complete' : 'Add info'}
                    </span>
                </button>
            ))}
        </div>
    );
};
