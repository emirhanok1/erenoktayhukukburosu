// Hero Slider Functionality
(function () {
    'use strict';

    // Get all slider images
    const sliderImages = document.querySelectorAll('.hero-img');
    let currentSlide = 0;

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
    setInterval(nextSlide, 5000);
})();
