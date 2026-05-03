const TARGET_DATE = new Date('2026-03-25T23:00:00Z');
const META_PIXEL_IDS = ['1599242897762192', '1152272353771099', '4254631328136179', '1560736461820497', '916689227676142'];
const WHATSAPP_GROUP_URL = 'https://chat.whatsapp.com/Glq12Ih9jOz5IhtHJ98ud0';
const SUPABASE_URL = 'https://zdjtcwtakgizbsbbwtgc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkanRjd3Rha2dpemJzYmJ3dGdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwMzIxMjMsImV4cCI6MjA4NDYwODEyM30.juuc45o-OZbLQcx2LaMLyltRABAVy70kgJ_L_JXeUEs';

const progressBar = document.getElementById('progress-bar');
const bottomBar = document.getElementById('bottomBar');

function initMetaPixel() {
  if (window.fbq) return;
  !(function(f, b, e, v, n, t, s) {
    if (f.fbq) return;
    n = f.fbq = function() {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = '2.0';
    n.queue = [];
    t = b.createElement(e);
    t.async = true;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

  META_PIXEL_IDS.forEach((id) => window.fbq('init', id));
  trackEvent('PageView');
  trackEvent('ViewContent', { content_name: 'Aula Secreta' });
}

function getGtag() {
  if (typeof window.gtag === 'function') return window.gtag;
  if (window.parent && window.parent !== window && typeof window.parent.gtag === 'function') return window.parent.gtag;
  return null;
}

function trackEvent(name, data = {}) {
  if (typeof window.fbq === 'function') window.fbq('track', name, data);

  const gtag = getGtag();
  if (gtag) gtag('event', name, data);
}

function trackCustom(name, data = {}) {
  if (typeof window.fbq === 'function') window.fbq('trackCustom', name, data);

  const gtag = getGtag();
  if (gtag) gtag('event', name, data);
}

function pad(value) {
  return String(value).padStart(2, '0');
}

function setCountdownValues(prefix, days, hours) {
  const dayEl = document.getElementById(`${prefix}-days`);
  const hourEl = document.getElementById(`${prefix}-hours`);
  if (dayEl) dayEl.textContent = pad(days);
  if (hourEl) hourEl.textContent = pad(hours);
}

function updateCountdown() {
  const diff = Math.max(TARGET_DATE.getTime() - Date.now(), 0);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  setCountdownValues('hero', days, hours);
  setCountdownValues('final', days, hours);
}

function updateProgress() {
  if (!progressBar) return;
  const scrollTop = window.scrollY;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const ratio = maxScroll > 0 ? Math.min(100, Math.max(0, (scrollTop / maxScroll) * 100)) : 0;
  progressBar.style.width = `${ratio}%`;
}

function setupReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
}

function setupTrackedViews() {
  const tracked = new Set();
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const eventName = entry.target.getAttribute('data-track-view');
      if (entry.isIntersecting && eventName && !tracked.has(eventName)) {
        tracked.add(eventName);
        trackCustom(eventName);
      }
    });
  }, { threshold: 0.35 });

  document.querySelectorAll('[data-track-view]').forEach((element) => observer.observe(element));
}

function setFaqState(item, isOpen) {
  const button = item.querySelector('.faq-question');
  const answer = item.querySelector('.faq-answer');
  if (!button || !answer) return;

  item.classList.toggle('open', isOpen);
  item.classList.toggle('active', isOpen);
  button.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  answer.style.display = isOpen ? 'block' : 'none';
  answer.style.maxHeight = isOpen ? `${answer.scrollHeight}px` : '0px';
}

function setupFaq() {
  const faqItems = document.querySelectorAll('.faq-item');
  if (faqItems[0]) faqItems[0].classList.add('active', 'open');
  if (faqItems[1]) faqItems[1].classList.add('active', 'open');

  faqItems.forEach((item) => {
    const button = item.querySelector('.faq-question');
    if (!button) return;

    setFaqState(item, item.classList.contains('active') || item.classList.contains('open'));

    button.addEventListener('click', () => {
      setFaqState(item, !item.classList.contains('active'));
    });
  });
}

function setupForm() {
  const form = document.getElementById('capture-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = document.getElementById('submit-btn');
    const nameInput = document.getElementById('capture-name');
    const phoneInput = document.getElementById('capture-phone');
    
    if (!nameInput || !phoneInput) return;
    
    const name = nameInput.value;
    const phone = phoneInput.value;

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Enviando...';
    }

    trackEvent('Lead', { content_name: 'Aula Secreta', name });

    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/webinar_leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          name: name,
          whatsapp: phone,
          source: 'webinar_page'
        })
      });

      if (!response.ok) {
        console.error('Submission failed', await response.text());
      }
    } catch (error) {
      console.error('Error submitting lead:', error);
    } finally {
      window.top.location.href = WHATSAPP_GROUP_URL;
    }
  });
}

function setupButtons() {
  document.querySelectorAll('[data-scroll-target]').forEach((button) => {
    button.addEventListener('click', () => {
      const selector = button.getAttribute('data-scroll-target');
      const target = selector ? document.querySelector(selector) : null;
      trackCustom(button.getAttribute('data-cta') || 'ScrollCTA');
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

function setupBottomBarVisibility() {
  const ctaSections = document.querySelectorAll('.cta-section, .hero-cta, .final-cta');
  const bar = document.getElementById('bottomBar');
  if (!bar) return;

  const toggleBar = () => {
    let hide = false;
    ctaSections.forEach((sec) => {
      const r = sec.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) hide = true;
    });
    bar.style.opacity = hide ? '0' : '1';
    bar.style.pointerEvents = hide ? 'none' : 'auto';
  };

  window.addEventListener('scroll', toggleBar, { passive: true });
  toggleBar();
}

initMetaPixel();
updateCountdown();
updateProgress();
setupReveal();
setupTrackedViews();
setupFaq();
setupForm();
setupButtons();
setupBottomBarVisibility();

window.addEventListener('scroll', updateProgress, { passive: true });
window.setInterval(updateCountdown, 1000 * 60 * 60); // Update every hour since we only show days
