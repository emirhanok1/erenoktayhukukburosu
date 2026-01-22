// Hero Slider Functionality
(function () {
    'use strict';

    // Get all slider images (now inside picture elements)
    const sliderImages = document.querySelectorAll('.hero-section picture img');
    let currentSlide = 0;

    // Set first image as active
    if (sliderImages.length > 0) {
        sliderImages[0].classList.add('active');
    }

    // Function to show next slide
    function nextSlide() {
        // Remove active class from current slide
        sliderImages[currentSlide].classList.remove('active');

        // Move to next slide
        currentSlide = (currentSlide + 1) % sliderImages.length;

        // Add active class to new slide
        sliderImages[currentSlide].classList.add('active');
    }

    // Auto-advance slides every 5 seconds
    if (sliderImages.length > 1) {
        setInterval(nextSlide, 5000);
    }
})();
