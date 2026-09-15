import React from 'react';
import { X, Target, CheckCircle, Sparkles, Award, Vote } from 'lucide-react';
import { Paslon } from '../types';

interface PaslonDetailModalProps {
  paslon: Paslon | null;
  onClose: () => void;
  onSelectPaslon: (paslon: Paslon) => void;
  canVote: boolean;
}

export const PaslonDetailModal: React.FC<PaslonDetailModalProps> = ({
  paslon,
  onClose,
  onSelectPaslon,
  canVote
}) => {
  if (!paslon) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0f172a] border border-cyan-500/40 rounded-2xl shadow-[0_10px_50px_rgba(6,182,212,0.2)] overflow-hidden max-h-[92vh] flex flex-col">
        
        {/* Header with Photo & Candidate Names */}
        <div className="relative p-6 bg-gradient-to-r from-slate-900 via-[#14203d] to-slate-900 border-b border-slate-800">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition z-10"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-center gap-5">
            {/* Number & Image Badge */}
            <div className="relative shrink-0">
              <div 
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 shadow-lg"
                style={{ borderColor: paslon.color }}
              >
                <img
                  src={paslon.foto}
                  alt={paslon.namaKetua}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div 
                className="absolute -top-3 -left-3 w-10 h-10 rounded-xl flex items-center justify-center text-slate-950 font-black text-xl shadow-lg"
                style={{ backgroundColor: paslon.color }}
              >
                {paslon.nomorUrut}
              </div>
            </div>

            {/* Names & Tagline */}
            <div className="text-center sm:text-left flex-1">
              <span 
                className="inline-block px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider mb-1.5"
                style={{ backgroundColor: `${paslon.color}20`, color: paslon.color, border: `1px solid ${paslon.color}40` }}
              >
                Kandidat Paslon #{paslon.nomorUrut}
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                {paslon.namaKetua}
              </h3>
              <p className="text-sm text-cyan-300 font-medium mt-0.5">
                Wakil: {paslon.namaWakil}
              </p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2 text-xs text-slate-400">
                <span className="bg-slate-800/90 px-2 py-0.5 rounded border border-slate-700 font-mono">
                  {paslon.kelasKetua}
                </span>
                <span>&bull;</span>
                <span className="bg-slate-800/90 px-2 py-0.5 rounded border border-slate-700 font-mono">
                  {paslon.kelasWakil}
                </span>
              </div>
              <p className="text-xs text-slate-300 italic mt-2.5 bg-slate-950/40 p-2 rounded-lg border border-slate-800">
                "{paslon.tagline}"
              </p>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-300">
          
          {/* VISI */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
              <Target className="w-4 h-4" /> Visi Utama:
            </h4>
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-200 leading-relaxed font-medium">
              {paslon.visi}
            </div>
          </div>

          {/* MISI */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" /> Misi Kerja:
            </h4>
            <div className="grid gap-2.5">
              {paslon.misi.map((m, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="text-xs sm:text-sm text-slate-300">{m}</span>
                </div>
              ))}
            </div>
          </div>

          {/* PROGRAM KERJA UNGGULAN */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Program Kerja Unggulan:
            </h4>
            <div className="grid sm:grid-cols-2 gap-2.5">
              {paslon.programKerja.map((proker, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-900/90 border border-amber-500/20 flex items-start gap-2.5">
                  <Award className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-200 font-medium">{proker}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Modal Action Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition"
          >
            Tutup
          </button>
          
          <button
            onClick={() => {
              onClose();
              onSelectPaslon(paslon);
            }}
            disabled={!canVote}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition shadow-lg ${
              canVote 
                ? 'bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-slate-950 shadow-cyan-500/20 cursor-pointer'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Vote className="w-4 h-4" />
            <span>Pilih Paslon Nomor {paslon.nomorUrut} Ini</span>
          </button>
        </div>

      </div>
    </div>
  );
};
