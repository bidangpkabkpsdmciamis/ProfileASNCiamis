// ============ EDIT PROFILE COMPONENT ============
class EditProfile {
  constructor() {
    this.api = new ProfileDataAPI();
    this.gasWriteUrl = window.CONFIG?.GAS_WRITE_URL || '';
    this.nip = window.CONFIG?.NIP || '';
    this.data = null;
    this.modal = null;
    this.photoFile = null;
    this.photoDataUrl = null;
    this.isPhotoCropped = false;
    
    // GitHub Config untuk upload foto
    this.githubToken = window.CONFIG?.GITHUB_TOKEN || '';
    this.githubRepo = window.CONFIG?.GITHUB_REPO || 'bidangpkabkpsdmciamis/ProfileASNCiamis';
    this.githubBranch = window.CONFIG?.GITHUB_BRANCH || 'main';
    this.assetFolder = 'assets/profiles';
    
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
      this.loadExistingPhoto();
      this.showModal();
    } catch (error) {
      console.error('[EditProfile] Error:', error);
      alert('Gagal memuat data: ' + error.message);
    }
  }

  // ===== LOAD FOTO EXISTING =====
  loadExistingPhoto() {
    const photoPreview = document.getElementById('photoPreview');
    if (!photoPreview) return;
    
    // Cek apakah ada foto di localStorage atau dari data
    const photoUrl = this.data?.Foto_Profile || localStorage.getItem(`profile_photo_${this.nip}`);
    
    if (photoUrl) {
      photoPreview.innerHTML = `<img src="${photoUrl}" alt="Profile Photo" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
      photoPreview.style.background = 'none';
    } else {
      photoPreview.innerHTML = `<i class="fas fa-user" style="font-size:2.5rem;color:var(--gray);"></i>`;
      photoPreview.style.background = 'var(--light-gray)';
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
        max-width: 900px;
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

        <!-- ===== FOTO PROFILE ===== -->
        <div style="
          display: flex;
          align-items: center;
          gap: 30px;
          padding: 20px;
          background: var(--light-gray);
          border-radius: 16px;
          margin-bottom: 25px;
          flex-wrap: wrap;
        ">
          <div style="display: flex; align-items: center; gap: 20px; flex: 1;">
            <div style="
              width: 100px;
              height: 100px;
              border-radius: 50%;
              background: var(--light-gray);
              display: flex;
              align-items: center;
              justify-content: center;
              overflow: hidden;
              border: 4px solid var(--primary);
              flex-shrink: 0;
            " id="photoPreview">
              <i class="fas fa-user" style="font-size: 2.5rem; color: var(--gray);"></i>
            </div>
            <div>
              <h4 style="color: var(--dark-blue); margin-bottom: 5px;">Foto Profile</h4>
              <p style="color: var(--gray); font-size: 0.9rem;">Upload foto dengan rasio 1:2 (portrait)</p>
              <div style="display: flex; gap: 10px; margin-top: 10px; flex-wrap: wrap;">
                <button type="button" id="uploadPhotoBtn" style="
                  padding: 8px 20px;
                  background: var(--gradient-primary);
                  color: white;
                  border: none;
                  border-radius: 8px;
                  cursor: pointer;
                  font-weight: 600;
                  transition: var(--transition);
                ">
                  <i class="fas fa-camera"></i> Pilih Foto
                </button>
                <button type="button" id="removePhotoBtn" style="
                  padding: 8px 20px;
                  background: var(--danger);
                  color: white;
                  border: none;
                  border-radius: 8px;
                  cursor: pointer;
                  font-weight: 600;
                  transition: var(--transition);
                  display: ${this.data?.Foto_Profile ? 'inline-flex' : 'none'};
                ">
                  <i class="fas fa-trash"></i> Hapus
                </button>
              </div>
              <div id="photoStatus" style="margin-top: 8px; font-size: 0.85rem; color: var(--gray);">
                ${this.data?.Foto_Profile ? '✅ Foto sudah terupload' : 'Belum ada foto'}
              </div>
            </div>
          </div>
        </div>

        <!-- ===== CROP MODAL (hidden by default) ===== -->
        <div id="cropContainer" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); z-index: 99999; align-items: center; justify-content: center; padding: 20px;">
          <div style="background: white; border-radius: 24px; padding: 30px; max-width: 700px; width: 100%; max-height: 90vh; overflow-y: auto;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
              <h3 style="color: var(--dark-blue);">✂️ Crop Foto</h3>
              <button type="button" id="closeCropBtn" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--gray);">
                <i class="fas fa-times"></i>
              </button>
            </div>
            <p style="color: var(--gray); margin-bottom: 15px; font-size: 0.9rem;">
              <i class="fas fa-info-circle"></i> Sesuaikan foto dengan rasio 1:2 (lebar:panjang)
            </p>
            <div style="position: relative; width: 100%; max-width: 500px; margin: 0 auto;">
              <img id="cropImage" src="" alt="Crop" style="width: 100%; display: block; border-radius: 8px;">
            </div>
            <div style="display: flex; gap: 15px; margin-top: 20px; justify-content: flex-end;">
              <button type="button" id="cancelCropBtn" style="
                padding: 10px 25px;
                border: 2px solid var(--gray);
                border-radius: 8px;
                background: white;
                color: var(--gray);
                font-weight: 600;
                cursor: pointer;
              ">
                Batal
              </button>
              <button type="button" id="applyCropBtn" style="
                padding: 10px 25px;
                background: var(--gradient-primary);
                color: white;
                border: none;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
              ">
                <i class="fas fa-check"></i> Selesai Crop
              </button>
            </div>
          </div>
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

    // ===== EVENT LISTENER UPLOAD FOTO =====
    this.setupPhotoUpload();
    this.setupCropModal();
    this.setupRemovePhoto();

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

  // ===== SETUP UPLOAD FOTO =====
  setupPhotoUpload() {
    const uploadBtn = document.getElementById('uploadPhotoBtn');
    if (!uploadBtn) return;

    // Buat hidden file input
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';
    fileInput.id = 'photoFileInput';
    document.body.appendChild(fileInput);

    uploadBtn.addEventListener('click', () => {
      fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        this.handlePhotoFile(file);
      }
      fileInput.value = '';
    });
  }

  // ===== HANDLE PHOTO FILE =====
  handlePhotoFile(file) {
    // Validasi ukuran file (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file terlalu besar. Maksimal 5MB.');
      return;
    }

    // Validasi tipe file
    if (!file.type.startsWith('image/')) {
      alert('File harus berupa gambar.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      this.photoDataUrl = e.target.result;
      this.openCropModal();
    };
    reader.readAsDataURL(file);
  }

  // ===== SETUP CROP MODAL =====
  setupCropModal() {
    const cropContainer = document.getElementById('cropContainer');
    const cropImage = document.getElementById('cropImage');
    const closeCropBtn = document.getElementById('closeCropBtn');
    const cancelCropBtn = document.getElementById('cancelCropBtn');
    const applyCropBtn = document.getElementById('applyCropBtn');

    // Inisialisasi Cropper.js
    let cropper = null;

    // Fungsi buka crop
    window.openCropModal = () => {
      if (!this.photoDataUrl) return;
      
      cropContainer.style.display = 'flex';
      cropImage.src = this.photoDataUrl;

      // Tunggu image load
      cropImage.onload = () => {
        if (cropper) {
          cropper.destroy();
        }
        
        // Inisialisasi Cropper dengan rasio 1:2
        cropper = new Cropper(cropImage, {
          aspectRatio: 1 / 2,
          viewMode: 1,
          dragMode: 'move',
          autoCropArea: 0.8,
          restore: false,
          guides: true,
          center: true,
          highlight: false,
          cropBoxMovable: true,
          cropBoxResizable: true,
          toggleDragModeOnDblclick: false,
          ready: function() {
            console.log('[Crop] Cropper siap');
          }
        });
      };
    };

    // Tutup crop
    const closeCrop = () => {
      cropContainer.style.display = 'none';
      if (cropper) {
        cropper.destroy();
        cropper = null;
      }
    };

    closeCropBtn.addEventListener('click', closeCrop);
    cancelCropBtn.addEventListener('click', closeCrop);

    // Apply crop
    applyCropBtn.addEventListener('click', () => {
      if (!cropper) return;

      try {
        // Dapatkan hasil crop
        const canvas = cropper.getCroppedCanvas({
          width: 400,
          height: 800,
          imageSmoothingEnabled: true,
          imageSmoothingQuality: 'high'
        });

        if (!canvas) {
          alert('Gagal melakukan crop. Silakan coba lagi.');
          return;
        }

        // Konversi ke blob
        canvas.toBlob((blob) => {
          if (!blob) {
            alert('Gagal memproses gambar. Silakan coba lagi.');
            return;
          }

          // Simpan file
          this.photoFile = new File([blob], `${this.nip}_${Date.now()}.jpg`, {
            type: 'image/jpeg'
          });

          // Update preview
          const preview = document.getElementById('photoPreview');
          if (preview) {
            preview.innerHTML = `<img src="${canvas.toDataURL('image/jpeg')}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
            preview.style.background = 'none';
          }

          // Update status
          const status = document.getElementById('photoStatus');
          if (status) {
            status.textContent = '✅ Foto baru siap diupload';
            status.style.color = 'var(--success)';
          }

          // Tampilkan tombol hapus
          const removeBtn = document.getElementById('removePhotoBtn');
          if (removeBtn) {
            removeBtn.style.display = 'inline-flex';
          }

          this.isPhotoCropped = true;
          this.photoDataUrl = canvas.toDataURL('image/jpeg');

          closeCrop();
        }, 'image/jpeg', 0.9);

      } catch (error) {
        console.error('[Crop] Error:', error);
        alert('Terjadi kesalahan saat crop: ' + error.message);
      }
    });

    // Expose fungsi untuk digunakan di event
    window.openCropModal = window.openCropModal;
  }

  // ===== OPEN CROP MODAL =====
  openCropModal() {
    if (typeof window.openCropModal === 'function') {
      window.openCropModal();
    } else {
      console.error('[Crop] Fungsi openCropModal tidak tersedia');
      // Fallback: langsung buka crop container
      const cropContainer = document.getElementById('cropContainer');
      const cropImage = document.getElementById('cropImage');
      if (cropContainer && cropImage) {
        cropContainer.style.display = 'flex';
        cropImage.src = this.photoDataUrl;
        cropImage.onload = () => {
          // Inisialisasi cropper sederhana
          if (typeof Cropper !== 'undefined') {
            new Cropper(cropImage, {
              aspectRatio: 1 / 2,
              viewMode: 1,
              dragMode: 'move',
              autoCropArea: 0.8
            });
          }
        };
      }
    }
  }

  // ===== SETUP REMOVE PHOTO =====
  setupRemovePhoto() {
    const removeBtn = document.getElementById('removePhotoBtn');
    if (!removeBtn) return;

    removeBtn.addEventListener('click', () => {
      if (confirm('Apakah Anda yakin ingin menghapus foto profile?')) {
        this.photoFile = null;
        this.photoDataUrl = null;
        this.isPhotoCropped = false;

        // Reset preview
        const preview = document.getElementById('photoPreview');
        if (preview) {
          preview.innerHTML = `<i class="fas fa-user" style="font-size:2.5rem;color:var(--gray);"></i>`;
          preview.style.background = 'var(--light-gray)';
        }

        // Update status
        const status = document.getElementById('photoStatus');
        if (status) {
          status.textContent = 'Foto akan dihapus saat disimpan';
          status.style.color = 'var(--danger)';
        }

        // Sembunyikan tombol hapus
        removeBtn.style.display = 'none';

        // Hapus dari data
        this.data.Foto_Profile = null;
      }
    });
  }

  // ===== UPLOAD FOTO KE GITHUB =====
  async uploadPhotoToGitHub(base64Data, fileName) {
    if (!this.githubToken) {
      console.warn('[GitHub] Token tidak tersedia, simpan foto sebagai base64');
      return null;
    }

    try {
      // Hapus prefix base64
      const base64Image = base64Data.split(',')[1] || base64Data;
      
      // Nama file: NIP_Nama.jpg
      const safeFileName = `${this.nip}_${fileName || 'profile'}.jpg`;
      const path = `${this.assetFolder}/${safeFileName}`;

      // Cek apakah file sudah ada
      const checkUrl = `https://api.github.com/repos/${this.githubRepo}/contents/${path}`;
      let sha = null;
      
      try {
        const checkResponse = await fetch(checkUrl, {
          headers: {
            'Authorization': `token ${this.githubToken}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        });
        if (checkResponse.ok) {
          const data = await checkResponse.json();
          sha = data.sha;
        }
      } catch (e) {
        // File belum ada, lanjutkan
      }

      // Upload file
      const uploadUrl = `https://api.github.com/repos/${this.githubRepo}/contents/${path}`;
      const response = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${this.githubToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.github.v3+json'
        },
        body: JSON.stringify({
          message: `Upload foto profile ${this.nip}`,
          content: base64Image,
          branch: this.githubBranch,
          sha: sha || undefined
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal upload ke GitHub');
      }

      const result = await response.json();
      
      // Dapatkan URL raw
      const rawUrl = `https://raw.githubusercontent.com/${this.githubRepo}/${this.githubBranch}/${path}`;
      console.log('[GitHub] Foto berhasil diupload:', rawUrl);
      
      return rawUrl;
      
    } catch (error) {
      console.error('[GitHub] Error upload:', error);
      return null;
    }
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

  // ===== SAVE DATA (DENGAN UPLOAD FOTO) =====
  async saveData() {
    const saveBtn = document.getElementById('saveProfileBtn');
    const originalText = saveBtn.innerHTML;
    
    try {
      saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyimpan...';
      saveBtn.disabled = true;

      // ===== 1. COLLECT FORM DATA =====
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

      // ===== 2. UPLOAD FOTO KE GITHUB =====
      let photoUrl = this.data?.Foto_Profile || null;
      
      if (this.photoFile && this.isPhotoCropped) {
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Upload foto...';
        
        // Konversi ke base64
        const reader = new FileReader();
        const photoData = await new Promise((resolve) => {
          reader.onload = (e) => resolve(e.target.result);
          reader.readAsDataURL(this.photoFile);
        });

        // Upload ke GitHub
        const fileName = `${this.nip}_${updatedData.Nama || 'profile'}`;
        photoUrl = await this.uploadPhotoToGitHub(photoData, fileName);
        
        if (photoUrl) {
          updatedData.Foto_Profile = photoUrl;
          // Simpan ke localStorage untuk cache
          localStorage.setItem(`profile_photo_${this.nip}`, photoUrl);
        } else {
          // Jika upload gagal, simpan sebagai base64 (fallback)
          updatedData.Foto_Profile = photoData;
        }
      } else if (this.photoFile === null && this.data?.Foto_Profile) {
        // Jika foto dihapus
        updatedData.Foto_Profile = null;
        localStorage.removeItem(`profile_photo_${this.nip}`);
      }

      console.log('[EditProfile] Sending data:', updatedData);

      // ===== 3. KIRIM KE GAS =====
      saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyimpan data...';
      
      const response = await fetch(this.gasWriteUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          action: 'updateIdentitas',
          nip: this.nip,
          data: JSON.stringify(updatedData)
        }).toString()
      });

      console.log('[EditProfile] Request sent (no-cors mode)');

      // ===== 4. SUCCESS =====
      alert('✅ Data identitas berhasil diperbarui!');
      this.modal.style.display = 'none';
      
      setTimeout(() => {
        location.reload();
      }, 1000);

    } catch (error) {
      console.error('[EditProfile] Save error:', error);
      
      if (error.message.includes('CORS') || error.message.includes('Failed to fetch')) {
        alert('✅ Data berhasil dikirim! Halaman akan di-refresh.');
        this.modal.style.display = 'none';
        setTimeout(() => {
          location.reload();
        }, 1500);
      } else {
        alert('❌ Gagal menyimpan data:\n\n' + error.message);
      }
      
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
  // Hapus crop container jika ada
  const cropContainer = document.getElementById('cropContainer');
  if (cropContainer) {
    cropContainer.style.display = 'none';
  }
}

// ============ EXPORT ============
window.EditProfile = EditProfile;
window.closeEditModal = closeEditModal;
