import React from 'react';
import { NavItem } from '../types';
import { APP_NAME } from '../constants';
import { LogOut, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  navItems: NavItem[];
  activePath: string;
  onNavigate: (path: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ navItems, activePath, onNavigate, isOpen, setIsOpen }) => {
  const { user, signInWithGoogle, logout } = useAuth();

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar Container */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-72 h-full
        bg-white/60 backdrop-blur-2xl border-r border-white/50
        flex flex-col
        transition-transform duration-300 ease-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div
          className="p-8 pb-4 cursor-pointer group"
          onClick={() => {
            onNavigate('/');
            setIsOpen(false);
          }}
        >
          <h1 className="font-serif text-3xl text-bridge-slate tracking-tight flex items-center gap-2 group-hover:opacity-80 transition-opacity">
            <span className="w-2 h-8 bg-bridge-sage rounded-full block"></span>
            {APP_NAME}
          </h1>
          <p className="text-xs text-slate-500 uppercase tracking-widest mt-2 ml-4 font-medium opacity-60">
            Professional Sanctuary
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-8 space-y-2">
          {navItems.map((item) => {
            const isActive = activePath === item.path;
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => {
                  onNavigate(item.path);
                  setIsOpen(false);
                }}
                className={`
                  w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-200 group
                  ${isActive
                    ? 'bg-bridge-slate text-white shadow-lg shadow-bridge-slate/20'
                    : 'text-slate-500 hover:bg-white/50 hover:text-bridge-slate'}
                `}
              >
                <Icon size={20} className={isActive ? 'text-bridge-sage' : 'text-slate-400 group-hover:text-bridge-slate'} strokeWidth={1.5} />
                <span className={`text-sm font-medium tracking-wide ${isActive ? 'font-semibold' : ''}`}>
                  {item.label}
                </span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-bridge-sage"></div>
                )}
              </button>
            );
          })}
        </nav>

        {/* User / Footer */}
        <div className="p-6 border-t border-slate-100">
          {user ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 px-2">
                <img src={user.photoURL || ''} alt={user.displayName || 'User'} className="w-8 h-8 rounded-full border border-slate-200" />
                <div className="overflow-hidden">
                  <div className="text-sm font-medium text-slate-700 truncate">{user.displayName}</div>
                  <div className="text-xs text-slate-400 truncate">{user.email}</div>
                </div>
              </div>
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-red-500 transition-colors rounded-xl hover:bg-red-50/50"
              >
                <LogOut size={18} strokeWidth={1.5} />
                <span className="text-sm font-medium">Sign Out</span>
              </button>
            </div>
          ) : (
            <button
              onClick={signInWithGoogle}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-bridge-slate text-white rounded-xl hover:bg-slate-700 transition-colors shadow-sm"
            >
              <LogIn size={18} strokeWidth={1.5} />
              <span className="text-sm font-medium">Sign In with Google</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
};