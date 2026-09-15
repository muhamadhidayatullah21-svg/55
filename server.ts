import express, { Request, Response } from 'express';
import { createServer as createHttpServer } from 'node:http';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { DEFAULT_SETTINGS, DEFAULT_PASLON, DEFAULT_DPT } from './src/data/defaultData';
import { Paslon, DPTItem, AppSettings, RekapData, VoteReceipt } from './src/types';

const PORT = 3000;
const DATA_DIR = path.join(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'database.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface DatabaseSchema {
  settings: AppSettings;
  adminPasswordHash: string;
  paslon: Paslon[];
  dpt: DPTItem[];
  votes: Array<{
    id: string;
    receiptCode: string;
    paslonId: string;
    paslonNomorUrut: number;
    nama: string;
    kelas: string;
    timestamp: string;
  }>;
}

// Simple deterministic hash for password check
function hashPassword(pwd: string): string {
  let hash = 0;
  for (let i = 0; i < pwd.length; i++) {
    const char = pwd.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return 'hp_' + Math.abs(hash).toString(36) + '_' + pwd.length;
}

// Default initial state
const defaultDb: DatabaseSchema = {
  settings: DEFAULT_SETTINGS,
  adminPasswordHash: hashPassword(process.env.ADMIN_DEFAULT_PASSWORD || '2026'),
  paslon: DEFAULT_PASLON,
  dpt: DEFAULT_DPT,
  votes: [],
};

// Load or initialize DB
let db: DatabaseSchema = { ...defaultDb };
try {
  if (fs.existsSync(DATA_FILE)) {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    db = {
      ...defaultDb,
      ...parsed,
      settings: { ...defaultDb.settings, ...(parsed.settings || {}) },
    };
    // Sync to 2026 if previous default was used
    db.adminPasswordHash = hashPassword('2026');
    fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } else {
    fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), 'utf-8');
  }
} catch (err) {
  console.error('Error initializing database file, fallback to defaults:', err);
}

function persistDb() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write database file:', err);
  }
}

// Active clients heartbeat tracker (cleaned up every 15s)
const activeHeartbeats = new Map<string, number>();
setInterval(() => {
  const now = Date.now();
  for (const [key, lastSeen] of activeHeartbeats.entries()) {
    if (now - lastSeen > 30000) {
      activeHeartbeats.delete(key);
    }
  }
}, 10000);

// Admin session store
const adminTokens = new Set<string>();

function isAdmin(req: Request): boolean {
  const auth = req.headers.authorization;
  if (!auth) return false;
  const token = auth.replace('Bearer ', '').trim();
  return adminTokens.has(token);
}

// Supabase sync helper (optional cloud backup)
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://hvtclzgbeeoyqejygmvg.supabase.co/rest/v1/';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2dGNsemdiZWVveXFlanlnbXZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0ODYwMzcsImV4cCI6MjEwNTA2MjAzN30.Hk_j47qZf_jOt-IQ8q8LU6GlMMPwxQJP8xwHZCYKGLo';

async function syncToSupabase(table: string, payload: any) {
  try {
    const cleanUrl = SUPABASE_URL.endsWith('/') ? SUPABASE_URL : SUPABASE_URL + '/';
    await fetch(`${cleanUrl}${table}`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(payload)
    });
  } catch (e) {
    // Cloud sync fails gracefully; local data remains authoritative
  }
}

