import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage();

await page.goto('https://www.bindo.vn/', { waitUntil: 'networkidle' });

const data = await page.evaluate(() => {
  const results = [];

  document.querySelectorAll('.product-grid, [class*="product"]').forEach((grid) => {
    const section = { title: '', products: [] };

    // Try to find section title
    const titleEl = grid.querySelector('h1, h2, h3, h4, .title, .category-name');
    if (titleEl) section.title = titleEl.innerText.trim();

    // Find product items
    grid.querySelectorAll('.product-item, .item, [class*="product-card"], [class*="item"]').forEach((item) => {
      const name = item.querySelector('[class*="name"], [class*="title"], h3, h4')?.innerText?.trim();
      const originalPrice = item.querySelector('[class*="original"], [class*="old-price"], s, del')?.innerText?.trim();
      const salePrice = item.querySelector('[class*="price"]:not([class*="original"]):not([class*="old"])')?.innerText?.trim();
      const sku = item.querySelector('[class*="sku"], [class*="code"]')?.innerText?.trim();
      const img = item.querySelector('img');
      const link = item.querySelector('a');

      if (name) {
        section.products.push({
          name,
          originalPrice: originalPrice || null,
          salePrice: salePrice || null,
          sku: sku || null,
          image: img?.src || img?.dataset?.src || null,
          imageAlt: img?.alt || null,
          url: link?.href || null,
        });
      }
    });

    if (section.products.length > 0) results.push(section);
  });

  return results;
});

await browser.close();

if (data.length === 0) {
  // Fallback: dump full HTML for manual inspection
  const browser2 = await chromium.launch();
  const page2 = await browser2.newPage();
  await page2.goto('https://www.bindo.vn/', { waitUntil: 'networkidle' });
  const html = await page2.content();
  await browser2.close();
  process.stdout.write(JSON.stringify({ html }, null, 2));
} else {
  process.stdout.write(JSON.stringify(data, null, 2));
}
