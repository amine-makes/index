function contactService(service) {
    alert('Thank you for your interest in our ' + service + ' service! Please contact us at aminehaddioui33@icloud.com to get started.');
}


// Contact & Request Form Submission with AJAX and validation
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const name = contactForm.name.value.trim();
            const email = contactForm.email.value.trim();
            const message = contactForm.message.value.trim();
            if (!name || !email || !message || !validateEmail(email)) {
                alert('Please fill out all fields with a valid email.');
                return;
            }
            try {
                const res = await fetch('/api/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, message })
                });
                const data = await res.json();
                if (data.success) {
                    alert('Thank you, ' + name + '! Your message has been sent. We will contact you at ' + email + '.');
                    contactForm.reset();
                } else {
                    alert('Sorry, there was a problem sending your message.');
                }
            } catch (err) {
                alert('Network error. Please try again later.');
            }
        });
    }

    // Newsletter signup
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = newsletterForm.email.value.trim();
            const msg = document.getElementById('newsletterMsg');
            if (!validateEmail(email)) {
                msg.textContent = 'Please enter a valid email address.';
                msg.style.color = '#ff512f';
                return;
            }
            msg.textContent = 'Thank you for subscribing! You will receive updates soon.';
            msg.style.color = '#fff';
            newsletterForm.reset();
        });
    }

    const requestForm = document.getElementById('requestForm');
    if (requestForm) {
        requestForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const name = requestForm.name.value.trim();
            const email = requestForm.email.value.trim();
            const service = requestForm.service.value;
            const details = requestForm.details.value.trim();
            if (!name || !email || !service || !details || !validateEmail(email)) {
                alert('Please fill out all fields with a valid email.');
                return;
            }
            try {
                const res = await fetch('/api/request', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, service, details })
                });
                const data = await res.json();
                if (data.success) {
                    alert('Thank you, ' + name + '! Your request for ' + service + ' has been received. We will contact you at ' + email + '.');
                    requestForm.reset();
                } else {
                    alert('Sorry, there was a problem sending your request.');
                }
            } catch (err) {
                alert('Network error. Please try again later.');
            }
        });
    }
});

function validateEmail(email) {
    // Simple email validation
    return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
}

// Simple language translations
const translations = {
    en: {
        home: 'Home', services: 'Services', tools: 'Tools', contact: 'Contact', help: 'Help',
        title: 'Creative Services Hub',
        tagline: `Unleash your brand's potential with our expert design, web development, and video editing services.`
    },
    fr: {
        home: 'Accueil', services: 'Services', tools: 'Outils', contact: 'Contact', help: 'Aide',
        title: 'Centre de Services Créatifs',
        tagline: `Libérez le potentiel de votre marque avec nos services experts en design, développement web et montage vidéo.`
    },
    ar: {
        home: 'الرئيسية', services: 'الخدمات', tools: 'الأدوات', contact: 'اتصل بنا', help: 'مساعدة',
        title: 'مركز الخدمات الإبداعية',
        tagline: `أطلق إمكانيات علامتك التجارية مع خدماتنا في التصميم وتطوير المواقع وتحرير الفيديو.`
    },
    de: {
        home: 'Startseite', services: 'Dienstleistungen', tools: 'Werkzeuge', contact: 'Kontakt', help: 'Hilfe',
        title: 'Kreativdienstleistungszentrum',
        tagline: `Entfesseln Sie das Potenzial Ihrer Marke mit unseren Experten für Design, Webentwicklung und Videobearbeitung.`
    },
    es: {
        home: 'Inicio', services: 'Servicios', tools: 'Herramientas', contact: 'Contacto', help: 'Ayuda',
        title: 'Centro de Servicios Creativos',
        tagline: `Libera el potencial de tu marca con nuestros servicios expertos en diseño, desarrollo web y edición de video.`
    }
};

document.addEventListener('DOMContentLoaded', function() {
    const langSwitcher = document.getElementById('langSwitcher');
    if (langSwitcher) {
        langSwitcher.addEventListener('change', function() {
            const lang = langSwitcher.value;
            setLanguage(lang);
        });
    }
});

function setLanguage(lang) {
        const t = translations[lang] || translations['en'];
        // Navbar
        const navLinks = document.querySelectorAll('.navbar ul li a');
        const keys = ['home', 'services', 'tools', 'contact', 'help'];
        navLinks.forEach((a, i) => { a.textContent = t[keys[i]]; });
        // Title (always English, brand)
        const titleEl = document.getElementById('site-title');
        if (titleEl) titleEl.textContent = translations['en'].title;
        // Tagline
        const taglineEl = document.querySelector('header p');
        if (taglineEl) taglineEl.textContent = t.tagline;
}

// Open external tool links in a new tab
function openTool(url) {
    window.open(url, '_blank', 'noopener');
}
