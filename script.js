// ============ MAIN SCRIPT ============
document.addEventListener('DOMContentLoaded', async function() {
  
  console.log('=== PROFILE PAGE START ===');
  console.log('[Profile] localStorage loginData:', localStorage.getItem('loginData'));
  console.log('[Profile] window.CONFIG:', window.CONFIG);
  console.log('[Profile] window.IS_LOGGED_IN:', window.IS_LOGGED_IN);
  
  // ===== INIT HEADER =====
  initHeader();
  
  // ===== CEK LOGIN =====
  const isLoggedIn = window.IS_LOGGED_IN || false;
  
  if (!isLoggedIn) {
    showLockedOverlay();
    return;
  }

  // ===== UPDATE USER INFO DI HEADER =====
  updateUserInfo();

  // ===== LOAD DATA PROFIL =====
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
    console.error('[Profile] Error loading profile:', error);
    showError(error.message);
  }

  // ===== SCROLL TO TOP =====
  initScrollTop();

  // ===== MOBILE TOGGLE =====
  initMobileToggle();
});

// ============ UPDATE USER INFO ============
function updateUserInfo() {
  const userNameEl = document.getElementById('userName');
  const dropdownNameEl = document.getElementById('dropdownName');
  const dropdownEmailEl = document.getElementById('dropdownEmail');
  
  // Gunakan USER_DATA dari config
  const userData = window.USER_DATA || {};
  const name = userData.name || window.CONFIG?.USER_NAME || 'Guest';
  const email = userData.email || window.CONFIG?.USER_EMAIL || '-';
  
  if (userNameEl) userNameEl.textContent = name;
  if (dropdownNameEl) dropdownNameEl.textContent = name;
  if (dropdownEmailEl) dropdownEmailEl.textContent = email;
}

// ============ SHOW LOCKED OVERLAY ============
function showLockedOverlay() {
  // Cek apakah overlay sudah ada
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
        Halaman Profil hanya dapat diakses oleh ASN yang sudah login.
        Silakan login terlebih dahulu untuk melihat data profil Anda.
      </p>
      <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
        <a href="https://bidangpkabkpsdmciamis.github.io/Singgatera/" class="btn btn-primary">
          <i class="fas fa-home"></i> Kembali ke Home
        </a>
        <a href="https://bidangpkabkpsdmciamis.github.io/Singgatera/login.html" class="btn btn-secondary">
          <i class="fas fa-sign-in-alt"></i> Login
        </a>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  
  // Sembunyikan konten
  const container = document.getElementById('profileContainer');
  if (container) {
    container.style.filter = 'blur(8px)';
    container.style.pointerEvents = 'none';
  }
}

// ============ LOAD IDENTITAS ============
async function loadIdentitas() {
  const container = document.getElementById('identitasContainer');
  if (!container) return;

  try {
    const api = new ProfileDataAPI();
    const data = await api.getIdentitas();

    if (!data) {
      container.innerHTML = `
        <div style="text-align: center; padding: 30px; color: var(--gray);">
          <p>Data identitas tidak ditemukan untuk NIP: ${window.CONFIG?.NIP || '-'}</p>
        </div>
      `;
      return;
    }

    // Update header
    const avatarEl = document.querySelector('.profile-avatar');
    if (avatarEl) avatarEl.innerHTML = `<i class="fas fa-user-circle"></i>`;
    
    const nameEl = document.getElementById('profileName');
    if (nameEl) nameEl.textContent = data.Nama || window.CONFIG?.USER_NAME || 'ASN';
    
    const nipEl = document.getElementById('profileNip');
    if (nipEl) nipEl.textContent = `NIP: ${data.NIP || window.CONFIG?.NIP || '-'}`;
    
    const badgeEl = document.getElementById('profileStatus');
    if (badgeEl) {
      badgeEl.textContent = data.Status_ASN || 'ASN';
      if (data.Status_ASN === 'PNS') {
        badgeEl.classList.add('gold');
      }
    }

    // Render identitas
    const fields = [
      { label: 'Nama', value: data.Nama },
      { label: 'NIP', value: data.NIP },
      { label: 'Status ASN', value: data.Status_ASN },
      { label: 'Pangkat / Golongan', value: `${data.Pangkat || ''} / ${data.Golongan_Ruang || ''}` },
      { label: 'Email', value: data.Email },
      { label: 'No HP', value: data.No_HP },
      { label: 'Tempat, Tanggal Lahir', value: `${data.Tempat_Lahir || ''}, ${data.Tanggal_Lahir || ''}` },
      { label: 'Jenis Kelamin', value: data.Jenis_Kelamin },
      { label: 'Agama', value: data.Agama },
      { label: 'Alamat', value: data.Alamat },
      { label: 'Unit Kerja', value: data.Unit_Kerja },
      { label: 'Jabatan', value: data.Jabatan },
      { label: 'TMT Jabatan', value: data.TMT_Jabatan },
      { label: 'Pendidikan Terakhir', value: data.Pendidikan_Terakhir },
      { label: 'Tahun Lulus', value: data.Tahun_Lulus }
    ];

    container.innerHTML = fields.map(field => `
      <div class="identitas-item">
        <span class="label">${field.label}</span>
        <span class="value">${field.value || '-'}</span>
      </div>
    `).join('');

  } catch (error) {
    console.error('[Profile] Error loadIdentitas:', error);
    container.innerHTML = `
      <div style="text-align: center; padding: 30px; color: var(--danger);">
        <p>Gagal memuat data identitas: ${error.message}</p>
        <button onclick="location.reload()" class="btn btn-primary" style="margin-top: 15px;">
          <i class="fas fa-sync"></i> Coba Lagi
        </button>
      </div>
    `;
  }
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

  // User dropdown
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

  // Logout
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('loginData');
      window.location.href = 'https://bidangpkabkpsdmciamis.github.io/Singgatera/';
    });
  }
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

// ============ SHOW ERROR ============
function showError(message) {
  const container = document.getElementById('profileContainer');
  if (container) {
    container.innerHTML = `
      <div style="text-align: center; padding: 80px 20px;">
        <i class="fas fa-exclamation-circle" style="font-size: 3rem; color: var(--danger); margin-bottom: 20px;"></i>
        <h2>Gagal Memuat Profil</h2>
        <p style="color: var(--gray);">${message}</p>
        <button onclick="location.reload()" class="btn btn-primary" style="margin-top: 20px;">
          <i class="fas fa-sync"></i> Refresh
        </button>
      </div>
    `;
  }
}
