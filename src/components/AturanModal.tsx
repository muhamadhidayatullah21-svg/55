import React from 'react';
import { X, CheckCircle2, AlertTriangle, ShieldCheck, FileCheck, Smartphone, UserCheck } from 'lucide-react';

interface AturanModalProps {
  isOpen: boolean;
  onClose: () => void;
  schoolName: string;
}

export const AturanModal: React.FC<AturanModalProps> = ({ isOpen, onClose, schoolName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0f172a] border border-cyan-500/30 rounded-2xl shadow-[0_10px_50px_rgba(6,182,212,0.15)] overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-[#131d36] to-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-wide">
                Tata Cara & Aturan Pemilihan Suara
              </h3>
              <p className="text-xs text-slate-400">
                Pesta Demokrasi Siswa {schoolName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-300">
          
          {/* Asas Luber Jurdil Card */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/30 to-purple-950/30 border border-cyan-500/20 flex items-start gap-3.5">
            <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400 shrink-0 mt-0.5">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-base mb-1">
                Asas Pemilihan OSIS: LUBER & JURDIL
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Pemilihan diselenggarakan secara <span className="text-cyan-300 font-bold">Langsung, Umum, Bebas, Rahasia, Jujur,</span> dan <span className="text-purple-300 font-bold">Adil</span>. Gunakan hak suaramu dengan bijak dan tanpa paksaan dari siapa pun.
              </p>
            </div>
          </div>

          {/* 5 Langkah Mudah Memilih */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-3 flex items-center gap-2">
              <Smartphone className="w-4 h-4" /> 5 Langkah Mudah Mencoblos Secara Online:
            </h4>
            
            <div className="grid gap-3">
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex gap-3 items-start">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-cyan-500 text-black font-black text-xs shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  <h5 className="font-semibold text-white text-sm">Isi Identitas Pemilih</h5>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Ketik Nama Lengkap dan pilih Kelas jurusanmu di form verifikasi pemilih.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex gap-3 items-start">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-cyan-500 text-black font-black text-xs shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  <h5 className="font-semibold text-white text-sm">Kenali Visi, Misi & Proker Paslon</h5>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Klik tombol "Lihat Visi & Misi" pada kartu paslon untuk membaca program unggulan mereka.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex gap-3 items-start">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-cyan-500 text-black font-black text-xs shrink-0 mt-0.5">
                  3
                </span>
                <div>
                  <h5 className="font-semibold text-white text-sm">Tentukan Pilihan & Klik "PILIH"</h5>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Klik tombol "Pilih Paslon Ini" pada kandidat jagoanmu.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex gap-3 items-start">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-cyan-500 text-black font-black text-xs shrink-0 mt-0.5">
                  4
                </span>
                <div>
                  <h5 className="font-semibold text-white text-sm">Konfirmasi Suara</h5>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Muncul layar konfirmasi kunci pilihan. Pastikan pilihanmu sudah mantap karena suara tidak dapat diubah setelah dikirim.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex gap-3 items-start">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500 text-black font-black text-xs shrink-0 mt-0.5">
                  5
                </span>
                <div>
                  <h5 className="font-semibold text-emerald-300 text-sm">Dapatkan Bukti Digital Suara Sah</h5>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Simpan atau screenshot "Kartu Bukti Suara Sah" ber-kode unik sebagai bukti kamu telah berpartisipasi.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Aturan Ketat Larangan */}
          <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h5 className="text-xs font-bold text-rose-300 uppercase tracking-wide mb-1">
                Peringatan Ketentuan Sistem:
              </h5>
              <ul className="text-xs text-rose-200/80 space-y-1 list-disc list-inside">
                <li>Satu identitas siswa hanya dapat memberikan suara <strong>1 (satu) kali</strong>.</li>
                <li>Sistem secara otomatis mendeteksi dan menolak pencoblosan ganda (double voting).</li>
                <li>Dilarang keras memalsukan identitas teman atau memakai nama orang lain.</li>
              </ul>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/70 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-slate-950 font-bold text-sm shadow-[0_0_20px_rgba(6,182,212,0.3)] transition"
          >
            Saya Mengerti & Siap Memilih
          </button>
        </div>

      </div>
    </div>
  );
};
