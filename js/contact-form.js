
// Contact Form Handler with Supabase
$(document).ready(function () {

    const contactForm = $('form'); // Assuming only one form on contact.html

    if (contactForm.length === 0) return;

    contactForm.on('submit', async function (e) {
        e.preventDefault();

        const submitBtn = $(this).find('button[type="submit"]');
        const originalText = submitBtn.text();

        // Sanitize Input Function
        function sanitizeInput(str) {
            if (!str) return '';
            const temp = document.createElement('div');
            temp.textContent = str;
            return temp.innerHTML;
        }

        // Input fields - assuming standard placeholder names, will verify in HTML update
        // We will add IDs to HTML elements to be precise
        const name = sanitizeInput($('#name').val());
        const email = sanitizeInput($('#email').val());
        const subject = sanitizeInput($('#subject').val());
        const message = sanitizeInput($('#message').val());

        // Honeypot Check
        const honeypot = $('#fax_number').val();
        if (honeypot) {
            console.log('Spam detected.');
            return; // Silently reject
        }

        if (!name || !email || !message) {
            alert('Lütfen gerekli alanları doldurunuz.');
            return;
        }

        // Loading State
        submitBtn.text('Gönderiliyor...');
        submitBtn.prop('disabled', true);

        try {
            // Insert into Supabase
            const { data, error } = await supabaseClient
                .from('messages')
                .insert([
                    {
                        name: name,
                        email: email,
                        subject: subject,
                        message: message,
                        created_at: new Date()
                    }
                ]);

            if (error) throw error;

            // Success
            alert('Mesajınız başarıyla iletildi. En kısa sürede dönüş sağlanacaktır.');
            contactForm[0].reset();

        } catch (error) {
            console.error('Error sending message:', error);
            // Check if table missing error or permission error
            if (error.code === '42P01') {
                alert('Sistem hatası: Mesaj kutusu henüz aktif edilmemiş (Tablo eksik). Lütfen yönetici ile iletişime geçin.');
            } else {
                alert('Mesaj gönderilirken bir hata oluştu: ' + error.message);
            }
        } finally {
            submitBtn.text(originalText);
            submitBtn.prop('disabled', false);
        }
    });
});
