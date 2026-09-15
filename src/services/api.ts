import { AppSettings, Paslon, DPTItem, RekapData, VoteReceipt } from '../types';

const BASE_URL = '/api';

export const api = {
  // Settings
  async getSettings(): Promise<AppSettings & { activeUsers: number; totalSuaraMasuk: number; totalDPT: number }> {
    const res = await fetch(`${BASE_URL}/settings`);
    if (!res.ok) throw new Error('Gagal memuat pengaturan aplikasi');
    return res.json();
  },

  async updateSettings(token: string, settings: Partial<AppSettings>): Promise<{ success: boolean; settings: AppSettings }> {
    const res = await fetch(`${BASE_URL}/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(settings)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Gagal menyimpan pengaturan');
    }
    return res.json();
  },

  // Heartbeat
  async sendHeartbeat(clientId: string): Promise<{ activeUsers: number }> {
    try {
      const res = await fetch(`${BASE_URL}/heartbeat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId })
      });
      return res.json();
    } catch {
      return { activeUsers: 1 };
    }
  },

  // Admin Auth
  async adminLogin(password: string): Promise<{ success: boolean; token: string }> {
    const res = await fetch(`${BASE_URL}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login admin gagal');
    return data;
  },

  async adminChangePassword(token: string, oldPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${BASE_URL}/admin/change-password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ oldPassword, newPassword })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Gagal mengubah password');
    return data;
  },

  // Paslon
  async getPaslon(): Promise<Paslon[]> {
    const res = await fetch(`${BASE_URL}/paslon`);
    if (!res.ok) throw new Error('Gagal memuat data paslon');
    return res.json();
  },

  async createPaslon(token: string, data: Partial<Paslon>): Promise<{ success: boolean; paslon: Paslon }> {
    const res = await fetch(`${BASE_URL}/paslon`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Gagal menambah paslon');
    return result;
  },

  async updatePaslon(token: string, id: string, data: Partial<Paslon>): Promise<{ success: boolean; paslon: Paslon }> {
    const res = await fetch(`${BASE_URL}/paslon/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Gagal memperbarui paslon');
    return result;
  },

  async deletePaslon(token: string, id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${BASE_URL}/paslon/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Gagal menghapus paslon');
    return result;
  },

  async resetAllPaslon(token: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${BASE_URL}/paslon/reset-all`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Gagal mereset paslon');
    return result;
  },

  async restoreDefaultPaslon(token: string): Promise<{ success: boolean; paslon: Paslon[] }> {
    const res = await fetch(`${BASE_URL}/paslon/restore-default`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },

  // Voter check & Cast vote
  async checkVoter(nama: string, kelas: string): Promise<{ hasVoted: boolean; registeredInDpt: boolean; receiptCode?: string }> {
    const res = await fetch(`${BASE_URL}/check-voter?nama=${encodeURIComponent(nama)}&kelas=${encodeURIComponent(kelas)}`);
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Gagal memeriksa status pemilih');
    }
    return res.json();
  },

  async castVote(nama: string, kelas: string, paslonId: string): Promise<{ success: boolean; message: string; receipt: VoteReceipt }> {
    const res = await fetch(`${BASE_URL}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nama, kelas, paslonId })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Gagal memberikan suara');
    return data;
  },

  // Rekapitulasi
  async getRekap(): Promise<RekapData> {
    const res = await fetch(`${BASE_URL}/rekap`);
    if (!res.ok) throw new Error('Gagal memuat data rekapitulasi');
    return res.json();
  },

  async resetAllVotes(token: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${BASE_URL}/rekap/reset-all`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Gagal mereset hasil perolehan suara');
    return result;
  },

  // DPT
  async getDPT(token: string, params?: { search?: string; kelas?: string; status?: string }): Promise<{
    total: number;
    filteredCount: number;
    votedCount: number;
    items: DPTItem[];
  }> {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.kelas) query.set('kelas', params.kelas);
    if (params?.status) query.set('status', params.status);

    const res = await fetch(`${BASE_URL}/dpt?${query.toString()}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Gagal memuat data DPT');
    return res.json();
  },

  async createDPT(token: string, nama: string, kelas: string): Promise<{ success: boolean; item: DPTItem }> {
    const res = await fetch(`${BASE_URL}/dpt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ nama, kelas })
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Gagal menambah DPT');
    return result;
  },

  async updateDPT(token: string, id: string, data: Partial<DPTItem>): Promise<{ success: boolean; item: DPTItem }> {
    const res = await fetch(`${BASE_URL}/dpt/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Gagal mengupdate DPT');
    return result;
  },

  async deleteDPT(token: string, id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${BASE_URL}/dpt/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Gagal menghapus DPT');
    return result;
  },

  async importDPTExcel(token: string, list: Array<{ nama: string; kelas: string }>): Promise<{
    success: boolean;
    message: string;
    addedCount: number;
    skippedCount: number;
    totalDPT: number;
  }> {
    const res = await fetch(`${BASE_URL}/dpt/import-excel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ list })
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Gagal mengimpor data DPT');
    return result;
  },

  async resetAllDPT(token: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${BASE_URL}/dpt/reset-all`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Gagal mereset data DPT');
    return result;
  },

  async restoreDefaultDPT(token: string): Promise<{ success: boolean; dpt: DPTItem[] }> {
    const res = await fetch(`${BASE_URL}/dpt/restore-default`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  }
};
