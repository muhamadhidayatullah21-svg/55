import React, { useRef } from 'react';
import { CheckCircle, Download, Share2, LogOut, ShieldCheck, QrCode, Sparkles } from 'lucide-react';
import { VoteReceipt } from '../types';

interface VoteReceiptViewProps {
  receipt: VoteReceipt;
  schoolName: string;
  appTitle: string;
  onDone: () => void;
}

export const VoteReceiptView: React.FC<VoteReceiptViewProps> = ({
  receipt,
  schoolName,
  appTitle,
  onDone
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(receipt.timestamp).toLocaleString('id-ID', {
    dateStyle: 'full',
    timeStyle: 'medium'
  });

  return (
    <div className="w-full max-w-lg mx-auto py-6 px-4 animate-in zoom-in-95 duration-300">
      
      {/* Success Banner */}
      <div className="text-center mb-6">
        <div className="inline-flex p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.3)] mb-3">
          <CheckCircle className="w-10 h-10 animate-bounce" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Suara Sah Telah Masuk!
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-md mx-auto">
          Terima kasih telah menggunakan hak suaramu untuk masa depan OSIS {schoolName}.
        </p>
      </div>

      {/* Digital Receipt Card (Print-Ready) */}
      <div 
        ref={cardRef}
        className="relative bg-gradient-to-b from-[#131d36] via-[#0f172a] to-[#0a0e1a] border-2 border-cyan-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_15px_60px_rgba(6,182,212,0.2)] overflow-hidden"
      >
        {/* Background Watermark/Pattern */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-56 h-56 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-56 h-56 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Card Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
          <div>
            <div className="flex items-center gap-1.5 text-cyan-400 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" /> BUKTI RESMI HAK SUARA
            </div>
            <h3 className="text-base font-extrabold text-white mt-0.5">{schoolName}</h3>
            <p className="text-[11px] text-slate-400">{appTitle}</p>
          </div>

          <div className="w-12 h-12 rounded-xl bg-slate-900/90 border border-cyan-500/30 flex items-center justify-center text-cyan-300">
            <QrCode className="w-7 h-7" />
          </div>
        </div>

        {/* Voter Details */}
        <div className="space-y-4">
          
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
                Nama Pemilih
              </span>
              <span className="text-sm font-bold text-white block mt-0.5 truncate">
                {receipt.nama}
              </span>
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
                Status Hak Suara
              </span>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-500/30 inline-block mt-0.5">
                Sah & Terverifikasi
              </span>
            </div>
          </div>

          {/* Verification Code Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 to-purple-950/40 border border-cyan-500/30 text-center">
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block mb-1">
              KODE VERIFIKASI DIGITAL (RECEIPT HASH)
            </span>
            <div className="text-base sm:text-lg font-mono font-black text-cyan-400 tracking-wider select-all">
              {receipt.receiptCode}
            </div>
            <span className="text-[10px] text-emerald-400 font-medium inline-flex items-center gap-1 mt-1">
              <CheckCircle className="w-3 h-3" /> Terverifikasi Masuk Database Realtime
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 px-1">
            <span>Waktu Pencoblosan:</span>
            <span className="font-mono text-slate-300">{formattedDate}</span>
          </div>

        </div>

        {/* Card Footer Security note */}
        <div className="mt-5 pt-4 border-t border-dashed border-slate-800 text-center">
          <p className="text-[11px] text-slate-400">
            Simpan atau screenshot bukti digital ini. Suara Anda bersifat <strong className="text-slate-200">Rahasia</strong> dan tidak dapat diakses pihak ketiga.
          </p>
        </div>

      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <button
          onClick={handlePrint}
          className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
        >
          <Download className="w-4 h-4 text-cyan-400" />
          <span>Simpan / Cetak Bukti</span>
        </button>

        <button
          onClick={onDone}
          className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.25)] transition cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Selesai (Ganti Pemilih)</span>
        </button>
      </div>

    </div>
  );
};
