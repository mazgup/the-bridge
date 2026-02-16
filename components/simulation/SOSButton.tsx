import React, { useState, useEffect, useRef } from 'react';
import { LifeBuoy, X } from 'lucide-react';

export const SOSButton: React.FC = () => {
    const [isActive, setIsActive] = useState(false);
    const [progress, setProgress] = useState(0);
    const timerRef = useRef<number | null>(null);
    const [showModal, setShowModal] = useState(false);

    const startPress = () => {
        timerRef.current = window.setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(timerRef.current!);
                    setShowModal(true);
                    return 0;
                }
                return prev + 5; // Fill in ~1s
            });
        }, 50);
    };

    const endPress = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        setProgress(0);
    };

    return (
        <>
            {/* Floating Trigger */}
            <div className="fixed bottom-8 right-8 z-50 flex flex-col items-center gap-2">
                 {/* Progress Ring Overlay */}
                <div 
                    className="relative group cursor-pointer"
                    onMouseDown={startPress}
                    onMouseUp={endPress}
                    onMouseLeave={endPress}
                    onTouchStart={startPress}
                    onTouchEnd={endPress}
                >
                    <svg className="w-16 h-16 transform -rotate-90 pointer-events-none absolute -top-1 -left-1">
                        <circle cx="32" cy="32" r="30" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-transparent" />
                        <circle 
                            cx="32" cy="32" r="30" 
                            stroke="currentColor" 
                            strokeWidth="4" 
                            fill="transparent" 
                            className="text-bridge-lilac transition-all duration-75 ease-linear"
                            strokeDasharray={188}
                            strokeDashoffset={188 - (188 * progress) / 100}
                        />
                    </svg>
                    
                    <div className="w-14 h-14 bg-bridge-slate rounded-full flex items-center justify-center shadow-2xl hover:scale-105 transition-transform">
                        <LifeBuoy className="text-white animate-pulse-slow" size={24} />
                    </div>
                </div>
                <span className="text-[10px] font-bold text-slate-400 bg-white/80 backdrop-blur px-2 py-0.5 rounded-full shadow-sm">Hold for S.O.S</span>
            </div>

            {/* Power Reset Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] bg-slate-900/95 flex flex-col items-center justify-center p-8 text-center animate-fade-in">
                    <button 
                        onClick={() => setShowModal(false)}
                        className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors"
                    >
                        <X size={32} />
                    </button>

                    <div className="max-w-2xl w-full">
                        <h2 className="text-bridge-lilac uppercase tracking-widest font-bold mb-8 animate-slide-down">Power Reset Active</h2>
                        
                        {/* Breathing Animation */}
                        <div className="w-64 h-64 mx-auto bg-gradient-to-br from-bridge-sage to-emerald-600 rounded-full blur-2xl animate-breath mb-8 opacity-40"></div>
                        
                        <div className="relative z-10 -mt-56 mb-12">
                            <h3 className="text-3xl md:text-5xl font-serif text-white leading-tight mb-8">
                                "The gap was a strategic choice.<br/>Not a skill loss."
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                                <div className="bg-white/10 p-4 rounded-xl border border-white/10">
                                    <div className="text-2xl font-bold text-bridge-sage mb-1">10y+</div>
                                    <div className="text-sm text-slate-300">Executive Experience</div>
                                </div>
                                <div className="bg-white/10 p-4 rounded-xl border border-white/10">
                                    <div className="text-2xl font-bold text-bridge-sage mb-1">£2M</div>
                                    <div className="text-sm text-slate-300">Revenue Managed</div>
                                </div>
                                <div className="bg-white/10 p-4 rounded-xl border border-white/10">
                                    <div className="text-2xl font-bold text-bridge-sage mb-1">Top 5%</div>
                                    <div className="text-sm text-slate-300">Industry Performance</div>
                                </div>
                            </div>
                        </div>

                        <p className="text-slate-400 text-sm animate-pulse">Breathe in... Breathe out...</p>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes breath {
                    0%, 100% { transform: scale(0.8); opacity: 0.3; }
                    50% { transform: scale(1.2); opacity: 0.6; }
                }
                .animate-breath {
                    animation: breath 8s infinite ease-in-out;
                }
            `}</style>
        </>
    );
};