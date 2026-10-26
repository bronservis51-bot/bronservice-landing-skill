'use strict';
document.documentElement.classList.add('js');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
  if (entry.isIntersecting) { entry.target.classList.add('visible'); revealObserver.unobserve(entry.target); }
}), { threshold: 0.08 });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
const tagline = document.querySelector('.word-reveal');
for (const node of [...tagline.childNodes]) {
  if (node.nodeType === Node.TEXT_NODE) {
    const fragment = document.createDocumentFragment();
    node.textContent.split(/(\s+)/).forEach(word => {
      if (!word.trim()) fragment.append(document.createTextNode(word));
      else { const span = document.createElement('span'); span.textContent = word; fragment.append(span); }
    }); node.replaceWith(fragment);
  }
}
const wordObserver = new IntersectionObserver(entries => entries.forEach(entry => {
  if (entry.isIntersecting) { entry.target.classList.add('lit'); wordObserver.unobserve(entry.target); }
}), { rootMargin: '0px 0px -18% 0px', threshold: 1 });
tagline.querySelectorAll('span').forEach((word, i) => { word.style.transitionDelay = `${Math.min(i * 60, 400)}ms`; wordObserver.observe(word); });
const menuToggle = document.querySelector('.menu-toggle'), mobileMenu = document.querySelector('.mobile-menu');
function closeMenu() { menuToggle.setAttribute('aria-expanded', 'false'); menuToggle.setAttribute('aria-label', 'Открыть меню'); mobileMenu.classList.remove('open'); mobileMenu.inert = true; document.body.classList.remove('lock'); }
menuToggle.addEventListener('click', () => {
  const opening = menuToggle.getAttribute('aria-expanded') !== 'true';
  if (!opening) return closeMenu();
  menuToggle.setAttribute('aria-expanded', 'true'); menuToggle.setAttribute('aria-label', 'Закрыть меню'); mobileMenu.inert = false; mobileMenu.classList.add('open'); document.body.classList.add('lock');
});
mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
// Keep keyboard focus within the full screen mobile menu while it is open.
document.addEventListener('keydown', e => {
  if (e.key !== 'Tab' || menuToggle.getAttribute('aria-expanded') !== 'true') return;
  const items = [menuToggle, ...mobileMenu.querySelectorAll('a,button')];
  const first = items[0], last = items[items.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
});
window.matchMedia('(min-width:761px)').addEventListener('change', e => { if (e.matches) closeMenu(); });
const products = [
  { src: 'assets/film-design.webp', alt: 'Телефон с дизайнерской защитной плёнкой', caption: 'Дизайн, который выбирает клиент' },
  { src: 'assets/film-plotter.webp', alt: 'Плоттер вырезает плёнку под модель телефона', caption: 'Точная форма из базы лекал' },
  { src: 'assets/film-apply.webp', alt: 'Мастер наносит защитную плёнку на телефон', caption: 'Аккуратная оклейка с гарантией' }
];
let productRequest = 0;
document.querySelectorAll('[data-product]').forEach(button => button.addEventListener('click', () => {
  const index = Number(button.dataset.product), item = products[index], request = ++productRequest;
  document.querySelectorAll('[data-product]').forEach(el => { const selected = el === button; el.classList.toggle('selected', selected); el.setAttribute('aria-pressed', String(selected)); });
  const image = document.getElementById('product-image');
  const loader = new Image();
  loader.onload = () => { if (request !== productRequest) return; image.src = item.src; image.alt = item.alt; document.getElementById('product-caption').textContent = item.caption; document.querySelector('.product-photo figcaption span:last-child').textContent = `0${index + 1} / 03`; };
  loader.onerror = () => { if (request !== productRequest) return; document.getElementById('product-caption').textContent = 'Фото не загрузилось. Попробуйте выбрать шаг ещё раз.'; };
  loader.src = item.src;
}));
const sections = [...document.querySelectorAll('section[id]')];
const navObserver = new IntersectionObserver(entries => entries.forEach(entry => {
  if (!entry.isIntersecting) return;
  document.querySelectorAll('.nav-shell nav a').forEach(link => { if (link.hash === `#${entry.target.id}`) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current'); });
}), { rootMargin: '-20% 0px -55% 0px', threshold: 0 });
sections.forEach(section => navObserver.observe(section));
const dialog = document.getElementById('contact-dialog'), form = document.getElementById('lead-form'), preview = document.getElementById('message-preview');
let opener;
document.querySelectorAll('[data-open]').forEach(button => button.addEventListener('click', () => {
  opener = button; closeMenu(); form.hidden = false; preview.hidden = true; dialog.showModal(); document.body.classList.add('lock');
}));
document.querySelector('.close-button').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', e => { if (e.target !== dialog) return; const rect = dialog.getBoundingClientRect(); if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) dialog.close(); });
dialog.addEventListener('close', () => { document.body.classList.remove('lock'); if (opener && opener.offsetParent !== null) opener.focus(); else menuToggle.focus(); });
form.addEventListener('submit', e => {
  e.preventDefault();
  const city = form.elements.city, name = form.elements.name, error = document.getElementById('form-error');
  city.removeAttribute('aria-invalid'); name.removeAttribute('aria-invalid');
  let invalid, message;
  if (city.value.trim().length < 2) { invalid = city; message = 'Напишите город: не менее двух символов.'; }
  else if (name.value.trim().length < 2) { invalid = name; message = 'Напишите имя: не менее двух символов.'; }
  if (invalid) { error.textContent = message; invalid.setAttribute('aria-invalid', 'true'); invalid.setAttribute('aria-describedby', 'form-error'); invalid.focus(); return; }
  error.textContent = '';
  const text = `Здравствуйте! Интересует франшиза «Бронь Сервис».\n\nИмя: ${name.value.trim()}\nГород: ${city.value.trim()}\nСрок открытия: ${form.elements.timing.value}\n\nХочу обсудить условия и расчёт для моего города.`;
  document.getElementById('message-text').textContent = text;
  document.getElementById('whatsapp-link').href = `https://wa.me/79956666614?text=${encodeURIComponent(text)}`;
  form.hidden = true; preview.hidden = false; dialog.scrollTop = 0; document.getElementById('whatsapp-link').focus();
});
form.addEventListener('input', e => { e.target.removeAttribute('aria-invalid'); document.getElementById('form-error').textContent = ''; });
document.querySelector('.back-button').addEventListener('click', () => { preview.hidden = true; form.hidden = false; form.elements.city.focus(); });

// A local visual interaction. It never sends data or attempts to reproduce a physical material test.
const filmRange = document.getElementById('film-range');
const filmOutput = document.getElementById('film-output');
const phoneArt = document.getElementById('phone-art');
const materialStage = document.getElementById('material-stage');
function showFilm(value) {
  const progress = Number(value) / 100;
  phoneArt.style.setProperty('--peel-opacity', String(1 - progress));
  phoneArt.style.setProperty('--flat-opacity', String(progress));
  filmOutput.textContent = `${value}%`;
  filmRange.setAttribute('aria-valuetext', Number(value) === 100 ? 'Плёнка нанесена' : `Нанесение плёнки: ${value}%`);
}
if (filmRange && phoneArt) {
  filmRange.addEventListener('input', () => showFilm(filmRange.value));
  showFilm(filmRange.value);
  if (!reducedMotion && window.matchMedia('(hover:hover) and (pointer:fine)').matches) {
    let frame = 0;
    materialStage.addEventListener('pointermove', event => {
      if (frame) cancelAnimationFrame(frame);
      const rect = materialStage.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width - .5) * 16;
      const y = ((event.clientY - rect.top) / rect.height - .5) * 12;
      frame = requestAnimationFrame(() => { phoneArt.style.transform = `translate3d(${x}px,${y}px,0) rotate(${-7 + x / 4}deg)`; });
    });
    materialStage.addEventListener('pointerleave', () => {
      if (frame) cancelAnimationFrame(frame);
      phoneArt.style.transform = '';
    });
  }
}
