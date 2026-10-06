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

/* ── Timeline: reveal each node on scroll ─────── */
const tlItems = Array.from(document.querySelectorAll('.tl-item'));
const tlObserver = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in-view'); });
}, { threshold: 0.25 });
tlItems.forEach(it => tlObserver.observe(it));

/* ── Timeline: "The Future" expand/collapse ───── */
const tlFuture = document.getElementById('tlFuture');
const tlFutureBtn = tlFuture?.querySelector('.tl-future-toggle');
if (tlFutureBtn) {
  const hint = tlFutureBtn.querySelector('.tl-future-hint');
  tlFutureBtn.addEventListener('click', () => {
    const open = tlFuture.classList.toggle('expanded');
    tlFutureBtn.setAttribute('aria-expanded', String(open));
    if (hint) hint.textContent = open ? 'Click to collapse ↑' : 'Click to expand →';
  });
}

/* ── Initial state ────────────────────────────── */
setActiveNav('home');
document.querySelector('.page[data-page="home"]')?.classList.add('in-view');

/* ── Contact form → Web3Forms (AJAX) ──────────── */
const form = document.getElementById('contactForm');
if (form) {
  const status = document.createElement('p');
  status.className = 'form-status';
  form.appendChild(status);
  const submitBtn = form.querySelector('.form-submit');

  form.addEventListener('submit', async e => {
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

    // Web3Forms wants a single "name" field
    data.set('name', `${first} ${last}`);

    status.textContent = 'Sending…';
    if (submitBtn) submitBtn.disabled = true;

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: data
      });
      const out = await res.json();
      if (res.ok && out.success) {
        status.textContent = 'Thanks! Your message has been sent.';
        form.reset();
      } else {
        status.textContent = out.message || 'Something went wrong. Please try again.';
      }
    } catch (err) {
      status.textContent = 'Network error. Please try again later.';
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });
}
