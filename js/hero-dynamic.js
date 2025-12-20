// Hero Dynamic Loader - Frontend
// Loads hero image dynamically from Supabase on page load

document.addEventListener('DOMContentLoaded', () => {
    loadHeroImage();
});

async function loadHeroImage() {
    try {
        // Fetch active hero image from Supabase
        const { data, error } = await supabaseClient
            .from('hero_image')
            .select('image_data')
            .eq('is_active', true)
            .single();

        if (error) {
            console.error('Error loading hero image:', error);
            // Keep default image on error
            return;
        }

        // Update hero image if not default
        if (data && data.image_data !== 'default') {
            const heroImg = document.querySelector('.hero-img');
            if (heroImg) {
                heroImg.src = data.image_data;
            }
        }
    } catch (err) {
        console.error('Error in loadHeroImage:', err);
        // Silently fail and keep default image
    }
}
