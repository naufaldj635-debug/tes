/* ─── MNFR WEBSITE SCRIPT ────────────────────────────────────────────────────── */
'use strict';

// ─── CURSOR ──────────────────────────────────────────────────────────────────
const cursor       = document.getElementById('cursor');
const cursorFollow = document.getElementById('cursorFollower');

let mouseX = 0, mouseY = 0;
let followX = 0, followY = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursor.style.left = mouseX + 'px';
  cursor.style.top  = mouseY + 'px';
});

(function animateCursor() {
  followX += (mouseX - followX) * 0.1;
  followY += (mouseY - followY) * 0.1;
  cursorFollow.style.left = followX + 'px';
  cursorFollow.style.top  = followY + 'px';
  requestAnimationFrame(animateCursor);
})();


// ─── NAV SCROLL ──────────────────────────────────────────────────────────────
const nav = document.getElementById('nav');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });


// ─── PARTICLE CANVAS ─────────────────────────────────────────────────────────
const canvas = document.getElementById('particles');
const ctx    = canvas.getContext('2d');

let particles = [];
let W, H;

function resize() {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
}

resize();
window.addEventListener('resize', () => { resize(); initParticles(); }, { passive: true });

function isDark() { return document.documentElement.getAttribute('data-theme') !== 'light'; }

function getAccentColor(alpha = 1) {
  return isDark()
    ? `rgba(110, 210, 255, ${alpha})`
    : `rgba(26, 106, 191, ${alpha})`;
}

class Particle {
  constructor() { this.reset(); }

  reset() {
    this.x      = Math.random() * W;
    this.y      = Math.random() * H;
    this.vx     = (Math.random() - 0.5) * 0.3;
    this.vy     = (Math.random() - 0.5) * 0.3 - 0.1;
    this.radius = Math.random() * 1.2 + 0.3;
    this.alpha  = Math.random() * 0.5 + 0.1;
    this.life   = 0;
    this.maxLife = Math.random() * 400 + 200;
  }

  update() {
    this.x  += this.vx;
    this.y  += this.vy;
    this.life++;
    const ratio = this.life / this.maxLife;
    this.currentAlpha = this.alpha * (ratio < 0.1 ? ratio / 0.1 : ratio > 0.8 ? 1 - (ratio - 0.8) / 0.2 : 1);
    if (this.life >= this.maxLife || this.x < 0 || this.x > W || this.y < 0 || this.y > H) {
      this.reset();
    }
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = getAccentColor(this.currentAlpha);
    ctx.fill();
  }
}

// Lines connecting nearby particles
function drawConnections() {
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        const alpha = (1 - dist / 120) * 0.08;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = getAccentColor(alpha);
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
  }
}

function initParticles() {
  const count = Math.min(Math.floor((W * H) / 12000), 90);
  particles = Array.from({ length: count }, () => new Particle());
}

function animateParticles() {
  ctx.clearRect(0, 0, W, H);
  particles.forEach(p => { p.update(); p.draw(); });
  drawConnections();
  requestAnimationFrame(animateParticles);
}

initParticles();
animateParticles();


// ─── SCROLL REVEAL ───────────────────────────────────────────────────────────
const revealElements = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el    = entry.target;
      const delay = parseInt(el.dataset.delay || 0);
      setTimeout(() => { el.classList.add('visible'); }, delay);
      revealObserver.unobserve(el);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

revealElements.forEach(el => revealObserver.observe(el));


// ─── THEME TOGGLE ─────────────────────────────────────────────────────────────
const themeToggle = document.getElementById('themeToggle');
const html        = document.documentElement;

function getStoredTheme() { return localStorage.getItem('mnfr-theme') || 'dark'; }
function setTheme(t) {
  html.setAttribute('data-theme', t);
  localStorage.setItem('mnfr-theme', t);
  themeToggle.querySelector('.theme-icon').textContent = t === 'dark' ? '◐' : '◑';
}

setTheme(getStoredTheme());

