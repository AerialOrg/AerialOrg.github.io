/* ── Page switching ───────────────────────────── */
let currentPage = 'home';
let switching = false;
const navbar = document.getElementById('navbar');
const navToggle = document.querySelector('.nav-toggle');

function closeMobileMenu() {
  navbar.classList.remove('menu-open');
  if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
}

function toggleMobileMenu() {
  if (!navToggle) return;
  const isOpen = navbar.classList.toggle('menu-open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
}

function switchPage(pageId) {
  if (pageId === currentPage || switching) return;
  switching = true;
  closeMobileMenu();

  const from = document.querySelector(`.page[data-page="${currentPage}"]`);
  const to   = document.querySelector(`.page[data-page="${pageId}"]`);
  if (!to) { switching = false; return; }

  // Fade out current page
  from.classList.remove('active');

  setTimeout(() => {
    // Fade in new page
    to.classList.add('active');

    // Scroll right panel back to top
    const rp = to.querySelector('.page-right.padded');
    if (rp) rp.scrollTop = 0;

    // Update nav highlight
    document.querySelectorAll('[data-page]').forEach(el => {
      const isActive = el.dataset.page === pageId;
      el.classList.toggle('nav-active', isActive);
    });

    currentPage = pageId;
    switching = false;
  }, 450);
}

// Wire nav + ghost buttons
document.addEventListener('click', e => {
  const toggle = e.target.closest('.nav-toggle');
  if (toggle) {
    e.preventDefault();
    toggleMobileMenu();
    return;
  }

  const pg = e.target.closest('[data-page]');
  if (pg && pg.closest('#navbar')) {
    e.preventDefault();
    switchPage(pg.dataset.page);
    return;
  }
  const gt = e.target.closest('[data-goto]');
  if (gt) {
    e.preventDefault();
    switchPage(gt.dataset.goto);
  }

  if (navbar.classList.contains('menu-open') && !e.target.closest('#navbar')) {
    closeMobileMenu();
  }
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 900) closeMobileMenu();
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeMobileMenu();
});

// Set initial nav state
document.querySelectorAll('#navbar [data-page="home"]').forEach(el => el.classList.add('nav-active'));
