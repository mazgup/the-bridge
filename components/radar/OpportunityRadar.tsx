import React, { useState, useEffect } from 'react';
import { GlassCard } from '../GlassCard';
import { 
    Radar, MapPin, PoundSterling, Clock, Star, Sparkles, 
    ChevronRight, Activity, ArrowUpRight, CheckCircle, 
    Filter, Heart, ThumbsUp, ThumbsDown, X, Building,
    Briefcase, Zap, Search, SlidersHorizontal, FileText, AlertCircle
} from 'lucide-react';
import { analyzeJobMatch, findOpportunities, JobAnalysis, Opportunity } from '../../services/geminiService';
import { CVData } from '../cv/CVTypes';

interface OpportunityRadarProps {
    cvData: CVData;
}

// --- Mock Data for £25k-£70k Band ---

const MOCK_JOBS: Opportunity[] = [
    {
        id: '1',
        title: 'Marketing Coordinator',
        company: 'TechStart Digital',
        location: 'Remote',
        salary: '£32,000 - £38,000',
        matchScore: 92,
        matchReason: 'Strong alignment with your communication and project coordination skills',
        sector: 'Tech'
    },
    {
        id: '2',
        title: 'Operations Assistant',
        company: 'GreenLeaf Logistics',
        location: 'Hybrid (Manchester)',
        salary: '£28,000 - £32,000',
        matchScore: 87,
        matchReason: 'Your organizational skills and attention to detail match perfectly',
        sector: 'Finance'
    },
    {
        id: '3',
        title: 'Customer Success Manager',
        company: 'SaaSify',
        location: 'Remote',
        salary: '£35,000 - £42,000',
        matchScore: 85,
        matchReason: 'Client-facing experience and problem-solving skills are key matches',
        sector: 'Tech'
    },
    {
        id: '4',
        title: 'Project Coordinator',
        company: 'BuildRight Construction',
        location: 'Hybrid (Birmingham)',
        salary: '£30,000 - £35,000',
        matchScore: 78,
        matchReason: 'Project management fundamentals align with role requirements',
        sector: 'Other'
    },
    {
        id: '5',
        title: 'HR Administrator',
        company: 'PeopleFirst Ltd',
        location: 'Office (Leeds)',
        salary: '£26,000 - £30,000',
        matchScore: 75,
        matchReason: 'Admin experience and interpersonal skills are transferable',
        sector: 'Finance'
    },
    {
        id: '6',
        title: 'Content Coordinator',
        company: 'MediaWave Agency',
        location: 'Remote',
        salary: '£28,000 - £34,000',
        matchScore: 82,
        matchReason: 'Writing skills and attention to detail match content role needs',
        sector: 'Creative'
    }
];

// --- Sub-Components ---