themeToggle.addEventListener('click', () => {
  setTheme(html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
});


// ─── LANGUAGE TOGGLE ─────────────────────────────────────────────────────────
const langToggle = document.getElementById('langToggle');
let   currentLang = localStorage.getItem('mnfr-lang') || 'en';

function applyLang(lang) {
  html.setAttribute('data-lang', lang);
  localStorage.setItem('mnfr-lang', lang);
  currentLang = lang;

  document.querySelectorAll('[data-en]').forEach(el => {
    const text = el.getAttribute(`data-${lang}`);
    if (text) el.textContent = text;
  });

  langToggle.textContent = lang === 'en' ? 'EN / ID' : 'ID / EN';
  document.documentElement.lang = lang === 'en' ? 'en' : 'id';
}

applyLang(currentLang);

langToggle.addEventListener('click', () => {
  applyLang(currentLang === 'en' ? 'id' : 'en');
});


// ─── SMOOTH SCROLL ───────────────────────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = nav.offsetHeight + 20;
    window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
  });
});


// ─── HERO PARALLAX ───────────────────────────────────────────────────────────
const heroName = document.querySelector('.hero-name');
const heroTag  = document.querySelector('.hero-tagline');

window.addEventListener('scroll', () => {
  const y = window.scrollY;
  if (heroName) heroName.style.transform = `translateY(${y * 0.15}px)`;
  if (heroTag)  heroTag.style.transform  = `translateY(${y * 0.08}px)`;
}, { passive: true });


// ─── INTEREST ITEMS HOVER GLOW ───────────────────────────────────────────────
document.querySelectorAll('.interest-item').forEach(item => {
  item.addEventListener('mouseenter', () => {
    item.style.background = 'linear-gradient(90deg, rgba(110,210,255,0.04), transparent)';
  });
  item.addEventListener('mouseleave', () => {
    item.style.background = '';
  });
});


// ─── EMBLEM MOUSE INTERACTION ─────────────────────────────────────────────────
const emblem = document.querySelector('.framework-emblem');
if (emblem) {
  emblem.addEventListener('mousemove', (e) => {
    const rect = emblem.getBoundingClientRect();
    const cx   = rect.left + rect.width / 2;
    const cy   = rect.top  + rect.height / 2;
    const dx   = (e.clientX - cx) / rect.width  * 20;
    const dy   = (e.clientY - cy) / rect.height * 20;
    emblem.style.transform = `rotateX(${-dy}deg) rotateY(${dx}deg)`;
    emblem.style.transition = 'transform 0.1s';
  });
  emblem.addEventListener('mouseleave', () => {
    emblem.style.transform = '';
    emblem.style.transition = 'transform 0.6s cubic-bezier(0.16,1,0.3,1)';
  });
}


// ─── ACTIVE NAV HIGHLIGHT ─────────────────────────────────────────────────────
const sections   = document.querySelectorAll('.section, .hero');
const navLinks   = document.querySelectorAll('.nav-links a');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.id;
      navLinks.forEach(link => {
        const href = link.getAttribute('href');
        link.style.color = href === `#${id}` ? 'var(--accent)' : '';
      });
    }
  });
}, { threshold: 0.4 });

sections.forEach(s => sectionObserver.observe(s));


// ─── SUBTLE MAGNETIC NAV LINKS ────────────────────────────────────────────────
navLinks.forEach(link => {
  link.addEventListener('mousemove', (e) => {
    const rect  = link.getBoundingClientRect();
    const dx    = (e.clientX - (rect.left + rect.width  / 2)) * 0.25;
    const dy    = (e.clientY - (rect.top  + rect.height / 2)) * 0.25;
    link.style.transform = `translate(${dx}px, ${dy}px)`;
  });
  link.addEventListener('mouseleave', () => {
    link.style.transform = '';
    link.style.transition = 'transform 0.5s cubic-bezier(0.16,1,0.3,1)';
  });
});

console.log('%cMNFR — Equilibrium Beyond Dimensions', 'color:#6ed2ff;font-family:monospace;font-size:14px;letter-spacing:2px;');
console.log('%cBuilt with intention. Designed with philosophy.', 'color:#888;font-family:monospace;font-size:10px;');
