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

            // Verify user role/permissions - Only admin users can access
            const user = session.user;
            const userRole = user?.user_metadata?.role || user?.app_metadata?.role;

            if (!user || userRole !== 'admin') {
                console.warn('Access denied: User role is not admin. Role:', userRole);
                await supabaseClient.auth.signOut();
                redirectToLogin('Yetkisiz erişim. Bu alana sadece yöneticiler erişebilir.');
                return;
            }

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

    // Proper Logout Handler - Intercept logout modal buttons
    document.addEventListener('DOMContentLoaded', function () {
        // Find logout modal and intercept the logout button
        const logoutModal = document.getElementById('logoutModal');
        if (logoutModal) {
            const logoutBtn = logoutModal.querySelector('.modal-footer .btn-primary, .modal-footer a[href="login.html"]');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', async function (e) {
                    e.preventDefault();

                    // Show loading state
                    const originalText = this.innerHTML;
                    this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Çıkış yapılıyor...';
                    this.style.pointerEvents = 'none';

                    try {
                        // Properly sign out from Supabase
                        if (typeof supabaseClient !== 'undefined') {
                            await supabaseClient.auth.signOut();
                            console.log('✅ Successfully signed out from Supabase');
                        }

                        // Clear any stored session data
                        sessionStorage.clear();

                        // Redirect to login
                        window.location.href = 'login.html';

                    } catch (error) {
                        console.error('Logout error:', error);
                        // Still redirect even if signOut fails
                        window.location.href = 'login.html';
                    }
                });
            }
        }

        // Also provide a global logout function for programmatic use
        window.adminLogout = async function () {
            try {
                if (typeof supabaseClient !== 'undefined') {
                    await supabaseClient.auth.signOut();
                }
                sessionStorage.clear();
                window.location.href = 'login.html';
            } catch (error) {
                console.error('Logout error:', error);
                window.location.href = 'login.html';
            }
        };
    });

})();
