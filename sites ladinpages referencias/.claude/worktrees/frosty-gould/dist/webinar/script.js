// ===========================
// COUNTDOWN TIMER
// ===========================
const TARGET_DATE = new Date('2026-03-18T20:00:00-03:00'); // 18/03/2026 às 20h (Brasília)

function updateCountdown() {
    const now = new Date();
    const diff = TARGET_DATE - now;

    if (diff <= 0) {
        // Aula já começou
        ['cd-days', 'cd-hours', 'cd-minutes', 'cd-seconds',
         'cd-days-2', 'cd-hours-2', 'cd-minutes-2', 'cd-seconds-2'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = '00';
        });
        return;
    }

    const days    = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours   = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    const pad = (n) => String(n).padStart(2, '0');

    // Hero countdown
    document.getElementById('cd-days').textContent    = pad(days);
    document.getElementById('cd-hours').textContent   = pad(hours);
    document.getElementById('cd-minutes').textContent = pad(minutes);
    document.getElementById('cd-seconds').textContent = pad(seconds);

    // Final CTA countdown
    document.getElementById('cd-days-2').textContent    = pad(days);
    document.getElementById('cd-hours-2').textContent   = pad(hours);
    document.getElementById('cd-minutes-2').textContent = pad(minutes);
    document.getElementById('cd-seconds-2').textContent = pad(seconds);
}

updateCountdown();
setInterval(updateCountdown, 1000);

// ===========================
// LEAD STORAGE (localStorage)
// ===========================
function saveRegistration(name, whatsapp) {
    const leads = JSON.parse(localStorage.getItem('canvaviagem_leads') || '[]');
    leads.push({
        name,
        whatsapp,
        timestamp: new Date().toISOString(),
        source: 'aula_secreta_18_03'
    });
    localStorage.setItem('canvaviagem_leads', JSON.stringify(leads));
}

// ===========================
// MODAL
// ===========================
const modal = document.getElementById('success-modal');
const modalNameEl = document.getElementById('modal-name');
const modalClose = document.getElementById('modal-close');

function showModal(name) {
    modalNameEl.textContent = name.split(' ')[0]; // só primeiro nome
    modal.classList.add('active');
    modal.removeAttribute('aria-hidden');
    document.body.style.overflow = 'hidden';
    modalClose.focus();
}

function closeModal() {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
}

modalClose.addEventListener('click', closeModal);

modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
});

// ===========================
// FORM HANDLING
// ===========================
function handleFormSubmit(nameId, whatsappId, e) {
    e.preventDefault();

    const nameEl     = document.getElementById(nameId);
    const whatsappEl = document.getElementById(whatsappId);

    const name     = nameEl.value.trim();
    const whatsapp = whatsappEl.value.trim();

    if (!name || !whatsapp) return;

    // Basic WhatsApp validation (only numbers, at least 10 digits)
    const cleanWpp = whatsapp.replace(/\D/g, '');
    if (cleanWpp.length < 10) {
        whatsappEl.focus();
        whatsappEl.style.borderColor = '#FF6B6B';
        whatsappEl.placeholder = 'Por favor, insira um WhatsApp válido';
        setTimeout(() => {
            whatsappEl.style.borderColor = '';
            whatsappEl.placeholder = 'WhatsApp com DDD (ex: 11 99999-9999)';
        }, 3000);
        return;
    }

    // Save to localStorage
    saveRegistration(name, cleanWpp);

    // Show success modal
    showModal(name);

    // Reset form
    nameEl.value = '';
    whatsappEl.value = '';
}

document.getElementById('registration-form-1').addEventListener('submit', (e) => {
    handleFormSubmit('name-1', 'whatsapp-1', e);
});

document.getElementById('registration-form-2').addEventListener('submit', (e) => {
    handleFormSubmit('name-2', 'whatsapp-2', e);
});

// ===========================
// FAQ ACCORDION
// ===========================
document.querySelectorAll('.faq-question').forEach((btn) => {
    btn.addEventListener('click', () => {
        const item = btn.closest('.faq-item');
        const isOpen = item.classList.contains('open');

        // Close all open FAQs
        document.querySelectorAll('.faq-item.open').forEach((openItem) => {
            openItem.classList.remove('open');
            openItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
        });

        // Open clicked one (unless it was already open)
        if (!isOpen) {
            item.classList.add('open');
            btn.setAttribute('aria-expanded', 'true');
        }
    });
});

// ===========================
// SCROLL REVEAL ANIMATIONS
// ===========================
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target); // animate only once
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll(
    '.glass-card, .benefit-card, .discovery-card, .for-who-card, .faq-item, .authority-card, .cta-final-card'
).forEach((el) => {
    el.classList.add('reveal');
    revealObserver.observe(el);
});

// ===========================
// WHATSAPP INPUT MASK (auto format)
// ===========================
function maskWhatsApp(input) {
    let v = input.value.replace(/\D/g, '').slice(0, 11);
    if (v.length >= 7) {
        v = v.replace(/^(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
    } else if (v.length >= 3) {
        v = v.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
    } else if (v.length >= 1) {
        v = v.replace(/^(\d{0,2})/, '($1');
    }
    input.value = v;
}

document.querySelectorAll('input[type="tel"]').forEach((input) => {
    input.addEventListener('input', () => maskWhatsApp(input));
});
