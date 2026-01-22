// Hero Slider Functionality
document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    // Get all slider images
    const sliderImages = document.querySelectorAll('.hero-img');

    // Safety check
    if (!sliderImages || sliderImages.length === 0) {
        console.warn('Hero slider: No images found with class .hero-img');
        return;
    }

    // Ensure first image is active if none are
    if (!document.querySelector('.hero-img.active')) {
        sliderImages[0].classList.add('active');
    }

    let currentSlide = 0;
    // Find current active slide index if any
    sliderImages.forEach((img, index) => {
        if (img.classList.contains('active')) {
            currentSlide = index;
        }
    });

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
    const slideInterval = setInterval(nextSlide, 5000);

    // Optional: Pause on hover
    const heroSection = document.querySelector('.hero-section');
    if (heroSection) {
        heroSection.addEventListener('mouseenter', () => clearInterval(slideInterval));
        heroSection.addEventListener('mouseleave', () => setInterval(nextSlide, 5000));
    }
});
