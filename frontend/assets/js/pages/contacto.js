document.addEventListener('DOMContentLoaded', () => {
    // Form handling
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                subject: document.getElementById('subject').value,
                message: document.getElementById('message').value,
                timestamp: new Date().toISOString()
            };

            console.log('Formulario enviado:', formData);

            // Simulate success
            alert('¡Mensaje enviado exitosamente! Nos pondremos en contacto contigo pronto.');
            this.reset();
        });
    }
});
