import { Paslon, DPTItem, AppSettings } from '../types';

export const DEFAULT_LOGO_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
  <defs>
    <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#06b6d4" />
      <stop offset="50%" stop-color="#3b82f6" />
      <stop offset="100%" stop-color="#8b5cf6" />
    </linearGradient>
    <linearGradient id="flame" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#f59e0b" />
      <stop offset="50%" stop-color="#ef4444" />
      <stop offset="100%" stop-color="#fbbf24" />
    </linearGradient>
  </defs>
  <circle cx="50" cy="50" r="46" stroke="url(#g1)" stroke-width="4" fill="#0f172a" />
  <path d="M50 20 C42 32 38 42 38 52 C38 64 45 72 50 75 C55 72 62 64 62 52 C62 42 58 32 50 20 Z" fill="url(#flame)" opacity="0.9" />
  <path d="M50 35 C46 44 44 50 44 56 C44 63 48 67 50 69 C52 67 56 63 56 56 C56 50 54 44 50 35 Z" fill="#fef08a" />
  <path d="M30 76 L70 76 L65 82 L35 82 Z" fill="#06b6d4" />
  <text x="50" y="92" font-size="7" font-weight="900" fill="#38bdf8" text-anchor="middle" letter-spacing="1">LB 2 VOCATIONAL</text>
</svg>
`)}`;

export const DEFAULT_SETTINGS: AppSettings = {
  appTitle: 'Pemilihan Ketua & Wakil Ketua OSIS',
  schoolName: 'SMK Lentera Bangsa 2',
  periode: 'Masa Bakti 2026/2027',
  logoUrl: DEFAULT_LOGO_SVG,
  votingStatus: 'open',
  votingCloseTime: null,
  strictDpt: false, // Default false: anyone can enter Nama & Kelas, or true to validate against DPT list
  antiPeepModeDefault: false,
  enableLiveQuickCount: true,
};

export const DEFAULT_PASLON: Paslon[] = [
  {
    id: 'paslon-1',
    nomorUrut: 1,
    namaKetua: 'Muhammad Fathir Pratama',
    namaWakil: 'Alya Sabrina Putri',
    kelasKetua: 'XI RPL 1',
    kelasWakil: 'X DKV 2',
    foto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    tagline: 'Kreatif, Kolaboratif, dan Berkarakter Teknologi',
    visi: 'Mewujudkan OSIS SMK Lentera Bangsa 2 sebagai wadah aspirasi siswa yang adaptif, inovatif di era digital, berakhlak mulia, dan berdaya saing global.',
    misi: [
      'Menyelenggarakan e-sport dan festival kreativitas digital antarkelas.',
      'Membuka kanal aspirasi digital "Curhat Santai OSIS" yang transparan dan solutif.',
      'Mengembangkan program inkubasi wirausaha kreatif berbasis projek kejuruan.',
      'Mempererat keharmonisan dan solidaritas antarseluruh jurusan di SMK Lentera Bangsa 2.'
    ],
    programKerja: [
      'LB2 Cyber Cup & Tech Expo tahunan.',
      'Podcast Siswa: Lentera Suara Pelajar.',
      'Gerakan Green School: Satu Siswa Satu Tanaman Hidroponik.',
      'Sistem Informasi Kegiatan Siswa Berbasis QR Code.'
    ],
    color: '#06b6d4', // Cyan neon
    voteCount: 0,
  },
  {
    id: 'paslon-2',
    nomorUrut: 2,
    namaKetua: 'Bintang Aditya Nugraha',
    namaWakil: 'Clarissa Maharani',
    kelasKetua: 'XI TKJ 2',
    kelasWakil: 'XI AKL 1',
    foto: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80',
    tagline: 'Aksi Nyata, Solidaritas Kuat, Prestasi Tanpa Batas',
    visi: 'Menjadikan OSIS SMK Lentera Bangsa 2 yang berintegritas tinggi, unggul dalam kepemimpinan, sigap bertindak, serta menjadi garda terdepan penegak kedisiplinan berkarakter positif.',
    misi: [
      'Meningkatkan partisipasi aktif siswa dalam lomba kompetensi kejuruan (LKS) dan seni budaya.',
      'Optimalisasi peran ekstrakurikuler dalam mengasah soft-skill kepemimpinan kerja.',
      'Membangun budaya disiplin ramah melalui mentoring antarkelas (Kakak Asuh).',
      'Menghidupkan kegiatan sosial kemasyarakatan dan kepedulian lingkungan sekitar sekolah.'
    ],
    programKerja: [
      'Liga Futsal & Basket OSIS Cup antar-sekolah sekota.',
      'Lentera Peduli: Baksos & Service Motor/Komputer Gratis bagi Warga.',
      'Workshop Bootcamp Siap Kerja & Sertifikasi Industri.',
      'Lentera Music & Cultural Fest 2026.'
    ],
    color: '#a855f7', // Purple neon
    voteCount: 0,
  },
  {
    id: 'paslon-3',
    nomorUrut: 3,
    namaKetua: 'Rifky Ardiansyah',
    namaWakil: 'Nadine Aurellia Zahra',
    kelasKetua: 'XI TKR 1',
    kelasWakil: 'X OTKP 1',
    foto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    tagline: 'Inspiratif, Tanggap Aspirasi, Bergerak Serempak',
    visi: 'Membangun ekosistem sekolah yang inklusif, membangkitkan rasa bangga menjadi anak SMK yang siap kerja, santun budi pekerti, dan melek teknologi masa depan.',
    misi: [
      'Menjamin transparansi anggaran kegiatan OSIS kepada seluruh perwakilan kelas (MPK).',
      'Mengaktifkan kembali mading digital dan pojok literasi inspiratif di setiap koridor jurusan.',
      'Menjalin kolaborasi dengan ikatan alumni untuk mentoring karier dan magang.',
      'Menciptakan iklim sekolah yang bebas perundungan (anti-bullying) dengan konseling sebaya.'
    ],
    programKerja: [
      'Hari Sehat & Bugar Bersama (Senam Gaul & Sarapan Bergizi).',
      'Pojok Karier SMK: Sharing Session Praktisi Industri & Alumni.',
      'Festival Kuliner & Produk Karya Siswa Tiap Akhir Semester.',
      'Piala Bergilir Kebersihan & Kerapian Bengkel / Lab Tiap Bulan.'
    ],
    color: '#f59e0b', // Amber/Gold neon
    voteCount: 0,
  }
];

