// ============ MAIN SCRIPT ============
document.addEventListener("DOMContentLoaded", async function () {
  // ===== CEK LOGIN =====
  const isLoggedIn = checkLoginStatus();
  if (!isLoggedIn) {
    showLockedOverlay();
    return;
  }

  // ===== LOAD DATA =====
  try {
    // 1. Load Identitas
    await loadIdentitas();

    // 2. Load Rekap Kompetensi
    const kompetensiRenderer = new KompetensiRenderer();
    await kompetensiRenderer.renderRekap("rekapContainer");

    // 3. Load Spider Chart
    const spiderChart = new SpiderChart("spiderChart");
    await spiderChart.loadData();
  } catch (error) {
    console.error("Error loading profile:", error);
    document.querySelector(".profile-container").innerHTML = `
      <div style="text-align: center; padding: 80px 20px;">
        <i class="fas fa-exclamation-circle" style="font-size: 3rem; color: var(--danger); margin-bottom: 20px;"></i>
        <h2>Gagal Memuat Profil</h2>
        <p style="color: var(--gray);">${error.message}</p>
        <button onclick="location.reload()" class="btn btn-primary" style="margin-top: 20px;">
          <i class="fas fa-sync"></i> Refresh
        </button>
      </div>
    `;
  }
});

// ============ CHECK LOGIN ============
function checkLoginStatus() {
  const loginData = localStorage.getItem("loginData");

  if (!loginData) return false;

  try {
    const userData = JSON.parse(loginData);
    const loginTime = new Date(userData.loginTime);
    const currentTime = new Date();

    const isSameDay =
      loginTime.getDate() === currentTime.getDate() &&
      loginTime.getMonth() === currentTime.getMonth() &&
      loginTime.getFullYear() === currentTime.getFullYear();

    if (isSameDay && userData.nip) {
      CONFIG.NIP = userData.nip;
      return true;
    }

    localStorage.removeItem("loginData");
    return false;
  } catch (e) {
    return false;
  }
}

// ============ SHOW LOCKED OVERLAY ============
function showLockedOverlay() {
  const overlay = document.createElement("div");
  overlay.className = "locked-overlay";
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
        <a href="index.html" class="btn btn-primary">
          <i class="fas fa-home"></i> Kembali
        </a>
        <a href="login.html" class="btn btn-secondary">
          <i class="fas fa-sign-in-alt"></i> Login
        </a>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  // Sembunyikan konten
  const container = document.querySelector(".profile-container");
  if (container) {
    container.style.filter = "blur(8px)";
    container.style.pointerEvents = "none";
  }
}

// ============ LOAD IDENTITAS ============
async function loadIdentitas() {
  const container = document.getElementById("identitasContainer");
  if (!container) return;

  try {
    const api = new ProfileDataAPI();
    const data = await api.getIdentitas();

    if (!data) {
      container.innerHTML = `
        <div style="text-align: center; padding: 30px; color: var(--gray);">
          <p>Data identitas tidak ditemukan</p>
        </div>
      `;
      return;
    }

    // Update header
    document.querySelector(".profile-avatar").innerHTML =
      `<i class="fas fa-user-circle"></i>`;
    document.querySelector(".profile-info h1").textContent = data.Nama || "ASN";
    document.querySelector(".profile-info .nip").textContent =
      `NIP: ${data.NIP || "-"}`;

    const badge = document.querySelector(".badge");
    if (badge) {
      badge.textContent = data.Status_ASN || "ASN";
      if (data.Status_ASN === "PNS") {
        badge.classList.add("gold");
      }
    }

    // Render identitas
    const fields = [
      { label: "Nama", value: data.Nama },
      { label: "NIP", value: data.NIP },
      { label: "Status ASN", value: data.Status_ASN },
      {
        label: "Pangkat / Golongan",
        value: `${data.Pangkat || ""} / ${data.Golongan_Ruang || ""}`,
      },
      { label: "Email", value: data.Email },
      { label: "No HP", value: data.No_HP },
      {
        label: "Tempat, Tanggal Lahir",
        value: `${data.Tempat_Lahir || ""}, ${data.Tanggal_Lahir || ""}`,
      },
      { label: "Jenis Kelamin", value: data.Jenis_Kelamin },
      { label: "Agama", value: data.Agama },
      { label: "Alamat", value: data.Alamat },
      { label: "Unit Kerja", value: data.Unit_Kerja },
      { label: "Jabatan", value: data.Jabatan },
      { label: "TMT Jabatan", value: data.TMT_Jabatan },
      { label: "Pendidikan Terakhir", value: data.Pendidikan_Terakhir },
      { label: "Tahun Lulus", value: data.Tahun_Lulus },
    ];

    container.innerHTML = fields
      .map(
        (field) => `
      <div class="identitas-item">
        <span class="label">${field.label}</span>
        <span class="value">${field.value || "-"}</span>
      </div>
    `,
      )
      .join("");
  } catch (error) {
    console.error("Error loadIdentitas:", error);
    container.innerHTML = `
      <div style="text-align: center; padding: 30px; color: var(--danger);">
        <p>Gagal memuat data identitas: ${error.message}</p>
      </div>
    `;
  }
}
