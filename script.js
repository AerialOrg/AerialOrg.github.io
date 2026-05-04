/* ── Page switching ───────────────────────────── */
let currentPage = 'home';
let switching = false;

function switchPage(pageId) {
  if (pageId === currentPage || switching) return;
  switching = true;

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
});

// Set initial nav state
document.querySelectorAll('#navbar [data-page="home"]').forEach(el => el.classList.add('nav-active'));
