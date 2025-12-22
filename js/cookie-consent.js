// Cookie Consent Management System
// KVKK/GDPR Compliant Cookie Management

(function () {
    'use strict';

    const COOKIE_CONSENT_KEY = 'cookieConsent';
    const CONSENT_ACCEPTED = 'accepted';
    const CONSENT_REJECTED = 'rejected';

    // Cookie Consent Manager
    const CookieConsent = {
        // Check if user has made a choice
        hasConsent: function () {
            return localStorage.getItem(COOKIE_CONSENT_KEY) !== null;
        },

        // Get current consent status
        getConsent: function () {
            return localStorage.getItem(COOKIE_CONSENT_KEY);
        },

        // Check if cookies are accepted
        isAccepted: function () {
            return this.getConsent() === CONSENT_ACCEPTED;
        },

        // Check if cookies are rejected
        isRejected: function () {
            return this.getConsent() === CONSENT_REJECTED;
        },

        // Set consent
        setConsent: function (value) {
            localStorage.setItem(COOKIE_CONSENT_KEY, value);
            this.triggerConsentChange();
        },

        // Accept cookies
        accept: function () {
            this.setConsent(CONSENT_ACCEPTED);
            this.hideBanner();
            console.log('Çerezler kabul edildi');
        },

        // Reject cookies
        reject: function () {
            this.setConsent(CONSENT_REJECTED);
            this.hideBanner();
            console.log('Çerezler reddedildi');
        },

        // Show banner
        showBanner: function () {
            const banner = document.getElementById('cookieConsentBanner');
            if (banner) {
                setTimeout(() => {
                    banner.classList.add('show');
                }, 500);
            }
        },

        // Hide banner
        hideBanner: function () {
            const banner = document.getElementById('cookieConsentBanner');
            if (banner) {
                banner.classList.remove('show');
                setTimeout(() => {
                    banner.style.display = 'none';
                }, 400);
            }
        },

        // Create banner HTML
        createBanner: function () {
            const banner = document.createElement('div');
            banner.id = 'cookieConsentBanner';
            banner.className = 'cookie-consent-banner';
            banner.innerHTML = `
                <div class="cookie-consent-content">
                    <div class="cookie-consent-text">
                        <p>
                            Sitemizde deneyiminizi geliştirmek için çerezler kullanılmaktadır.
                            <a href="kvkk.html" target="_blank">Gizlilik Politikası</a>
                        </p>
                    </div>
                    <div class="cookie-consent-buttons">
                        <button class="cookie-btn cookie-btn-reject" id="rejectCookies">REDDET</button>
                        <button class="cookie-btn cookie-btn-accept" id="acceptCookies">KABUL ET</button>
                    </div>
                </div>
            `;
            document.body.appendChild(banner);

            // Add event listeners
            document.getElementById('acceptCookies').addEventListener('click', () => {
                this.accept();
            });

            document.getElementById('rejectCookies').addEventListener('click', () => {
                this.reject();
            });
        },

        // Initialize
        init: function () {
            // Create banner if not exists
            if (!document.getElementById('cookieConsentBanner')) {
                this.createBanner();
            }

            // Show banner if no consent given
            if (!this.hasConsent()) {
                this.showBanner();
            }
        },

        // Create settings link
        createSettingsLink: function () {
            if (document.getElementById('cookieSettingsLink')) return;

            const settingsLink = document.createElement('div');
            settingsLink.id = 'cookieSettingsLink';
            settingsLink.className = 'cookie-settings-link';
            settingsLink.innerHTML = '<i class="fas fa-cookie-bite"></i> Çerez Ayarları';
            settingsLink.addEventListener('click', () => {
                const banner = document.getElementById('cookieConsentBanner');
                if (banner) {
                    banner.style.display = 'block';
                    this.showBanner();
                }
            });
            document.body.appendChild(settingsLink);
        },

        // Trigger event when consent changes
        triggerConsentChange: function () {
            window.dispatchEvent(new CustomEvent('cookieConsentChange', {
                detail: { consent: this.getConsent() }
            }));
        }
    };

    // Map Manager - Controls map loading based on cookie consent
    const MapManager = {
        // Check and display map or placeholder
        init: function () {
            const mapContainers = document.querySelectorAll('[data-cookie-map]');

            mapContainers.forEach(container => {
                this.updateMapDisplay(container);
            });

            // Listen for consent changes
            window.addEventListener('cookieConsentChange', () => {
                mapContainers.forEach(container => {
                    this.updateMapDisplay(container);
                });
            });
        },

        // Update map display based on consent
        updateMapDisplay: function (container) {
            if (CookieConsent.isAccepted()) {
                this.showMap(container);
            } else {
                this.showPlaceholder(container);
            }
        },

        // Show actual map
        showMap: function (container) {
            const mapSrc = container.getAttribute('data-map-src');
            container.innerHTML = `
                <iframe src="${mapSrc}" 
                    width="100%" 
                    height="450" 
                    style="border:0;" 
                    allowfullscreen="" 
                    loading="lazy" 
                    referrerpolicy="no-referrer-when-downgrade">
                </iframe>
            `;
        },

        // Show placeholder with cookie settings button
        showPlaceholder: function (container) {
            container.innerHTML = `
                <div class="map-cookie-placeholder">
                    <i class="fas fa-map-marked-alt"></i>
                    <h3>Haritayı Görüntülemek İçin Çerezleri Kabul Edin</h3>
                    <p>
                        Ofisimizin konumunu haritada görmek için çerezleri kabul etmeniz gerekmektedir. 
                        Google Maps kullanımı için çerezler gereklidir.
                    </p>
                    <button class="map-cookie-btn" onclick="document.getElementById('cookieSettingsLink').click()">
                        <i class="fas fa-cookie-bite"></i> Çerez Ayarlarını Düzenle
                    </button>
                </div>
            `;
        }
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            CookieConsent.init();
            MapManager.init();
        });
    } else {
        CookieConsent.init();
        MapManager.init();
    }

    // Expose to window for external access
    window.CookieConsent = CookieConsent;
    window.MapManager = MapManager;

})();
