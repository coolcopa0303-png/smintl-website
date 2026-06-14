/* =====================================================
   SEN MART INTERNATIONAL — main.js
   L2 Interaction: scroll reveal · navbar · count-up
   mouse spotlight · track tabs · form handling
   ===================================================== */

'use strict';

// ======================== LANGUAGE / i18n ========================
const LANG_KEY = 'smintl_lang';

function applyLanguage(lang) {
  // Translate innerHTML elements
  document.querySelectorAll('[data-zh]').forEach(el => {
    if (!el.dataset.en) el.dataset.en = el.innerHTML;
    el.innerHTML = lang === 'zh' ? el.dataset.zh : el.dataset.en;
  });
  // Translate placeholder attributes
  document.querySelectorAll('[data-zh-placeholder]').forEach(el => {
    if (!el.dataset.enPlaceholder) el.dataset.enPlaceholder = el.placeholder;
    el.placeholder = lang === 'zh' ? el.dataset.zhPlaceholder : el.dataset.enPlaceholder;
  });
  // Update html lang attribute
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  // Update toggle button label
  const toggle = document.getElementById('langToggle');
  if (toggle) toggle.textContent = lang === 'zh' ? 'EN' : '中文';
  localStorage.setItem(LANG_KEY, lang);
}

function initLanguage() {
  const toggle = document.getElementById('langToggle');
  if (!toggle) return;
  const saved = localStorage.getItem(LANG_KEY) || 'en';
  applyLanguage(saved);
  toggle.addEventListener('click', () => {
    const current = localStorage.getItem(LANG_KEY) || 'en';
    applyLanguage(current === 'en' ? 'zh' : 'en');
  });
}
initLanguage();

// ======================== SCROLL PROGRESS ========================
const scrollProgressBar = document.getElementById('scrollProgress');
function updateScrollProgress() {
  if (!scrollProgressBar) return;
  const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight);
  scrollProgressBar.style.setProperty('--progress', Math.min(pct, 1));
}
if (scrollProgressBar) window.addEventListener('scroll', updateScrollProgress, { passive: true });

// ======================== NAVBAR ========================
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const mobileDrawer = document.getElementById('mobileDrawer');

const isInnerPage = document.body.classList.contains('inner-page');

function updateNavbar() {
  if (isInnerPage) {
    navbar.classList.add('scrolled');
    return;
  }
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}
window.addEventListener('scroll', updateNavbar, { passive: true });
updateNavbar();

// Active nav link based on current page URL
(function initActiveLinkFromURL() {
  const currentFile = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
    const href = (link.getAttribute('href') || '').split('/').pop();
    if (href === currentFile) link.classList.add('active');
  });
})();

hamburger.addEventListener('click', () => {
  const isOpen = mobileDrawer.classList.toggle('open');
  hamburger.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-expanded', String(isOpen));
});

// Close mobile drawer on link click
document.querySelectorAll('.mobile-nav-link').forEach(link => {
  link.addEventListener('click', () => {
    mobileDrawer.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  });
});

// Close drawer on outside click
document.addEventListener('click', (e) => {
  if (!navbar.contains(e.target) && !mobileDrawer.contains(e.target)) {
    mobileDrawer.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  }
});

// ======================== HERO IMAGE KEN BURNS ========================
const heroBgImg = document.querySelector('.hero-bg-img');
if (heroBgImg) {
  if (heroBgImg.complete) {
    heroBgImg.classList.add('loaded');
  } else {
    heroBgImg.addEventListener('load', () => heroBgImg.classList.add('loaded'));
  }
}

// ======================== MOUSE GLOW (HERO) ========================
const heroSection = document.querySelector('.hero');
const heroGlow = document.querySelector('.hero-glow');
let glowRafId = null;

if (heroSection && heroGlow && window.matchMedia('(hover: hover)').matches) {
  heroSection.addEventListener('mousemove', (e) => {
    if (glowRafId) return;
    glowRafId = requestAnimationFrame(() => {
      const rect = heroSection.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      heroGlow.style.left = x + 'px';
      heroGlow.style.top = y + 'px';
      heroGlow.style.transform = 'translate(-50%, -50%)';
      heroGlow.style.transition = 'left 0.6s ease, top 0.6s ease';
      glowRafId = null;
    });
  });
}

// ======================== SCROLL REVEAL ========================
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal, .stagger-reveal');
  if (!reveals.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  reveals.forEach(el => observer.observe(el));
}
initScrollReveal();

// ======================== COUNT-UP ========================
function countUp(el, target, delay = 0) {
  const duration = 1500;
  setTimeout(() => {
    const startTime = performance.now();
    function update(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      el.textContent = Math.floor(eased * target).toLocaleString();
      if (progress < 1) requestAnimationFrame(update);
      else el.textContent = target.toLocaleString();
    }
    requestAnimationFrame(update);
  }, delay);
}

function initCounters() {
  const counters = document.querySelectorAll('.count-up');
  if (!counters.length) return;

  const section = counters[0].closest('section') || counters[0].parentElement;
  let triggered = false;

  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !triggered) {
      triggered = true;
      counters.forEach((el, i) => {
        countUp(el, parseInt(el.dataset.end, 10), i * 160);
      });
      observer.disconnect();
    }
  }, { threshold: 0.25 });

  observer.observe(section);
}
initCounters();

