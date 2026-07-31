// ============ EDIT PROFILE COMPONENT ============
class EditProfile {
  constructor() {
    this.api = new ProfileDataAPI();
    this.gasWriteUrl = window.CONFIG?.GAS_WRITE_URL || '';
    this.nip = window.CONFIG?.NIP || '';
    this.data = null;
    this.modal = null;
    
    console.log('[EditProfile] Initialized');
    console.log('[EditProfile] GAS_WRITE_URL:', this.gasWriteUrl);
    console.log('[EditProfile] NIP:', this.nip);
  }

  // ===== BUKA MODAL EDIT =====
  async openEditModal() {
    try {
      this.data = await this.api.getIdentitas();
      
      if (!this.data) {
        alert('Gagal memuat data identitas');
        return;
      }

      this.createModal();
      this.fillForm();
      this.showModal();
    } catch (error) {
      console.error('[EditProfile] Error:', error);
      alert('Gagal memuat data: ' + error.message);
    }
  }

  // ===== BUAT MODAL =====
  createModal() {
    const existingModal = document.getElementById('editProfileModal');
    if (existingModal) {
      existingModal.remove();
    }

    this.modal = document.createElement('div');
    this.modal.id = 'editProfileModal';
    this.modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(8px);
      z-index: 10000;
      display: none;
      align-items: center;
      justify-content: center;
      padding: 20px;
      overflow-y: auto;
    `;

    this.modal.innerHTML = `
      <div style="
        background: white;
        border-radius: 24px;
        padding: 40px;
        max-width: 800px;
        width: 100%;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        position: relative;
      ">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; border-bottom: 2px solid var(--light-gray); padding-bottom: 15px;">
          <h2 style="font-family: 'Poppins', sans-serif; font-size: 1.8rem; color: var(--dark-blue);">
            ✏️ Edit Profil ASN
          </h2>
          <button onclick="closeEditModal()" style="
            background: none;
            border: none;
            font-size: 1.8rem;
            cursor: pointer;
            color: var(--gray);
            transition: var(--transition);
          ">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div style="margin-bottom: 20px; padding: 15px; background: var(--light-gray); border-radius: 12px;">
          <p style="color: var(--gray); font-size: 0.9rem;">
            <i class="fas fa-info-circle" style="color: var(--primary);"></i>
            <strong>NIP:</strong> <span id="editNipDisplay">-</span>
          </p>
        </div>

        <form id="editProfileForm" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
          ${this.generateFormFields()}
        </form>

        <!-- VERIFIKASI -->
        <div style="
          margin-top: 25px;
          padding: 20px;
          background: #fef3c7;
          border: 2px solid #f59e0b;
          border-radius: 12px;
          display: flex;
          align-items: flex-start;
          gap: 15px;
        ">
          <input type="checkbox" id="verificationCheck" style="
            width: 20px;
            height: 20px;
            margin-top: 2px;
            cursor: pointer;
            accent-color: var(--primary);
          ">
          <div>
            <label for="verificationCheck" style="font-weight: 600; color: var(--dark); cursor: pointer;">
              <i class="fas fa-check-circle" style="color: #f59e0b;"></i>
              Saya menyatakan bahwa semua data yang diisi telah sesuai dan benar
            </label>
            <p style="font-size: 0.85rem; color: var(--gray); margin-top: 5px;">
              Data yang telah disimpan akan langsung memperbarui profil Anda.
            </p>
          </div>
        </div>

        <div style="display: flex; gap: 15px; margin-top: 25px; justify-content: flex-end;">
          <button type="button" onclick="closeEditModal()" style="
            padding: 12px 28px;
            border: 2px solid var(--gray);
            border-radius: 12px;
            background: white;
            color: var(--gray);
            font-weight: 600;
            cursor: pointer;
            transition: var(--transition);
          ">
            <i class="fas fa-times"></i> Batal
          </button>
          <button type="button" id="saveProfileBtn" style="
            padding: 12px 28px;
            border: none;
            border-radius: 12px;
            background: var(--gradient-primary);
            color: white;
            font-weight: 600;
            cursor: pointer;
            transition: var(--transition);
            display: flex;
            align-items: center;
            gap: 10px;
            opacity: 0.5;
            pointer-events: none;
          ">
            <i class="fas fa-save"></i> Simpan Perubahan
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(this.modal);

    // Event listener checkbox
    const verificationCheck = document.getElementById('verificationCheck');
    const saveBtn = document.getElementById('saveProfileBtn');

    verificationCheck.addEventListener('change', function() {
      if (this.checked) {
        saveBtn.style.opacity = '1';
        saveBtn.style.pointerEvents = 'auto';
        saveBtn.style.transform = 'scale(1)';
      } else {
        saveBtn.style.opacity = '0.5';
        saveBtn.style.pointerEvents = 'none';
        saveBtn.style.transform = 'scale(0.95)';
      }
    });

    saveBtn.addEventListener('click', () => {
      if (verificationCheck.checked) {
        this.saveData();
      } else {
        alert('Silakan centang verifikasi terlebih dahulu.');
      }
    });
  }

