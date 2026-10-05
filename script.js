/* ── Elements ─────────────────────────────────── */
const navbar = document.getElementById('navbar');
const navToggle = document.querySelector('.nav-toggle');
const site = document.querySelector('.site');
const sections = Array.from(document.querySelectorAll('.page'));
const navLinks = Array.from(document.querySelectorAll('#navbar [data-page]'));

/* ── Mobile menu ──────────────────────────────── */
function closeMobileMenu() {
  navbar.classList.remove('menu-open');
  if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
}
function toggleMobileMenu() {
  if (!navToggle) return;
  const isOpen = navbar.classList.toggle('menu-open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
}

/* ── Smooth jump to a section ──────────────────── */
function goToSection(pageId) {
  const target = document.querySelector(`.page[data-page="${pageId}"]`);
  if (!target) return;
  closeMobileMenu();
  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ── Nav highlight ────────────────────────────── */
function setActiveNav(pageId) {
  navLinks.forEach(el => el.classList.toggle('nav-active', el.dataset.page === pageId));
  document.body.classList.toggle('at-home', pageId === 'home');
}

/* ── Click wiring ─────────────────────────────── */
document.addEventListener('click', e => {
  const toggle = e.target.closest('.nav-toggle');
  if (toggle) { e.preventDefault(); toggleMobileMenu(); return; }

  const pg = e.target.closest('[data-page]');
  if (pg && pg.closest('#navbar')) { e.preventDefault(); goToSection(pg.dataset.page); return; }

  const gt = e.target.closest('[data-goto]');
  if (gt) { e.preventDefault(); goToSection(gt.dataset.goto); return; }

  if (navbar.classList.contains('menu-open') && !e.target.closest('#navbar')) closeMobileMenu();
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 900) closeMobileMenu();
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeMobileMenu();
});

/* ── Scroll-spy: track section in view ────────── */
const ratios = new Map();
let currentActive = null;

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    ratios.set(entry.target, entry.isIntersecting ? entry.intersectionRatio : 0);
    // Animate a section in once, then leave it — no replay on re-entry
    if (entry.intersectionRatio > 0.15) entry.target.classList.add('in-view');
  });

  // Exactly one active section: the most-visible one
  let best = null, bestRatio = 0;
  ratios.forEach((r, el) => { if (r > bestRatio) { bestRatio = r; best = el; } });

  if (best && best !== currentActive && bestRatio > 0.25) {
    currentActive = best;
    setActiveNav(best.dataset.page);
  }
}, { threshold: [0, 0.05, 0.25, 0.4, 0.6, 0.9] });

sections.forEach(s => observer.observe(s));

/* ── Timeline: reveal + distribute nodes by scroll ── */
const tlSection = document.querySelector('.page[data-page="timeline"]');
const tlItems = Array.from(document.querySelectorAll('.tl-item'));
const tlProgress = document.querySelector('.tl-progress');
// top positions (% of track) per number of revealed nodes
const TL_LAYOUT = {
  1: [50],
  2: [33.333, 66.667],
  3: [25, 50, 75]
};
let tlTicking = false;

function updateTimeline() {
  tlTicking = false;
  if (!tlSection || tlItems.length === 0) return;

  const vh = window.innerHeight;
  const rect = tlSection.getBoundingClientRect();
  // progress 0 → 1 as the section rises through the lower half of the viewport
  const p = (vh * 0.65 - rect.top) / (vh * 0.55);
  const clamped = Math.max(0, Math.min(1, p));

  // stage: how many nodes are revealed (1, 2, or 3)
  let stage;
  if (clamped < 0.34) stage = 1;
  else if (clamped < 0.67) stage = 2;
  else stage = 3;

  const layout = TL_LAYOUT[stage];
  tlItems.forEach((item, i) => {
    if (i < stage) {
      item.style.top = layout[i] + '%';
      item.classList.add('revealed');
    } else {
      item.classList.remove('revealed');
      item.style.top = '100%';
    }
  });

  if (tlProgress) {
    const last = layout[layout.length - 1];
    tlProgress.style.height = last + '%';
  }
}

function requestTimeline() {
  if (!tlTicking) { tlTicking = true; requestAnimationFrame(updateTimeline); }
}
window.addEventListener('scroll', requestTimeline, { passive: true });
window.addEventListener('resize', requestTimeline);

/* ── Initial state ────────────────────────────── */
setActiveNav('home');
document.querySelector('.page[data-page="home"]')?.classList.add('in-view');
updateTimeline();

/* ── Contact form → mailto ────────────────────── */
const form = document.getElementById('contactForm');
if (form) {
  const status = document.createElement('p');
  status.className = 'form-status';
  form.appendChild(status);

  form.addEventListener('submit', e => {
    e.preventDefault();
    const data = new FormData(form);
    const first = (data.get('first') || '').toString().trim();
    const last = (data.get('last') || '').toString().trim();
    const email = (data.get('email') || '').toString().trim();
    const subject = (data.get('subject') || '').toString().trim();
    const message = (data.get('message') || '').toString().trim();

    if (!first || !last || !email || !subject || !message) {
      status.textContent = 'Please fill in every field before submitting.';
      return;
    }

    const body =
      `Name: ${first} ${last}\n` +
      `Email: ${email}\n\n` +
      `${message}`;
    const href = `mailto:tbd@umd.edu?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = href;
    status.textContent = 'Opening your email app…';
  });
}
