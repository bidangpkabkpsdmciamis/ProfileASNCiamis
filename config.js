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

// ============ FUNGSI BACA COOKIE ============
function getCookie(name) {
  const cookies = document.cookie.split('; ');
  for (let cookie of cookies) {
    const [key, value] = cookie.split('=');
    if (key === name) {
      try {
        return JSON.parse(decodeURIComponent(value));
      } catch (e) {
        console.error('[Cookie] Gagal parse:', e);
        return null;
      }
    }
  }
  return null;
}

// ============ FUNGSI CEK LOGIN (DIPERBAIKI DENGAN COOKIE) ============
function checkLoginStatus() {
  try {
    console.log('[Profile] ===== CHECK LOGIN STATUS =====');
    
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
        
        // Simpan ke cookie
        const cookieValue = encodeURIComponent(JSON.stringify(loginData));
        document.cookie = `loginData=${cookieValue}; path=/; domain=.singgatera.my.id; max-age=86400; SameSite=Lax; Secure`;
        console.log('[Profile] ✅ Data login tersimpan ke cookie');
        
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
    
    // ===== STEP 2: CEK COOKIE (PRIORITAS UTAMA) =====
    const cookieData = getCookie('loginData');
    
    if (cookieData) {
      console.log('[Profile] ✅ Login data ditemukan di COOKIE');
      console.log('[Profile] Data cookie:', cookieData);
      
      const nip = cookieData.username || '';
      const name = cookieData.name || 'Guest';
      
      if (!nip) {
        console.log('[Profile] ❌ NIP tidak ditemukan di cookie');
        return false;
      }
      
      // Cek masa berlaku (sama hari)
      const loginTime = new Date(cookieData.loginTime);
      const currentTime = new Date();
      const isSameDay = 
        loginTime.getDate() === currentTime.getDate() &&
        loginTime.getMonth() === currentTime.getMonth() &&
        loginTime.getFullYear() === currentTime.getFullYear();
      
      if (!isSameDay) {
        console.log('[Profile] ⚠️ Cookie login sudah kadaluarsa');
        // Hapus cookie
        document.cookie = `loginData=; path=/; domain=.singgatera.my.id; max-age=0`;
        return false;
      }
      
      // ===== SYNC KE LOCALSTORAGE =====
      localStorage.setItem('loginData', JSON.stringify(cookieData));
      console.log('[Profile] ✅ Data cookie disinkronkan ke localStorage');
      
      // Set CONFIG
      CONFIG.NIP = nip;
      CONFIG.USER_NAME = name;
      CONFIG.USER_EMAIL = cookieData.email || '';
      
      console.log('[Profile] ✅ Login valid dari COOKIE! NIP:', CONFIG.NIP);
      return true;
    }
    
    console.log('[Profile] ❌ Tidak ada cookie login');
    
    // ===== STEP 3: FALLBACK KE LOCALSTORAGE =====
    const loginData = localStorage.getItem('loginData');
    
    if (loginData) {
      console.log('[Profile] 📦 Login data ditemukan di localStorage (fallback)');
      const userData = JSON.parse(loginData);
      const nip = userData.username || '';
      const name = userData.name || 'Guest';
      
      if (!nip) {
        console.log('[Profile] ❌ NIP tidak ditemukan di localStorage');
        return false;
      }
      
      // Cek masa berlaku
      const loginTime = new Date(userData.loginTime);
      const currentTime = new Date();
      const isSameDay = 
        loginTime.getDate() === currentTime.getDate() &&
        loginTime.getMonth() === currentTime.getMonth() &&
        loginTime.getFullYear() === currentTime.getFullYear();
      
      if (!isSameDay) {
        console.log('[Profile] ⚠️ Login di localStorage sudah kadaluarsa');
        localStorage.removeItem('loginData');
        return false;
      }
      
      // ===== RESTORE COOKIE =====
      const cookieValue = encodeURIComponent(JSON.stringify(userData));
      document.cookie = `loginData=${cookieValue}; path=/; domain=.singgatera.my.id; max-age=86400; SameSite=Lax; Secure`;
      console.log('[Profile] ✅ Cookie direstore dari localStorage');
      
      CONFIG.NIP = nip;
      CONFIG.USER_NAME = name;
      CONFIG.USER_EMAIL = userData.email || '';
      
      console.log('[Profile] ✅ Login valid dari localStorage! NIP:', CONFIG.NIP);
      return true;
    }
    
    console.log('[Profile] ❌ Tidak ada data login ditemukan sama sekali');
    return false;
    
  } catch (error) {
    console.error('[Profile] ❌ Error checkLoginStatus:', error);
    return false;
  }
}

// ============ FUNGSI LOGOUT ============
function logout() {
  // Hapus cookie
  document.cookie = `loginData=; path=/; domain=.singgatera.my.id; max-age=0`;
  // Hapus localStorage
  localStorage.removeItem('loginData');
  // Hapus sessionStorage
  sessionStorage.removeItem('redirectAfterLogin');
  console.log('[Profile] ✅ Logout berhasil - semua data dihapus');
  window.location.href = 'https://www.singgatera.my.id/?logout=true';
}

// ============ EKSEKUSI ============
const IS_LOGGED_IN = checkLoginStatus();

// EXPORT ke window
window.CONFIG = CONFIG;
window.IS_LOGGED_IN = IS_LOGGED_IN;
window.logout = logout;

console.log('[Profile] ========== STATUS AKHIR ==========');
console.log('[Profile] IS_LOGGED_IN:', IS_LOGGED_IN);
console.log('[Profile] CONFIG.NIP:', CONFIG.NIP);
console.log('[Profile] CONFIG.USER_NAME:', CONFIG.USER_NAME);
console.log('[Profile] ===================================');
