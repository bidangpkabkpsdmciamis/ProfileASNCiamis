// ============ KONFIGURASI ============
const CONFIG = {
  GAS_URL: window.GAS_URL || 'https://script.google.com/macros/s/AKfycbz0Gxvtrf5j4gZrKimdMAnde8wmrQiALmdURC65cAsIQJhxicd-xn_2e_8Mp8eV0ZtM6Q/exec',
  NIP: '',
  USER_NAME: 'Guest',
  USER_EMAIL: ''
};

// ============ FUNGSI CEK LOGIN ============
// Mengadopsi struktur login dari page login: { name, username, loginTime }
function checkLoginStatus() {
  try {
    const loginData = localStorage.getItem('loginData');
    
    if (!loginData) {
      console.log('[Profile] Tidak ada data login di localStorage');
      return false;
    }
    
    const userData = JSON.parse(loginData);
    console.log('[Profile] Data login ditemukan:', userData);
    
    // Cek apakah login masih berlaku (sama seperti di home)
    const loginTime = new Date(userData.loginTime);
    const currentTime = new Date();
    
    const isSameDay = 
      loginTime.getDate() === currentTime.getDate() &&
      loginTime.getMonth() === currentTime.getMonth() &&
      loginTime.getFullYear() === currentTime.getFullYear();
    
    // Ambil NIP dari field username (karena di login menggunakan username untuk NIP)
    const nip = userData.username || userData.nip || userData.NIP || '';
    
    if (isSameDay && nip) {
      // Set data ke CONFIG
      CONFIG.NIP = nip;
      CONFIG.USER_NAME = userData.name || 'Guest';
      CONFIG.USER_EMAIL = userData.email || userData.username || '';
      
      console.log('[Profile] Login valid untuk NIP:', CONFIG.NIP);
      console.log('[Profile] Nama:', CONFIG.USER_NAME);
      return true;
    } else {
      console.log('[Profile] Login sudah kadaluarsa atau NIP tidak ditemukan');
      localStorage.removeItem('loginData');
      return false;
    }
  } catch (e) {
    console.error('[Profile] Error checkLoginStatus:', e);
    localStorage.removeItem('loginData');
    return false;
  }
}

// ============ FUNGSI GET USER DATA ============
function getUserData() {
  try {
    const loginData = localStorage.getItem('loginData');
    if (!loginData) return null;
    return JSON.parse(loginData);
  } catch (e) {
    return null;
  }
}

// ============ INIT ============
const IS_LOGGED_IN = checkLoginStatus();
const USER_DATA = getUserData();

// Export untuk digunakan
window.CONFIG = CONFIG;
window.IS_LOGGED_IN = IS_LOGGED_IN;
window.USER_DATA = USER_DATA;
