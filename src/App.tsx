import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { VoterView } from './components/VoterView';
import { AdminDashboard } from './components/AdminDashboard';
import { AturanModal } from './components/AturanModal';
import { QuickCountModal } from './components/QuickCountModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AppSettings, Paslon, RekapData } from './types';
import { DEFAULT_SETTINGS, DEFAULT_PASLON } from './data/defaultData';
import { api } from './services/api';
import { ShieldCheck, Heart, Sparkles } from 'lucide-react';

export default function App() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [paslonList, setPaslonList] = useState<Paslon[]>(DEFAULT_PASLON);
  const [rekap, setRekap] = useState<RekapData | null>(null);
  const [activeUsers, setActiveUsers] = useState<number>(1);

  // View state: 'voter' or 'admin'
  const [viewMode, setViewMode] = useState<'voter' | 'admin'>('voter');

  // Anti-peep mode (privacy screen)
  const [antiPeepMode, setAntiPeepMode] = useState<boolean>(false);

  // Modals
  const [isAturanOpen, setIsAturanOpen] = useState<boolean>(false);
  const [isQuickCountOpen, setIsQuickCountOpen] = useState<boolean>(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState<boolean>(false);

  // Admin Auth Token
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    return localStorage.getItem('lb2_admin_token') || null;
  });

  // Client ID for heartbeat
  const [clientId] = useState<string>(() => {
    let cid = localStorage.getItem('lb2_client_id');
    if (!cid) {
      cid = 'client_' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem('lb2_client_id', cid);
    }
    return cid;
  });

  // Fetch all live data
  const refreshData = useCallback(async () => {
    try {
      const [settRes, paslonRes, rekapRes] = await Promise.all([
        api.getSettings(),
        api.getPaslon(),
        api.getRekap()
      ]);
      setSettings(settRes);
      setActiveUsers(settRes.activeUsers || 1);
      setPaslonList(paslonRes);
      setRekap(rekapRes);
    } catch (err) {
      console.error('Error refreshing election data:', err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Periodic polling for real-time multi-guest sync & heartbeat
  useEffect(() => {
    // Send heartbeat immediately
    api.sendHeartbeat(clientId).then(res => {
      if (res?.activeUsers) setActiveUsers(res.activeUsers);
    });

    const heartbeatInterval = setInterval(() => {
      api.sendHeartbeat(clientId).then(res => {
        if (res?.activeUsers) setActiveUsers(res.activeUsers);
      });
    }, 12000);

    // Poll live votes and status every 4 seconds
    const pollInterval = setInterval(() => {
      refreshData();
    }, 4000);

    return () => {
      clearInterval(heartbeatInterval);
      clearInterval(pollInterval);
    };
  }, [clientId, refreshData]);

  const handleAdminLoginSuccess = (token: string) => {
    setAdminToken(token);
    localStorage.setItem('lb2_admin_token', token);
    setViewMode('admin');
  };

  const handleAdminLogout = () => {
    setAdminToken(null);
    localStorage.removeItem('lb2_admin_token');
    setViewMode('voter');
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col justify-between selection:bg-cyan-500 selection:text-black">
      
      {/* Top Fixed / Sticky Navigation Bar */}
      <div>
        <Navbar
          settings={settings}
          activeUsers={activeUsers}
          antiPeepMode={antiPeepMode}
          onToggleAntiPeep={() => setAntiPeepMode(!antiPeepMode)}
          onOpenAturan={() => setIsAturanOpen(true)}
          onOpenQuickCount={() => setIsQuickCountOpen(true)}
          isAdminLoggedIn={Boolean(adminToken)}
          onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
          onAdminLogout={handleAdminLogout}
          viewMode={viewMode}
          onChangeViewMode={(mode) => {
            if (mode === 'admin' && !adminToken) {
              setIsAdminLoginOpen(true);
            } else {
              setViewMode(mode);
            }
          }}
        />

        {/* Main View Mode: Voter or Admin */}
        <main className="pb-16">
          {viewMode === 'admin' && adminToken ? (
            <AdminDashboard
              token={adminToken}
              settings={settings}
              rekap={rekap}
              paslonList={paslonList}
              onRefreshData={refreshData}
              onBackToVoter={() => setViewMode('voter')}
            />
          ) : (
            <VoterView
              settings={settings}
              paslonList={paslonList}
              antiPeepMode={antiPeepMode}
              onRefreshData={refreshData}
            />
          )}
        </main>
      </div>

      {/* Global Modals */}
      <AturanModal
        isOpen={isAturanOpen}
        onClose={() => setIsAturanOpen(false)}
        schoolName={settings.schoolName}
      />

      <QuickCountModal
        isOpen={isQuickCountOpen}
        onClose={() => setIsQuickCountOpen(false)}
        rekap={rekap}
        schoolName={settings.schoolName}
      />

      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onSuccess={handleAdminLoginSuccess}
        schoolName={settings.schoolName}
      />

      {/* Modern High-Tech School Footer */}
      <footer className="w-full border-t border-slate-800/80 bg-[#0a0e17] py-8 px-4 sm:px-6 lg:px-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-900 border border-cyan-500/30 p-0.5">
              <img
                src={settings.logoUrl}
                alt={settings.schoolName}
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <p className="font-bold text-white">
                {settings.schoolName} &bull; {settings.appTitle}
              </p>
              <p className="text-[11px] text-slate-500">
                Sistem E-Voting OSIS Digital &bull; Asas LUBER JURDIL &bull; {settings.periode}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1.5 text-cyan-400 bg-cyan-950/40 px-2.5 py-1 rounded-full border border-cyan-500/20 font-mono">
              <ShieldCheck className="w-3.5 h-3.5" /> 1 Vote Per Siswa
            </span>
            <span className="text-slate-500">
              Dikembangkan untuk Pesta Demokrasi Siswa SMK Lentera Bangsa 2
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}
