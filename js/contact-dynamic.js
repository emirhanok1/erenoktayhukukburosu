// Contact Page Dynamic Office Data Loader
// Loads office information from Supabase and updates the contact page dynamically

(function () {
    'use strict';

    // Load office data when DOM is ready
    document.addEventListener('DOMContentLoaded', function () {
        loadOfficeData();
    });

    /**
     * Load office information from Supabase
     */
    async function loadOfficeData() {
        try {
            const { data, error } = await supabaseClient
                .from('office_info')
                .select('*')
                .limit(1)
                .single();

            if (error) throw error;

            if (data) {
                updateContactPage(data);
                updateSchemaData(data);
                updateMapEmbed(data);
                updateOfficeGallery(data);
            }
        } catch (error) {
            console.error('Error loading office data:', error);
            handleLoadError();
        }
    }

    /**
     * Update all contact information on the page
     */
    function updateContactPage(data) {
        // Update address displays
        const addressElements = document.querySelectorAll('[data-office-address]');
        addressElements.forEach(el => {
            if (data.address) {
                el.textContent = `${data.address} ${data.district}/${data.city}`;
            }
        });

        // Update phone displays
        const phoneElements = document.querySelectorAll('[data-office-phone]');
        phoneElements.forEach(el => {
            if (data.phone) {
                el.textContent = data.phone;
                if (el.tagName === 'A') {
                    el.href = `tel:${data.phone.replace(/\s/g, '')}`;
                }
            }
        });

        // Update email displays
        const emailElements = document.querySelectorAll('[data-office-email]');
        emailElements.forEach(el => {
            if (data.email) {
                el.textContent = data.email;
                if (el.tagName === 'A') {
                    el.href = `mailto:${data.email}`;
                }
            }
        });

        // Update Google Maps link
        const mapsLinkElements = document.querySelectorAll('[data-google-maps-link]');
        mapsLinkElements.forEach(el => {
            if (data.google_maps_url && el.tagName === 'A') {
                el.href = data.google_maps_url;
            }
        });
    }

    /**
     * Update Schema.org structured data
     */
    function updateSchemaData(data) {
        // Find the schema script tag
        const schemaScripts = document.querySelectorAll('script[type="application/ld+json"]');

        schemaScripts.forEach(script => {
            try {
                const schemaData = JSON.parse(script.textContent);

                // Update LegalService schema
                if (schemaData['@type'] === 'LegalService') {
                    // Update address
                    if (schemaData.address && data.address) {
                        schemaData.address.streetAddress = data.address;
                        schemaData.address.addressLocality = data.district || schemaData.address.addressLocality;
                        schemaData.address.addressRegion = data.city || schemaData.address.addressRegion;
                        schemaData.address.postalCode = data.postal_code || schemaData.address.postalCode;
                    }

                    // Update geo coordinates
                    if (schemaData.geo && data.latitude && data.longitude) {
                        schemaData.geo.latitude = data.latitude.toString();
                        schemaData.geo.longitude = data.longitude.toString();
                    }

                    // Update contact info
                    if (data.phone) {
                        schemaData.telephone = '+90' + data.phone.replace(/\s/g, '').replace(/^0/, '');
                    }
                    if (data.email) {
                        schemaData.email = data.email;
                    }
                    if (data.google_maps_url) {
                        schemaData.hasMap = data.google_maps_url;
                    }

                    // Update the script content
                    script.textContent = JSON.stringify(schemaData, null, 2);
                }
            } catch (e) {
                console.error('Error updating schema:', e);
            }
        });
    }

    /**
     * Update Google Maps embed iframe
     */
    function updateMapEmbed(data) {
        const mapIframe = document.querySelector('iframe[src*="google.com/maps"]');

        if (mapIframe && data.latitude && data.longitude) {
            const embedUrl = generateGoogleMapsEmbed(data.latitude, data.longitude, data.address);
            mapIframe.src = embedUrl;
        }
    }

    /**
     * Update office gallery images
     */
    function updateOfficeGallery(data) {
        // Update office image 1
        if (data.office_image_1) {
            const img1Elements = document.querySelectorAll('[data-office-image="1"]');
            img1Elements.forEach(img => {
                img.src = data.office_image_1;
            });
        }

        // Update office image 2
        if (data.office_image_2) {
            const img2Elements = document.querySelectorAll('[data-office-image="2"]');
            img2Elements.forEach(img => {
                img.src = data.office_image_2;
            });
        }

        // Update office image 3
        if (data.office_image_3) {
            const img3Elements = document.querySelectorAll('[data-office-image="3"]');
            img3Elements.forEach(img => {
                img.src = data.office_image_3;
            });
        }
    }

    /**
     * Generate Google Maps embed URL with marker
     */
    function generateGoogleMapsEmbed(lat, lon, address) {
        // Use q parameter to show marker at exact coordinates
        // z=17 for good zoom level, output=embed for iframe
        return `https://maps.google.com/maps?q=${lat},${lon}&z=17&output=embed`;
    }

    /**
     * Handle load error - use fallback/default values
     */
    function handleLoadError() {
        console.warn('Using default office information due to load error');
        // Default values are already in HTML, so no action needed
        // Could optionally show a user-friendly message or retry logic here
    }
})();
