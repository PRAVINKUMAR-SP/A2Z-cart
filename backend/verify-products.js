async function verify() {
  const res = await fetch('http://localhost:8085/api/products');
  const data = await res.json();
  console.log('=== SUMMARY OF DATABASE PRODUCTS ===');
  console.log('Total Products in DB:', data.length);
  const byCat = {};
  data.forEach(p => {
    byCat[p.category] = (byCat[p.category] || 0) + 1;
  });
  console.log('Category Counts:');
  for (const [cat, count] of Object.entries(byCat)) {
    console.log(`  - ${cat}: ${count} items`);
  }

  const sample = data.find(p => p.category === 'electronics');
  console.log('\n=== SAMPLE PRODUCT (Electronics) ===');
  console.log({
    id: sample.id,
    name: sample.name,
    category: sample.category,
    priceRupees: sample.price / 100,
    flipkartPriceRupees: sample.originalPrice / 100,
    savingsRupees: (sample.originalPrice - sample.price) / 100,
    discountPercent: sample.discountPercent,
    tagline: sample.tagline,
    sellerName: sample.sellerName,
    image: sample.image
  });

  const sampleDress = data.find(p => p.category === 'dresses');
  console.log('\n=== SAMPLE PRODUCT (Dresses) ===');
  console.log({
    id: sampleDress.id,
    name: sampleDress.name,
    category: sampleDress.category,
    priceRupees: sampleDress.price / 100,
    flipkartPriceRupees: sampleDress.originalPrice / 100,
    savingsRupees: (sampleDress.originalPrice - sampleDress.price) / 100,
    discountPercent: sampleDress.discountPercent,
    tagline: sampleDress.tagline,
    sellerName: sampleDress.sellerName,
    image: sampleDress.image
  });
}

verify();