const SalaryFilter = ({ minSalary, maxSalary, onChange }: { 
    minSalary: number, 
    maxSalary: number, 
    onChange: (min: number, max: number) => void 
}) => (
    <div className="flex items-center gap-4 px-4 py-3 bg-white/40 border border-slate-200 rounded-xl">
        <PoundSterling size={16} className="text-slate-400" />
        <div className="flex-1">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>£{minSalary.toLocaleString()}</span>
                <span>£{maxSalary.toLocaleString()}</span>
            </div>
            <input 
                type="range" 
                min="25000" 
                max="70000" 
                step="1000"
                value={maxSalary}
                onChange={(e) => onChange(minSalary, parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-bridge-slate"
            />
        </div>
    </div>
);

const ConfigurationRibbon = ({ 
    salaryRange, 
    onSalaryChange, 
    workType, 
    onWorkTypeChange,
    isSearching
}: { 
    salaryRange: { min: number, max: number },
    onSalaryChange: (min: number, max: number) => void,
    workType: string,
    onWorkTypeChange: (type: string) => void,
    isSearching: boolean
}) => (
    <div className="flex flex-col gap-4 mb-6 animate-slide-down">
        {/* Search & Main Filter */}
        <div className="flex gap-4">
            <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Search roles (e.g. 'Coordinator', 'Assistant', 'Manager')..." 
                    className="w-full pl-12 pr-4 py-3 bg-white/60 backdrop-blur-md border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-bridge-sage/50 text-sm font-medium placeholder-slate-400 shadow-sm"
                />
            </div>
            <button className="px-4 py-3 bg-white/60 border border-slate-200 rounded-2xl text-slate-600 hover:bg-white hover:text-bridge-slate transition-colors shadow-sm">
                <SlidersHorizontal size={20} />
            </button>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap gap-3">
            {/* Salary Range */}
            <div className="flex-1 min-w-[200px]">
                <SalaryFilter 
                    minSalary={salaryRange.min} 
                    maxSalary={salaryRange.max} 
                    onChange={onSalaryChange}
                />
            </div>

            {/* Work Type Toggles */}
            <div className="flex gap-2">
                {['All', 'Remote', 'Hybrid', 'Office'].map(type => (
                    <button
                        key={type}
                        onClick={() => onWorkTypeChange(type)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                            workType === type 
                                ? 'bg-bridge-slate text-white shadow-md' 
                                : 'bg-white/40 border border-slate-200 text-slate-600 hover:bg-white'
                        }`}
                    >
                        <MapPin size={12} /> {type}
                    </button>
                ))}
            </div>
        </div>

        {isSearching && (
            <div className="flex items-center gap-2 text-bridge-sage text-sm">
                <Activity size={14} className="animate-spin" />
                Searching the market for opportunities matching your profile...
            </div>
        )}
    </div>
);

const RadarVisualization = ({ jobs, onSelect, selectedId }: { jobs: Opportunity[], onSelect: (job: Opportunity) => void, selectedId?: string }) => {
    const getPosition = (score: number, sector: string) => {
        const normalizedScore = Math.max(60, Math.min(100, score));
        const distance = 45 - ((normalizedScore - 60) / 40 * 35); 
        
        let baseAngle = 0;
        if (sector === 'Tech') baseAngle = 45;
        if (sector === 'Finance') baseAngle = 135;
        if (sector === 'Public') baseAngle = 225;
        if (sector === 'Creative') baseAngle = 315;
        if (sector === 'Other') baseAngle = 90;

        const jitter = (parseInt(sector, 36) % 60) - 30;
        const angle = (baseAngle + jitter) * (Math.PI / 180);
        
        const x = 50 + (distance * Math.cos(angle));
        const y = 50 + (distance * Math.sin(angle));

        return { x, y };
    };

    return (
        <div className="aspect-square w-full max-w-[350px] mx-auto relative mb-6 group">
            {/* Background Radar Rings */}
            <div className="absolute inset-0 rounded-full border border-slate-300 opacity-30"></div>
            <div className="absolute inset-[15%] rounded-full border border-slate-300 opacity-30"></div>
            <div className="absolute inset-[30%] rounded-full border border-slate-300 opacity-30"></div>
            <div className="absolute inset-[45%] rounded-full border border-bridge-sage/50 bg-bridge-sage/5"></div>

            {/* Quadrant Lines */}
            <div className="absolute top-0 bottom-0 left-1/2 w-px bg-slate-200"></div>
            <div className="absolute left-0 right-0 top-1/2 h-px bg-slate-200"></div>

            {/* Sector Labels */}
            <div className="absolute top-2 right-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tech</div>
            <div className="absolute bottom-2 right-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Finance</div>
            <div className="absolute bottom-2 left-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Public</div>
            <div className="absolute top-2 left-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Creative</div>

            {/* Scanning Animation */}
            <div className="absolute inset-[50%] top-1/2 left-1/2 w-[50%] h-[50%] origin-top-left bg-gradient-to-r from-transparent to-bridge-sage/20 animate-spin-slow rounded-tl-full pointer-events-none" style={{ animationDuration: '4s' }}></div>

            {/* Center - You */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                <div className="relative">
                    <div className="absolute inset-0 bg-bridge-sage rounded-full animate-ping opacity-20"></div>
                    <div className="w-8 h-8 rounded-full bg-bridge-slate flex items-center justify-center text-white text-xs font-bold shadow-lg relative z-10">
                        You
                    </div>
                </div>
            </div>

            {/* Job Dots */}
            {jobs.map((job) => {
                const pos = getPosition(job.matchScore || 70, job.sector || 'Other');
                const isSelected = selectedId === job.id;
                
                return (
                    <button
                        key={job.id}
                        onClick={() => onSelect(job)}
                        className={`absolute w-3 h-3 -ml-1.5 -mt-1.5 rounded-full transition-all duration-300 z-30
                            ${isSelected 
                                ? 'bg-bridge-slate scale-[2.5] shadow-xl ring-4 ring-white/50' 
                                : 'bg-white border-2 border-bridge-sage shadow-md hover:scale-150'}
                        `}
                        style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                    >
                        {isSelected && (
                            <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[6px] font-bold bg-slate-800 text-white px-1 rounded whitespace-nowrap">
                                {job.matchScore}%
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
};

// --- Main Component ---

export const OpportunityRadar: React.FC<OpportunityRadarProps> = ({ cvData }) => {
    const [selectedJob, setSelectedJob] = useState<Opportunity | null>(null);
    const [jobs, setJobs] = useState<Opportunity[]>(MOCK_JOBS);
    const [analyzing, setAnalyzing] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [salaryRange, setSalaryRange] = useState({ min: 25000, max: 70000 });
    const [workType, setWorkType] = useState('All');
    const [jobAnalysis, setJobAnalysis] = useState<JobAnalysis | null>(null);

    // Initial Selection
    useEffect(() => {
        if (!selectedJob && jobs.length > 0) {
            setSelectedJob(jobs[0]);
        }
    }, [jobs]);

    // Search for real opportunities when CV data changes
    useEffect(() => {
        if (cvData.experience.length > 0 || cvData.skills.length > 0) {
            handleSearchJobs();
        }
    }, [cvData.experience, cvData.skills]);

    const handleSearchJobs = async () => {
        setIsSearching(true);
        // In production, this would call the real API
        // const opportunities = await findOpportunities(cvData);
        // setJobs(opportunities.length > 0 ? opportunities : MOCK_JOBS);
        
        // Simulate search delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        setJobs(MOCK_JOBS);
        setIsSearching(false);
    };

    const handleSelectJob = async (job: Opportunity) => {
        if (selectedJob?.id === job.id) return;
        
        setSelectedJob(job);
        setJobAnalysis(null);
        setAnalyzing(true);
        
        const analysis = await analyzeJobMatch(job.title, job.company);
        setJobAnalysis(analysis);
        setAnalyzing(false);
    };

    const filteredJobs = jobs.filter(job => {
        // Filter by salary range
        const jobMinSalary = parseInt(job.salary?.replace(/[^0-9]/g, '') || '0');
        if (jobMinSalary < salaryRange.min || jobMinSalary > salaryRange.max) return false;
        
        // Filter by work type
        if (workType !== 'All') {
            if (!job.location.toLowerCase().includes(workType.toLowerCase())) return false;
        }
        
        return true;
    });

    const hasCVData = cvData.experience.length > 0 || cvData.skills.length > 0;

    return (
        <div className="h-full flex flex-col animate-fade-in pb-12">
             <header className="flex justify-between items-end mb-6">
                <div>
                    <h2 className="text-3xl font-serif text-bridge-slate">Opportunity Radar</h2>
                    <p className="text-slate-500">Find roles in the £25k-£70k range matching your skills</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-full border border-slate-200 text-xs font-medium text-slate-500 shadow-sm">
                    <Activity size={14} className="text-bridge-sage animate-pulse" /> Live Scanning
                </div>
            </header>

            {/* CV Data Warning */}
            {!hasCVData && (
                <GlassCard className="mb-6 border-amber-200 bg-amber-50/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                            <AlertCircle size={20} />
                        </div>
                        <div>
                            <p className="font-bold text-amber-800">Complete Your CV for Better Matches</p>
                            <p className="text-sm text-amber-700">
                                Add your experience and skills in the CV Builder or CV Audit to get personalized job recommendations.
                            </p>
                        </div>
                    </div>
                </GlassCard>
            )}

            <ConfigurationRibbon 
                salaryRange={salaryRange}
                onSalaryChange={(min, max) => setSalaryRange({ min, max })}
                workType={workType}
                onWorkTypeChange={setWorkType}
                isSearching={isSearching}
            />

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden">
                
                {/* LEFT PANE: Radar Visualization */}
                <div className="lg:col-span-5 flex flex-col">
                    <GlassCard className="flex-1 flex flex-col justify-center items-center relative overflow-hidden bg-gradient-to-b from-slate-50/50 to-white/30">
                         <div className="absolute top-4 left-4 z-10">
                            <h3 className="text-sm font-bold text-bridge-slate uppercase tracking-widest flex items-center gap-2">
                                <Radar size={16} /> Market View
                            </h3>
                         </div>
                         <RadarVisualization 
                            jobs={filteredJobs} 
                            onSelect={handleSelectJob} 
                            selectedId={selectedJob?.id} 
                        />
                        <div className="text-center text-xs text-slate-400 max-w-xs mx-auto">
                            <p>Closer to center = higher skill match</p>
                            <p className="mt-1"><strong>{filteredJobs.length}</strong> opportunities in your range</p>
                        </div>
                    </GlassCard>
                </div>

                {/* RIGHT PANE: Job Details */}
                <div className="lg:col-span-7 h-full overflow-y-auto pr-2 custom-scrollbar">
                    {selectedJob ? (
                        <div className="animate-slide-up pb-8">
                            <GlassCard className="relative overflow-hidden border-t-4 border-t-bridge-sage">
                                {/* Header */}
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex gap-4">
                                        <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-xl font-bold text-slate-400">
                                            {selectedJob.company[0]}
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-serif text-slate-800 leading-tight">{selectedJob.title}</h3>
                                            <div className="text-slate-500 font-medium flex items-center gap-2 text-sm mt-1">
                                                <Building size={14} /> {selectedJob.company}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <div className="text-4xl font-serif font-bold text-bridge-slate">{selectedJob.matchScore}%</div>
                                        <div className="text-[10px] text-bridge-sage font-bold uppercase tracking-widest">Match Score</div>
                                    </div>
                                </div>

                                {/* Quick Stats */}
                                <div className="grid grid-cols-3 gap-3 mb-6">
                                    <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100 flex flex-col items-center text-center">
                                        <MapPin size={16} className="text-slate-400 mb-1" />
                                        <span className="text-xs font-bold text-slate-700">{selectedJob.location}</span>
                                    </div>
                                    <div className="bg-emerald-50/80 p-3 rounded-xl border border-emerald-100 flex flex-col items-center text-center">
                                        <PoundSterling size={16} className="text-emerald-500 mb-1" />
                                        <span className="text-xs font-bold text-emerald-700">{selectedJob.salary}</span>
                                    </div>
                                    <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100 flex flex-col items-center text-center">
                                        <Briefcase size={16} className="text-slate-400 mb-1" />
                                        <span className="text-xs font-bold text-slate-700">{selectedJob.sector}</span>
                                    </div>
                                </div>

                                {/* Why You Fit */}
                                <div className="space-y-4 mb-6">
                                    <div className="bg-bridge-sage/10 rounded-xl p-4 border border-bridge-sage/20">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Sparkles size={16} className="text-bridge-sage" />
                                            <h4 className="text-xs font-bold text-bridge-sage uppercase tracking-widest">Why You Fit</h4>
                                        </div>
                                        <p className="text-sm text-slate-700 leading-relaxed font-medium">
                                            {jobAnalysis?.whyFit || selectedJob.matchReason}
                                            {analyzing && <span className="animate-pulse ml-2">...</span>}
                                        </p>
                                    </div>

                                    {jobAnalysis?.gap && (
                                        <div className="bg-amber-50/50 rounded-xl p-4 border border-amber-100">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Zap size={16} className="text-amber-600" />
                                                <h4 className="text-xs font-bold text-amber-600 uppercase tracking-widest">Skill Gap to Bridge</h4>
                                            </div>
                                            <p className="text-sm text-slate-700 leading-relaxed">
                                                {jobAnalysis.gap}
                                            </p>
                                        </div>
                                    )}

                                    {jobAnalysis?.salaryContext && (
                                        <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100">
                                            <div className="flex items-center gap-2 mb-2">
                                                <PoundSterling size={16} className="text-blue-600" />
                                                <h4 className="text-xs font-bold text-blue-600 uppercase tracking-widest">Market Context</h4>
                                            </div>
                                            <p className="text-sm text-slate-700 leading-relaxed">
                                                {jobAnalysis.salaryContext}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3 pt-4 border-t border-slate-100">
                                    <button className="flex-1 bg-white border border-slate-200 text-slate-600 py-3 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                                        <FileText size={16} /> Prep Me
                                    </button>
                                    <button className="flex-1 bg-bridge-slate text-white py-3 rounded-xl text-sm font-bold hover:bg-slate-700 transition-colors shadow-lg flex items-center justify-center gap-2">
                                        Apply <ArrowUpRight size={16} />
                                    </button>
                                </div>
                            </GlassCard>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
                            <Radar size={48} className="mb-4" />
                            <p className="text-sm font-medium">Select an opportunity on the radar</p>
                        </div>
                    )}
                    
                    {/* Job List */}
                    <div className="space-y-3 pb-8">
                         <div className="flex items-center gap-2 mb-2 px-1">
                             <Briefcase size={14} className="text-slate-400" />
                             <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">All Opportunities</h4>
                        </div>
                        {filteredJobs.filter(j => j.id !== selectedJob?.id).map(job => (
                             <div 
                                key={job.id}
                                onClick={() => handleSelectJob(job)}
                                className="bg-white/40 border border-slate-200 p-4 rounded-xl cursor-pointer hover:bg-white hover:border-bridge-sage transition-all flex justify-between items-center group"
                            >
                                <div>
                                    <div className="font-bold text-sm text-slate-700">{job.title}</div>
                                    <div className="text-xs text-slate-500">{job.company} • {job.salary}</div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-bold text-bridge-sage bg-bridge-sage/10 px-2 py-1 rounded-md">{job.matchScore}%</span>
                                    <ChevronRight size={16} className="text-slate-300 group-hover:text-bridge-slate transition-colors" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
