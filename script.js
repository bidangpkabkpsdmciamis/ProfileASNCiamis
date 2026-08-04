// ============ SCRIPT.JS - MAIN SCRIPT ============

document.addEventListener('DOMContentLoaded', async function() {
  
  console.log('=== PROFILE PAGE START ===');
  console.log('[Profile] window.IS_LOGGED_IN:', window.IS_LOGGED_IN);
  console.log('[Profile] window.CONFIG?.NIP:', window.CONFIG?.NIP);
  console.log('[Profile] window.CONFIG?.USER_NAME:', window.CONFIG?.USER_NAME);
  console.log('[Profile] URL:', window.location.href);
  console.log('[Profile] localStorage:', localStorage.getItem('loginData'));
  
  // ===== CEK APAKAH ELEMEN ADA =====
  const container = document.getElementById('profileContainer');
  if (!container) {
    console.error('[Profile] ERROR: Elemen #profileContainer tidak ditemukan!');
    document.body.innerHTML = `
      <div style="text-align: center; padding: 80px 20px; font-family: Arial, sans-serif;">
        <h2>⚠️ Error Halaman</h2>
        <p style="color: #666;">Elemen container tidak ditemukan.</p>
        <a href="https://www.singgatera.my.id/" class="btn btn-primary" style="margin-top: 20px; display: inline-block; padding: 12px 30px; background: #2563eb; color: white; text-decoration: none; border-radius: 8px;">
          Kembali ke Home
        </a>
      </div>
    `;
    return;
  }
  
  // ===== CEK LOGIN =====
  let isLoggedIn = window.IS_LOGGED_IN || false;
  
  // Jika tidak login, coba cek query parameter token
  if (!isLoggedIn) {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    if (token) {
      try {
        const userData = JSON.parse(decodeURIComponent(token));
        if (userData && userData.username) {
          console.log('[Profile] Found token in URL, saving to localStorage');
          localStorage.setItem('loginData', JSON.stringify(userData));
          // Refresh config
          if (typeof window.checkLoginStatus === 'function') {
            window.checkLoginStatus();
            isLoggedIn = window.IS_LOGGED_IN || true;
          } else {
            // Force reload config
            location.reload();
            return;
          }
        }
      } catch (e) {
        console.error('[Profile] Error parsing token:', e);
      }
    }
  }
  
  if (!isLoggedIn) {
    console.log('[Profile] ❌ Belum login, menampilkan lock screen');
    showLockedOverlay();
    return;
  }

  console.log('[Profile] ✅ Login confirmed, loading data...');

  // ===== UPDATE HEADER =====
  updateUserInfo();

  // ===== LOAD DATA =====
  try {
    // 1. Load Identitas
    await loadIdentitas();
    
    // 2. Load Rekap Kompetensi
    const kompetensiRenderer = new KompetensiRenderer();
    await kompetensiRenderer.renderRekap('rekapContainer');
    
    // 3. Load Spider Chart
    const spiderChart = new SpiderChart('spiderChart');
    await spiderChart.loadData();
    
  } catch (error) {
    console.error('[Profile] Error:', error);
    showError(error.message);
  }

  // ===== INIT COMPONENTS =====
  initHeader();
  initScrollTop();
  initMobileToggle();
  
  // ===== SETUP TOMBOL EDIT PROFIL =====
  setupEditButton();
});

// ... sisanya sama seperti sebelumnya (fungsi formatDate, updateUserInfo, showLockedOverlay, loadIdentitas, setupEditButton, initHeader, initScrollTop, initMobileToggle) ...
