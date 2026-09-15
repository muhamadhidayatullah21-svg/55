import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  User, 
  Vote, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Sparkles, 
  ChevronRight,
  ShieldCheck,
  Search,
  Clock
} from 'lucide-react';
import { Paslon, AppSettings, VoteReceipt } from '../types';
import { api } from '../services/api';
import { PaslonDetailModal } from './PaslonDetailModal';
import { VoteConfirmModal } from './VoteConfirmModal';
import { VoteReceiptView } from './VoteReceiptView';

interface VoterViewProps {
  settings: AppSettings;
  paslonList: Paslon[];
  antiPeepMode: boolean;
  onRefreshData: () => Promise<void>;
}

export const VoterView: React.FC<VoterViewProps> = ({
  settings,
  paslonList,
  antiPeepMode,
  onRefreshData
}) => {
  // Voter identity state
  const [nama, setNama] = useState<string>('');
  const [kelas, setKelas] = useState<string>('');
  const [isIdentityConfirmed, setIsIdentityConfirmed] = useState<boolean>(false);
  const [isCheckingVoter, setIsCheckingVoter] = useState<boolean>(false);
  const [identityError, setIdentityError] = useState<string | null>(null);

  // Masking state for anti-peep
  const [maskNama, setMaskNama] = useState<boolean>(false);

  // Selected candidate and modals
  const [selectedPaslonDetail, setSelectedPaslonDetail] = useState<Paslon | null>(null);
  const [candidateToVote, setCandidateToVote] = useState<Paslon | null>(null);
  const [isSubmittingVote, setIsSubmittingVote] = useState<boolean>(false);

  // Vote receipt state
  const [voteReceipt, setVoteReceipt] = useState<VoteReceipt | null>(null);

  // Sync antiPeepMode to input masking if toggled from navbar
  useEffect(() => {
    if (antiPeepMode) {
      setMaskNama(true);
    }
  }, [antiPeepMode]);

  const handleVerifyIdentity = async (e: React.FormEvent) => {
    e.preventDefault();
    setIdentityError(null);

    const cleanNama = nama.trim();

    if (!cleanNama) {
      setIdentityError('Harap masukkan Nama Lengkap Anda.');
      return;
    }

    setIsCheckingVoter(true);
    try {
      const res = await api.checkVoter(cleanNama);
      if (res.hasVoted) {
        setIdentityError(
          `Identitas "${cleanNama}" sudah tercatat telah memilih sebelumnya! Kode bukti: ${res.receiptCode || '-'}`
        );
        setIsCheckingVoter(false);
        return;
      }
      if (settings.strictDpt && !res.registeredInDpt) {
        setIdentityError(
          `Nama "${cleanNama}" tidak terdaftar dalam DPT resmi. Hubungi Panitia OSIS.`
        );
        setIsCheckingVoter(false);
        return;
      }
      if (res.kelas) {
        setKelas(res.kelas);
      }
      setIsIdentityConfirmed(true);
    } catch (err: any) {
      setIdentityError(err.message || 'Gagal memvalidasi data pemilih.');
    } finally {
      setIsCheckingVoter(false);
    }
  };

  const handleOpenConfirmModal = (paslon: Paslon) => {
    if (settings.votingStatus === 'closed') {
      alert('Sesi pemilihan saat ini sedang ditutup oleh panitia OSIS.');
      return;
    }
    if (!isIdentityConfirmed) {
      alert('Silakan verifikasi Nama Lengkap Anda terlebih dahulu pada formulir di atas.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setCandidateToVote(paslon);
  };

  const handleConfirmVote = async () => {
    if (!candidateToVote) return;
    setIsSubmittingVote(true);

    try {
      const res = await api.castVote(nama, kelas, candidateToVote.id);
      
      // Fire celebratory confetti!
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // Confetti fallback
      }

      setVoteReceipt(res.receipt);
      setCandidateToVote(null);
      await onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Gagal mengirimkan suara.');
      setCandidateToVote(null);
    } finally {
      setIsSubmittingVote(false);
    }
  };

  const handleResetSession = () => {
    setNama('');
    setKelas('');
    setIsIdentityConfirmed(false);
    setVoteReceipt(null);
    setIdentityError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If voter has just cast vote, show the digital receipt
  if (voteReceipt) {
    return (
      <VoteReceiptView
        receipt={voteReceipt}
        schoolName={settings.schoolName}
        appTitle={settings.appTitle}
        onDone={handleResetSession}
      />
    );
  }

  const isVotingOpen = settings.votingStatus === 'open';

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Hero Banner with Modern Visual Identity */}
      <div className="relative rounded-3xl overflow-hidden border border-cyan-500/20 bg-gradient-to-r from-slate-900 via-[#11192e] to-slate-900 p-6 sm:p-10 shadow-[0_10px_40px_rgba(6,182,212,0.1)]">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Satu Suara Menentukan Masa Depan Sekolah
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            {settings.appTitle}
          </h2>
          <p className="text-sm sm:text-base text-slate-300 mt-2 font-medium">
            Gunakan hak pilihmu secara demokratis, mandiri, dan rahasia. Pilih pemimpin yang siap membawa {settings.schoolName} makin unggul dan berprestasi!
          </p>

          {!isVotingOpen && (
            <div className="mt-4 p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs sm:text-sm flex items-center gap-2.5 font-semibold">
              <Clock className="w-5 h-5 text-rose-400 shrink-0" />
              <span>Sesi pemilihan sedang DITUTUP oleh Panitia OSIS. Anda tetap dapat melihat visi-misi paslon.</span>
            </div>
          )}
        </div>
      </div>

      {/* STEP 1: FORM IDENTITAS PEMILIH (GUEST / SISWA) */}
      <section className="relative rounded-2xl border border-slate-800 bg-[#0f172a]/90 backdrop-blur-md p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-cyan-500 text-slate-950 font-black text-[10px]">
                1
              </span>
              Langkah Pertama: Verifikasi Identitas Pemilih
            </div>
            <h3 className="text-lg font-black text-white mt-1">
              {isIdentityConfirmed ? 'Identitas Pemilih Terverifikasi' : 'Masukkan Nama Lengkap Siswa'}
            </h3>
            <p className="text-xs text-slate-400">
              Tanpa registrasi email atau kata sandi rumit. Cukup ketik nama lengkapmu untuk mencoblos.
            </p>
          </div>

          {/* Privacy Screen Toggle for Sensitive Data on Phone/Laptop */}
          <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800 self-start sm:self-auto">
            <span className="text-[11px] font-semibold text-slate-400 px-2">
              Sensor Layar:
            </span>
            <button
              type="button"
              onClick={() => setMaskNama(!maskNama)}
              className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
                maskNama 
                  ? 'bg-purple-600 text-white shadow-[0_0_10px_rgba(168,85,247,0.4)]' 
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              {maskNama ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>Sensor Nama</span>
            </button>
          </div>
        </div>

        {/* Identity Form or Confirmed State */}
        {isIdentityConfirmed ? (
          <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-r from-emerald-950/30 to-cyan-950/30 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] uppercase font-bold tracking-wider text-emerald-400 block">
                  PEMILIH AKTIF SIAP MEMILIH
                </span>
                <h4 className="text-base font-black text-white">
                  {maskNama ? '••••••••••••••••' : nama}
                </h4>
                <p className="text-xs text-emerald-400 font-medium">
                  Hak suara aktif &bull; Siap memberikan suara
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsIdentityConfirmed(false)}
              className="text-xs text-slate-400 hover:text-white underline underline-offset-2 transition"
            >
              Ubah Identitas / Ganti Siswa
            </button>
          </div>
        ) : (
          <form onSubmit={handleVerifyIdentity} className="space-y-4">
            <div>
              {/* Input Nama Lengkap (Single clean field) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-cyan-400" /> Nama Lengkap Siswa
                  </span>
                  {maskNama && (
                    <span className="text-[10px] text-purple-400 font-normal">Disamarkan</span>
                  )}
                </label>
                <div className="relative">
                  <input
                    type={maskNama ? 'password' : 'text'}
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    placeholder="Contoh: Muhammad Fathir Pratama"
                    autoFocus
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
                  />
                  {maskNama && (
                    <button
                      type="button"
                      onClick={() => setMaskNama(false)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Error Message */}
            {identityError && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{identityError}</span>
              </div>
            )}

            {/* Submit Verification Button */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isCheckingVoter}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.25)] transition cursor-pointer"
              >
                {isCheckingVoter ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                    <span>Memverifikasi Hak Suara...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verifikasi & Lanjut Pilih Paslon</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </section>

      {/* STEP 2: DAFTAR KARTU PASLON GAUL */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-400">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-purple-500 text-slate-950 font-black text-[10px]">
                2
              </span>
              Langkah Kedua: Tentukan Calon Pemimpinmu
            </div>
            <h3 className="text-xl font-black text-white mt-1">
              Kandidat Pasangan Calon Ketua & Wakil Ketua OSIS
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Total {paslonList.length} Paslon Terdaftar
          </span>
        </div>

        {/* Paslon Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paslonList.map((paslon) => (
            <div
              key={paslon.id}
              className="group relative rounded-3xl bg-[#0f172a] border-2 border-slate-800 hover:border-cyan-500/60 transition-all duration-300 flex flex-col overflow-hidden shadow-xl hover:shadow-[0_10px_40px_rgba(6,182,212,0.15)]"
            >
              {/* Top Accent Color Bar */}
              <div 
                className="h-2 w-full transition-all duration-300"
                style={{ backgroundColor: paslon.color || '#06b6d4' }}
              ></div>

              {/* Card Photo Container */}
              <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-slate-900">
                <img
                  src={paslon.foto}
                  alt={paslon.namaKetua}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  referrerPolicy="no-referrer"
                />
                
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-black/30"></div>

                {/* Nomor Urut Badge Besar */}
                <div 
                  className="absolute top-4 left-4 w-12 h-12 rounded-2xl flex items-center justify-center text-slate-950 font-black text-2xl shadow-[0_4px_20px_rgba(0,0,0,0.5)] border-2 border-white/20"
                  style={{ backgroundColor: paslon.color || '#06b6d4' }}
                >
                  {paslon.nomorUrut}
                </div>

                {/* Tagline Badge */}
                <div className="absolute bottom-3 left-4 right-4">
                  <span className="inline-block px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-[11px] font-medium text-cyan-300 italic truncate max-w-full">
                    "{paslon.tagline}"
                  </span>
                </div>
              </div>

              {/* Card Body Information */}
              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    CALON KETUA & WAKIL
                  </span>
                  <h4 className="text-lg font-black text-white leading-snug group-hover:text-cyan-300 transition">
                    {paslon.namaKetua}
                  </h4>
                  <p className="text-xs font-semibold text-slate-300 mt-0.5">
                    Wakil: <span className="text-purple-300">{paslon.namaWakil}</span>
                  </p>

                  <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-400 font-mono">
                    <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      {paslon.kelasKetua}
                    </span>
                    <span>&bull;</span>
                    <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      {paslon.kelasWakil}
                    </span>
                  </div>

                  {/* Visi Teaser */}
                  <div className="mt-3.5 p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 text-xs text-slate-300 line-clamp-2">
                    <strong className="text-cyan-400">Visi: </strong>
                    {paslon.visi}
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => setSelectedPaslonDetail(paslon)}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-700 hover:border-slate-500 transition cursor-pointer"
                  >
                    <span>Lihat Visi, Misi & Proker</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  <button
                    onClick={() => handleOpenConfirmModal(paslon)}
                    disabled={!isVotingOpen}
                    className={`w-full py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-lg ${
                      isVotingOpen
                        ? 'bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-slate-950 shadow-cyan-500/20 cursor-pointer'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    }`}
                  >
                    <Vote className="w-4 h-4 font-black" />
                    <span>PILIH PASLON #{paslon.nomorUrut}</span>
                  </button>
                </div>

              </div>
            </div>
          ))}
        </div>
      </section>

      {/* MODALS */}
      <PaslonDetailModal
        paslon={selectedPaslonDetail}
        onClose={() => setSelectedPaslonDetail(null)}
        onSelectPaslon={handleOpenConfirmModal}
        canVote={isVotingOpen}
      />

      <VoteConfirmModal
        isOpen={Boolean(candidateToVote)}
        paslon={candidateToVote}
        voterNama={nama}
        voterKelas={kelas}
        onClose={() => setCandidateToVote(null)}
        onConfirm={handleConfirmVote}
        isSubmitting={isSubmittingVote}
      />

    </div>
  );
};
