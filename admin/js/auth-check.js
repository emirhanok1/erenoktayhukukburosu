/**
 * Enhanced Admin Authentication Check
 * Version: 2.0
 * 
 * SECURITY FEATURES:
 * - Session validation on page load
 * - Real-time auth state monitoring
 * - Loading overlay to prevent flash of content
 * - Automatic logout on session expiry
 * - Protection against direct URL access
 */

(function () {
    'use strict';

    // Create loading overlay to prevent content flash
    const loadingOverlay = document.createElement('div');
    loadingOverlay.id = 'auth-loading';
    loadingOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: #4e73df;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 999999;
    `;
    loadingOverlay.innerHTML = `
        <div style="text-align: center; color: white;">
            <i class="fas fa-spinner fa-spin" style="font-size: 48px; margin-bottom: 20px;"></i>
            <p style="font-family: 'Nunito', sans-serif; font-size: 16px;">Oturum doğrulanıyor...</p>
        </div>
    `;
    document.body.insertBefore(loadingOverlay, document.body.firstChild);

    // Hide page content initially
    if (document.body) {
        document.body.style.visibility = 'hidden';
    }

    async function checkAuth() {
        try {
            // Check if supabaseClient is available
            if (typeof supabaseClient === 'undefined') {
                console.error('Supabase client not loaded!');
                redirectToLogin('Sistem hatası. Lütfen sayfayı yenileyin.');
                return;
            }

            // Get current session
            const { data: { session }, error } = await supabaseClient.auth.getSession();

            if (error) {
                console.error('Session check error:', error);
                redirectToLogin('Oturum doğrulama hatası.');
                return;
            }

            if (!session) {
                // No session found
                redirectToLogin('Lütfen giriş yapın.');
                return;
            }

            // Verify session is still valid (not expired)
            const currentTime = Math.floor(Date.now() / 1000);
            if (session.expires_at && session.expires_at < currentTime) {
                console.warn('Session expired');
                await supabaseClient.auth.signOut();
                redirectToLogin('Oturumunuz sona erdi. Lütfen tekrar giriş yapın.');
                return;
            }

            // Optional: Verify user role/permissions here
            // const user = session.user;
            // if (!user || user.role !== 'admin') {
            //     redirectToLogin('Yetkisiz erişim.');
            //     return;
            // }

            // Authentication successful - show content
            removeLoadingOverlay();
            console.log('✅ Authentication successful');

        } catch (err) {
            console.error('Auth check failed:', err);
            redirectToLogin('Beklenmeyen bir hata oluştu.');
        }
    }

    function redirectToLogin(message) {
        // Store message for login page if needed
        if (message) {
            sessionStorage.setItem('auth_redirect_message', message);
        }
        window.location.href = 'login.html';
    }

    function removeLoadingOverlay() {
        if (loadingOverlay && loadingOverlay.parentNode) {
            loadingOverlay.remove();
        }
        if (document.body) {
            document.body.style.visibility = 'visible';
        }
    }

    // Run authentication check when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkAuth);
    } else {
        checkAuth();
    }

    // Monitor auth state changes in real-time
    if (typeof supabaseClient !== 'undefined') {
        supabaseClient.auth.onAuthStateChange((event, session) => {
            console.log('Auth state changed:', event);

            if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
                redirectToLogin('Oturumunuz sonlandırıldı.');
            } else if (event === 'TOKEN_REFRESHED') {
                console.log('✅ Token refreshed successfully');
            } else if (!session && event !== 'INITIAL_SESSION') {
                redirectToLogin('Oturum kayboldu. Lütfen tekrar giriş yapın.');
            }
        });
    }

    // Prevent browser back button after logout
    window.addEventListener('pageshow', function (event) {
        if (event.persisted) {
            // Page was loaded from cache (back button)
            checkAuth();
        }
    });

})();
