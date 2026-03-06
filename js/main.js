
document.addEventListener("DOMContentLoaded", async function () {

    // --- Sticky Navbar ---
    // --- Sticky Navbar (Optimized with rAF) ---
    let ticking = false;
    window.addEventListener('scroll', function () {
        if (!ticking) {
            window.requestAnimationFrame(function () {
                const navBar = document.querySelector('.nav-bar');
                const carousel = document.querySelector('.carousel');
                const pageHeader = document.querySelector('.page-header');

                if (window.scrollY > 90) {
                    if (navBar) navBar.classList.add('nav-sticky');
                    if (carousel) carousel.style.marginTop = "73px";
                    if (pageHeader) pageHeader.style.marginTop = "73px";
                } else {
                    if (navBar) navBar.classList.remove('nav-sticky');
                    if (carousel) carousel.style.marginTop = "0";
                    if (pageHeader) pageHeader.style.marginTop = "0";
                }
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });

    // --- Navbar Dropdown Hover (Desktop) ---
    const dropdowns = document.querySelectorAll('.navbar .dropdown');

    function toggleDropdown(e) {
        const toggle = this.querySelector('.dropdown-toggle');
        const menu = this.querySelector('.dropdown-menu');
        if (window.innerWidth > 992) {
            if (e.type === 'mouseenter') {
                menu.classList.add('show');
                if (toggle) toggle.setAttribute('aria-expanded', 'true');
            } else {
                menu.classList.remove('show');
                if (toggle) toggle.setAttribute('aria-expanded', 'false');
            }
        }
    }

    dropdowns.forEach(dropdown => {
        dropdown.addEventListener('mouseenter', toggleDropdown);
        dropdown.addEventListener('mouseleave', toggleDropdown);
    });

    // --- Dynamic Announcements (Supabase) ---
    const blogContainer = document.getElementById('blog-carousel-container');
    if (blogContainer && window.supabaseClient) {
        const fetchAnnouncements = async () => {
            try {
                const { data: announcements, error } = await window.supabaseClient
                    .from('announcements')
                    .select('*')
                    .eq('is_active', true)
                    .order('created_at', { ascending: false })
                    .limit(3);

                if (error) throw error;

                if (announcements && announcements.length > 0) {
                    let html = '';
                    announcements.forEach(item => {
                        const date = new Date(item.created_at).toLocaleDateString('tr-TR');
                        // Fallback image if none provided
                        const img = item.image_url || 'img/logo.webp';
                        html += `
                        <div class="blog-item">
                            <img src="${img}" alt="${item.title}" style="height: 200px; object-fit: cover;">
                            <h3>${item.title}</h3>
                            <div class="meta">
                                <i class="fa fa-calendar-alt"></i>
                                <p>${date}</p>
                            </div>
                            <p>${item.content.substring(0, 100)}...</p>
                            <button type="button" class="btn btn-primary" onclick="openAnnouncementModal('${item.id}')">
                                Detayları Oku <i class="fa fa-angle-right"></i>
                            </button>
                        </div>`;
                    });
                    blogContainer.innerHTML = html;

                    // Re-initialize Owl Carousel if jQuery is loaded after dynamic content is injected
                    if (window.jQuery && $(blogContainer).length > 0) {
                        if ($(blogContainer).data('owl.carousel')) {
                            $(blogContainer).trigger('destroy.owl.carousel');
                        }
                        $(blogContainer).owlCarousel({
                            autoplay: true,
                            dots: true,
                            loop: false,
                            rewind: true,
                            margin: 30,
                            responsive: {
                                0: { items: 1 },
                                576: { items: 1 },
                                768: { items: 2 },
                                992: { items: 3 }
                            }
                        });
                    }
                }
            } catch (err) {
                console.error('Duyurular yüklenirken hata:', err);
            }
        };

        const observerOptions = {
            root: null,
            rootMargin: '200px 0px',
            threshold: 0.1
        };

        const announcementsObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    fetchAnnouncements();
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        announcementsObserver.observe(blogContainer);
    }

    // --- Carousel Initialization (Owl Carousel) ---
    if (window.jQuery) {
        $(".testimonials-carousel").owlCarousel({
            autoplay: true,
            dots: true,
            loop: true,
            responsive: {
                0: { items: 1 },
                576: { items: 1 },
                768: { items: 2 },
                992: { items: 3 }
            }
        });

        // Initialize Blog Carousel AFTER content injection
        if ($(".blog-carousel").children().length > 0) {
            // Destroy current instance if exists
            if ($(".blog-carousel").data('owl.carousel')) {
                $(".blog-carousel").trigger('destroy.owl.carousel');
            }

            $(".blog-carousel").owlCarousel({
                autoplay: true,
                dots: true,
                loop: false,
                rewind: true,
                margin: 30,
                responsive: {
                    0: { items: 1 },
                    576: { items: 1 },
                    768: { items: 2 },
                    992: { items: 3 }
                }
            });
        }

        // Portfolio Isotope
        if ($('.portfolio-container').length > 0) {
            var portfolioIsotope = $('.portfolio-container').isotope({
                itemSelector: '.portfolio-item',
                layoutMode: 'fitRows'
            });

            $('#portfolio-flters li').on('click', function () {
                $("#portfolio-flters li").removeClass('filter-active');
                $(this).addClass('filter-active');

                portfolioIsotope.isotope({ filter: $(this).data('filter') });
            });
        }
    }

}); // End DOMContentLoaded

// --- Service Modal Function (Global) ---
window.openServiceModal = function (type) {
    const titles = {
        'ceza': 'Ceza Hukuku',
        'sigorta': 'Sigorta ve Tazminat Hukuku',
        'aile': 'Aile ve Miras Hukuku',
        'is': 'İş ve Sosyal Güvenlik Hukuku',
        'ticaret': 'Ticaret ve Şirketler Hukuku',
        'icra': 'İcra ve İflas Hukuku'
    };

    // Detailed descriptions (can be expanded)
    const contents = {
        'ceza': 'Ağır Ceza ve Asliye Ceza Mahkemelerinin görev alanına giren suçlarda sanık müdafiliği ve mağdur vekilliği hizmeti verilmektedir. Özellikle uyuşturucu, cinsel suçlar, kasten öldürme ve yaralama suçlarında uzmanlaşmış kadromuzla hizmetinizdeyiz.',
        'sigorta': 'Trafik kazalarından kaynaklanan maddi ve manevi tazminat davaları, değer kaybı başvuruları ve Sigorta Tahkim Komisyonu süreçleri titizlikle takip edilmektedir.',
        'aile': 'Anlaşmalı ve çekişmeli boşanma davaları, nafaka, velayet, mal rejimi tasfiyesi, soybağı ve babalık davaları ile miras paylaşımı konularında hukuki destek sağlanmaktadır.',
        'is': 'İşe iade davaları, kıdem ve ihbar tazminatı hesaplamaları, fazla mesai ve diğer işçilik alacaklarının tahsili süreçlerinde işçi ve işveren vekilliği yapılmaktadır.',
        'ticaret': 'Şirket kuruluşları, esas sözleşme değişiklikleri, genel kurul toplantıları, birleşme ve devralmalar ile ticari sözleşmelerin hazırlanması konularında danışmanlık verilmektedir.',
        'icra': 'Çek, senet ve fatura alacaklarının tahsili, icra takipleri, itirazın iptali davaları, menfi tespit davaları ve iflas erteleme süreçleri yönetilmektedir.'
    };

    // Create or Update Modal
    let modal = document.getElementById('serviceModalDynamic');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'serviceModalDynamic';
        modal.className = 'modal fade';
        modal.setAttribute('tabindex', '-1');
        modal.setAttribute('role', 'dialog');
        modal.innerHTML = `
            <div class="modal-dialog modal-lg" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="serviceModalTitle"></h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body" id="serviceModalBody"></div>
                    <div class="modal-footer">
                        <a href="contact.html" class="btn btn-primary">Randevu Al</a>
                        <button type="button" class="btn btn-secondary" data-dismiss="modal">Kapat</button>
                    </div>
                </div>
            </div>`;
        document.body.appendChild(modal);
    }

    document.getElementById('serviceModalTitle').innerText = titles[type] || 'Hizmet Detayı';
    document.getElementById('serviceModalBody').innerText = contents[type] || 'Detaylı bilgi için lütfen iletişime geçiniz.';

    // Show modal using jQuery (Bootstrap requirement)
    if (window.jQuery) {
        $(modal).modal('show');
    }
};

window.openAnnouncementModal = async function (id) {
    if (!window.supabaseClient) return;

    const { data, error } = await window.supabaseClient
        .from('announcements')
        .select('*')
        .eq('id', id)
        .single();

    if (data) {
        let modal = document.getElementById('announcementModalDynamic');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'announcementModalDynamic';
            modal.className = 'modal fade';
            modal.innerHTML = `
             <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title"></h5>
                        <button type="button" class="close" data-dismiss="modal">&times;</button>
                    </div>
                    <div class="modal-body"></div>
                    <div class="modal-footer"><button class="btn btn-secondary" data-dismiss="modal">Kapat</button></div>
                </div>
             </div>`;
            document.body.appendChild(modal);
        }

        const imgHtml = data.image_url ? `<img src="${data.image_url}" class="img-fluid mb-3" style="width:100%">` : '';
        modal.querySelector('.modal-title').innerText = data.title;
        modal.querySelector('.modal-body').innerHTML = imgHtml + `<p>${data.content}</p>`;

        if (window.jQuery) $(modal).modal('show');
    }
};

