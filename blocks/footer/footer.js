import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

function buildNewsletterForm() {
  const form = document.createElement('form');
  form.className = 'footer-newsletter-form';
  form.addEventListener('submit', (e) => e.preventDefault());

  const input = document.createElement('input');
  input.type = 'email';
  input.placeholder = 'Nhập địa chỉ email';
  input.setAttribute('aria-label', 'Email đăng ký bản tin');

  const btn = document.createElement('button');
  btn.type = 'submit';
  btn.textContent = 'GỬI';

  form.append(input, btn);
  return form;
}

function buildColumns(contentWrapper) {
  const columns = document.createElement('div');
  columns.className = 'footer-columns';

  // Each top-level <li> is a column: <p><strong>heading</strong></p> + nested <ul>
  const items = contentWrapper.querySelectorAll(':scope > ul > li');
  items.forEach((li) => {
    const col = document.createElement('div');
    col.className = 'footer-col';
    while (li.firstChild) col.append(li.firstChild);
    columns.append(col);
  });

  // Add newsletter form to the last column
  const lastCol = columns.lastElementChild;
  if (lastCol) lastCol.append(buildNewsletterForm());

  return columns;
}

/**
 * loads and decorates the footer
 *
 * Footer authored content structure (two sections separated by ---):
 *   Section 1: a <ul> where each <li> is a column:
 *     - <p><strong>heading</strong></p> — column title
 *     - <ul> — column links (optional)
 *     - additional <p> — extra content (e.g. newsletter intro)
 *   Section 2: company info paragraphs (bottom bar)
 *
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);

  block.textContent = '';
  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  const sections = [...footer.querySelectorAll('.section')];

  // Section 1: transform H3-grouped content into columns
  if (sections[0]) {
    sections[0].classList.add('footer-links-section');
    const wrapper = sections[0].querySelector('.default-content-wrapper');
    if (wrapper) wrapper.replaceWith(buildColumns(wrapper));
  }

  // Section 2: bottom bar — add back-to-top button
  if (sections[1]) {
    sections[1].classList.add('footer-bottom-section');

    const backToTop = document.createElement('button');
    backToTop.className = 'footer-back-to-top';
    backToTop.setAttribute('aria-label', 'Về đầu trang');
    backToTop.textContent = '↑ Đầu trang';
    backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    sections[1].append(backToTop);
  }

  block.append(footer);
}
