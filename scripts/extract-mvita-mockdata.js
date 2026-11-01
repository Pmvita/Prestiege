/**
 * One-shot: flatten imported-from-mvita/collections into Prestiege category JSON
 * and write collections/mvita-collections.json (listingIds shape).
 */
const fs = require('fs');
const path = require('path');

const SHARED = path.join(__dirname, '..', 'shared', 'mockData');
const DB = path.join(__dirname, '..', 'db', 'mockData');

const CATEGORY_MAP = {
  watches: 'watches',
  jewelry: 'jewelry',
  art: 'art',
  Attire: 'fashion',
  technology: 'collectibles',
  furniture: 'collectibles',
  Consumables: 'spirits',
  commercial: 'collectibles',
};

function adaptItem(item) {
  let value = item.value;
  if (typeof value === 'number') {
    value = { amount: value, currency: item.currency || 'USD' };
  } else if (value && typeof value === 'object') {
    value = {
      amount: typeof value.amount === 'number' ? value.amount : null,
      currency: value.currency || 'USD',
    };
  } else {
    value = { amount: null, currency: 'USD' };
  }

  let location = item.location;
  if (typeof location === 'string' && location.trim()) {
    location = { city: location.trim(), country: '' };
  } else if (!location || typeof location !== 'object') {
    location = null;
  }

  const images = Array.isArray(item.images)
    ? item.images.filter((u) => typeof u === 'string' && u.startsWith('http'))
    : [];

  return {
    ...item,
    value,
    location,
    images,
    status: item.status || 'available',
  };
}

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function writeJson(p, data) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

const mvita = readJson(
  path.join(SHARED, 'imported-from-mvita', 'collections', 'collections.json')
);
const bySlug = {};
const adaptedCollections = [];

for (const col of mvita.collections || []) {
  const slug = CATEGORY_MAP[col.category];
  if (!slug) {
    console.warn('Unmapped category', col.category, col.id);
    continue;
  }
  if (!bySlug[slug]) bySlug[slug] = new Map();

  const listingIds = [];
  for (const raw of col.items || []) {
    if (!raw || typeof raw !== 'object' || !raw.id) continue;
    if (String(raw.id).startsWith('_') || raw._comment || raw._comment_) continue;
    const adapted = adaptItem(raw);
    if (!bySlug[slug].has(adapted.id)) {
      bySlug[slug].set(adapted.id, adapted);
    }
    listingIds.push(adapted.id);
  }

  const amount =
    typeof col.totalValue === 'number'
      ? col.totalValue
      : listingIds.reduce((sum, id) => {
          const item = bySlug[slug].get(id);
          return sum + (item?.value?.amount || 0);
        }, 0);

  const cover = (col.items || []).find((i) => i?.images?.[0])?.images?.[0] || null;

  adaptedCollections.push({
    id: col.id,
    name: col.name,
    category: slug,
    summary: col.summary || `${col.name} — imported from Mvita-HQ holdings`,
    image: cover,
    listingIds,
    estimatedValue: { amount, currency: col.currency || 'USD' },
    curator: 'Mvita Family Office',
    source: 'imported-from-mvita',
  });
}

const mergeStats = {};
for (const [slug, map] of Object.entries(bySlug)) {
  const fileRel = path.join(slug, `${slug}.json`);
  const sharedPath = path.join(SHARED, fileRel);
  const existing = readJson(sharedPath);
  const arrayKey = slug;
  const existingItems = Array.isArray(existing[arrayKey]) ? existing[arrayKey] : [];
  const merged = new Map();
  for (const item of existingItems) {
    if (item?.id) merged.set(item.id, item);
  }
  let added = 0;
  for (const [id, item] of map) {
    if (!merged.has(id)) {
      merged.set(id, item);
      added += 1;
    }
  }
  const out = { [arrayKey]: [...merged.values()] };
  writeJson(sharedPath, out);
  writeJson(path.join(DB, fileRel), out);
  mergeStats[slug] = { before: existingItems.length, after: merged.size, added };
}

writeJson(path.join(SHARED, 'collections', 'mvita-collections.json'), {
  collections: adaptedCollections,
});
writeJson(path.join(DB, 'collections', 'mvita-collections.json'), {
  collections: adaptedCollections,
});

console.log('Category merge:', mergeStats);
console.log('Adapted collections:', adaptedCollections.length);
console.log(
  adaptedCollections.map((c) => ({ id: c.id, n: c.listingIds.length, cat: c.category }))
);
