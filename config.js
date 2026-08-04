// ============ KONFIGURASI ============
const CONFIG = {
  // GAS URL untuk READ (membaca data)
  GAS_URL: 'https://script.google.com/macros/s/AKfycby6ZesA7-ucTDue5wg92abdEQNQr8po_w6legTcOg7LHnzSdfQi1t7vqAz2X7oIiyOvbw/exec',
  
  // GAS URL untuk WRITE (menyimpan data)
  GAS_WRITE_URL: 'https://script.google.com/macros/s/AKfycbxgrroFCX-rj3XutVILU25gSLIqoocgb93iSfdeSGfjcLqDYabFnvbfRPr0Cb2GiZPNLg/exec',
  
  NIP: '',
  USER_NAME: 'Guest',
  USER_EMAIL: ''
};

// ============ FUNGSI CEK LOGIN ============
function checkLoginStatus() {
  try {
    // ===== STEP 1: CEK URL PARAMETER (dari redirect login) =====
    const urlParams = new URLSearchParams(window.location.search);
    const loginDataParam = urlParams.get('loginData');
    
    if (loginDataParam) {
      console.log('[Profile] ✅ Login data ditemukan di URL parameter');
      try {
        const loginData = JSON.parse(decodeURIComponent(loginDataParam));
        console.log('[Profile] Data login dari URL:', loginData);
        
        // Simpan ke localStorage
        localStorage.setItem('loginData', JSON.stringify(loginData));
        console.log('[Profile] ✅ Data login tersimpan ke localStorage');
        
        // Hapus parameter dari URL (bersihkan URL)
        const cleanUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
        console.log('[Profile] ✅ URL parameter dihapus');
        
        // Set CONFIG
        CONFIG.NIP = loginData.username || '';
        CONFIG.USER_NAME = loginData.name || 'Guest';
        CONFIG.USER_EMAIL = loginData.email || '';
        
        console.log('[Profile] ✅ Login valid dari URL! NIP:', CONFIG.NIP);
        return true;
      } catch (e) {
        console.error('[Profile] ❌ Gagal parse login data dari URL:', e);
      }
    }
    
    // ===== STEP 2: CEK LOCALSTORAGE =====
    const loginData = localStorage.getItem('loginData');
    
    if (!loginData) {
      console.log('[Profile] ❌ Tidak ada data login di localStorage');
      return false;
    }
    
    const userData = JSON.parse(loginData);
    console.log('[Profile] Data login dari localStorage:', userData);
    
    // Ambil NIP dari field username (sesuai dengan login page)
    const nip = userData.username || '';
    const name = userData.name || 'Guest';
    
    if (!nip) {
      console.log('[Profile] ❌ NIP tidak ditemukan di data login');
      return false;
    }
    
    // ===== STEP 3: CEK MASA BERLAKU LOGIN (sama hari) =====
    const loginTime = new Date(userData.loginTime);
    const currentTime = new Date();
    const isSameDay = 
      loginTime.getDate() === currentTime.getDate() &&
      loginTime.getMonth() === currentTime.getMonth() &&
      loginTime.getFullYear() === currentTime.getFullYear();
    
    if (!isSameDay) {
      console.log('[Profile] ⚠️ Login sudah kadaluarsa (beda hari)');
      localStorage.removeItem('loginData');
      return false;
    }
    
    // ===== STEP 4: SET DATA KE CONFIG =====
    CONFIG.NIP = nip;
    CONFIG.USER_NAME = name;
    CONFIG.USER_EMAIL = userData.email || '';
    
    console.log('[Profile] ✅ Login valid dari localStorage! NIP:', CONFIG.NIP);
    return true;
    
  } catch (error) {
    console.error('[Profile] ❌ Error checkLoginStatus:', error);
    return false;
  }
}

// ============ FUNGSI REDIRECT KE LOGIN (jika belum login) ============
function redirectToLogin() {
  const currentUrl = window.location.href;
  const encodedRedirect = encodeURIComponent(currentUrl);
  window.location.href = `https://www.singgatera.my.id/login.html?redirect=${encodedRedirect}`;
}

// ============ EKSEKUSI ============
const IS_LOGGED_IN = checkLoginStatus();

// EKSPORT ke window
window.CONFIG = CONFIG;
window.IS_LOGGED_IN = IS_LOGGED_IN;
window.redirectToLogin = redirectToLogin;

console.log('[Profile] ========== STATUS ==========');
console.log('[Profile] IS_LOGGED_IN:', IS_LOGGED_IN);
console.log('[Profile] CONFIG.NIP:', CONFIG.NIP);
console.log('[Profile] CONFIG.USER_NAME:', CONFIG.USER_NAME);
console.log('[Profile] GAS_URL:', CONFIG.GAS_URL);
console.log('[Profile] =============================');
