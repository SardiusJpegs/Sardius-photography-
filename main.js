/* Sardius Photography: small helpers, no libraries needed. */
(() => {
  // Mobile menu
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.nav-toggle');
  if (header && toggle) {
    const setOpen = (open) => {
      header.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.textContent = open ? 'Close' : 'Menu';
    };
    toggle.addEventListener('click', () => setOpen(!header.classList.contains('is-open')));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && header.classList.contains('is-open')) {
        setOpen(false);
        toggle.focus();
      }
    });
  }

  // Photos: match each frame to the photo's real shape, or show the
  // dark placeholder when the image file has not been added yet.
  document.querySelectorAll('.frame img').forEach((img) => {
    const fit = () => img.parentElement.style.setProperty('--ar', `${img.naturalWidth} / ${img.naturalHeight}`);
    const missing = () => img.classList.add('is-missing');
    if (img.complete) {
      if (img.naturalWidth) fit(); else missing();
    } else {
      img.addEventListener('load', fit);
      img.addEventListener('error', missing);
    }
  });

  // Portfolio lightbox
  const box = document.getElementById('lightbox');
  if (box && typeof box.showModal === 'function') {
    const big = box.querySelector('img');
    const caption = box.querySelector('.lightbox-caption');
    document.querySelectorAll('.gallery .frame').forEach((frame) => {
      const img = frame.querySelector('img');
      if (!img) return;
      const label = frame.querySelector('figcaption')?.textContent ?? img.alt;
      const open = document.createElement('button');
      open.type = 'button';
      open.className = 'frame-open';
      open.setAttribute('aria-label', `View larger: ${label}`);
      open.addEventListener('click', () => {
        if (img.classList.contains('is-missing')) return;
        big.src = img.currentSrc || img.src;
        big.alt = img.alt;
        caption.textContent = label;
        box.showModal();
      });
      frame.appendChild(open);
    });
    box.addEventListener('click', (e) => {
      if (e.target === box || e.target.closest('.lightbox-close')) box.close();
    });
  }

  // Booking page: preselect service or package from the link that brought you here
  const params = new URLSearchParams(window.location.search);
  ['service', 'package'].forEach((name) => {
    const select = document.querySelector(`select[name="${name}"]`);
    const value = params.get(name);
    if (select && value && [...select.options].some((o) => o.value === value)) {
      select.value = value;
    }
  });

  // Home hero: the red glow follows the pointer, like a safelight in a darkroom
  const hero = document.querySelector('.hero');
  if (hero && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    hero.addEventListener('pointermove', (e) => {
      const r = hero.getBoundingClientRect();
      hero.style.setProperty('--mx', `${e.clientX - r.left}px`);
      hero.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  }

  // Booking form: send the details straight to WhatsApp
  const form = document.getElementById('booking-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!form.reportValidity()) return;
      const d = new FormData(form);
      const text = (n) => (form.elements[n]?.selectedOptions?.[0]?.textContent || d.get(n) || '').toString().trim();
      const lines = [
        'Hello Sardius Photography, I would like to book a session.',
        '',
        `Name: ${text('name')}`,
        `Email: ${text('email')}`,
        text('phone') && `Phone: ${text('phone')}`,
        `Service: ${text('service')}`,
        text('package') && `Package: ${text('package')}`,
        text('date') && `Preferred date: ${text('date')}`,
        text('location') && `Location: ${text('location')}`,
        '',
        `Details: ${text('message')}`,
      ].filter((l) => l !== false && l !== '' || l === '');
      window.open(`https://wa.me/${form.dataset.wa}?text=${encodeURIComponent(lines.join('\n'))}`, '_blank', 'noopener');
    });
  }
})();
