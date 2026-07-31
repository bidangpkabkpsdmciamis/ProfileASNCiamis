// ============ KONFIGURASI ============
// Gunakan GAS URL yang sama dengan page login
const CONFIG = {
  GAS_URL: 'https://script.google.com/macros/s/AKfycbz0Gxvtrf5j4gZrKimdMAnde8wmrQiALmdURC65cAsIQJhxicd-xn_2e_8Mp8eV0ZtM6Q/exec',
  NIP: '',
  USER_NAME: 'Guest',
  USER_EMAIL: ''
};

// ============ FUNGSI CEK LOGIN ============
function checkLoginStatus() {
  try {
    const loginData = localStorage.getItem('loginData');
    
    if (!loginData) {
      console.log('[Profile] Tidak ada data login');
      return false;
    }
    
    const userData = JSON.parse(loginData);
    console.log('[Profile] Data login:', userData);
    
    // Ambil NIP dari field username (sesuai dengan login page)
    const nip = userData.username || '';
    const name = userData.name || 'Guest';
    
    if (!nip) {
      console.log('[Profile] NIP tidak ditemukan');
      return false;
    }
    
    // Cek apakah login masih berlaku (sama hari)
    const loginTime = new Date(userData.loginTime);
    const currentTime = new Date();
    const isSameDay = 
      loginTime.getDate() === currentTime.getDate() &&
      loginTime.getMonth() === currentTime.getMonth() &&
      loginTime.getFullYear() === currentTime.getFullYear();
    
    if (!isSameDay) {
      console.log('[Profile] Login sudah kadaluarsa');
      localStorage.removeItem('loginData');
      return false;
    }
    
    // Set data ke CONFIG
    CONFIG.NIP = nip;
    CONFIG.USER_NAME = name;
    CONFIG.USER_EMAIL = userData.email || '';
    
    console.log('[Profile] Login valid! NIP:', CONFIG.NIP);
    return true;
    
  } catch (error) {
    console.error('[Profile] Error:', error);
    return false;
  }
}

// ============ EKSEKUSI ============
const IS_LOGGED_IN = checkLoginStatus();

// EXPORT ke window
window.CONFIG = CONFIG;
window.IS_LOGGED_IN = IS_LOGGED_IN;

console.log('[Profile] IS_LOGGED_IN:', IS_LOGGED_IN);
console.log('[Profile] CONFIG.NIP:', CONFIG.NIP);
