import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Formats a price string, ensuring the currency symbol is included.
 * @param {string} text
 * @returns {string}
 */
function formatPrice(text) {
  return text ? text.trim() : '';
}

/**
 * loads and decorates the product-grid block
 *
 * Authored content structure:
 *   Row 1 (optional, 1 cell): Block title — rendered as a teal header bar
 *   Middle rows (one per product):
 *     Col 1: Image (picture)
 *     Col 2: Product name (link or plain text)
 *     Col 3: Original price (e.g. 210,000đ)
 *     Col 4: Sale price (e.g. 160,000đ)
 *     Col 5: SKU (e.g. BDA-12699)
 *     Col 6: Badge label (e.g. Bán chạy) — optional
 *     Col 7: Discount text (e.g. -23%) — optional
 *   "Xem nhiều mẫu hơn" button is rendered statically at the bottom
 *
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const rows = [...block.children];
  const fragment = document.createDocumentFragment();

  // Detect optional header row: a single-cell row at the top
  let productRows = rows;
  const firstRow = rows[0];
  if (firstRow && firstRow.children.length === 1 && !firstRow.querySelector('a')) {
    const header = document.createElement('div');
    header.className = 'product-grid-header';
    header.textContent = firstRow.firstElementChild.textContent.trim();
    fragment.append(header);
    productRows = rows.slice(1);
  }

  const ul = document.createElement('ul');
  fragment.append(ul);

  productRows.forEach((row) => {
    const cells = [...row.children];
    if (cells.length < 2) return; // skip malformed rows

    const [imageCell, nameCell, originalPriceCell, salePriceCell, skuCell, badgeCell, discountCell] = cells;

    const li = document.createElement('li');
    li.className = 'product-card';

    // --- Image wrapper ---
    const imageWrapper = document.createElement('div');
    imageWrapper.className = 'product-card-image';

    const picture = imageCell.querySelector('picture');
    if (picture) {
      const img = picture.querySelector('img');
      if (img) {
        picture.replaceWith(
          createOptimizedPicture(img.src, img.alt || '', false, [{ width: '400' }]),
        );
      }
      imageWrapper.append(imageCell.querySelector('picture') || imageCell.firstElementChild || imageCell);
    }

    // Badge label (e.g. "Bán chạy")
    const badgeText = badgeCell ? badgeCell.textContent.trim() : '';
    if (badgeText) {
      const badge = document.createElement('span');
      badge.className = 'product-badge-label';
      badge.textContent = badgeText;
      imageWrapper.prepend(badge);
    }

    // Discount badge (e.g. "-23%")
    const discountText = discountCell ? discountCell.textContent.trim() : '';
    if (discountText) {
      const discount = document.createElement('span');
      discount.className = 'product-badge-discount';
      discount.textContent = discountText;
      imageWrapper.append(discount);
    }

    li.append(imageWrapper);

    // --- Card body ---
    const body = document.createElement('div');
    body.className = 'product-card-body';

    // Product name (may be a link)
    const nameLink = nameCell.querySelector('a');
    const nameEl = document.createElement('p');
    nameEl.className = 'product-name';
    if (nameLink) {
      nameEl.append(nameLink.cloneNode(true));
    } else {
      nameEl.textContent = nameCell.textContent.trim();
    }
    body.append(nameEl);

    // Pricing row
    const pricing = document.createElement('div');
    pricing.className = 'product-pricing';

    const originalPrice = formatPrice(originalPriceCell.textContent);
    if (originalPrice) {
      const orig = document.createElement('span');
      orig.className = 'product-price-original';
      orig.textContent = originalPrice;
      pricing.append(orig);
    }

    const salePrice = formatPrice(salePriceCell.textContent);
    if (salePrice) {
      const sale = document.createElement('span');
      sale.className = 'product-price-sale';
      sale.textContent = salePrice;
      pricing.append(sale);
    }

    const sku = skuCell ? skuCell.textContent.trim() : '';
    if (sku) {
      const skuEl = document.createElement('span');
      skuEl.className = 'product-sku';
      skuEl.textContent = `(${sku})`;
      pricing.append(skuEl);
    }

    body.append(pricing);

    // Buy button — reuse the product link if available, otherwise '#'
    const buyHref = nameLink ? nameLink.href : '#';
    const buyBtn = document.createElement('a');
    buyBtn.className = 'product-buy-btn';
    buyBtn.href = buyHref;
    buyBtn.textContent = 'Mua ngay';
    body.append(buyBtn);

    li.append(body);
    ul.append(li);
  });

  const loadMoreEl = document.createElement('a');
  loadMoreEl.className = 'product-grid-load-more';
  loadMoreEl.href = '/';
  loadMoreEl.textContent = 'Xem nhiều mẫu hơn';
  fragment.append(loadMoreEl);

  block.replaceChildren(fragment);
}
