import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

const isDesktop = window.matchMedia('(min-width: 900px)');

function toggleMenu(nav, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  if (button) button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
}

/**
 * loads and decorates the bindo header
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // Try loading brand/contact from nav fragment (CMS-authored)
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);
  const sections = fragment ? [...fragment.children] : [];

  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';

  // --- Top bar (logo | search | cart | contact) ---
  const topBar = document.createElement('div');
  topBar.className = 'nav-top';

  // Logo from fragment brand section
  const brandSection = sections[0];
  const brandLink = brandSection?.querySelector('a');
  const brandWrap = document.createElement('div');
  brandWrap.className = 'nav-brand';
  const logoImg = document.createElement('img');
  logoImg.src = '/icons/bindo-logo.svg';
  logoImg.alt = 'Bindo';
  logoImg.width = 113;
  logoImg.height = 58;
  logoImg.loading = 'eager';
  if (brandLink) {
    brandLink.textContent = '';
    brandLink.className = '';
    const container = brandLink.closest('.button-container');
    if (container) container.className = '';
    brandLink.append(logoImg);
    brandWrap.append(brandLink);
  } else {
    const a = document.createElement('a');
    a.href = '/';
    a.append(logoImg);
    brandWrap.append(a);
  }
  topBar.append(brandWrap);

  // Search
  const searchWrap = document.createElement('div');
  searchWrap.className = 'nav-search';
  searchWrap.innerHTML = `<form action="/tim-kiem/" role="search">
    <input type="text" placeholder="Bạn cần tìm gì.." name="key" aria-label="Tìm kiếm">
    <button type="submit" aria-label="Tìm kiếm">🔎</button>
  </form>`;
  topBar.append(searchWrap);

  // Cart
  const cartWrap = document.createElement('div');
  cartWrap.className = 'nav-cart';
  cartWrap.innerHTML = `<a href="/shopping-bag" rel="nofollow" aria-label="Giỏ hàng">
    <span class="nav-cart-icon">
      <span class="nav-cart-count" aria-live="polite">0</span>
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
      </svg>
    </span>
    <span>Giỏ hàng</span>
  </a>`;
  topBar.append(cartWrap);

  // Contact info from fragment
  const toolsSection = sections[2];
  const contactWrap = document.createElement('div');
  contactWrap.className = 'nav-contact';
  if (toolsSection) {
    const phoneLink = toolsSection.querySelector('a[href^="tel:"]');
    const paragraphs = toolsSection.querySelectorAll('p');
    const addressText = paragraphs.length > 1 ? paragraphs[paragraphs.length - 1] : null;

    if (phoneLink) {
      const phoneDiv = document.createElement('div');
      phoneDiv.className = 'nav-phone';
      phoneDiv.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.59 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
      </svg>`;
      const phoneInfo = document.createElement('div');
      const label = document.createElement('strong');
      label.textContent = 'Hỗ trợ mua hàng';
      phoneLink.className = 'nav-phone-link';
      phoneLink.rel = 'nofollow';
      phoneInfo.append(label, phoneLink);
      phoneDiv.append(phoneInfo);
      contactWrap.append(phoneDiv);
    }

    if (addressText) {
      const addressDiv = document.createElement('div');
      addressDiv.className = 'nav-address';
      addressText.textContent.split('|').forEach((part) => {
        const span = document.createElement('span');
        span.textContent = part.trim();
        addressDiv.append(span);
      });
      contactWrap.append(addressDiv);
    }
  }
  topBar.append(contactWrap);

  nav.append(topBar);

  // Hamburger (mobile)
  const hamburger = document.createElement('div');
  hamburger.className = 'nav-hamburger';
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
    <span class="nav-hamburger-icon"></span>
  </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav));
  nav.append(hamburger);

  // --- Nav sections bar from fragment ---
  const navBar = document.createElement('div');
  navBar.className = 'nav-sections';
  const navSection = sections[1];
  if (navSection) {
    const ul = navSection.querySelector('ul');
    if (ul) {
      // Add badges for items with data-new attribute
      ul.querySelectorAll('li[data-new]').forEach((li) => {
        const span = document.createElement('span');
        span.className = 'nav-badge';
        span.textContent = 'NEW';
        li.append(span);
      });
      navBar.append(ul);
    }
  }
  nav.append(navBar);

  nav.setAttribute('aria-expanded', 'false');
  toggleMenu(nav, isDesktop.matches);
  isDesktop.addEventListener('change', () => toggleMenu(nav, isDesktop.matches));
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Escape' && nav.getAttribute('aria-expanded') === 'true') {
      toggleMenu(nav, false);
      nav.querySelector('button')?.focus();
    }
  });

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}
