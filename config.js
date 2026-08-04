// ============ KONFIGURASI ============
const CONFIG = {
  GAS_URL: 'https://script.google.com/macros/s/AKfycby6ZesA7-ucTDue5wg92abdEQNQr8po_w6legTcOg7LHnzSdfQi1t7vqAz2X7oIiyOvbw/exec',
  GAS_WRITE_URL: 'https://script.google.com/macros/s/AKfycbxgrroFCX-rj3XutVILU25gSLIqoocgb93iSfdeSGfjcLqDYabFnvbfRPr0Cb2GiZPNLg/exec',
  NIP: '',
  USER_NAME: 'Guest',
  USER_EMAIL: '',
  DOMAIN: '.singgatera.my.id'
};

// ============ COOKIE UTILITY ============
function setAuthCookie(userData, days = 1) {
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  const value = encodeURIComponent(JSON.stringify(userData));
  
  // PENTING: domain harus dengan titik di depan
  // dan path harus '/' agar semua halaman bisa akses
  const cookieString = `loginData=${value}; expires=${expires}; path=/; domain=${CONFIG.DOMAIN}; SameSite=Lax; Secure`;
  
  document.cookie = cookieString;
  console.log('[Cookie] Set cookie:', cookieString);
  console.log('[Cookie] All cookies:', document.cookie);
}

function getAuthCookie() {
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const trimmed = cookie.trim();
    if (trimmed.startsWith('loginData=')) {
      try {
        const value = trimmed.substring('loginData='.length);
        const decoded = decodeURIComponent(value);
        return JSON.parse(decoded);
      } catch (e) {
        console.error('[Cookie] Parse error:', e);
        return null;
      }
    }
  }
  return null;
}

function deleteAuthCookie() {
  document.cookie = `loginData=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${CONFIG.DOMAIN};`;
}

// ============ CEK COOKIE DI BROWSER ============
function debugCookies() {
  console.log('[Cookie Debug] All cookies:', document.cookie);
  console.log('[Cookie Debug] loginData:', getAuthCookie());
  console.log('[Cookie Debug] CONFIG.DOMAIN:', CONFIG.DOMAIN);
}

// ============ SYNC: Cookie ↔ localStorage ============
function syncAuthData() {
  // 1. Coba ambil dari cookie
  let userData = getAuthCookie();
  
  // 2. Jika tidak ada di cookie, coba localStorage
  if (!userData) {
    const localData = localStorage.getItem('loginData');
    if (localData) {
      try {
        userData = JSON.parse(localData);
        // Sync ke cookie
        if (userData && userData.username) {
          console.log('[Sync] Syncing localStorage → cookie');
          setAuthCookie(userData);
        }
      } catch (e) {
        console.error('[Sync] Error parsing localStorage:', e);
      }
    }
  }
  
  // 3. Jika ada di cookie, sync ke localStorage
  if (userData) {
    localStorage.setItem('loginData', JSON.stringify(userData));
    console.log('[Sync] User data:', userData);
  } else {
    console.log('[Sync] No user data found');
  }
  
  return userData;
}

// ============ CEK LOGIN ============
function checkLoginStatus() {
  try {
    const userData = syncAuthData();
    
    if (!userData) {
      console.log('[Auth] Tidak ada data login');
      return false;
    }
    
    const nip = userData.username || userData.nip || '';
    const name = userData.name || 'Guest';
    
    if (!nip) {
      console.log('[Auth] NIP tidak ditemukan');
      return false;
    }
    
    // Cek expired (24 jam)
    const loginTime = new Date(userData.loginTime);
    const currentTime = new Date();
    const hoursDiff = (currentTime - loginTime) / (1000 * 60 * 60);
    
    if (hoursDiff > 24) {
      console.log('[Auth] Login sudah kadaluarsa');
      deleteAuthCookie();
      localStorage.removeItem('loginData');
      return false;
    }
    
    CONFIG.NIP = nip;
    CONFIG.USER_NAME = name;
    CONFIG.USER_EMAIL = userData.email || '';
    
    console.log('[Auth] Login valid! NIP:', CONFIG.NIP);
    console.log('[Auth] Name:', CONFIG.USER_NAME);
    return true;
    
  } catch (error) {
    console.error('[Auth] Error:', error);
    return false;
  }
}

// ============ LOGOUT ============
function logout() {
  deleteAuthCookie();
  localStorage.removeItem('loginData');
  sessionStorage.removeItem('loginData');
  window.location.href = 'https://www.singgatera.my.id/';
}

// ============ EKSEKUSI ============
const IS_LOGGED_IN = checkLoginStatus();

// Debug
console.log('[Auth] IS_LOGGED_IN:', IS_LOGGED_IN);
console.log('[Auth] CONFIG.NIP:', CONFIG.NIP);
console.log('[Auth] CONFIG.USER_NAME:', CONFIG.USER_NAME);
debugCookies();

// Export ke window
window.CONFIG = CONFIG;
window.IS_LOGGED_IN = IS_LOGGED_IN;
window.setAuthCookie = setAuthCookie;
window.getAuthCookie = getAuthCookie;
window.deleteAuthCookie = deleteAuthCookie;
window.logout = logout;
window.debugCookies = debugCookies;
