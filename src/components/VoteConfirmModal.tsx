import React, { useState, useEffect } from 'react';
import { ShieldAlert, Check, X, Lock, CheckCircle2 } from 'lucide-react';
import { Paslon } from '../types';

interface VoteConfirmModalProps {
  isOpen: boolean;
  paslon: Paslon | null;
  voterNama: string;
  voterKelas: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isSubmitting: boolean;
}

export const VoteConfirmModal: React.FC<VoteConfirmModalProps> = ({
  isOpen,
  paslon,
  voterNama,
  voterKelas,
  onClose,
  onConfirm,
  isSubmitting
}) => {
  const [countdown, setCountdown] = useState<number>(2);

  useEffect(() => {
    if (isOpen) {
      setCountdown(2);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isOpen]);

  if (!isOpen || !paslon) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#0f172a] border-2 border-cyan-500/50 rounded-2xl shadow-[0_10px_60px_rgba(6,182,212,0.25)] overflow-hidden">
        
        {/* Top Warning Banner */}
        <div className="p-4 bg-gradient-to-r from-amber-500/20 via-cyan-500/20 to-purple-500/20 border-b border-slate-800 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/20 text-amber-300">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Konfirmasi Hak Suara Anda</h3>
            <p className="text-xs text-slate-300">Pilihan bersifat final dan tidak dapat diubah!</p>
          </div>
        </div>

        {/* Content Details */}
        <div className="p-6 space-y-5 text-center">
          
          <div className="text-xs text-slate-400">
            Anda akan memberikan 1 suara sah atas nama:
            <div className="mt-1 font-mono font-bold text-sm text-cyan-300 bg-slate-900/90 py-1.5 px-3 rounded-lg border border-slate-800 inline-block">
              {voterNama} &bull; {voterKelas}
            </div>
          </div>

          {/* Chosen Candidate Card Preview */}
          <div 
            className="p-4 rounded-xl border-2 bg-gradient-to-b from-slate-900/90 to-slate-950 flex flex-col items-center gap-3"
            style={{ borderColor: paslon.color }}
          >
            <div className="relative">
              <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-white/20 shadow-md">
                <img
                  src={paslon.foto}
                  alt={paslon.namaKetua}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span 
                className="absolute -top-2 -left-2 w-8 h-8 rounded-lg text-slate-950 font-black text-base flex items-center justify-center shadow-lg"
                style={{ backgroundColor: paslon.color }}
              >
                {paslon.nomorUrut}
              </span>
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                PILIHAN ANDA:
              </span>
              <h4 className="text-base font-black text-white mt-0.5">
                {paslon.namaKetua}
              </h4>
              <p className="text-xs text-slate-300">
                & {paslon.namaWakil}
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-400 italic">
            "Pastikan Anda memilih dengan hati nurani demi kemajuan SMK Lentera Bangsa 2."
          </p>

        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
          >
            Batal
          </button>
          
          <button
            onClick={onConfirm}
            disabled={countdown > 0 || isSubmitting}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition ${
              countdown > 0 || isSubmitting
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : 'bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.3)] cursor-pointer'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                <span>Menyimpan Suara...</span>
              </>
            ) : countdown > 0 ? (
              <>
                <Lock className="w-3.5 h-3.5" />
                <span>Kunci Pilihan ({countdown}s)</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4 font-black" />
                <span>Ya, Kirim Suara!</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