  // ===== GENERATE FORM FIELDS =====
  generateFormFields() {
    const fields = [
      { id: 'Nama', label: 'Nama', type: 'text', required: true },
      { id: 'NIP', label: 'NIP', type: 'text', required: true, readonly: true },
      { id: 'Status_ASN', label: 'Status ASN', type: 'text', required: true },
      { id: 'Pangkat', label: 'Pangkat', type: 'text' },
      { id: 'Golongan_Ruang', label: 'Golongan Ruang', type: 'text' },
      { id: 'Email', label: 'Email', type: 'email' },
      { id: 'No_HP', label: 'No HP', type: 'text' },
      { id: 'Tempat_Lahir', label: 'Tempat Lahir', type: 'text' },
      { id: 'Tanggal_Lahir', label: 'Tanggal Lahir', type: 'date' },
      { id: 'Jenis_Kelamin', label: 'Jenis Kelamin', type: 'select', options: ['Laki Laki', 'Perempuan'] },
      { id: 'Agama', label: 'Agama', type: 'select', options: ['Islam', 'Kristen', 'Katolik', 'Hindu', 'Budha', 'Konghucu', 'Lainnya'] },
      { id: 'Alamat', label: 'Alamat', type: 'text' },
      { id: 'Unit_Kerja', label: 'Unit Kerja', type: 'text' },
      { id: 'Jabatan', label: 'Jabatan', type: 'text' },
      { id: 'TMT_Jabatan', label: 'TMT Jabatan', type: 'date' },
      { id: 'Pendidikan_Terakhir', label: 'Pendidikan Terakhir', type: 'text' },
      { id: 'Tahun_Lulus', label: 'Tahun Lulus', type: 'text' }
    ];

    return fields.map(field => {
      let input = '';
      if (field.type === 'select') {
        const options = field.options.map(opt => 
          `<option value="${opt}">${opt}</option>`
        ).join('');
        input = `<select id="edit_${field.id}" ${field.readonly ? 'disabled' : ''} style="width:100%;padding:10px 12px;border:2px solid var(--light-gray);border-radius:8px;font-size:0.95rem;">${options}</select>`;
      } else {
        input = `<input type="${field.type}" id="edit_${field.id}" ${field.required ? 'required' : ''} ${field.readonly ? 'readonly' : ''} style="width:100%;padding:10px 12px;border:2px solid var(--light-gray);border-radius:8px;font-size:0.95rem;${field.readonly ? 'background:var(--light-gray);cursor:not-allowed;' : ''}">`;
      }

      return `
        <div style="display:flex;flex-direction:column;gap:4px;${field.id === 'Nama' || field.id === 'NIP' ? 'grid-column: span 2;' : ''}">
          <label for="edit_${field.id}" style="font-weight:600;font-size:0.85rem;color:var(--dark);">
            ${field.label} ${field.required ? '<span style="color:var(--danger);">*</span>' : ''}
          </label>
          ${input}
        </div>
      `;
    }).join('');
  }

