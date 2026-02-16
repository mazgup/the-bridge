import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
  onClick?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className = '', 
  interactive = false,
  onClick
}) => {
  return (
    <div 
      onClick={onClick}
      className={`
        bg-white/40 
        backdrop-blur-xl 
        border border-white/50 
        shadow-[0_8px_30px_rgb(0,0,0,0.04)] 
        rounded-3xl 
        p-6 
        transition-all 
        duration-300 
        ease-out
        ${interactive ? 'hover:bg-white/50 hover:scale-[1.01] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};