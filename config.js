// ============ KONFIGURASI ============
// GAS_URL diambil dari environment variable atau di-set saat build
// Jangan hardcode di file ini jika deploy di production
const CONFIG = {
  // Untuk development, set manual. Untuk production, gunakan window.GAS_URL
  GAS_URL:
    window.GAS_URL ||
    "https://script.google.com/macros/s/AKfycbzG2wcJT49KxrD7kLsFdbywiluBl_ij-wr9YLOkrhNClPzhOio_F1eqCsR1414CFTIQNA/exec",
  NIP: "", // Akan diisi dari localStorage atau cookie
};

// Set NIP dari localStorage
const loginData = localStorage.getItem("loginData");
if (loginData) {
  try {
    const userData = JSON.parse(loginData);
    CONFIG.NIP = userData.nip || userData.NIP || "";
  } catch (e) {
    console.error("Gagal membaca loginData", e);
  }
}
