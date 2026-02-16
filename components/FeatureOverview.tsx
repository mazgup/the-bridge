import React from 'react';
import { GlassCard } from './GlassCard';
import { INITIAL_FEATURES } from '../constants';
import { Radar, Mic, ArrowRight } from 'lucide-react';

export const FeatureOverview: React.FC = () => {
    // Combine initial features with hardcoded ones that might be in nav but not feature list
    const allFeatures = [
        ...INITIAL_FEATURES,
        {
            id: 'opportunity-radar',
            title: 'Opportunity Radar',
            description: 'Semantic job matching that uses your "Skill DNA" to find high-compatibility roles in the open and hidden markets.',
            icon: Radar,
            status: 'active',
            actionLabel: 'Scan Market'
        },
        {
            id: 'simulation-lab',
            title: 'Simulation Lab',
            description: 'A low-latency, judgment-free zone to practice interviews, salary negotiations, and pitches with AI personas.',
            icon: Mic,
            status: 'active',
            actionLabel: 'Enter Lab'
        }
    ];

    return (
        <div className="animate-fade-in pb-12">
             <header className="mb-8">
                <h2 className="text-4xl font-serif text-bridge-slate mb-2">Platform Features</h2>
                <p className="text-slate-500 text-lg">A comprehensive guide to your toolkit.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {allFeatures.map((feature, idx) => {
                    const Icon = feature.icon;
                    return (
                        <GlassCard key={idx} className="flex flex-col h-full">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-bridge-slate text-white rounded-xl shadow-lg">
                                    <Icon size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800">{feature.title}</h3>
                            </div>
                            <p className="text-slate-600 leading-relaxed flex-1 mb-6">
                                {feature.description}
                            </p>
                            <div className="pt-4 border-t border-slate-100 flex items-center text-sm font-bold text-bridge-sage">
                                <span className="uppercase tracking-wider">Status: {feature.status}</span>
                            </div>
                        </GlassCard>
                    );
                })}
            </div>
        </div>
    );
};