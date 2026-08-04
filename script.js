// ============ SCRIPT.JS - MAIN SCRIPT ============
// File ini digunakan bersama di semua halaman SINGGATERA

// ============ UPDATE USER INFO ============
function updateUserInfo() {
  const userNameEl = document.getElementById('userName');
  const dropdownNameEl = document.getElementById('dropdownName');
  const dropdownEmailEl = document.getElementById('dropdownEmail');
  
  // Gunakan CONFIG yang sudah di-set oleh checkLoginStatus()
  const name = window.CONFIG?.USER_NAME || 'Guest';
  const email = window.CONFIG?.USER_EMAIL || '-';
  
  if (userNameEl) userNameEl.textContent = name;
  if (dropdownNameEl) dropdownNameEl.textContent = name;
  if (dropdownEmailEl) dropdownEmailEl.textContent = email;
}

// ============ CEK LOGIN STATUS ============
function isUserLoggedIn() {
  return window.IS_LOGGED_IN || false;
}

// ============ INIT HEADER ============
function initHeader() {
  const header = document.getElementById('header');
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
  }

  // ===== USER DROPDOWN =====
  const userBtn = document.getElementById('userBtn');
  const userDropdown = document.getElementById('userDropdown');
  
  if (userBtn && userDropdown) {
    userBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      userDropdown.classList.toggle('active');
    });

    document.addEventListener('click', () => {
      userDropdown.classList.remove('active');
    });
  }

  // ===== LOGOUT =====
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Gunakan fungsi logout global dari config.js
      if (typeof window.logout === 'function') {
        window.logout();
      } else {
        // Fallback manual
        localStorage.removeItem('loginData');
        sessionStorage.removeItem('loginData');
        document.cookie = 'loginData=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.singgatera.my.id;';
        window.location.href = 'https://www.singgatera.my.id/';
      }
    });
  }
}

// ============ INIT MOBILE TOGGLE ============
function initMobileToggle() {
  const mobileToggle = document.getElementById('mobileToggle');
  const nav = document.getElementById('nav');
  
  if (!mobileToggle || !nav) return;
  
  mobileToggle.addEventListener('click', () => {
    nav.classList.toggle('active');
    mobileToggle.innerHTML = nav.classList.contains('active')
      ? '<i class="fas fa-times"></i>'
      : '<i class="fas fa-bars"></i>';
  });

  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target) && !mobileToggle.contains(e.target)) {
      nav.classList.remove('active');
      mobileToggle.innerHTML = '<i class="fas fa-bars"></i>';
    }
  });
}

// ============ INIT SCROLL TOP ============
function initScrollTop() {
  const scrollTopBtn = document.getElementById('scrollTop');
  if (!scrollTopBtn) return;
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
      scrollTopBtn.classList.add('active');
    } else {
      scrollTopBtn.classList.remove('active');
    }
  });

  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ============ SHOW LOCKED OVERLAY ============
