// Office Settings Management JavaScript

$(document).ready(function () {
    let currentOfficeData = null;
    let imageUpdates = {
        1: null,
        2: null,
        3: null
    };

    // Load office information on page load
    loadOfficeInfo();

    // Form submission handler
    $('#officeForm').on('submit', async function (e) {
        e.preventDefault();
        await updateOfficeInfo();
    });

    // Image upload handlers
    for (let i = 1; i <= 3; i++) {
        // Click on image container to trigger file input
        $(`.office-image-container[data-slot="${i}"]`).on('click', function () {
            $(`#imageInput${i}`).click();
        });

        // Handle file selection
        $(`#imageInput${i}`).on('change', function (e) {
            handleImageUpload(i, e.target.files[0]);
        });
    }

    // Listen for coordinate changes to update map
    $('#latitude, #longitude').on('input', debounce(updateMapPreview, 500));

    // Load office information from database
    async function loadOfficeInfo() {
        try {
            const { data, error } = await supabaseClient
                .from('office_info')
                .select('*')
                .limit(1)
                .single();

            if (error) throw error;

            if (data) {
                currentOfficeData = data;
                populateForm(data);
                updateMapPreview();
            }
        } catch (error) {
            console.error('Error loading office info:', error);
            showAlert('Ofis bilgileri yüklenirken hata oluştu: ' + error.message, 'danger');
        }
    }

    // Populate form with data
    function populateForm(data) {
        $('#address').val(data.address || '');
        $('#postalCode').val(data.postal_code || '');
        $('#city').val(data.city || '');
        $('#district').val(data.district || '');
        $('#latitude').val(data.latitude || '');
        $('#longitude').val(data.longitude || '');
        $('#phone').val(data.phone || '');
        $('#email').val(data.email || '');
        $('#googleMapsUrl').val(data.google_maps_url || '');

        // Load office images
        if (data.office_image_1) {
            $('#officeImage1').attr('src', data.office_image_1);
        }
        if (data.office_image_2) {
            $('#officeImage2').attr('src', data.office_image_2);
        }
        if (data.office_image_3) {
            $('#officeImage3').attr('src', data.office_image_3);
        }
    }

    // Handle image upload
    async function handleImageUpload(slot, file) {
        if (!file) return;

        try {
            // Show loading state
            $(`#officeImage${slot}`).css('opacity', '0.5');

            // Convert to base64
            const base64 = await convertToBase64(file);

            // Store in temporary object
            imageUpdates[slot] = base64;

            // Update preview
            $(`#officeImage${slot}`).attr('src', base64).css('opacity', '1');

            showAlert(`Görsel ${slot} seçildi. Kaydetmek için "Değişiklikleri Kaydet" butonuna tıklayın.`, 'info');
        } catch (error) {
            console.error('Error uploading image:', error);
            showAlert('Görsel yüklenirken hata oluştu: ' + error.message, 'danger');
            $(`#officeImage${slot}`).css('opacity', '1');
        }
    }

    // Update office information
    async function updateOfficeInfo() {
        const submitBtn = $('#officeForm button[type="submit"]');
        const originalText = submitBtn.html();

        // Validate coordinates
        const lat = parseFloat($('#latitude').val());
        const lon = parseFloat($('#longitude').val());

        if (isNaN(lat) || isNaN(lon)) {
            showAlert('Lütfen geçerli koordinat değerleri girin.', 'warning');
            return;
        }

        if (lat < -90 || lat > 90) {
            showAlert('Enlem (Latitude) -90 ile 90 arasında olmalıdır.', 'warning');
            return;
        }

        if (lon < -180 || lon > 180) {
            showAlert('Boylam (Longitude) -180 ile 180 arasında olmalıdır.', 'warning');
            return;
        }

        // Show loading state
        submitBtn.html('<i class="fas fa-spinner fa-spin"></i> Kaydediliyor...').prop('disabled', true);

        try {
            const updates = {
                address: $('#address').val(),
                postal_code: $('#postalCode').val(),
                city: $('#city').val(),
                district: $('#district').val(),
                latitude: lat,
                longitude: lon,
                phone: $('#phone').val(),
                email: $('#email').val(),
                google_maps_url: $('#googleMapsUrl').val(),
                updated_at: new Date()
            };

            // Add image updates if any
            for (let i = 1; i <= 3; i++) {
                if (imageUpdates[i]) {
                    updates[`office_image_${i}`] = imageUpdates[i];
                }
            }

            // Update in database
            const { error } = await supabaseClient
                .from('office_info')
                .update(updates)
                .eq('id', currentOfficeData.id);

            if (error) throw error;

            // Clear image updates
            imageUpdates = { 1: null, 2: null, 3: null };

            showAlert('Ofis bilgileri başarıyla güncellendi!', 'success');

            // Reload data
            await loadOfficeInfo();

        } catch (error) {
            console.error('Error updating office info:', error);
            showAlert('Güncelleme sırasında hata oluştu: ' + error.message, 'danger');
        } finally {
            submitBtn.html(originalText).prop('disabled', false);
        }
    }

    // Update map preview
    function updateMapPreview() {
        const lat = $('#latitude').val();
        const lon = $('#longitude').val();

        if (lat && lon && !isNaN(lat) && !isNaN(lon)) {
            const embedUrl = generateGoogleMapsEmbed(lat, lon);
            $('#mapIframe').attr('src', embedUrl);
        }
    }

    // Generate Google Maps embed URL with marker
    function generateGoogleMapsEmbed(lat, lon) {
        // Use q parameter to show marker at exact coordinates
        return `https://maps.google.com/maps?q=${lat},${lon}&z=17&output=embed`;
    }

    // Convert image to Base64
    function convertToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = function (e) {
                const img = new Image();
                img.onload = function () {
                    const canvas = document.createElement('canvas');

                    // Resize if too large (max 1200px width)
                    let width = img.width;
                    let height = img.height;
                    const maxWidth = 1200;

                    if (width > maxWidth) {
                        height = (height * maxWidth) / width;
                        width = maxWidth;
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    // Convert to Base64 with compression (0.8 quality for JPEG)
                    const base64 = canvas.toDataURL('image/jpeg', 0.8);
                    resolve(base64);
                };
                img.onerror = reject;
                img.src = e.target.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // Show alert message
    function showAlert(message, type = 'info') {
        const alertHtml = `
            <div class="alert alert-${type} alert-dismissible fade show" role="alert">
                ${message}
                <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
        `;
        $('#alertContainer').html(alertHtml);

        // Auto-hide after 5 seconds
        setTimeout(() => {
            $('#alertContainer .alert').fadeOut('slow', function () {
                $(this).remove();
            });
        }, 5000);

        // Scroll to top
        $('html, body').animate({ scrollTop: 0 }, 'fast');
    }

    // Debounce function to limit map updates
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
});
