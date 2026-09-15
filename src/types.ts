export interface Paslon {
  id: string;
  nomorUrut: number;
  namaKetua: string;
  namaWakil: string;
  kelasKetua: string;
  kelasWakil: string;
  foto: string;
  tagline: string;
  visi: string;
  misi: string[];
  programKerja: string[];
  color: string;
  voteCount: number;
}

export interface DPTItem {
  id: string;
  nama: string;
  kelas: string;
  hasVoted: boolean;
  votedAt?: string;
  receiptCode?: string;
}

export interface VoteReceipt {
  receiptCode: string;
  nama: string;
  kelas: string;
  paslonNomorUrut: number;
  timestamp: string;
}

export interface AppSettings {
  appTitle: string;
  schoolName: string;
  periode: string;
  logoUrl: string;
  votingStatus: 'open' | 'closed';
  votingCloseTime?: string | null;
  strictDpt: boolean;
  antiPeepModeDefault: boolean;
  enableLiveQuickCount: boolean;
}

export interface PaslonStat {
  id: string;
  nomorUrut: number;
  namaKetua: string;
  namaWakil: string;
  suara: number;
  persentase: number;
  color: string;
}

export interface KelasStat {
  kelas: string;
  totalPemilih: number;
  sudahMemilih: number;
  persentase: number;
}

export interface TimelineStat {
  time: string;
  votes: number;
}

export interface RecentVoteItem {
  id: string;
  namaMasked: string;
  kelas: string;
  timestamp: string;
}

export interface RekapData {
  totalDPT: number;
  totalSuaraMasuk: number;
  partisipasiPersen: number;
  paslonStats: PaslonStat[];
  kelasStats: KelasStat[];
  timeline: TimelineStat[];
  recentVotes: RecentVoteItem[];
}
