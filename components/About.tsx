import React from 'react';
import { GlassCard } from './GlassCard';
import { ShieldCheck, Target, Heart, Zap } from 'lucide-react';

export const About: React.FC = () => {
    return (
        <div className="animate-fade-in pb-12">
            <header className="mb-8">
                <h2 className="text-4xl font-serif text-bridge-slate mb-2">About The Bridge</h2>
                <p className="text-slate-500 text-lg">Your professional sanctuary for career reinvention.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <GlassCard className="p-8">
                    <h3 className="text-2xl font-serif text-bridge-slate mb-4">Our Mission</h3>
                    <p className="text-slate-600 leading-relaxed mb-6">
                        The Bridge is a high-end, subscription-based career enhancement platform designed to eliminate the "Blank Page Syndrome" and the anxiety of returning to the workforce or pivoting to a higher level.
                    </p>
                    <p className="text-slate-600 leading-relaxed">
                        We believe that career gaps are strategic intervals, not weaknesses. Our technology translates your life experience into executive power, ensuring you are day-one ready for the 2026 workforce.
                    </p>
                </GlassCard>

                <div className="grid grid-cols-1 gap-4">
                    <GlassCard className="flex items-start gap-4 p-6">
                        <div className="p-3 bg-bridge-sage/20 rounded-xl text-bridge-slate">
                            <ShieldCheck size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold text-bridge-slate mb-1">Zero-Friction UX</h4>
                            <p className="text-sm text-slate-500">Designed for busy professionals. Instant load times, 1-tap actions, and a calm, distraction-free aesthetic.</p>
                        </div>
                    </GlassCard>
                    <GlassCard className="flex items-start gap-4 p-6">
                        <div className="p-3 bg-bridge-lilac/30 rounded-xl text-bridge-slate">
                            <Target size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold text-bridge-slate mb-1">AI-Powered Strategy</h4>
                            <p className="text-sm text-slate-500">We don't just format text; we extract value using advanced Chain-of-Thought prompting and semantic analysis.</p>
                        </div>
                    </GlassCard>
                </div>
            </div>

            <h3 className="text-2xl font-serif text-bridge-slate mb-6">Core Values</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <GlassCard className="text-center p-8">
                    <Heart size={32} className="mx-auto text-rose-400 mb-4" />
                    <h4 className="font-bold text-lg mb-2">Empathy First</h4>
                    <p className="text-sm text-slate-500">We understand the vulnerability of career transitions.</p>
                </GlassCard>
                <GlassCard className="text-center p-8">
                    <Zap size={32} className="mx-auto text-amber-400 mb-4" />
                    <h4 className="font-bold text-lg mb-2">Speed to Value</h4>
                    <p className="text-sm text-slate-500">Maximum signal, minimum noise. Get results in seconds.</p>
                </GlassCard>
                <GlassCard className="text-center p-8">
                    <ShieldCheck size={32} className="mx-auto text-bridge-sage mb-4" />
                    <h4 className="font-bold text-lg mb-2">Executive Standard</h4>
                    <p className="text-sm text-slate-500">Every output is polished, professional, and ready for the boardroom.</p>
                </GlassCard>
            </div>
        </div>
    );
};