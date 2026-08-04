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
  document.cookie = `loginData=${value}; expires=${expires}; path=/; domain=${CONFIG.DOMAIN}; SameSite=Lax; Secure`;
}

function getAuthCookie() {
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [key, value] = cookie.trim().split('=');
    if (key === 'loginData') {
      try {
        return JSON.parse(decodeURIComponent(value));
      } catch {
        return null;
      }
    }
  }
  return null;
}

function deleteAuthCookie() {
  document.cookie = `loginData=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${CONFIG.DOMAIN};`;
}

// ============ SYNC: Cookie ↔ localStorage ============
function syncAuthData() {
  // Prioritas: Cookie (cross-subdomain) → localStorage (fallback)
  let userData = getAuthCookie();
  
  if (!userData) {
    const localData = localStorage.getItem('loginData');
    if (localData) {
      try {
        userData = JSON.parse(localData);
        if (userData && userData.username) {
          setAuthCookie(userData);
        }
      } catch (e) {}
    }
  } else {
    localStorage.setItem('loginData', JSON.stringify(userData));
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

window.CONFIG = CONFIG;
window.IS_LOGGED_IN = IS_LOGGED_IN;
window.setAuthCookie = setAuthCookie;
window.getAuthCookie = getAuthCookie;
window.deleteAuthCookie = deleteAuthCookie;
window.logout = logout;

console.log('[Auth] IS_LOGGED_IN:', IS_LOGGED_IN);
console.log('[Auth] CONFIG.NIP:', CONFIG.NIP);