export const DEFAULT_KELAS_LIST = [
  // Kelas X
  'X RPL 1', 'X RPL 2',
  'X TKJ 1', 'X TKJ 2',
  'X DKV 1', 'X DKV 2',
  'X TKR 1', 'X TKR 2',
  'X AKL 1', 'X AKL 2',
  'X OTKP 1', 'X OTKP 2',
  // Kelas XI
  'XI RPL 1', 'XI RPL 2',
  'XI TKJ 1', 'XI TKJ 2',
  'XI DKV 1', 'XI DKV 2',
  'XI TKR 1', 'XI TKR 2',
  'XI AKL 1', 'XI AKL 2',
  'XI OTKP 1', 'XI OTKP 2',
  // Kelas XII
  'XII RPL 1', 'XII RPL 2',
  'XII TKJ 1', 'XII TKJ 2',
  'XII DKV 1', 'XII DKV 2',
  'XII TKR 1', 'XII TKR 2',
  'XII AKL 1', 'XII AKL 2',
  'XII OTKP 1', 'XII OTKP 2',
  // Guru & Staff
  'Dewan Guru & Staff'
];

export const DEFAULT_DPT: DPTItem[] = [
  { id: 'dpt-1', nama: 'Ahmad Fauzi', kelas: 'XII RPL 1', hasVoted: false },
  { id: 'dpt-2', nama: 'Siti Nurhaliza', kelas: 'XII RPL 1', hasVoted: false },
  { id: 'dpt-3', nama: 'Dimas Wicaksono', kelas: 'XII RPL 1', hasVoted: false },
  { id: 'dpt-4', nama: 'Putri Anggraini', kelas: 'XI TKJ 1', hasVoted: false },
  { id: 'dpt-5', nama: 'Rian Hidayat', kelas: 'XI TKJ 1', hasVoted: false },
  { id: 'dpt-6', nama: 'Dewi Lestari', kelas: 'XI TKJ 2', hasVoted: false },
  { id: 'dpt-7', nama: 'Bagus Prasetyo', kelas: 'X DKV 1', hasVoted: false },
  { id: 'dpt-8', nama: 'Zahra Ramadhani', kelas: 'X DKV 1', hasVoted: false },
  { id: 'dpt-9', nama: 'Fajar Nugraha', kelas: 'X TKR 1', hasVoted: false },
  { id: 'dpt-10', nama: 'Anisa Rahmawati', kelas: 'XI AKL 1', hasVoted: false },
  { id: 'dpt-11', nama: 'Rizky Pratama', kelas: 'XII OTKP 1', hasVoted: false },
  { id: 'dpt-12', nama: 'Nabila Syahrani', kelas: 'X RPL 2', hasVoted: false },
];
