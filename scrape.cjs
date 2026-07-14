const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  console.log("Navigating to the main URL...");
  await page.goto('https://www.lojaeucatex.com.br/produtos/pisos', { waitUntil: 'networkidle2' });

  // Wait a bit for dynamic content to load
  console.log("Waiting for products to load...");
  await new Promise(r => setTimeout(r, 5000));

  console.log("Extracting products...");
  let products = await page.evaluate(() => {
    const items = [];
    
    // VTEX uses specific classes for product summaries.
    const productCards = document.querySelectorAll('.vtex-product-summary-2-x-container');
    
    if (productCards.length > 0) {
      productCards.forEach(card => {
        const nameEl = card.querySelector('.vtex-product-summary-2-x-nameContainer, .vtex-product-summary-2-x-productNameContainer');
        const imgEl = card.querySelector('img');
        const linkEl = card.closest('a') || card.querySelector('a');
        
        if (nameEl && imgEl) {
          items.push({
            name: nameEl.innerText.trim(),
            image: imgEl.src,
            link: linkEl ? linkEl.href : ''
          });
        }
      });
    }
    
    // Fallback if the specific VTEX classes aren't present
    if (items.length === 0) {
      const allLinks = Array.from(document.querySelectorAll('a'));
      allLinks.forEach(a => {
        const img = a.querySelector('img');
        const text = a.innerText.trim();
        if (img && text && text.length > 10 && items.length < 20) {
          items.push({
            name: text.split('\n')[0].trim(),
            image: img.src,
            link: a.href
          });
        }
      });
    }

    // Deduplicate by name
    const uniqueItems = [];
    const names = new Set();
    for (const item of items) {
      if (!names.has(item.name) && item.link) {
        names.add(item.name);
        uniqueItems.push(item);
      }
    }

    return uniqueItems.slice(0, 12); // Limit to 12 products
  });

  console.log(`Found ${products.length} products. Now fetching descriptions for each...`);

  // Visit each product page to get the description
  for (let i = 0; i < products.length; i++) {
    if (products[i].link) {
      console.log(`[${i+1}/${products.length}] Fetching description for: ${products[i].name}`);
      try {
        const productPage = await browser.newPage();
        await productPage.goto(products[i].link, { waitUntil: 'networkidle2', timeout: 30000 });
        await new Promise(r => setTimeout(r, 2000)); // wait for components to render
        
        // Try to click "DESCRIÇÃO DO PRODUTO" or extract it
        const description = await productPage.evaluate(() => {
          // Sometimes the description is inside a specific VTEX product description component
          const descEl = document.querySelector('.vtex-store-components-3-x-productDescriptionText');
          if (descEl) return descEl.innerText.trim();
          
          // Alternatively, look for the word "DESCRIÇÃO DO PRODUTO"
          // We can just grab the text of the main product description area
          const textBlocks = Array.from(document.querySelectorAll('p, div.vtex-store-components-3-x-content'));
          for (const block of textBlocks) {
            const text = block.innerText.trim();
            if (text.length > 50 && !text.includes('R$') && !text.includes('CEP')) {
               return text; // return first substantial paragraph
            }
          }
          return "Piso de alta resistência, acabamento impecável e conforto térmico para seu ambiente.";
        });
        
        products[i].description = description || "Piso de alta resistência, acabamento impecável e conforto térmico para seu ambiente.";
        await productPage.close();
      } catch (e) {
        console.error(`Error fetching description for ${products[i].name}`, e.message);
        products[i].description = "Piso de alta resistência, acabamento impecável e conforto térmico para seu ambiente.";
      }
    }
  }

  if (!fs.existsSync('./src')){
    fs.mkdirSync('./src', { recursive: true });
  }
  
  fs.writeFileSync('./src/products.json', JSON.stringify(products, null, 2));
  console.log(`Saved ${products.length} unique products with descriptions to ./src/products.json.`);

  await browser.close();
})();
