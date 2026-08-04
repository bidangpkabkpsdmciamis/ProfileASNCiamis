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
  try {
    const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
    const value = encodeURIComponent(JSON.stringify(userData));
    document.cookie = `loginData=${value}; expires=${expires}; path=/; domain=${CONFIG.DOMAIN}; SameSite=Lax`;
    console.log('[Cookie] Set cookie:', document.cookie);
  } catch (e) {
    console.error('[Cookie] Error setting cookie:', e);
  }
}

function getAuthCookie() {
  try {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const trimmed = cookie.trim();
      if (trimmed.startsWith('loginData=')) {
        const value = trimmed.substring('loginData='.length);
        const decoded = decodeURIComponent(value);
        return JSON.parse(decoded);
      }
    }
  } catch (e) {
    console.error('[Cookie] Error reading cookie:', e);
  }
  return null;
}

function deleteAuthCookie() {
  document.cookie = `loginData=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${CONFIG.DOMAIN};`;
}

// ============ CEK LOGIN - PRIORITAS: localStorage → cookie ============
function checkLoginStatus() {
  console.log('[Auth] ===== CHECKING LOGIN STATUS =====');
  console.log('[Auth] Current URL:', window.location.href);
  console.log('[Auth] Document.domain:', document.domain);
  console.log('[Auth] All cookies:', document.cookie);
  
  try {
    // ===== 1. CEK DARI localStorage (PRIORITAS UTAMA) =====
    let userData = null;
    const localData = localStorage.getItem('loginData');
    console.log('[Auth] localStorage loginData:', localData);
    
    if (localData) {
      try {
        userData = JSON.parse(localData);
        console.log('[Auth] Found userData in localStorage:', userData);
      } catch (e) {
        console.error('[Auth] Error parsing localStorage:', e);
      }
    }
    
    // ===== 2. CEK DARI COOKIE (fallback) =====
    if (!userData) {
      userData = getAuthCookie();
      if (userData) {
        console.log('[Auth] Found userData in cookie:', userData);
        // Sync ke localStorage
        localStorage.setItem('loginData', JSON.stringify(userData));
      }
    }
    
    // ===== 3. CEK DARI QUERY PARAMETER (redirect dari login) =====
    if (!userData) {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      if (token) {
        try {
          userData = JSON.parse(decodeURIComponent(token));
          console.log('[Auth] Found userData in query param:', userData);
          // Simpan ke localStorage dan cookie
          localStorage.setItem('loginData', JSON.stringify(userData));
          setAuthCookie(userData);
        } catch (e) {
          console.error('[Auth] Error parsing token:', e);
        }
      }
    }
    
    // ===== 4. CEK DARI sessionStorage =====
    if (!userData) {
      const sessionData = sessionStorage.getItem('loginData');
      if (sessionData) {
        try {
          userData = JSON.parse(sessionData);
          console.log('[Auth] Found userData in sessionStorage:', userData);
          localStorage.setItem('loginData', JSON.stringify(userData));
        } catch (e) {
          console.error('[Auth] Error parsing sessionStorage:', e);
        }
      }
    }
    
    // ===== VALIDASI DATA =====
    if (!userData) {
      console.log('[Auth] ❌ No login data found');
      return false;
    }
    
    const nip = userData.username || userData.nip || '';
    const name = userData.name || 'Guest';
    
    if (!nip) {
      console.log('[Auth] ❌ NIP not found in data');
      return false;
    }
    
    // Cek expired (24 jam)
    const loginTime = new Date(userData.loginTime);
    const currentTime = new Date();
    const hoursDiff = (currentTime - loginTime) / (1000 * 60 * 60);
    
    if (hoursDiff > 24) {
      console.log('[Auth] ❌ Login expired (', hoursDiff.toFixed(1), 'hours ago)');
      deleteAuthCookie();
      localStorage.removeItem('loginData');
      sessionStorage.removeItem('loginData');
      return false;
    }
    
    // ===== LOGIN VALID =====
    CONFIG.NIP = nip;
    CONFIG.USER_NAME = name;
    CONFIG.USER_EMAIL = userData.email || '';
    
    console.log('[Auth] ✅ Login VALID!');
    console.log('[Auth] NIP:', CONFIG.NIP);
    console.log('[Auth] Name:', CONFIG.USER_NAME);
    console.log('[Auth] Email:', CONFIG.USER_EMAIL);
    console.log('[Auth] Hours since login:', hoursDiff.toFixed(1));
    
    return true;
    
  } catch (error) {
    console.error('[Auth] ❌ Error in checkLoginStatus:', error);
    return false;
  }
}

// ============ LOGOUT ============
function logout() {
  console.log('[Auth] Logging out...');
  deleteAuthCookie();
  localStorage.removeItem('loginData');
  sessionStorage.removeItem('loginData');
  window.location.href = 'https://www.singgatera.my.id/';
}

// ============ EKSEKUSI ============
const IS_LOGGED_IN = checkLoginStatus();

// Export ke window
window.CONFIG = CONFIG;
window.IS_LOGGED_IN = IS_LOGGED_IN;
window.setAuthCookie = setAuthCookie;
window.getAuthCookie = getAuthCookie;
window.deleteAuthCookie = deleteAuthCookie;
window.logout = logout;

console.log('[Auth] ===== FINAL RESULT =====');
console.log('[Auth] IS_LOGGED_IN:', IS_LOGGED_IN);
console.log('[Auth] CONFIG.NIP:', CONFIG.NIP);
console.log('[Auth] CONFIG.USER_NAME:', CONFIG.USER_NAME);
