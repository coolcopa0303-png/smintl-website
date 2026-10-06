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
  const fmt = n => ('plain' in el.dataset ? String(n) : n.toLocaleString());
  setTimeout(() => {
    const startTime = performance.now();
    function update(now) {
      const elapsed = now - startTime;
      const progress = Math.max(0, Math.min(elapsed / duration, 1));
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      el.textContent = fmt(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(update);
      else el.textContent = fmt(target);
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

// ======================== IMAGE SLIDER ========================
document.querySelectorAll('[data-slider]').forEach(slider => {
  const track = slider.querySelector('.slider-track');
  const slides = track.children;
  const dotsWrap = slider.querySelector('.slider-dots');
  const count = slides.length;
  const autoplay = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let index = 0;
  let timer = null;

  const dots = Array.from({ length: count }, (_, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'slider-dot';
    dot.setAttribute('aria-label', `Go to photo ${i + 1}`);
    dot.addEventListener('click', () => { goTo(i); restart(); });
    dotsWrap.appendChild(dot);
    return dot;
  });

  function goTo(i) {
    index = (i + count) % count;
    track.style.transform = `translateX(${-index * 100}%)`;
    dots.forEach((d, n) => d.classList.toggle('active', n === index));
  }
  function stop() { clearInterval(timer); timer = null; }
  function start() { if (autoplay && !timer) timer = setInterval(() => goTo(index + 1), 5000); }
  function restart() { stop(); start(); }

  slider.querySelector('.slider-prev').addEventListener('click', () => { goTo(index - 1); restart(); });
  slider.querySelector('.slider-next').addEventListener('click', () => { goTo(index + 1); restart(); });

  slider.tabIndex = 0;
  slider.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') { goTo(index - 1); restart(); }
    if (e.key === 'ArrowRight') { goTo(index + 1); restart(); }
  });

  // Mouse drag / touch swipe
  let startX = 0, deltaX = 0, dragging = false;
  slider.addEventListener('pointerdown', e => {
    if (e.target.closest('button')) return;
    dragging = true; startX = e.clientX; deltaX = 0;
    slider.classList.add('is-dragging');
    slider.setPointerCapture(e.pointerId);
    stop();
  });
  slider.addEventListener('pointermove', e => {
    if (!dragging) return;
    deltaX = e.clientX - startX;
    track.style.transform = `translateX(calc(${-index * 100}% + ${deltaX}px))`;
  });
  const endDrag = () => {
    if (!dragging) return;
    dragging = false;
    slider.classList.remove('is-dragging');
    const threshold = slider.offsetWidth * 0.15;
    if (deltaX > threshold) goTo(index - 1);
    else if (deltaX < -threshold) goTo(index + 1);
    else goTo(index);
    start();
  };
  slider.addEventListener('pointerup', endDrag);
  slider.addEventListener('pointercancel', endDrag);

  slider.addEventListener('mouseenter', stop);
  slider.addEventListener('mouseleave', () => { if (!dragging) start(); });
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));

  goTo(0);
  start();
});

// ======================== SCREENSHOT LIGHTBOX ========================
document.querySelectorAll('.sp-shot img').forEach(img => {
  img.addEventListener('click', () => {
    const box = document.createElement('div');
    box.className = 'shot-lightbox';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.innerHTML = '<button type="button" class="shot-lightbox-close" aria-label="Close"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>';
    const big = document.createElement('img');
    big.src = img.currentSrc || img.src;
    big.alt = img.alt;
    box.appendChild(big);
    document.body.appendChild(box);
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => box.classList.add('open'));
    const close = () => {
      box.remove();
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
      img.focus?.();
    };
    const onKey = e => { if (e.key === 'Escape') close(); };
    box.addEventListener('click', close);
    document.addEventListener('keydown', onKey);
    box.querySelector('button').focus();
  });
});