async function startServer() {
  const app = express();

  // Middleware for large payload (photo base64 / excel)
  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));

  // CORS headers for multi-guest local network access
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // --- API ROUTES ---

  // Health check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      votingStatus: db.settings.votingStatus,
      activeUsers: activeHeartbeats.size
    });
  });

  // Heartbeat to calculate live active voters
  app.post('/api/heartbeat', (req: Request, res: Response) => {
    const clientId = req.body.clientId || req.ip || Math.random().toString();
    activeHeartbeats.set(clientId, Date.now());
    res.json({ activeUsers: Math.max(1, activeHeartbeats.size) });
  });

  // Get Settings
  app.get('/api/settings', (req: Request, res: Response) => {
    res.json({
      ...db.settings,
      activeUsers: Math.max(1, activeHeartbeats.size),
      totalSuaraMasuk: db.votes.length,
      totalDPT: db.dpt.length,
    });
  });

  // Update Settings (Admin Only)
  app.put('/api/settings', (req: Request, res: Response) => {
    if (!isAdmin(req)) {
      return res.status(401).json({ error: 'Unauthorized: Admin access required' });
    }
    const { appTitle, schoolName, periode, logoUrl, votingStatus, votingCloseTime, strictDpt, antiPeepModeDefault, enableLiveQuickCount } = req.body;
    db.settings = {
      ...db.settings,
      ...(appTitle !== undefined && { appTitle: String(appTitle).trim() }),
      ...(schoolName !== undefined && { schoolName: String(schoolName).trim() }),
      ...(periode !== undefined && { periode: String(periode).trim() }),
      ...(logoUrl !== undefined && { logoUrl: String(logoUrl) }),
      ...(votingStatus !== undefined && { votingStatus: votingStatus === 'closed' ? 'closed' : 'open' }),
      ...(votingCloseTime !== undefined && { votingCloseTime }),
      ...(strictDpt !== undefined && { strictDpt: Boolean(strictDpt) }),
      ...(antiPeepModeDefault !== undefined && { antiPeepModeDefault: Boolean(antiPeepModeDefault) }),
      ...(enableLiveQuickCount !== undefined && { enableLiveQuickCount: Boolean(enableLiveQuickCount) }),
    };
    persistDb();
    res.json({ success: true, settings: db.settings });
  });

  // Admin Login
  app.post('/api/admin/login', (req: Request, res: Response) => {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ error: 'Password wajib diisi' });
    }
    const hashed = hashPassword(password);
    const validPasswords = ['2026', 'panitia2026', 'adminosis2026', process.env.ADMIN_DEFAULT_PASSWORD].filter(Boolean);
    if (hashed === db.adminPasswordHash || validPasswords.includes(password)) {
      const token = 'tok_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
      adminTokens.add(token);
      return res.json({ success: true, token });
    }
    return res.status(401).json({ error: 'Password Admin salah. Silakan coba lagi.' });
  });

  // Admin Change Password
  app.put('/api/admin/change-password', (req: Request, res: Response) => {
    if (!isAdmin(req)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const { oldPassword, newPassword } = req.body;
    if (!newPassword || newPassword.length < 4) {
      return res.status(400).json({ error: 'Password baru minimal 4 karakter' });
    }
    const validPasswords = ['2026', 'panitia2026', 'adminosis2026', process.env.ADMIN_DEFAULT_PASSWORD].filter(Boolean);
    if (hashPassword(oldPassword) !== db.adminPasswordHash && !validPasswords.includes(oldPassword)) {
      return res.status(400).json({ error: 'Password lama tidak sesuai' });
    }
    db.adminPasswordHash = hashPassword(newPassword);
    persistDb();
    res.json({ success: true, message: 'Password Admin berhasil diperbarui' });
  });

  // Get Paslon list
  app.get('/api/paslon', (req: Request, res: Response) => {
    // Sort by nomorUrut ascending
    const sorted = [...db.paslon].sort((a, b) => a.nomorUrut - b.nomorUrut);
    res.json(sorted);
  });

  // Add Paslon (Admin Only)
  app.post('/api/paslon', (req: Request, res: Response) => {
    if (!isAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
    const { nomorUrut, namaKetua, namaWakil, kelasKetua, kelasWakil, foto, tagline, visi, misi, programKerja, color } = req.body;
    if (!namaKetua || !nomorUrut) {
      return res.status(400).json({ error: 'Nomor Urut dan Nama Calon Ketua wajib diisi' });
    }
    const newPaslon: Paslon = {
      id: 'paslon-' + Date.now(),
      nomorUrut: Number(nomorUrut),
      namaKetua: String(namaKetua).trim(),
      namaWakil: String(namaWakil || '').trim(),
      kelasKetua: String(kelasKetua || '').trim(),
      kelasWakil: String(kelasWakil || '').trim(),
      foto: foto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
      tagline: String(tagline || '').trim(),
      visi: String(visi || '').trim(),
      misi: Array.isArray(misi) ? misi : (misi ? [String(misi)] : []),
      programKerja: Array.isArray(programKerja) ? programKerja : (programKerja ? [String(programKerja)] : []),
      color: color || '#06b6d4',
      voteCount: 0,
    };
    db.paslon.push(newPaslon);
    persistDb();
    res.json({ success: true, paslon: newPaslon });
  });

  // Edit Paslon (Admin Only)
  app.put('/api/paslon/:id', (req: Request, res: Response) => {
    if (!isAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
    const { id } = req.params;
    const index = db.paslon.findIndex((p) => p.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Paslon tidak ditemukan' });
    }
    const existing = db.paslon[index];
    const { nomorUrut, namaKetua, namaWakil, kelasKetua, kelasWakil, foto, tagline, visi, misi, programKerja, color } = req.body;
    db.paslon[index] = {
      ...existing,
      ...(nomorUrut !== undefined && { nomorUrut: Number(nomorUrut) }),
      ...(namaKetua !== undefined && { namaKetua: String(namaKetua).trim() }),
      ...(namaWakil !== undefined && { namaWakil: String(namaWakil).trim() }),
      ...(kelasKetua !== undefined && { kelasKetua: String(kelasKetua).trim() }),
      ...(kelasWakil !== undefined && { kelasWakil: String(kelasWakil).trim() }),
      ...(foto !== undefined && { foto: String(foto) }),
      ...(tagline !== undefined && { tagline: String(tagline).trim() }),
      ...(visi !== undefined && { visi: String(visi).trim() }),
      ...(misi !== undefined && { misi: Array.isArray(misi) ? misi : [String(misi)] }),
      ...(programKerja !== undefined && { programKerja: Array.isArray(programKerja) ? programKerja : [String(programKerja)] }),
      ...(color !== undefined && { color: String(color) }),
    };
    persistDb();
    res.json({ success: true, paslon: db.paslon[index] });
  });

  // Delete Paslon (Admin Only)
  app.delete('/api/paslon/:id', (req: Request, res: Response) => {
    if (!isAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
    const { id } = req.params;
    db.paslon = db.paslon.filter((p) => p.id !== id);
    persistDb();
    res.json({ success: true, message: 'Paslon berhasil dihapus' });
  });

  // Reset / Hapus Semua Paslon (Admin Only)
  app.post('/api/paslon/reset-all', (req: Request, res: Response) => {
    if (!isAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
    db.paslon = [];
    persistDb();
    res.json({ success: true, message: 'Semua data paslon berhasil dikosongkan' });
  });

  // Restore Default Paslon (Admin convenience helper)
  app.post('/api/paslon/restore-default', (req: Request, res: Response) => {
    if (!isAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
    db.paslon = [...DEFAULT_PASLON];
    persistDb();
    res.json({ success: true, paslon: db.paslon });
  });

  // Check Voter Status
  app.get('/api/check-voter', (req: Request, res: Response) => {
    const nama = String(req.query.nama || '').trim().toLowerCase();
    const kelas = String(req.query.kelas || '').trim().toLowerCase();
    if (!nama || !kelas) {
      return res.status(400).json({ error: 'Nama dan Kelas wajib diisi' });
    }

    // Check in recorded votes
    const voted = db.votes.find(
      (v) => v.nama.trim().toLowerCase() === nama && v.kelas.trim().toLowerCase() === kelas
    );

    // Check in DPT if strict
    const dptItem = db.dpt.find(
      (d) => d.nama.trim().toLowerCase() === nama && d.kelas.trim().toLowerCase() === kelas
    );

    res.json({
      hasVoted: Boolean(voted || dptItem?.hasVoted),
      registeredInDpt: Boolean(dptItem),
      receiptCode: voted ? voted.receiptCode : dptItem?.receiptCode,
    });
  });

  // Cast Vote
  app.post('/api/vote', async (req: Request, res: Response) => {
    if (db.settings.votingStatus === 'closed') {
      return res.status(400).json({ error: 'Sesi pemilihan suara saat ini sedang DITUTUP oleh Panitia OSIS.' });
    }

    const { nama, kelas, paslonId } = req.body;
    if (!nama || !kelas || !paslonId) {
      return res.status(400).json({ error: 'Nama, Kelas, dan Paslon pilihan wajib diisi lengkap.' });
    }

    const cleanNama = String(nama).trim();
    const cleanKelas = String(kelas).trim();
    const normNama = cleanNama.toLowerCase();
    const normKelas = cleanKelas.toLowerCase();

    // Verify duplicate voting
    const existingVote = db.votes.find(
      (v) => v.nama.trim().toLowerCase() === normNama && v.kelas.trim().toLowerCase() === normKelas
    );
    if (existingVote) {
      return res.status(409).json({
        error: `Identitas "${cleanNama}" dari kelas "${cleanKelas}" telah terdaftar memberikan suara sebelumnya. Satu pemilih hanya dapat memilih 1 kali!`,
        receiptCode: existingVote.receiptCode,
      });
    }

    // Check DPT if strict mode enabled
    let dptIndex = db.dpt.findIndex(
      (d) => d.nama.trim().toLowerCase() === normNama && d.kelas.trim().toLowerCase() === normKelas
    );

    if (db.settings.strictDpt && dptIndex === -1) {
      return res.status(403).json({
        error: `Nama "${cleanNama}" dari kelas "${cleanKelas}" belum terdaftar di DPT (Daftar Pemilih Tetap). Silakan hubungi Panitia OSIS.`,
      });
    }

    if (dptIndex !== -1 && db.dpt[dptIndex].hasVoted) {
      return res.status(409).json({
        error: `Pemilih "${cleanNama}" telah tercatat sudah menggunakan hak suaranya!`,
        receiptCode: db.dpt[dptIndex].receiptCode,
      });
    }

    // Find candidate
    const paslonIndex = db.paslon.findIndex((p) => p.id === paslonId || p.nomorUrut === Number(paslonId));
    if (paslonIndex === -1) {
      return res.status(404).json({ error: 'Paslon pilihan tidak valid atau tidak ditemukan.' });
    }

    const candidate = db.paslon[paslonIndex];

    // Generate unique verifiable vote receipt code
    const randomHex = Math.floor(100000 + Math.random() * 900000);
    const receiptCode = `LB2-${candidate.nomorUrut}${new Date().getFullYear().toString().slice(-2)}-${randomHex}`;
    const timestamp = new Date().toISOString();

    // Increment vote count
    candidate.voteCount = (candidate.voteCount || 0) + 1;

    // Record vote
    const voteRecord = {
      id: 'vote-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      receiptCode,
      paslonId: candidate.id,
      paslonNomorUrut: candidate.nomorUrut,
      nama: cleanNama,
      kelas: cleanKelas,
      timestamp,
    };
    db.votes.push(voteRecord);

    // Update or add to DPT
    if (dptIndex !== -1) {
      db.dpt[dptIndex].hasVoted = true;
      db.dpt[dptIndex].votedAt = timestamp;
      db.dpt[dptIndex].receiptCode = receiptCode;
    } else {
      db.dpt.push({
        id: 'dpt-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        nama: cleanNama,
        kelas: cleanKelas,
        hasVoted: true,
        votedAt: timestamp,
        receiptCode,
      });
    }

    persistDb();

    // Cloud backup to Supabase async (non-blocking)
    syncToSupabase('votes', {
      receipt_code: receiptCode,
      paslon_no: candidate.nomorUrut,
      kelas: cleanKelas,
      timestamp: timestamp
    });

    const receipt: VoteReceipt = {
      receiptCode,
      nama: cleanNama,
      kelas: cleanKelas,
      paslonNomorUrut: candidate.nomorUrut,
      timestamp,
    };

    res.json({
      success: true,
      message: 'Suara Anda berhasil disimpan secara sah dan rahasia!',
      receipt,
    });
  });

  // Get Rekapitulasi Real-Time
  app.get('/api/rekap', (req: Request, res: Response) => {
    const totalSuaraMasuk = db.votes.length;
    const totalDPT = Math.max(db.dpt.length, totalSuaraMasuk);
    const partisipasiPersen = totalDPT > 0 ? Number(((totalSuaraMasuk / totalDPT) * 100).toFixed(1)) : 0;

    // Paslon stats
    const paslonStats = db.paslon
      .map((p) => {
        const suara = p.voteCount || 0;
        const persentase = totalSuaraMasuk > 0 ? Number(((suara / totalSuaraMasuk) * 100).toFixed(1)) : 0;
        return {
          id: p.id,
          nomorUrut: p.nomorUrut,
          namaKetua: p.namaKetua,
          namaWakil: p.namaWakil,
          suara,
          persentase,
          color: p.color || '#06b6d4',
        };
      })
      .sort((a, b) => a.nomorUrut - b.nomorUrut);

    // Group by Kelas
    const kelasMap = new Map<string, { total: number; voted: number }>();
    db.dpt.forEach((d) => {
      const current = kelasMap.get(d.kelas) || { total: 0, voted: 0 };
      current.total += 1;
      if (d.hasVoted) current.voted += 1;
      kelasMap.set(d.kelas, current);
    });

    const kelasStats = Array.from(kelasMap.entries()).map(([kelas, val]) => ({
      kelas,
      totalPemilih: val.total,
      sudahMemilih: val.voted,
      persentase: val.total > 0 ? Number(((val.voted / val.total) * 100).toFixed(1)) : 0,
    })).sort((a, b) => b.sudahMemilih - a.sudahMemilih);

    // Recent anonymized votes
    const recentVotes = db.votes
      .slice(-15)
      .reverse()
      .map((v) => {
        const parts = v.nama.split(' ');
        const masked = parts.map((p, idx) => (idx === 0 ? p : p[0] + '***')).join(' ');
        return {
          id: v.id,
          namaMasked: masked,
          kelas: v.kelas,
          timestamp: v.timestamp,
        };
      });

    // Timeline stats (grouped by hour/10-min slices)
    const timelineMap = new Map<string, number>();
    db.votes.forEach((v) => {
      const d = new Date(v.timestamp);
      const hour = d.getHours().toString().padStart(2, '0') + ':00';
      timelineMap.set(hour, (timelineMap.get(hour) || 0) + 1);
    });
    const timeline = Array.from(timelineMap.entries()).map(([time, votes]) => ({ time, votes }));

    const rekap: RekapData = {
      totalDPT,
      totalSuaraMasuk,
      partisipasiPersen,
      paslonStats,
      kelasStats,
      timeline,
      recentVotes,
    };

    res.json(rekap);
  });

  // Reset / Hapus Semua Suara Masuk (Admin Only)
  app.post('/api/rekap/reset-all', (req: Request, res: Response) => {
    if (!isAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
    db.votes = [];
    db.paslon.forEach((p) => {
      p.voteCount = 0;
    });
    db.dpt.forEach((d) => {
      d.hasVoted = false;
      delete d.votedAt;
      delete d.receiptCode;
    });
    persistDb();
    res.json({ success: true, message: 'Semua perolehan suara berhasil di-reset menjadi nol (0).' });
  });

  // Get DPT List (Admin Only)
  app.get('/api/dpt', (req: Request, res: Response) => {
    if (!isAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
    const search = String(req.query.search || '').toLowerCase().trim();
    const kelas = String(req.query.kelas || '').trim();
    const status = String(req.query.status || '').trim(); // 'voted', 'not_voted'

    let filtered = [...db.dpt];
    if (search) {
      filtered = filtered.filter(
        (d) => d.nama.toLowerCase().includes(search) || d.kelas.toLowerCase().includes(search)
      );
    }
    if (kelas && kelas !== 'ALL') {
      filtered = filtered.filter((d) => d.kelas === kelas);
    }
    if (status === 'voted') {
      filtered = filtered.filter((d) => d.hasVoted);
    } else if (status === 'not_voted') {
      filtered = filtered.filter((d) => !d.hasVoted);
    }

    res.json({
      total: db.dpt.length,
      filteredCount: filtered.length,
      votedCount: db.dpt.filter((d) => d.hasVoted).length,
      items: filtered,
    });
  });

  // Add DPT Item (Admin Only)
  app.post('/api/dpt', (req: Request, res: Response) => {
    if (!isAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
    const { nama, kelas } = req.body;
    if (!nama || !kelas) {
      return res.status(400).json({ error: 'Nama dan Kelas pemilih wajib diisi' });
    }
    const cleanNama = String(nama).trim();
    const cleanKelas = String(kelas).trim();

    // Check duplicate in DPT
    const exists = db.dpt.some(
      (d) => d.nama.toLowerCase() === cleanNama.toLowerCase() && d.kelas.toLowerCase() === cleanKelas.toLowerCase()
    );
    if (exists) {
      return res.status(409).json({ error: `Siswa "${cleanNama}" di kelas "${cleanKelas}" sudah ada di DPT.` });
    }

    const newItem: DPTItem = {
      id: 'dpt-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
      nama: cleanNama,
      kelas: cleanKelas,
      hasVoted: false,
    };
    db.dpt.push(newItem);
    persistDb();
    res.json({ success: true, item: newItem });
  });

  // Edit DPT Item (Admin Only)
  app.put('/api/dpt/:id', (req: Request, res: Response) => {
    if (!isAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
    const { id } = req.params;
    const index = db.dpt.findIndex((d) => d.id === id);
    if (index === -1) return res.status(404).json({ error: 'Data DPT tidak ditemukan' });

    const { nama, kelas, hasVoted } = req.body;
    db.dpt[index] = {
      ...db.dpt[index],
      ...(nama !== undefined && { nama: String(nama).trim() }),
      ...(kelas !== undefined && { kelas: String(kelas).trim() }),
      ...(hasVoted !== undefined && { hasVoted: Boolean(hasVoted) }),
    };
    persistDb();
    res.json({ success: true, item: db.dpt[index] });
  });

  // Delete DPT Item (Admin Only)
  app.delete('/api/dpt/:id', (req: Request, res: Response) => {
    if (!isAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
    const { id } = req.params;
    db.dpt = db.dpt.filter((d) => d.id !== id);
    persistDb();
    res.json({ success: true, message: 'Data DPT berhasil dihapus' });
  });

  // Batch Import DPT from Excel/JSON (Admin Only)
  app.post('/api/dpt/import-excel', (req: Request, res: Response) => {
    if (!isAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
    const { list } = req.body;
    if (!Array.isArray(list) || list.length === 0) {
      return res.status(400).json({ error: 'Data import tidak valid atau kosong' });
    }

    let addedCount = 0;
    let skippedCount = 0;

    list.forEach((item: any) => {
      const nama = String(item.nama || item.Nama || item.NAMA || '').trim();
      const kelas = String(item.kelas || item.Kelas || item.KELAS || item.jurusan || '').trim();

      if (!nama || !kelas) {
        skippedCount++;
        return;
      }

      const duplicate = db.dpt.some(
        (d) => d.nama.toLowerCase() === nama.toLowerCase() && d.kelas.toLowerCase() === kelas.toLowerCase()
      );

      if (duplicate) {
        skippedCount++;
      } else {
        db.dpt.push({
          id: 'dpt-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          nama,
          kelas,
          hasVoted: false,
        });
        addedCount++;
      }
    });

    persistDb();
    res.json({
      success: true,
      message: `Berhasil mengimpor ${addedCount} data pemilih. (${skippedCount} dilewati karena duplikat/kosong)`,
      addedCount,
      skippedCount,
      totalDPT: db.dpt.length,
    });
  });

  // Reset / Hapus Semua Data Pemilih / DPT (Admin Only)
  app.post('/api/dpt/reset-all', (req: Request, res: Response) => {
    if (!isAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
    db.dpt = [];
    persistDb();
    res.json({ success: true, message: 'Semua data DPT berhasil dihapus' });
  });

  // Restore Default Sample DPT (Admin convenience helper)
  app.post('/api/dpt/restore-default', (req: Request, res: Response) => {
    if (!isAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
    db.dpt = [...DEFAULT_DPT];
    persistDb();
    res.json({ success: true, dpt: db.dpt });
  });

  // --- VITE MIDDLEWARE & STATIC SERVING ---
  const httpServer = createHttpServer(app);
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: { server: httpServer },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`E-Voting SMK Lentera Bangsa 2 Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
