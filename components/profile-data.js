// ============ PROFILE DATA API ============
class ProfileDataAPI {
  constructor() {
    this.baseUrl = window.CONFIG?.GAS_URL || 'https://script.google.com/macros/s/AKfycbz0Gxvtrf5j4gZrKimdMAnde8wmrQiALmdURC65cAsIQJhxicd-xn_2e_8Mp8eV0ZtM6Q/exec';
    this.nip = window.CONFIG?.NIP || '';
    
    console.log('[ProfileDataAPI] Menggunakan GAS URL:', this.baseUrl);
    console.log('[ProfileDataAPI] NIP:', this.nip);
  }

  // ===== GET IDENTITAS =====
  async getIdentitas() {
    if (!this.nip) {
      throw new Error('NIP tidak ditemukan. Silakan login terlebih dahulu.');
    }

    const url = `${this.baseUrl}?action=getIdentitas&nip=${encodeURIComponent(this.nip)}`;
    console.log('[ProfileDataAPI] Fetching identitas:', url);
    
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('[ProfileDataAPI] Identitas response:', result);
      
      if (!result.success) {
        throw new Error(result.error || 'Gagal mengambil data identitas');
      }
      
      return result.data;
    } catch (error) {
      console.error('[ProfileDataAPI] Error:', error);
      throw error;
    }
  }

  // ===== GET REKAP KOMPETENSI =====
  async getRekapKompetensi(tahun = 'all') {
    if (!this.nip) {
      throw new Error('NIP tidak ditemukan');
    }

    const url = `${this.baseUrl}?action=getRekapKompetensi&nip=${encodeURIComponent(this.nip)}&tahun=${encodeURIComponent(tahun)}`;
    console.log('[ProfileDataAPI] Fetching rekap:', url);
    
    try {
      const response = await fetch(url);
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Gagal mengambil data rekap kompetensi');
      }
      
      return result.data;
    } catch (error) {
      console.error('[ProfileDataAPI] Error:', error);
      throw error;
    }
  }

  // ===== GET CHART DATA =====
  async getChartData() {
    if (!this.nip) {
      throw new Error('NIP tidak ditemukan');
    }

    const url = `${this.baseUrl}?action=getChartData&nip=${encodeURIComponent(this.nip)}`;
    console.log('[ProfileDataAPI] Fetching chart:', url);
    
    try {
      const response = await fetch(url);
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Gagal mengambil data chart');
      }
      
      return result.data;
    } catch (error) {
      console.error('[ProfileDataAPI] Error:', error);
      throw error;
    }
  }
}

window.ProfileDataAPI = ProfileDataAPI;
