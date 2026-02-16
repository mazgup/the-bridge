import React, { useState } from 'react';
import { User, Feature } from '../types';
import { GlassCard } from './GlassCard';
import { ArrowRight, Sparkles, Clock, Bell, TrendingUp, Radar, Activity, Search, FileText, Mic, BookOpen } from 'lucide-react';
import { CVData } from './cv/CVTypes';

interface DashboardProps {
  user: User;
  features: Feature[];
  onNavigate: (path: string) => void;
  cvData: CVData;
}

const ReadinessGauge = ({ score, size = 60, stroke = 6 }: { score: number, size?: number, stroke?: number }) => {
  const radius = size / 2;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg
        height={size}
        width={size}
        className="rotate-[-90deg] transition-all duration-1000 ease-out"
      >
        <circle
          stroke="#e2e8f0"
          strokeWidth={stroke}
          fill="transparent"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke="#9FBFA0" // bridge-sage
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset }}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>
      <div className="absolute text-center">
        <span className="font-serif text-bridge-slate font-bold" style={{ fontSize: size * 0.25 }}>{score}%</span>
      </div>
    </div>
  );
};

export const Dashboard: React.FC<DashboardProps> = ({ user, features, onNavigate, cvData }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Calculate Readiness based on CV, Interview Prep, and Briefings
  const calculateReadiness = () => {
    // CV Score (40% weight) - based on CV completion
    let cvScore = 0;
    if (cvData.personal_info.name) cvScore += 15;
    if (cvData.targetRole) cvScore += 15;
    if (cvData.summary) cvScore += 20;
    if (cvData.experience.length > 0) cvScore += 30;
    if (cvData.skills.length > 0) cvScore += 20;
    cvScore = Math.min(cvScore, 100);

    // Interview Prep (35% weight) - placeholder until user completes simulations
    const interviewScore = 40; // Base score, increases with practice

    // Briefings (25% weight) - placeholder
    const briefingsScore = 30; // Base score, increases with knowledge briefs generated

    const totalScore = Math.round(
      (cvScore * 0.4) +
      (interviewScore * 0.35) +
      (briefingsScore * 0.25)
    );

    return { cvScore, interviewScore, briefingsScore, totalScore };
  };

  const readiness = calculateReadiness();

  // Filter features based on search
  const filteredFeatures = features.filter(feature =>
    feature.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    feature.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFeatureClick = (feature: Feature) => {
    if (feature.id === 'cv-audit') {
      onNavigate('/cv-audit');
    } else if (feature.id === 'cv-builder') {
      onNavigate('/cv-builder');
    } else if (feature.id === 'opportunity-radar') {
      onNavigate('/radar');
    } else if (feature.id === 'return-hub') {
      onNavigate('/return-hub');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Welcome Section */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
          <h2 className="text-4xl md:text-5xl font-serif text-bridge-slate mb-2">
            Good morning, {user.name}
          </h2>
          <p className="text-slate-500 text-lg font-light">
            Ready to build your bridge to what's next?
          </p>
        </div>
        <div className="flex gap-3">
          <button className="p-3 rounded-full bg-white/40 hover:bg-white/80 transition-colors backdrop-blur-md border border-white/50 text-slate-600 shadow-sm relative">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-400 rounded-full border-2 border-white"></span>
          </button>
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-md">
            <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
          </div>
        </div>
      </header>

      {/* Quick Actions / Priority */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Building the Bridge - CV, Interview Prep, Briefings */}
        <GlassCard className="flex flex-col justify-between h-52 relative overflow-hidden">
          <div className="flex justify-between items-start z-10">
            <div>
              <div className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1 flex items-center gap-1">
                <TrendingUp size={12} /> Building the Bridge
              </div>
              <div className="text-3xl font-serif text-bridge-slate font-bold mb-1">{readiness.totalScore}%</div>
              <div className="text-xs text-slate-400 font-medium">Day-One Ready</div>
            </div>
            <div className="relative">
              <ReadinessGauge score={readiness.totalScore} size={72} stroke={6} />
            </div>
          </div>

          {/* Breakdown Mini-Bars - CV, Interview Prep, Briefings */}
          <div className="grid grid-cols-3 gap-3 mt-4 z-10">
            <div className="flex flex-col gap-1 group relative cursor-help">
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-bridge-sage rounded-full transition-all duration-500" style={{ width: `${readiness.cvScore}%` }}></div>
              </div>
              <div className="flex items-center gap-1">
                <FileText size={10} className="text-slate-400" />
                <span className="text-[9px] text-slate-400 font-bold uppercase">CV</span>
              </div>
            </div>
            <div className="flex flex-col gap-1 group relative cursor-help">
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-400 rounded-full transition-all duration-500" style={{ width: `${readiness.interviewScore}%` }}></div>
              </div>
              <div className="flex items-center gap-1">
                <Mic size={10} className="text-slate-400" />
                <span className="text-[9px] text-slate-400 font-bold uppercase">Interview</span>
              </div>
            </div>
            <div className="flex flex-col gap-1 group relative cursor-help">
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full transition-all duration-500" style={{ width: `${readiness.briefingsScore}%` }}></div>
              </div>
              <div className="flex items-center gap-1">
                <BookOpen size={10} className="text-slate-400" />
                <span className="text-[9px] text-slate-400 font-bold uppercase">Briefings</span>
              </div>
            </div>
          </div>

          {/* Background Decoration */}
          <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-gradient-to-br from-bridge-sage/20 to-transparent rounded-full blur-2xl"></div>
        </GlassCard>

        {/* Interview Simulation Lab - Promoted Card */}
        <GlassCard
          interactive
          onClick={() => onNavigate('/simulation')}
          className="!bg-bridge-slate !text-white !opacity-100 md:col-span-1 h-52 flex flex-col justify-between group border-none cursor-pointer relative overflow-hidden shadow-xl"
        >
          <div className="flex justify-between items-start z-10">
            <div className="p-2 bg-white/10 rounded-xl text-bridge-lilac backdrop-blur-sm">
              <Mic size={20} />
            </div>
          </div>
          <div className="z-10">
            <div className="text-slate-300 text-xs font-bold uppercase tracking-widest mb-2">Recommended</div>
            <div className="text-xl font-serif text-white flex items-center justify-between">
              Interview Simulation Lab
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                <ArrowRight size={16} />
              </div>
            </div>
            <p className="text-slate-400 text-xs mt-2 leading-relaxed">Practice high-stakes interviews with AI feedback and generate interview cheat sheets.</p>
          </div>
          <div className="absolute bottom-0 right-0 w-full h-full bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
        </GlassCard>
      </div>

      {/* Toolkit Section */}
      <div className="pt-4">
        <h3 className="text-xl font-serif text-slate-700 mb-6 flex items-center gap-3">
          Your Toolkit
          <span className="h-px flex-1 bg-slate-200"></span>
        </h3>

        {filteredFeatures.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {filteredFeatures.map((feature) => {
              const Icon = feature.icon;
              const isReturnHub = feature.id === 'return-hub';

              return (
                <GlassCard
                  key={feature.id}
                  interactive={feature.status !== 'locked'}
                  onClick={() => handleFeatureClick(feature)}
                  className={`group relative overflow-hidden ${isReturnHub ? 'border-bridge-lilac/50 bg-gradient-to-br from-white/40 to-bridge-lilac/10' : ''}`}
                >
                  <div className="flex items-start gap-5">
                    <div className={`p-4 rounded-2xl transition-colors ${feature.status === 'active' ? (isReturnHub ? 'bg-bridge-lilac text-bridge-slate' : 'bg-bridge-slate text-white') : 'bg-slate-100 text-slate-500 group-hover:bg-bridge-sage/20 group-hover:text-bridge-slate'}`}>
                      <Icon size={24} strokeWidth={1.5} />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <h4 className="text-lg font-semibold text-slate-800 group-hover:text-bridge-slate transition-colors">{feature.title}</h4>
                        {feature.status === 'coming_soon' && (
                          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 border border-slate-200 px-2 py-1 rounded-full">Coming Soon</span>
                        )}
                      </div>
                      <p className="text-slate-500 text-sm leading-relaxed mb-4">
                        {feature.description}
                      </p>

                      {feature.status !== 'locked' && (
                        <button className="text-sm font-medium text-slate-600 group-hover:text-bridge-slate flex items-center gap-2 group-hover:gap-3 transition-all">
                          {feature.actionLabel || 'Open'} <ArrowRight size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400">
            <p>No tools found matching "{searchTerm}".</p>
          </div>
        )}
      </div>
    </div>
  );
};