function showLockedOverlay() {
  if (document.getElementById('lockedOverlay')) return;
  
  const overlay = document.createElement('div');
  overlay.className = 'locked-overlay';
  overlay.id = 'lockedOverlay';
  overlay.innerHTML = `
    <div class="locked-content">
      <div class="lock-icon">
        <i class="fas fa-lock"></i>
      </div>
      <h2>🔒 Akses Terbatas</h2>
      <p>
        Halaman ini hanya dapat diakses oleh ASN yang sudah login.
        Silakan login terlebih dahulu untuk mengakses halaman ini.
      </p>
      <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
        <a href="https://www.singgatera.my.id/" class="btn btn-primary">
          <i class="fas fa-home"></i> Kembali ke Home
        </a>
        <a href="https://www.singgatera.my.id/login.html" class="btn btn-secondary">
          <i class="fas fa-sign-in-alt"></i> Login
        </a>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  
  // Blur content di belakang overlay
  const containers = document.querySelectorAll('.container, .profile-container, .main-container');
  containers.forEach(el => {
    el.style.filter = 'blur(8px)';
    el.style.pointerEvents = 'none';
  });
}

// ============ HIDE LOCKED OVERLAY ============
function hideLockedOverlay() {
  const overlay = document.getElementById('lockedOverlay');
  if (overlay) {
    overlay.remove();
  }
  
  const containers = document.querySelectorAll('.container, .profile-container, .main-container');
  containers.forEach(el => {
    el.style.filter = 'none';
    el.style.pointerEvents = 'auto';
  });
}

// ============ PROTECT PAGE ============
function protectPage() {
  const isLoggedIn = window.IS_LOGGED_IN || false;
  
  if (!isLoggedIn) {
    console.log('[Protect] User belum login, menampilkan lock screen');
    showLockedOverlay();
    return false;
  }
  
  console.log('[Protect] User sudah login');
  hideLockedOverlay();
  updateUserInfo();
  return true;
}

// ============ FORMAT TANGGAL ============
function formatDate(dateValue) {
  if (!dateValue || dateValue === '-' || dateValue === '') return '-';
  
  try {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) {
      return dateValue;
    }
    const options = { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    };
    return date.toLocaleDateString('id-ID', options);
  } catch (e) {
    return dateValue;
  }
}

// ============ SHOW ERROR ============
function showError(message, containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error('[Error] Container tidak ditemukan');
    return;
  }
  
  container.innerHTML = `
    <div style="text-align: center; padding: 80px 20px;">
      <i class="fas fa-exclamation-circle" style="font-size: 3rem; color: var(--danger); margin-bottom: 20px;"></i>
      <h2>Gagal Memuat Data</h2>
      <p style="color: var(--gray);">${message}</p>
      <button onclick="location.reload()" class="btn btn-primary" style="margin-top: 20px;">
        <i class="fas fa-sync"></i> Refresh
      </button>
    </div>
  `;
}

// ============ SHOW LOADING ============
function showLoading(containerId, message = 'Memuat data...') {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  container.innerHTML = `
    <div class="loading">
      <div class="spinner"></div>
      <p>${message}</p>
    </div>
  `;
}

// ============ GET QUERY PARAMETER ============
function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

// ============ REDIRECT IF NOT LOGGED IN ============
function redirectIfNotLoggedIn(redirectUrl = 'https://www.singgatera.my.id/login.html') {
  if (!window.IS_LOGGED_IN) {
    const currentUrl = encodeURIComponent(window.location.href);
    window.location.href = `${redirectUrl}?redirect=${currentUrl}`;
    return true;
  }
  return false;
}

// ============ CHECK AUTH STATUS ============
function checkAuthAndRedirect() {
  const isLoggedIn = window.IS_LOGGED_IN || false;
  
  if (!isLoggedIn) {
    // Coba refresh data dari cookie
    if (typeof window.checkLoginStatus === 'function') {
      const refreshed = window.checkLoginStatus();
      if (refreshed) {
        updateUserInfo();
        return true;
      }
    }
    return false;
  }
  
  updateUserInfo();
  return true;
}

// ============ EXPORT KE GLOBAL ============
window.updateUserInfo = updateUserInfo;
window.isUserLoggedIn = isUserLoggedIn;
window.initHeader = initHeader;
window.initMobileToggle = initMobileToggle;
window.initScrollTop = initScrollTop;
window.showLockedOverlay = showLockedOverlay;
window.hideLockedOverlay = hideLockedOverlay;
window.protectPage = protectPage;
window.formatDate = formatDate;
window.showError = showError;
window.showLoading = showLoading;
window.getQueryParam = getQueryParam;
window.redirectIfNotLoggedIn = redirectIfNotLoggedIn;
window.checkAuthAndRedirect = checkAuthAndRedirect;

console.log('[Script.js] Loaded successfully');
console.log('[Script.js] IS_LOGGED_IN:', window.IS_LOGGED_IN);
