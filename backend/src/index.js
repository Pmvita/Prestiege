const express = require('express');
const cors = require('cors');
const { getStore } = require('./store');
const { toCard } = require('./normalize');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: 'Prestiege API running', version: '1.0.0' });
});

app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'prestiege-api' });
});

app.get('/api/categories', (req, res) => {
  const { categories } = getStore();
  res.json({ categories });
});

const LISTING_SORTS = {
  price_desc: (a, b) => (b.price || 0) - (a.price || 0),
  price_asc: (a, b) => (a.price || 0) - (b.price || 0),
  title: (a, b) => (a.title || '').localeCompare(b.title || '', undefined, { sensitivity: 'base' }),
  brand: (a, b) => {
    const brandA = (a.brand || '').trim();
    const brandB = (b.brand || '').trim();
    if (!brandA && brandB) return 1;
    if (brandA && !brandB) return -1;
    return brandA.localeCompare(brandB, undefined, { sensitivity: 'base' });
  },
};

function matchesListingSearch(listing, query) {
  const model = listing.model || listing.raw?.model || '';
  const haystack = `${listing.title || ''} ${listing.brand || ''} ${model}`.toLowerCase();
  return haystack.includes(query);
}

app.get('/api/listings', (req, res) => {
  const { listings } = getStore();
  const category = (req.query.category || '').toString().toLowerCase();
  const sortKey = (req.query.sort || 'price_desc').toString().toLowerCase();
  const q = (req.query.q || '').toString().trim().toLowerCase();
  const limit = Math.min(parseInt(req.query.limit, 10) || 100, 1000);
  const offset = parseInt(req.query.offset, 10) || 0;

  let filtered = listings;
  if (category) {
    filtered = listings.filter((l) => l.category === category);
  }
  if (q) {
    filtered = filtered.filter((listing) => matchesListingSearch(listing, q));
  }

  const compare = LISTING_SORTS[sortKey] || LISTING_SORTS.price_desc;
  filtered = [...filtered].sort(compare);

  const page = filtered.slice(offset, offset + limit).map(toCard);
  res.json({
    listings: page,
    total: filtered.length,
    offset,
    limit,
    sort: LISTING_SORTS[sortKey] ? sortKey : 'price_desc',
  });
});

app.get('/api/listings/:id', (req, res) => {
  const { listingsById } = getStore();
  const listing = listingsById.get(req.params.id);
  if (!listing) {
    return res.status(404).json({ error: 'Listing not found' });
  }
  res.json({ listing });
});

app.get('/api/collections', (req, res) => {
  const { collections } = getStore();
  const category = (req.query.category || '').toString().toLowerCase();
  let filtered = collections;
  if (category) {
    filtered = collections.filter((c) => c.category === category);
  }
  const summary = filtered.map((c) => ({
    id: c.id,
    name: c.name,
    category: c.category,
    categoryName: c.categoryName || c.category,
    summary: c.summary,
    image: c.image,
    listingCount: c.listingCount,
    estimatedValue: c.estimatedValue,
    curator: c.curator,
  }));
  res.json({ collections: summary, total: summary.length });
});

app.get('/api/collections/:id', (req, res) => {
  const { collectionsById } = getStore();
  const collection = collectionsById.get(req.params.id);
  if (!collection) {
    return res.status(404).json({ error: 'Collection not found' });
  }
  res.json({ collection });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  const store = getStore();
  console.log(`Prestiege API running on port ${PORT}`);
  console.log(
    `Loaded ${store.listings.length} listings across ${store.categories.length} categories, ${store.collections.length} collections`
  );
});