  // ===== FILL FORM =====
  fillForm() {
    const data = this.data;
    const fields = [
      'Nama', 'NIP', 'Status_ASN', 'Pangkat', 'Golongan_Ruang',
      'Email', 'No_HP', 'Tempat_Lahir', 'Tanggal_Lahir', 'Jenis_Kelamin',
      'Agama', 'Alamat', 'Unit_Kerja', 'Jabatan', 'TMT_Jabatan',
      'Pendidikan_Terakhir', 'Tahun_Lulus'
    ];

    const nipDisplay = document.getElementById('editNipDisplay');
    if (nipDisplay) nipDisplay.textContent = data.NIP || '-';

    fields.forEach(field => {
      const element = document.getElementById(`edit_${field}`);
      if (element) {
        let value = data[field] || '';
        
        if (field === 'Tanggal_Lahir' || field === 'TMT_Jabatan') {
          if (value) {
            try {
              const date = new Date(value);
              if (!isNaN(date.getTime())) {
                value = date.toISOString().split('T')[0];
              }
            } catch (e) {}
          }
        }
        
        element.value = value;
      }
    });
  }

  // ===== SHOW MODAL =====
  showModal() {
    if (this.modal) {
      this.modal.style.display = 'flex';
      const content = this.modal.querySelector('div > div');
      if (content) {
        content.style.animation = 'fadeIn 0.3s ease';
      }
    }
  }

  // ===== SAVE DATA =====
  async saveData() {
    const saveBtn = document.getElementById('saveProfileBtn');
    const originalText = saveBtn.innerHTML;
    
    try {
      saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyimpan...';
      saveBtn.disabled = true;

      const fields = [
        'Nama', 'NIP', 'Status_ASN', 'Pangkat', 'Golongan_Ruang',
        'Email', 'No_HP', 'Tempat_Lahir', 'Tanggal_Lahir', 'Jenis_Kelamin',
        'Agama', 'Alamat', 'Unit_Kerja', 'Jabatan', 'TMT_Jabatan',
        'Pendidikan_Terakhir', 'Tahun_Lulus'
      ];

      const updatedData = {};
      fields.forEach(field => {
        const element = document.getElementById(`edit_${field}`);
        if (element) {
          updatedData[field] = element.value;
        }
      });

      console.log('[EditProfile] Sending data:', updatedData);
      console.log('[EditProfile] To URL:', this.gasWriteUrl);

      const response = await fetch(this.gasWriteUrl, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'updateIdentitas',
          nip: this.nip,
          identitas: updatedData
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('[EditProfile] Response:', result);

      if (result.success) {
        alert('✅ Data identitas berhasil diperbarui!');
        this.modal.style.display = 'none';
        
        // Refresh data di halaman
        if (typeof loadIdentitas === 'function') {
          await loadIdentitas();
        }
        if (typeof updateUserInfo === 'function') {
          updateUserInfo();
        }
        
        setTimeout(() => {
          location.reload();
        }, 1000);
      } else {
        throw new Error(result.error || 'Gagal menyimpan data');
      }

    } catch (error) {
      console.error('[EditProfile] Save error:', error);
      
      let errorMessage = error.message;
      if (error.message.includes('CORS') || error.message.includes('Failed to fetch')) {
        errorMessage = 'Masalah koneksi ke server. Pastikan:\n\n1. GAS Write sudah di-deploy dengan akses "Anyone"\n2. URL di config.js sudah diupdate\n3. Koneksi internet stabil\n\nURL saat ini: ' + this.gasWriteUrl;
      }
      
      alert('❌ Gagal menyimpan data:\n\n' + errorMessage);
      
    } finally {
      saveBtn.innerHTML = originalText;
      saveBtn.disabled = false;
    }
  }
}

// ============ FUNGSI CLOSE MODAL ============
function closeEditModal() {
  const modal = document.getElementById('editProfileModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

// ============ EXPORT ============
window.EditProfile = EditProfile;
window.closeEditModal = closeEditModal;
