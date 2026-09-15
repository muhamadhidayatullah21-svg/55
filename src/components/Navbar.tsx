import React, { useState } from 'react';
import { ShieldCheck, Eye, EyeOff, BookOpen, BarChart3, Lock, Users, Radio, LogOut } from 'lucide-react';
import { AppSettings } from '../types';

interface NavbarProps {
  settings: AppSettings;
  activeUsers: number;
  antiPeepMode: boolean;
  onToggleAntiPeep: () => void;
  onOpenAturan: () => void;
  onOpenQuickCount: () => void;
  isAdminLoggedIn: boolean;
  onOpenAdminLogin: () => void;
  onAdminLogout: () => void;
  viewMode: 'voter' | 'admin';
  onChangeViewMode: (mode: 'voter' | 'admin') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  activeUsers,
  antiPeepMode,
  onToggleAntiPeep,
  onOpenAturan,
  onOpenQuickCount,
  isAdminLoggedIn,
  onOpenAdminLogin,
  onAdminLogout,
  viewMode,
  onChangeViewMode
}) => {
  const isVotingOpen = settings.votingStatus === 'open';

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#0f172a]/85 border-b border-cyan-500/20 shadow-[0_4px_24px_rgba(6,182,212,0.08)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & School Branding */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onChangeViewMode('voter')}>
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full blur opacity-50 group-hover:opacity-100 transition duration-300"></div>
              <div className="relative w-12 h-12 rounded-full overflow-hidden bg-slate-900 border border-cyan-400/40 flex items-center justify-center p-1">
                <img
                  src={settings.logoUrl}
                  alt={settings.schoolName}
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                  E-VOTING OSIS
                </span>
                <span className="text-xs text-slate-400 font-mono hidden sm:inline-block">
                  {settings.periode}
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-black text-white tracking-tight group-hover:text-cyan-300 transition flex items-center gap-1.5">
                {settings.schoolName}
              </h1>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Live Online Users Indicator */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300 font-mono">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>{activeUsers} Online</span>
            </div>

            {/* Voting Session Status Badge */}
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${
              isVotingOpen 
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]' 
                : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
            }`}>
              <Radio className={`w-3.5 h-3.5 ${isVotingOpen ? 'animate-pulse text-emerald-400' : 'text-rose-400'}`} />
              <span className="hidden sm:inline">{isVotingOpen ? 'Sesi Dibuka' : 'Sesi Ditutup'}</span>
              <span className="sm:hidden">{isVotingOpen ? 'Buka' : 'Tutup'}</span>
            </div>

            {/* Mode Privasi Layar (Anti-Intip) Button */}
            <button
              onClick={onToggleAntiPeep}
              title={antiPeepMode ? 'Nonaktifkan Mode Privasi Layar' : 'Aktifkan Mode Privasi Layar (Anti-Intip)'}
              className={`p-2 sm:px-3 sm:py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition ${
                antiPeepMode
                  ? 'bg-purple-600 text-white border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                  : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:border-purple-500/50 hover:text-purple-300'
              }`}
            >
              {antiPeepMode ? <EyeOff className="w-4 h-4 text-purple-200" /> : <Eye className="w-4 h-4 text-slate-400" />}
              <span className="hidden md:inline">
                {antiPeepMode ? 'Privasi: ON' : 'Anti-Intip'}
              </span>
            </button>

            {/* Aturan Pemilihan */}
            <button
              onClick={onOpenAturan}
              className="p-2 sm:px-3 sm:py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 hover:border-cyan-500/50 text-slate-300 hover:text-cyan-300 text-xs font-medium flex items-center gap-1.5 transition"
            >
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span className="hidden md:inline">Tata Cara</span>
            </button>

            {/* Quick Count Button (if allowed) */}
            {settings.enableLiveQuickCount && (
              <button
                onClick={onOpenQuickCount}
                className="p-2 sm:px-3 sm:py-1.5 rounded-lg bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-500/40 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 shadow-[0_0_12px_rgba(6,182,212,0.15)] transition"
              >
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                <span className="hidden sm:inline">Quick Count</span>
              </button>
            )}

            {/* Admin Toggle / Logout */}
            {isAdminLoggedIn ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onChangeViewMode(viewMode === 'admin' ? 'voter' : 'admin')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition flex items-center gap-1.5 ${
                    viewMode === 'admin'
                      ? 'bg-purple-600 text-white border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                      : 'bg-slate-800 text-purple-300 border-purple-500/40 hover:bg-purple-950/40'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{viewMode === 'admin' ? 'Buka Web Pemilih' : 'Dashboard Admin'}</span>
                </button>
                <button
                  onClick={onAdminLogout}
                  title="Keluar dari Akun Admin"
                  className="p-2 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/40 text-rose-300 transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAdminLogin}
                className="p-2 sm:px-3 sm:py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 hover:border-slate-500 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition"
              >
                <Lock className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">Admin</span>
              </button>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};
