// Hero Image Manager - Admin Panel
// Handles image upload, preview, and saving to Supabase

let selectedImageData = null;
let originalImageSrc = '';

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadCurrentHeroImage();
    setupEventListeners();
});

// Load current hero image from Supabase
async function loadCurrentHeroImage() {
    try {
        const { data, error } = await supabaseClient
            .from('hero_image')
            .select('*')
            .eq('is_active', true)
            .single();

        if (error) {
            console.error('Error loading hero image:', error);
            return;
        }

        if (data && data.image_data !== 'default') {
            // Load from database
            const previewImg = document.getElementById('previewImage');
            previewImg.src = data.image_data;
            originalImageSrc = data.image_data;
        } else {
            // Use default image
            originalImageSrc = document.getElementById('previewImage').src;
        }
    } catch (err) {
        console.error('Error in loadCurrentHeroImage:', err);
    }
}

// Setup event listeners
function setupEventListeners() {
    const imageInput = document.getElementById('heroImageInput');
    const applyBtn = document.getElementById('applyBtn');
    const cancelBtn = document.getElementById('cancelBtn');

    imageInput.addEventListener('change', handleImageSelect);
    applyBtn.addEventListener('click', applyHeroImage);
    cancelBtn.addEventListener('click', cancelChanges);
}

// Handle image file selection
function handleImageSelect(event) {
    const file = event.target.files[0];

    if (!file) return;

    // Validate file type
    if (file.type !== 'image/webp') {
        alert('Lütfen sadece .webp uzantılı görsel dosyası seçin!');
        return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        alert('Görsel boyutu 5MB\'dan küçük olmalıdır!');
        return;
    }

    // Show filename
    document.getElementById('currentFileName').textContent = `Seçilen dosya: ${file.name}`;

    // Convert to Base64
    const reader = new FileReader();
    reader.onload = (e) => {
        selectedImageData = e.target.result;

        // Update preview
        document.getElementById('previewImage').src = selectedImageData;

        // Enable buttons
        document.getElementById('applyBtn').disabled = false;
        document.getElementById('cancelBtn').disabled = false;
    };
    reader.readAsDataURL(file);
}

// Apply hero image (save to Supabase)
async function applyHeroImage() {
    if (!selectedImageData) {
        alert('Lütfen önce bir görsel seçin!');
        return;
    }

    const applyBtn = document.getElementById('applyBtn');
    applyBtn.disabled = true;
    applyBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Kaydediliyor...';

    try {
        // First, deactivate all existing images
        await supabaseClient
            .from('hero_image')
            .update({ is_active: false })
            .eq('is_active', true);

        // Insert new hero image
        const { data, error } = await supabaseClient
            .from('hero_image')
            .insert([
                {
                    image_data: selectedImageData,
                    is_active: true,
                    updated_at: new Date().toISOString()
                }
            ]);

        if (error) throw error;

        alert('✅ Hero görseli başarıyla güncellendi!');

        // Update original image
        originalImageSrc = selectedImageData;
        selectedImageData = null;

        // Reset UI
        document.getElementById('heroImageInput').value = '';
        document.getElementById('currentFileName').textContent = '';
        document.getElementById('applyBtn').disabled = true;
        document.getElementById('cancelBtn').disabled = true;
        applyBtn.innerHTML = '<i class="fas fa-check"></i> Uygula';

    } catch (err) {
        console.error('Error saving hero image:', err);
        alert('❌ Hata: Görsel kaydedilemedi. Lütfen tekrar deneyin.');
        applyBtn.disabled = false;
        applyBtn.innerHTML = '<i class="fas fa-check"></i> Uygula';
    }
}

// Cancel changes
function cancelChanges() {
    // Restore original image
    document.getElementById('previewImage').src = originalImageSrc;

    // Clear selection
    selectedImageData = null;
    document.getElementById('heroImageInput').value = '';
    document.getElementById('currentFileName').textContent = '';

    // Disable buttons
    document.getElementById('applyBtn').disabled = true;
    document.getElementById('cancelBtn').disabled = true;

    alert('🔄 Değişiklikler iptal edildi.');
}
