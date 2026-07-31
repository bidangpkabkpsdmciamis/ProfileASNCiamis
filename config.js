
// ============ KONFIGURASI ============
// GAS_URL di-set dari environment variable atau build time
// Jangan hardcode di file ini untuk keamanan
const CONFIG = {
  // Untuk development, set manual. Untuk production, gunakan window.GAS_URL
  GAS_URL: window.GAS_URL || 'https://script.google.com/macros/s/AKfycbz0Gxvtrf5j4gZrKimdMAnde8wmrQiALmdURC65cAsIQJhxicd-xn_2e_8Mp8eV0ZtM6Q/exec',
  NIP: '' // Akan diisi dari localStorage
};

// Set NIP dari localStorage (sama dengan login di home/evaluasi)
(function initConfig() {
  try {
    const loginData = localStorage.getItem('loginData');
    if (loginData) {
      const userData = JSON.parse(loginData);
      CONFIG.NIP = userData.nip || userData.NIP || '';
      CONFIG.USER_NAME = userData.name || 'Guest';
      CONFIG.USER_EMAIL = userData.email || '';
    }
  } catch (e) {
    console.error('Gagal membaca loginData:', e);
  }
})();

// Export untuk digunakan
window.CONFIG = CONFIG;
