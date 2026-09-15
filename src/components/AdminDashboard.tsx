import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { 
  BarChart3, 
  Users, 
  UserCheck, 
  Vote, 
  Settings, 
  FileSpreadsheet, 
  Printer, 
  Trash2, 
  Plus, 
  Edit, 
  Upload, 
  Download, 
  Check, 
  AlertTriangle, 
  RefreshCw, 
  Key, 
  School, 
  Lock, 
  Unlock, 
  Radio, 
  Eye, 
  EyeOff, 
  ArrowUpRight,
  Globe,
  Sparkles,
  Search,
  CheckCircle,
  XCircle,
  HelpCircle
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, PieChart, Pie, Legend } from 'recharts';
import { AppSettings, Paslon, DPTItem, RekapData } from '../types';
import { DEFAULT_KELAS_LIST } from '../data/defaultData';
import { api } from '../services/api';

interface AdminDashboardProps {
  token: string;
  settings: AppSettings;
  rekap: RekapData | null;
  paslonList: Paslon[];
  onRefreshData: () => Promise<void>;
  onBackToVoter: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  token,
  settings,
  rekap,
  paslonList,
  onRefreshData,
  onBackToVoter
}) => {
  // Navigation tabs: 'rekap' | 'paslon' | 'dpt' | 'settings' | 'hosting'
  const [activeTab, setActiveTab] = useState<'rekap' | 'paslon' | 'dpt' | 'settings' | 'hosting'>('rekap');

  // Loading and alerts
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // --- DPT STATE ---
  const [dptItems, setDptItems] = useState<DPTItem[]>([]);
  const [dptSearch, setDptSearch] = useState<string>('');
  const [dptKelasFilter, setDptKelasFilter] = useState<string>('ALL');
  const [dptStatusFilter, setDptStatusFilter] = useState<string>('ALL');
  const [isAddingDpt, setIsAddingDpt] = useState<boolean>(false);
  const [newDptNama, setNewDptNama] = useState<string>('');
  const [newDptKelas, setNewDptKelas] = useState<string>('');
  const [editingDpt, setEditingDpt] = useState<DPTItem | null>(null);
  const excelInputRef = useRef<HTMLInputElement>(null);

  // --- PASLON STATE ---
  const [isPaslonModalOpen, setIsPaslonModalOpen] = useState<boolean>(false);
  const [editingPaslon, setEditingPaslon] = useState<Paslon | null>(null);
  const [paslonForm, setPaslonForm] = useState<{
    nomorUrut: number;
    namaKetua: string;
    namaWakil: string;
    kelasKetua: string;
    kelasWakil: string;
    foto: string;
    tagline: string;
    visi: string;
    misiText: string;
    prokerText: string;
    color: string;
  }>({
    nomorUrut: 1,
    namaKetua: '',
    namaWakil: '',
    kelasKetua: '',
    kelasWakil: '',
    foto: '',
    tagline: '',
    visi: '',
    misiText: '',
    prokerText: '',
    color: '#06b6d4'
  });
  const paslonPhotoInputRef = useRef<HTMLInputElement>(null);

  // --- SETTINGS STATE ---
  const [settingsForm, setSettingsForm] = useState<AppSettings>({ ...settings });
  const [logoPreview, setLogoPreview] = useState<string>(settings.logoUrl);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // --- PASSWORD CHANGE STATE ---
  const [oldPassword, setOldPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  // --- DANGER ACTION MODAL ---
  const [dangerAction, setDangerAction] = useState<{
    type: 'reset_votes' | 'reset_dpt' | 'reset_paslon';
    title: string;
    description: string;
  } | null>(null);

  // Fetch DPT when tab changes
  const fetchDPT = async () => {
    try {
      const res = await api.getDPT(token, {
        search: dptSearch,
        kelas: dptKelasFilter === 'ALL' ? '' : dptKelasFilter,
        status: dptStatusFilter === 'ALL' ? '' : dptStatusFilter
      });
      setDptItems(res.items);
    } catch (e: any) {
      console.error(e);
    }
  };

  React.useEffect(() => {
    if (activeTab === 'dpt') {
      fetchDPT();
    }
  }, [activeTab, dptSearch, dptKelasFilter, dptStatusFilter]);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  // --- EXPORT REKAPITULASI EXCEL ---
  const handleExportExcel = () => {
    if (!rekap) return;
    try {
      const wb = XLSX.utils.book_new();

      // Sheet 1: Perolehan Suara Paslon
      const paslonSheetData = rekap.paslonStats.map((p) => ({
        'No. Urut': p.nomorUrut,
        'Nama Calon Ketua': p.namaKetua,
        'Nama Calon Wakil': p.namaWakil,
        'Total Perolehan Suara': p.suara,
        'Persentase (%)': `${p.persentase}%`
      }));
      const wsPaslon = XLSX.utils.json_to_sheet(paslonSheetData);
      XLSX.utils.book_append_sheet(wb, wsPaslon, 'Rekap Suara Paslon');

      // Sheet 2: Partisipasi Per Kelas
      const kelasSheetData = rekap.kelasStats.map((k) => ({
        'Kelas / Jurusan': k.kelas,
        'Total Pemilih': k.totalPemilih,
        'Sudah Memilih': k.sudahMemilih,
        'Belum Memilih': k.totalPemilih - k.sudahMemilih,
        'Partisipasi (%)': `${k.persentase}%`
      }));
      const wsKelas = XLSX.utils.json_to_sheet(kelasSheetData);
      XLSX.utils.book_append_sheet(wb, wsKelas, 'Partisipasi Kelas');

      // Sheet 3: Ringkasan Umum
      const summaryData = [
        { Parameter: 'Nama Sekolah', Nilai: settings.schoolName },
        { Parameter: 'Judul Pemilihan', Nilai: settings.appTitle },
        { Parameter: 'Periode', Nilai: settings.periode },
        { Parameter: 'Waktu Ekspor', Nilai: new Date().toLocaleString('id-ID') },
        { Parameter: 'Total DPT', Nilai: rekap.totalDPT },
        { Parameter: 'Total Suara Sah Masuk', Nilai: rekap.totalSuaraMasuk },
        { Parameter: 'Tingkat Partisipasi', Nilai: `${rekap.partisipasiPersen}%` },
        { Parameter: 'Status Pemilihan', Nilai: settings.votingStatus.toUpperCase() }
      ];
      const wsSummary = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, wsSummary, 'Ringkasan');

      XLSX.writeFile(wb, `Hasil_Voting_OSIS_${settings.schoolName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`);
      showNotification('success', 'File Excel rekapitulasi berhasil diunduh.');
    } catch (e: any) {
      showNotification('error', 'Gagal mengekspor data ke Excel.');
    }
  };

  // --- PRINT / EXPORT PDF ---
  const handlePrintPDF = () => {
    window.print();
  };

  // --- TEMPLATE EXCEL DPT DOWNLOAD ---
  const handleDownloadTemplateDPT = () => {
    const templateData = [
      { Nama: 'Ahmad Fauzi', Kelas: 'XII RPL 1' },
      { Nama: 'Siti Nurhaliza', Kelas: 'XII RPL 1' },
      { Nama: 'Rian Hidayat', Kelas: 'XI TKJ 1' },
      { Nama: 'Dewi Lestari', Kelas: 'X DKV 2' },
      { Nama: 'Bagus Prasetyo', Kelas: 'XI TKR 1' },
      { Nama: 'Anisa Rahmawati', Kelas: 'XII AKL 2' },
    ];
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(templateData);
    XLSX.utils.book_append_sheet(wb, ws, 'Template_DPT');
    XLSX.writeFile(wb, 'Template_Import_DPT_SMK_Lentera_Bangsa_2.xlsx');
  };

  // --- IMPORT EXCEL DPT ---
  const handleImportExcelDPT = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const firstSheetName = wb.SheetNames[0];
        const rawJson: any[] = XLSX.utils.sheet_to_json(wb.Sheets[firstSheetName]);

        if (!rawJson || rawJson.length === 0) {
          showNotification('error', 'File Excel kosong atau tidak terbaca.');
          return;
        }

        const formattedList = rawJson.map((r) => ({
          nama: r.Nama || r.nama || r.NAMA || r['Nama Siswa'] || '',
          kelas: r.Kelas || r.kelas || r.KELAS || r.Jurusan || r['Kelas / Jurusan'] || ''
        })).filter(item => item.nama && item.kelas);

        if (formattedList.length === 0) {
          showNotification('error', 'Kolom "Nama" dan "Kelas" tidak ditemukan di dalam file Excel.');
          return;
        }

        setIsLoading(true);
        const res = await api.importDPTExcel(token, formattedList);
        showNotification('success', res.message);
        await fetchDPT();
        await onRefreshData();
      } catch (err: any) {
        showNotification('error', err.message || 'Gagal membaca file Excel.');
      } finally {
        setIsLoading(false);
        if (excelInputRef.current) excelInputRef.current.value = '';
      }
    };
    reader.readAsBinaryString(file);
  };

  // --- PASLON ACTIONS ---
  const handleOpenAddPaslon = () => {
    setEditingPaslon(null);
    setPaslonForm({
      nomorUrut: paslonList.length + 1,
      namaKetua: '',
      namaWakil: '',
      kelasKetua: '',
      kelasWakil: '',
      foto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
      tagline: '',
      visi: '',
      misiText: '',
      prokerText: '',
      color: '#06b6d4'
    });
    setIsPaslonModalOpen(true);
  };

  const handleOpenEditPaslon = (paslon: Paslon) => {
    setEditingPaslon(paslon);
    setPaslonForm({
      nomorUrut: paslon.nomorUrut,
      namaKetua: paslon.namaKetua,
      namaWakil: paslon.namaWakil,
      kelasKetua: paslon.kelasKetua,
      kelasWakil: paslon.kelasWakil,
      foto: paslon.foto,
      tagline: paslon.tagline,
      visi: paslon.visi,
      misiText: paslon.misi.join('\n'),
      prokerText: paslon.programKerja.join('\n'),
      color: paslon.color || '#06b6d4'
    });
    setIsPaslonModalOpen(true);
  };

  const handleSavePaslon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paslonForm.namaKetua || !paslonForm.nomorUrut) {
      showNotification('error', 'Nomor urut dan nama calon ketua wajib diisi.');
      return;
    }

    const payload = {
      nomorUrut: paslonForm.nomorUrut,
      namaKetua: paslonForm.namaKetua,
      namaWakil: paslonForm.namaWakil,
      kelasKetua: paslonForm.kelasKetua,
      kelasWakil: paslonForm.kelasWakil,
      foto: paslonForm.foto,
      tagline: paslonForm.tagline,
      visi: paslonForm.visi,
      misi: paslonForm.misiText.split('\n').map(s => s.trim()).filter(Boolean),
      programKerja: paslonForm.prokerText.split('\n').map(s => s.trim()).filter(Boolean),
      color: paslonForm.color
    };

    setIsLoading(true);
    try {
      if (editingPaslon) {
        await api.updatePaslon(token, editingPaslon.id, payload);
        showNotification('success', 'Data paslon berhasil diperbarui.');
      } else {
        await api.createPaslon(token, payload);
        showNotification('success', 'Paslon baru berhasil ditambahkan.');
      }
      setIsPaslonModalOpen(false);
      await onRefreshData();
    } catch (err: any) {
      showNotification('error', err.message || 'Gagal menyimpan paslon.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePaslon = async (id: string) => {
    if (!confirm('Yakin ingin menghapus paslon ini?')) return;
    try {
      await api.deletePaslon(token, id);
      showNotification('success', 'Paslon berhasil dihapus.');
      await onRefreshData();
    } catch (err: any) {
      showNotification('error', err.message || 'Gagal menghapus paslon.');
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setPaslonForm(prev => ({ ...prev, foto: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  // --- SAVE SETTINGS ---
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.updateSettings(token, {
        ...settingsForm,
        logoUrl: logoPreview
      });
      showNotification('success', 'Pengaturan aplikasi dan logo berhasil diperbarui.');
      await onRefreshData();
    } catch (err: any) {
      showNotification('error', err.message || 'Gagal menyimpan pengaturan.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // --- CHANGE ADMIN PASSWORD ---
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showNotification('error', 'Konfirmasi password baru tidak cocok.');
      return;
    }
    if (newPassword.length < 6) {
      showNotification('error', 'Password baru minimal 6 karakter.');
      return;
    }
    setIsLoading(true);
    try {
      await api.adminChangePassword(token, oldPassword, newPassword);
      showNotification('success', 'Password admin berhasil diperbarui!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      showNotification('error', err.message || 'Gagal mengubah kata sandi.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- DANGER RESET CONFIRMATION ---
  const executeDangerAction = async () => {
    if (!dangerAction) return;
    setIsLoading(true);
    try {
      if (dangerAction.type === 'reset_votes') {
        await api.resetAllVotes(token);
        showNotification('success', 'Semua perolehan suara berhasil di-reset!');
      } else if (dangerAction.type === 'reset_dpt') {
        await api.resetAllDPT(token);
        showNotification('success', 'Semua data DPT berhasil dikosongkan.');
        await fetchDPT();
      } else if (dangerAction.type === 'reset_paslon') {
        await api.resetAllPaslon(token);
        showNotification('success', 'Semua data paslon berhasil dikosongkan.');
      }
      setDangerAction(null);
      await onRefreshData();
    } catch (err: any) {
      showNotification('error', err.message || 'Operasi gagal.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner & Control Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-[#0f172a] border border-purple-500/30 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-cyan-500 p-0.5 shadow-lg">
            <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
              <School className="w-7 h-7 text-purple-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-500/30">
                PANEL KONTROL RESMI
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {settings.periode}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-0.5">
              Dashboard Admin E-Voting {settings.schoolName}
            </h2>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Toggle Voting Status Quick Action */}
          <button
            onClick={async () => {
              const newStatus = settings.votingStatus === 'open' ? 'closed' : 'open';
              await api.updateSettings(token, { votingStatus: newStatus });
              await onRefreshData();
              showNotification('success', `Sesi pemilihan sekarang: ${newStatus === 'open' ? 'DIBUKA' : 'DITUTUP'}`);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
              settings.votingStatus === 'open'
                ? 'bg-rose-950/60 hover:bg-rose-900 border border-rose-500/50 text-rose-300'
                : 'bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300'
            }`}
          >
            {settings.votingStatus === 'open' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
            <span>{settings.votingStatus === 'open' ? 'Tutup Sesi Voting' : 'Buka Sesi Voting'}</span>
          </button>

          <button
            onClick={onBackToVoter}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <span>Buka Web Pemilih</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Global Notification Feedback */}
      {feedback && (
        <div className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2.5 animate-in slide-in-from-top duration-200 ${
          feedback.type === 'success' 
            ? 'bg-emerald-950/70 border border-emerald-500/50 text-emerald-300'
            : 'bg-rose-950/70 border border-rose-500/50 text-rose-300'
        }`}>
          {feedback.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Top Highlight Statistics Cards */}
      {rekap && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800">
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
              <Vote className="w-4 h-4 text-cyan-400" /> Suara Sah Masuk
            </span>
            <div className="text-3xl font-black text-cyan-400 mt-2 font-mono">
              {rekap.totalSuaraMasuk}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Dari total {rekap.totalDPT} DPT
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800">
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4 text-purple-400" /> Total DPT Pemilih
            </span>
            <div className="text-3xl font-black text-purple-400 mt-2 font-mono">
              {rekap.totalDPT}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Siswa/i terdaftar
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800">
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-emerald-400" /> Partisipasi Suara
            </span>
            <div className="text-3xl font-black text-emerald-400 mt-2 font-mono">
              {rekap.partisipasiPersen}%
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Tingkat kehadiran pemilih
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800">
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
              <Radio className="w-4 h-4 text-amber-400" /> Status Pemilihan
            </span>
            <div className={`text-xl font-black mt-2 uppercase font-mono ${
              settings.votingStatus === 'open' ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {settings.votingStatus === 'open' ? 'Sesi Terbuka' : 'Sesi Ditutup'}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              {settings.strictDpt ? 'Mode DPT Ketat Aktif' : 'Terbuka Semua Siswa'}
            </span>
          </div>
        </div>
      )}

      {/* Main Navigation Tabs */}
      <div className="flex border-b border-slate-800 overflow-x-auto gap-2 pb-1">
        <button
          onClick={() => setActiveTab('rekap')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition cursor-pointer ${
            activeTab === 'rekap'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Rekapitulasi Real-Time</span>
        </button>

        <button
          onClick={() => setActiveTab('paslon')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition cursor-pointer ${
            activeTab === 'paslon'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Vote className="w-4 h-4" />
          <span>Manajemen Paslon ({paslonList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('dpt')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition cursor-pointer ${
            activeTab === 'dpt'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Daftar Pemilih / DPT</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Pengaturan & Logo Sekolah</span>
        </button>

        <button
          onClick={() => setActiveTab('hosting')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition cursor-pointer ${
            activeTab === 'hosting'
              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Panduan Hosting Online</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: REKAPITULASI REAL-TIME */}
      {/* ========================================================================= */}
      {activeTab === 'rekap' && rekap && (
        <div className="space-y-6">
          
          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Rekap Suara Terkoneksi Database Server Realtime
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleExportExcel}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Export Excel (.xlsx)</span>
              </button>

              <button
                onClick={handlePrintPDF}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Printer className="w-4 h-4 text-cyan-400" />
                <span>Cetak / Simpan PDF</span>
              </button>

              <button
                onClick={() => setDangerAction({
                  type: 'reset_votes',
                  title: 'Reset / Hapus Semua Suara Masuk?',
                  description: 'Tindakan ini akan mengosongkan semua perolehan suara menjadi 0 dan mengembalikan status semua pemilih menjadi "Belum Memilih".'
                })}
                className="px-3.5 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-500/40 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Reset Semua Suara</span>
              </button>
            </div>
          </div>

          {/* Graphical Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Bar Chart: Suara per Paslon */}
            <div className="lg:col-span-2 p-6 rounded-3xl bg-[#0f172a] border border-slate-800">
              <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400 mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" /> Perolehan Suara Paslon (Real-Time)
              </h3>
              
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={rekap.paslonStats} margin={{ top: 20, right: 20, left: -15, bottom: 10 }}>
                    <XAxis dataKey="nomorUrut" stroke="#64748b" tickFormatter={(val) => `Paslon #${val}`} />
                    <YAxis stroke="#64748b" allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                      formatter={(val: any, name: any, item: any) => [
                        `${val} Suara (${item.payload.persentase}%)`,
                        item.payload.namaKetua
                      ]}
                    />
                    <Bar dataKey="suara" radius={[8, 8, 0, 0]}>
                      {rekap.paslonStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || '#06b6d4'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pie Chart: Persentase Suara */}
            <div className="p-6 rounded-3xl bg-[#0f172a] border border-slate-800 flex flex-col justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-purple-400 mb-4 flex items-center gap-2">
                <Vote className="w-4 h-4" /> Distribusi Persentase (%)
              </h3>

              <div className="h-56 w-full">
                {rekap.totalSuaraMasuk > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={rekap.paslonStats}
                        dataKey="suara"
                        nameKey="namaKetua"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={5}
                      >
                        {rekap.paslonStats.map((entry, index) => (
                          <Cell key={`pie-${index}`} fill={entry.color || '#06b6d4'} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                        formatter={(val: any, name: any, item: any) => [`${val} Suara (${item.payload.persentase}%)`, item.payload.namaKetua]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-slate-500">
                    Belum ada suara masuk
                  </div>
                )}
              </div>

              {/* Legend List */}
              <div className="space-y-2 mt-2 pt-3 border-t border-slate-800">
                {rekap.paslonStats.map((p) => (
                  <div key={p.id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: p.color }}></span>
                      <span className="text-slate-300 font-medium truncate">#{p.nomorUrut} {p.namaKetua}</span>
                    </div>
                    <span className="font-bold text-white font-mono shrink-0">{p.persentase}%</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Detailed Breakdown per Paslon Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {rekap.paslonStats.map((p) => (
              <div
                key={p.id}
                className="p-5 rounded-2xl bg-[#0f172a] border-2 flex items-center justify-between shadow-lg"
                style={{ borderColor: `${p.color}40` }}
              >
                <div className="flex items-center gap-3.5">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-slate-950 font-black text-xl shadow-md"
                    style={{ backgroundColor: p.color }}
                  >
                    {p.nomorUrut}
                  </div>
                  <div>
                    <h4 className="font-black text-white text-base leading-tight">
                      {p.namaKetua}
                    </h4>
                    <p className="text-xs text-slate-400">
                      & {p.namaWakil}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-black text-white font-mono">
                    {p.suara}
                  </div>
                  <span className="text-xs font-bold text-cyan-400">
                    {p.persentase}% Suara
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Partisipasi per Kelas Table */}
          <div className="p-6 rounded-3xl bg-[#0f172a] border border-slate-800">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" /> Partisipasi Suara Berdasarkan Kelas / Jurusan
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {rekap.kelasStats.map((k) => (
                <div key={k.kelas} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white font-mono">{k.kelas}</span>
                    <span className="font-bold text-cyan-400">{k.persentase}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 transition-all duration-500"
                      style={{ width: `${Math.min(100, k.persentase)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Sudah memilih: {k.sudahMemilih}</span>
                    <span>Total siswa: {k.totalPemilih}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live Recent Votes Stream */}
          <div className="p-6 rounded-3xl bg-[#0f172a] border border-slate-800">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
              <Radio className="w-4 h-4 text-cyan-400 animate-pulse" /> Log Aktivitas Suara Siswa Terkini (Anonim & Aman)
            </h3>
            
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {rekap.recentVotes.length > 0 ? (
                rekap.recentVotes.map((v) => (
                  <div key={v.id} className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="font-medium text-slate-300">{v.namaMasked}</span>
                      <span className="text-slate-500">&bull;</span>
                      <span className="text-cyan-400 font-mono">{v.kelas}</span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {new Date(v.timestamp).toLocaleTimeString('id-ID')}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-xs text-slate-500">
                  Belum ada riwayat suara pada sesi ini.
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: MANAJEMEN PASLON (CRUD) */}
      {/* ========================================================================= */}
      {activeTab === 'paslon' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Daftar Kandidat Pasangan Calon (Paslon)
              </h3>
              <p className="text-xs text-slate-400">
                Kelola nomor urut, foto, visi, misi, dan program kerja unggulan.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleOpenAddPaslon}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Paslon Baru</span>
              </button>

              <button
                onClick={() => setDangerAction({
                  type: 'reset_paslon',
                  title: 'Hapus Semua Paslon?',
                  description: 'Tindakan ini akan mengosongkan seluruh data kandidat paslon dari sistem.'
                })}
                className="px-3.5 py-2.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Hapus Semua Paslon</span>
              </button>

              <button
                onClick={async () => {
                  await api.restoreDefaultPaslon(token);
                  await onRefreshData();
                  showNotification('success', 'Contoh data Paslon SMK Lentera Bangsa 2 berhasil dipulihkan!');
                }}
                className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
                title="Kembalikan data paslon default sekolah"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Paslon Cards List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paslonList.map((p) => (
              <div
                key={p.id}
                className="rounded-3xl bg-[#0f172a] border-2 border-slate-800 p-5 flex flex-col justify-between space-y-4 shadow-xl"
                style={{ borderColor: `${p.color}50` }}
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-950 font-black text-lg shadow-md shrink-0"
                      style={{ backgroundColor: p.color }}
                    >
                      {p.nomorUrut}
                    </div>
                    <div className="truncate">
                      <h4 className="font-bold text-white text-base truncate">
                        {p.namaKetua}
                      </h4>
                      <p className="text-xs text-slate-400 truncate">
                        Wakil: {p.namaWakil}
                      </p>
                    </div>
                  </div>

                  <div className="relative h-44 w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-800">
                    <img
                      src={p.foto}
                      alt={p.namaKetua}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md text-xs font-bold text-cyan-400 font-mono">
                      {p.voteCount || 0} Suara
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex gap-2 text-slate-400 font-mono">
                      <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">{p.kelasKetua}</span>
                      <span>&bull;</span>
                      <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">{p.kelasWakil}</span>
                    </div>
                    <p className="text-slate-300 italic line-clamp-2">
                      "{p.tagline}"
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => handleOpenEditPaslon(p)}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Edit Paslon</span>
                  </button>

                  <button
                    onClick={() => handleDeletePaslon(p.id)}
                    className="p-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-500/30 transition cursor-pointer"
                    title="Hapus paslon"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>
            ))}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: DAFTAR PEMILIH TETAP (DPT) */}
      {/* ========================================================================= */}
      {activeTab === 'dpt' && (
        <div className="space-y-6">
          
          {/* Action and Import Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Manajemen Data Pemilih / DPT
              </h3>
              <p className="text-xs text-slate-400">
                Unggah file Excel DPT sekolah atau input manual nama & kelas siswa.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Import Excel Button */}
              <input
                type="file"
                ref={excelInputRef}
                onChange={handleImportExcelDPT}
                accept=".xlsx, .xls, .csv"
                className="hidden"
              />
              <button
                onClick={() => excelInputRef.current?.click()}
                disabled={isLoading}
                className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Excel Siswa</span>
              </button>

              {/* Template Download */}
              <button
                onClick={handleDownloadTemplateDPT}
                className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                title="Unduh format Excel DPT yang sesuai"
              >
                <Download className="w-4 h-4 text-cyan-400" />
                <span>Template Excel</span>
              </button>

              {/* Add Manual Single Voter */}
              <button
                onClick={() => setIsAddingDpt(!isAddingDpt)}
                className="px-3.5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Manual</span>
              </button>

              {/* Reset All DPT */}
              <button
                onClick={() => setDangerAction({
                  type: 'reset_dpt',
                  title: 'Hapus Semua Data Pemilih (DPT)?',
                  description: 'Tindakan ini akan menghapus semua daftar pemilih tetap dari database sekolah.'
                })}
                className="px-3.5 py-2.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Hapus Semua DPT</span>
              </button>

              <button
                onClick={async () => {
                  await api.restoreDefaultDPT(token);
                  await fetchDPT();
                  await onRefreshData();
                  showNotification('success', 'DPT contoh berhasil dipulihkan.');
                }}
                className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
                title="Kembalikan DPT contoh"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Add Manual Form (Collapsible) */}
          {isAddingDpt && (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/30 to-slate-900 border border-purple-500/40 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-2">
                <Plus className="w-4 h-4" /> Tambah Pemilih Baru Manual
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Nama Lengkap Siswa"
                  value={newDptNama}
                  onChange={(e) => setNewDptNama(e.target.value)}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-purple-500"
                />
                <input
                  type="text"
                  placeholder="Kelas / Jurusan (Contoh: XI RPL 1)"
                  value={newDptKelas}
                  onChange={(e) => setNewDptKelas(e.target.value)}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-purple-500"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingDpt(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (!newDptNama || !newDptKelas) {
                      showNotification('error', 'Nama dan Kelas wajib diisi');
                      return;
                    }
                    try {
                      await api.createDPT(token, newDptNama, newDptKelas);
                      showNotification('success', 'Pemilih berhasil ditambahkan');
                      setNewDptNama('');
                      setNewDptKelas('');
                      setIsAddingDpt(false);
                      await fetchDPT();
                      await onRefreshData();
                    } catch (e: any) {
                      showNotification('error', e.message);
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold"
                >
                  Simpan Pemilih
                </button>
              </div>
            </div>
          )}

          {/* Search and Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Cari nama pemilih..."
                value={dptSearch}
                onChange={(e) => setDptSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            <select
              value={dptKelasFilter}
              onChange={(e) => setDptKelasFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">Semua Kelas</option>
              {DEFAULT_KELAS_LIST.map((k) => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>

            <select
              value={dptStatusFilter}
              onChange={(e) => setDptStatusFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">Semua Status Voting</option>
              <option value="voted">Sudah Memilih</option>
              <option value="not_voted">Belum Memilih</option>
            </select>
          </div>

          {/* DPT Table */}
          <div className="rounded-3xl bg-[#0f172a] border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/90 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">No.</th>
                    <th className="py-3.5 px-4">Nama Siswa</th>
                    <th className="py-3.5 px-4">Kelas</th>
                    <th className="py-3.5 px-4">Status Suara</th>
                    <th className="py-3.5 px-4">Waktu Voting</th>
                    <th className="py-3.5 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {dptItems.length > 0 ? (
                    dptItems.map((item, index) => (
                      <tr key={item.id} className="hover:bg-slate-900/50 transition">
                        <td className="py-3 px-4 font-mono text-slate-500">{index + 1}</td>
                        <td className="py-3 px-4 font-bold text-white">{item.nama}</td>
                        <td className="py-3 px-4 font-mono text-cyan-300">{item.kelas}</td>
                        <td className="py-3 px-4">
                          {item.hasVoted ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold uppercase">
                              <CheckCircle className="w-3 h-3" /> Sudah Memilih
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-[10px] font-medium">
                              Belum Memilih
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">
                          {item.votedAt ? new Date(item.votedAt).toLocaleString('id-ID') : '-'}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={async () => {
                              if (!confirm(`Hapus data ${item.nama}?`)) return;
                              await api.deleteDPT(token, item.id);
                              await fetchDPT();
                              await onRefreshData();
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 hover:text-rose-300 text-slate-400 transition"
                            title="Hapus pemilih"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-slate-500">
                        Tidak ada data pemilih yang sesuai dengan pencarian.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: MENU PENGATURAN ADMIN & BRANDING */}
      {/* ========================================================================= */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Settings Form */}
          <form onSubmit={handleSaveSettings} className="space-y-6 p-6 sm:p-8 rounded-3xl bg-[#0f172a] border border-slate-800">
            <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <Settings className="w-4 h-4" /> Pengaturan Aplikasi & Logo Sekolah
            </h3>

            {/* School Logo Upload & Preview */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Logo Sekolah (Tampil di Navbar & Bukti Suara)
              </label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center overflow-hidden p-2">
                  <img
                    src={logoPreview}
                    alt="Logo Sekolah"
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="space-y-2">
                  <input
                    type="file"
                    ref={logoInputRef}
                    onChange={handleLogoUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Upload Logo Baru</span>
                  </button>
                  <p className="text-[11px] text-slate-400">Format PNG, JPG, SVG disarankan</p>
                </div>
              </div>
            </div>

            {/* Title / Name of App */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Nama Sekolah
              </label>
              <input
                type="text"
                value={settingsForm.schoolName}
                onChange={(e) => setSettingsForm({ ...settingsForm, schoolName: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Judul Kegiatan Pemilihan
              </label>
              <input
                type="text"
                value={settingsForm.appTitle}
                onChange={(e) => setSettingsForm({ ...settingsForm, appTitle: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Periode / Masa Bakti
              </label>
              <input
                type="text"
                value={settingsForm.periode}
                onChange={(e) => setSettingsForm({ ...settingsForm, periode: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Voting Session Toggle */}
            <div className="pt-2 border-t border-slate-800 space-y-3">
              <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-white block">Status Sesi Pemilihan</span>
                  <span className="text-[11px] text-slate-400">Buka atau tutup akses pencoblosan bagi siswa</span>
                </div>
                <input
                  type="checkbox"
                  checked={settingsForm.votingStatus === 'open'}
                  onChange={(e) => setSettingsForm({ ...settingsForm, votingStatus: e.target.checked ? 'open' : 'closed' })}
                  className="w-5 h-5 accent-cyan-500 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-white block">Wajib Terdaftar di DPT (Strict Mode)</span>
                  <span className="text-[11px] text-slate-400">Jika aktif, siswa harus ada di daftar DPT untuk bisa memilih</span>
                </div>
                <input
                  type="checkbox"
                  checked={settingsForm.strictDpt}
                  onChange={(e) => setSettingsForm({ ...settingsForm, strictDpt: e.target.checked })}
                  className="w-5 h-5 accent-purple-500 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-white block">Tampilkan Quick Count untuk Siswa/Publik</span>
                  <span className="text-[11px] text-slate-400">Izinkan pemilih melihat grafik perolehan suara sementara</span>
                </div>
                <input
                  type="checkbox"
                  checked={settingsForm.enableLiveQuickCount}
                  onChange={(e) => setSettingsForm({ ...settingsForm, enableLiveQuickCount: e.target.checked })}
                  className="w-5 h-5 accent-emerald-500 rounded"
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-cyan-500 hover:from-amber-400 hover:to-cyan-400 text-slate-950 font-bold text-xs shadow-lg transition cursor-pointer"
            >
              Simpan Perubahan Pengaturan
            </button>
          </form>

          {/* Change Admin Password */}
          <form onSubmit={handleChangePassword} className="space-y-6 p-6 sm:p-8 rounded-3xl bg-[#0f172a] border border-slate-800 h-fit">
            <h3 className="text-sm font-bold uppercase tracking-wider text-purple-400 flex items-center gap-2">
              <Key className="w-4 h-4" /> Perbarui Kata Sandi Admin
            </h3>
            <p className="text-xs text-slate-400">
              Ganti password berkala demi keamanan sistem e-voting sekolah.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Password Lama
                </label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Masukkan password admin lama..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Password Baru (Min. 6 Karakter)
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Password baru..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Konfirmasi Password Baru
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ketik ulang password baru..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg transition cursor-pointer"
            >
              Update Password Admin
            </button>
          </form>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: PANDUAN HOSTING & DEPLOYMENT ONLINE GRATIS */}
      {/* ========================================================================= */}
      {activeTab === 'hosting' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-[#0f172a] border border-slate-800 space-y-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400">
              <Globe className="w-4 h-4" /> Panduan Praktis Publikasi Online
            </div>
            <h3 className="text-xl font-black text-white mt-1">
              Cara Hosting Aplikasi E-Voting Secara Gratis & Publik
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Agar siswa dan siswi SMK Lentera Bangsa 2 bisa mencoblos serentak dari HP masing-masing melalui Google Chrome.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Vercel / Netlify Guide */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="w-8 h-8 rounded-xl bg-white text-black font-black flex items-center justify-center text-sm">
                ▲
              </div>
              <h4 className="text-base font-bold text-white">1. Vercel (Opsi Paling Cepat)</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                1. Push kode ke GitHub.<br/>
                2. Buka <strong>vercel.com</strong> dan impor repositori.<br/>
                3. Framework Preset: <strong>Vite</strong>.<br/>
                4. Klik <strong>Deploy</strong>. Anda langsung mendapatkan domain publik gratis (contoh: <code>evoting-smk-lb2.vercel.app</code>).
              </p>
            </div>

            {/* Render Guide */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-black flex items-center justify-center text-sm">
                R
              </div>
              <h4 className="text-base font-bold text-white">2. Render (Full-Stack Node.js)</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                1. Buka <strong>render.com</strong>, pilih <em>Web Service</em>.<br/>
                2. Hubungkan akun GitHub sekolah.<br/>
                3. Build Command: <code>npm install && npm run build</code>.<br/>
                4. Start Command: <code>npm start</code>.<br/>
                5. Server multi-guest akan aktif dan dapat diakses publik 24/7.
              </p>
            </div>

            {/* Railway Guide */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="w-8 h-8 rounded-xl bg-purple-600 text-white font-black flex items-center justify-center text-sm">
                🚆
              </div>
              <h4 className="text-base font-bold text-white">3. Railway</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                1. Buka <strong>railway.app</strong>.<br/>
                2. Klik <em>Deploy from GitHub repo</em>.<br/>
                3. Railway secara otomatis mendeteksi Node.js dan menjalankan perintah start.<br/>
                4. Generate public domain di tab <em>Settings</em>.
              </p>
            </div>

          </div>

          <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 text-xs text-slate-300 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-cyan-300 block mb-1">Tips Pemilihan di Jaringan Sekolah:</strong>
              Cukup bagikan Link Web atau cetak stiker <strong>QR Code</strong> di mading sekolah atau ruang kelas. Siswa hanya perlu scan QR Code menggunakan kamera HP untuk langsung masuk ke halaman pencoblosan!
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL EDIT / TAMBAH PASLON */}
      {/* ========================================================================= */}
      {isPaslonModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-2xl bg-[#0f172a] border border-cyan-500/40 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 via-[#151f38] to-slate-900">
              <h3 className="text-base font-black text-white">
                {editingPaslon ? 'Edit Data Paslon' : 'Tambah Paslon Baru'}
              </h3>
              <button onClick={() => setIsPaslonModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSavePaslon} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Nomor Urut</label>
                  <input
                    type="number"
                    value={paslonForm.nomorUrut}
                    onChange={(e) => setPaslonForm({ ...paslonForm, nomorUrut: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Warna Aksen Neon</label>
                  <input
                    type="color"
                    value={paslonForm.color}
                    onChange={(e) => setPaslonForm({ ...paslonForm, color: e.target.value })}
                    className="w-full h-10 rounded-xl bg-slate-900 border border-slate-700 cursor-pointer p-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Nama Calon Ketua</label>
                  <input
                    type="text"
                    value={paslonForm.namaKetua}
                    onChange={(e) => setPaslonForm({ ...paslonForm, namaKetua: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                    placeholder="Nama Ketua"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Kelas Calon Ketua</label>
                  <input
                    type="text"
                    value={paslonForm.kelasKetua}
                    onChange={(e) => setPaslonForm({ ...paslonForm, kelasKetua: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                    placeholder="Contoh: XI RPL 1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Nama Calon Wakil</label>
                  <input
                    type="text"
                    value={paslonForm.namaWakil}
                    onChange={(e) => setPaslonForm({ ...paslonForm, namaWakil: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                    placeholder="Nama Wakil"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Kelas Calon Wakil</label>
                  <input
                    type="text"
                    value={paslonForm.kelasWakil}
                    onChange={(e) => setPaslonForm({ ...paslonForm, kelasWakil: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                    placeholder="Contoh: X DKV 2"
                  />
                </div>
              </div>

              {/* Foto Paslon */}
              <div>
                <label className="block font-bold text-slate-300 mb-1">Foto Paslon (Upload File atau URL)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    ref={paslonPhotoInputRef}
                    onChange={handlePhotoUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => paslonPhotoInputRef.current?.click()}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 text-slate-200 font-semibold"
                  >
                    Pilih File Foto
                  </button>
                  <input
                    type="text"
                    value={paslonForm.foto}
                    onChange={(e) => setPaslonForm({ ...paslonForm, foto: e.target.value })}
                    className="flex-1 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                    placeholder="Atau tempel URL gambar..."
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Tagline Gaul / Slogan Paslon</label>
                <input
                  type="text"
                  value={paslonForm.tagline}
                  onChange={(e) => setPaslonForm({ ...paslonForm, tagline: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  placeholder="Contoh: Inovatif, Kolaboratif, Berkarakter!"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Visi Utama</label>
                <textarea
                  rows={2}
                  value={paslonForm.visi}
                  onChange={(e) => setPaslonForm({ ...paslonForm, visi: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Misi (1 baris per butir misi)</label>
                <textarea
                  rows={3}
                  value={paslonForm.misiText}
                  onChange={(e) => setPaslonForm({ ...paslonForm, misiText: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                  placeholder="Baris 1&#10;Baris 2&#10;Baris 3"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Program Kerja Unggulan (1 baris per program)</label>
                <textarea
                  rows={3}
                  value={paslonForm.prokerText}
                  onChange={(e) => setPaslonForm({ ...paslonForm, prokerText: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                  placeholder="Turnamen Esports OSIS Cup&#10;Podcast Siswa LB2&#10;Bakti Sosial"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsPaslonModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-slate-950 font-bold"
                >
                  Simpan Paslon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DANGER ACTION CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {dangerAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-[#0f172a] border-2 border-rose-500/60 rounded-3xl p-6 shadow-[0_10px_60px_rgba(244,63,94,0.3)] space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/40">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">{dangerAction.title}</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {dangerAction.description}
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setDangerAction(null)}
                disabled={isLoading}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
              >
                Batal
              </button>
              <button
                onClick={executeDangerAction}
                disabled={isLoading}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
              >
                {isLoading ? 'Memproses...' : 'Ya, Lanjutkan!'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