// ======================== ACTIVE NAV LINK ========================
function initActiveNav() {
  if (isInnerPage) return;
  const sections = document.querySelectorAll('section[id], div[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === '#' + id);
        });
      }
    });
  }, { threshold: 0.3, rootMargin: '-80px 0px -60% 0px' });

  sections.forEach(s => observer.observe(s));
}
initActiveNav();

// ======================== TRACK TABS ========================
const trackTabs = document.querySelectorAll('.track-tab');
const trackInput = document.getElementById('trackInput');

const tabPlaceholders = {
  hbl: 'Enter HBL number...',
  mbl: 'Enter MBL number...',
  ref: 'Enter reference number...',
  cntr: 'Enter container number...',
};

trackTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    trackTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    if (trackInput) {
      trackInput.placeholder = tabPlaceholders[tab.dataset.tab] || 'Enter shipment number...';
      trackInput.focus();
    }
  });
});

// ======================== HERO TRACK FORM ========================
async function handleHeroTrack(e) {
  e.preventDefault();
  const shipmentInput = document.getElementById('heroShipmentNumber');
  const customerInput = document.getElementById('heroCustomerCode');
  const resultEl = document.getElementById('heroTrackResult');
  if (!shipmentInput || !customerInput || !resultEl) return;

  const shipmentNumber = shipmentInput.value.trim();
  const customerCode = customerInput.value.trim();

  if (!shipmentNumber) {
    shipmentInput.focus();
    shipmentInput.style.borderColor = 'rgba(239,68,68,0.8)';
    setTimeout(() => { shipmentInput.style.borderColor = ''; }, 2000);
    return;
  }

  // Show loading
  resultEl.hidden = false;
  resultEl.textContent = 'Searching...';
  resultEl.style.opacity = '1';

  try {
    const params = new URLSearchParams({ shipmentNumber });
    if (customerCode) params.append('customerCode', customerCode);
    const res = await fetch(`https://api.senmartintl.com/public/find?${params}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    if (data && (data.hbl || data.mbl || data.status || data.eta)) {
      const lines = [];
      if (data.hbl) lines.push(`HBL: ${data.hbl}`);
      if (data.mbl) lines.push(`MBL: ${data.mbl}`);
      if (data.status) lines.push(`Status: ${data.status}`);
      if (data.eta) lines.push(`ETA: ${data.eta}`);
      resultEl.textContent = lines.join('  ·  ');
    } else if (Array.isArray(data) && data.length > 0) {
      const item = data[0];
      const lines = [];
      if (item.hbl) lines.push(`HBL: ${item.hbl}`);
      if (item.status) lines.push(`Status: ${item.status}`);
      if (item.eta) lines.push(`ETA: ${item.eta}`);
      resultEl.textContent = lines.length ? lines.join('  ·  ') : 'Shipment found. Contact us for details.';
    } else {
      resultEl.innerHTML = 'No results found for this shipment number. <a href="mailto:info@senmartintl.com">Contact us directly →</a>';
    }
  } catch (err) {
    resultEl.innerHTML = 'Unable to connect to tracking system. Please <a href="mailto:info@senmartintl.com">email us</a> or call <a href="tel:5169620966">516-962-0966</a>.';
  }
}

// ======================== TRACK FORM ========================
function handleTrack(e) {
  e.preventDefault();
  const input = document.getElementById('trackInput');
  const result = document.getElementById('trackResult');
  if (!input || !result) return;

  const val = input.value.trim();
  if (!val) {
    input.focus();
    input.style.borderColor = 'var(--error)';
    setTimeout(() => { input.style.borderColor = ''; }, 2000);
    return;
  }

  result.hidden = false;
  result.style.opacity = '0';
  result.style.transform = 'translateY(8px)';
  requestAnimationFrame(() => {
    result.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    result.style.opacity = '1';
    result.style.transform = 'translateY(0)';
  });
}

// ======================== CONTACT FORM ========================
function handleContact(e) {
  e.preventDefault();
  const form = e.target;
  const successMsg = document.getElementById('formSuccess');
  const btn = form.querySelector('button[type="submit"]');

  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Sending...';
  }

  // Simulate async submission
  setTimeout(() => {
    if (successMsg) {
      successMsg.hidden = false;
      successMsg.style.opacity = '0';
      successMsg.style.transform = 'translateY(8px)';
      requestAnimationFrame(() => {
        successMsg.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        successMsg.style.opacity = '1';
        successMsg.style.transform = 'translateY(0)';
      });
    }
    form.reset();
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = 'Send Inquiry <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>';
    }
  }, 1200);
}

// ======================== SMOOTH ANCHOR SCROLL ========================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ======================== HERO STAGGER ENTRANCE ========================
(function initHeroEntrance() {
  const reveals = document.querySelectorAll('.hero-content .reveal');
  reveals.forEach((el, i) => {
    el.style.transitionDelay = `${0.2 + i * 0.12}s`;
    // Trigger immediately on load
    requestAnimationFrame(() => {
      setTimeout(() => {
        el.classList.add('in-view');
      }, 100 + i * 120);
    });
  });
})();

// ======================== PARALLAX HERO BG ========================
if (window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
  let parallaxRaf = null;
  window.addEventListener('scroll', () => {
    if (parallaxRaf) return;
    parallaxRaf = requestAnimationFrame(() => {
      const scrollY = window.scrollY;
      if (heroBgImg && scrollY < window.innerHeight) {
        heroBgImg.style.transform = `scale(1) translateY(${scrollY * 0.25}px)`;
      }
      parallaxRaf = null;
    });
  }, { passive: true });
}
