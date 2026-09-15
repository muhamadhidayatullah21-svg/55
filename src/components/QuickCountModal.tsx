import React from 'react';
import { X, BarChart3, TrendingUp, Users, Radio } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { RekapData } from '../types';

interface QuickCountModalProps {
  isOpen: boolean;
  onClose: () => void;
  rekap: RekapData | null;
  schoolName: string;
}

export const QuickCountModal: React.FC<QuickCountModalProps> = ({
  isOpen,
  onClose,
  rekap,
  schoolName
}) => {
  if (!isOpen || !rekap) return null;

  const chartData = rekap.paslonStats.map((p) => ({
    name: `Paslon #${p.nomorUrut}`,
    suara: p.suara,
    persen: p.persentase,
    ketua: p.namaKetua,
    color: p.color || '#06b6d4'
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0f172a] border border-cyan-500/40 rounded-3xl shadow-[0_10px_60px_rgba(6,182,212,0.2)] overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-[#131f3b] to-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white">
                  Quick Count Perolehan Suara
                </h3>
                <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span> Live
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {schoolName} &bull; Transparansi Rekapitulasi Real-Time
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Total Suara Masuk
              </span>
              <div className="text-2xl font-black text-cyan-400 mt-1">
                {rekap.totalSuaraMasuk}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Total DPT Terdaftar
              </span>
              <div className="text-2xl font-black text-white mt-1">
                {rekap.totalDPT}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Partisipasi
              </span>
              <div className="text-2xl font-black text-purple-400 mt-1">
                {rekap.partisipasiPersen}%
              </div>
            </div>
          </div>

          {/* Bar Chart Visualization */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              Perbandingan Perolehan Suara
            </h4>
            
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                    labelStyle={{ color: '#e2e8f0', fontWeight: 'bold' }}
                    formatter={(val: any, name: any, item: any) => [
                      `${val} Suara (${item.payload.persen}%)`,
                      item.payload.ketua
                    ]}
                  />
                  <Bar dataKey="suara" radius={[8, 8, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Paslon Percentages Cards */}
          <div className="space-y-3">
            {rekap.paslonStats.map((p) => (
              <div
                key={p.id}
                className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <span 
                    className="w-8 h-8 rounded-xl font-black text-slate-950 text-sm flex items-center justify-center shrink-0 shadow-md"
                    style={{ backgroundColor: p.color }}
                  >
                    {p.nomorUrut}
                  </span>
                  <div>
                    <h5 className="font-bold text-white text-sm">
                      {p.namaKetua}
                    </h5>
                    <p className="text-xs text-slate-400">
                      Wakil: {p.namaWakil}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-lg font-black text-white font-mono">
                    {p.persentase}%
                  </div>
                  <span className="text-xs text-slate-400">
                    {p.suara} Suara
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
