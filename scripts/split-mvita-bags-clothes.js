/**
 * Read-only against Mvita-HQ. Files bags, shoes, and clothes from every
 * collection item into Prestiege category JSON (shared + db mirror).
 */
const fs = require('fs');
const path = require('path');

const MVITA = 'C:/Users/user/Desktop/MAIN/Personal/1. Mvita-HQ/shared/mockData/collections/collections.json';
const SHARED = path.join(__dirname, '..', 'shared', 'mockData');
const DB = path.join(__dirname, '..', 'db', 'mockData');

const BAG = [
  'birkin', 'kelly', 'handbag', 'purse', 'clutch', 'tote', 'backpack', 'picotin',
  'constance', 'evelyne', 'herbag', 'bolide', 'lindy', 'holdall', 'duffle', 'duffel',
  'messenger', 'bumbag', 'keepall', 'pochette', 'saddle', 'wallet', 'briefcase',
  'vanity case', 'luggage', 'sidebag', 'side bag', 'pocket organizer', 'belt bag',
  'pouch', 'coursier', 'horizon 55',
];
const SHOE = [
  'sneaker', 'sneakers', 'shoe', 'shoes', 'loafer', 'loafers', 'boot', 'boots',
  'derby', 'slipper', 'slippers', 'mule', 'mules', 'sandal', 'sandals', 'trainer',
  'trainers', 'espadrille', 'chelsea', 'air jordan', 'jordan', 'air force', 'af1',
  'dunk', 'air max', 'vapormax', 'runner', 'mercurial', 'phantom', 'copa',
];
const CLOTH = [
  'jacket', 'suit', 'sweater', 'jumper', 'trouser', 'trousers', 'pants', 'jeans',
  'shirt', 'blouse', 'blazer', 'hoodie', 'tracksuit', 'track suit', 'coat', 'vest',
  'cardigan', 'sweatshirt', 'polo', 'shorts', 'glove', 'gloves', 'beanie', 'toque',
  'belt', 'hat', 'fedora', 'gown', 'dress', 'skirt', 'tee', 't-shirt', 'sweatpants',
  'salopette', 'overshirt', 'turtleneck', 'parka', 'trench', 'kimono', 'robe',
  'scarf', 'bodysuit', 'corset', 'kaftan', 'pullover', 'crewneck', 'windbreaker',
];
const NOT_WEARABLE = [
  'eau de parfum', 'eau de toilette', 'edp', 'edt', 'cologne', 'parfum', 'lotion',
  'essence', 'moisturizer', 'moisturizing', 'glasses', 'sunglasses', 'jewelry',
  'jewlery', 'jewellery', 'extrait', 'cigar',
];

function textOf(it) {
  return [it.name, it.model, it.brand, it.medium, it.type].filter(Boolean).join(' ').toLowerCase();
}

function has(text, word) {
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(?:^|[^a-z0-9])${escaped}(?:[^a-z0-9]|$)`, 'i').test(text);
}

function kind(it, collectionName) {
  const text = textOf(it);
  if (!text.trim()) return 'skip';
  if (/bearbrick|medicom|figure\b|cigar/.test(text)) return 'other';
  if (NOT_WEARABLE.some((w) => has(text, w))) return 'other';
  if (BAG.some((w) => has(text, w)) || /\bbag\b/.test(text)) return 'bag';
  const wearable = collectionName === 'Attire';
  if (SHOE.some((w) => has(text, w))) return wearable ? 'shoe' : 'other';
  if (!wearable) return 'other';
  if (CLOTH.some((w) => has(text, w))) return 'cloth';
  if (/\bset\b/.test(text)) return 'cloth';
  if (/^(men|women) - \d+$/i.test((it.name || '').trim())) return 'cloth';
  return 'other';
}

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

function writeBoth(rel, data) {
  const body = JSON.stringify(data, null, 2) + '\n';
  for (const root of [SHARED, DB]) {
    const full = path.join(root, rel);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, body, 'utf8');
  }
}

const mvita = readJson(MVITA);
const bags = [];
const shoes = [];
const clothes = [];
const nonAttireOtherIds = new Set();
const seen = new Set();

for (const col of mvita.collections || []) {
  for (const raw of col.items || []) {
    if (!raw || !raw.id || String(raw.id).startsWith('_')) continue;
    const bucket = kind(raw, col.name);
    if (bucket === 'other' && col.name !== 'Attire') nonAttireOtherIds.add(raw.id);
    if (bucket !== 'bag' && bucket !== 'shoe' && bucket !== 'cloth') continue;
    if (seen.has(raw.id)) continue;
    seen.add(raw.id);
    const item = adaptItem(raw);
    if (bucket === 'bag') bags.push(item);
    else if (bucket === 'shoe') shoes.push(item);
    else clothes.push(item);
  }
}

const fashionPath = path.join(SHARED, 'fashion', 'fashion.json');
const shoesPath = path.join(SHARED, 'shoes', 'shoes.json');
const existingFashion = readJson(fashionPath).fashion || [];
const existingShoes = readJson(shoesPath).shoes || [];

const bagIds = new Set(bags.map((b) => b.id));
const shoeIds = new Set(shoes.map((s) => s.id));
const clothIds = new Set(clothes.map((c) => c.id));

const fashionKept = existingFashion.filter(
  (item) => item && item.id && !bagIds.has(item.id) && !shoeIds.has(item.id) && !nonAttireOtherIds.has(item.id)
);
const fashionIds = new Set(fashionKept.map((item) => item.id));
let clothesAdded = 0;
for (const item of clothes) {
  if (fashionIds.has(item.id)) continue;
  fashionKept.push(item);
  fashionIds.add(item.id);
  clothesAdded += 1;
}

const shoeKept = existingShoes.filter(
  (item) =>
    item &&
    item.id &&
    !shoeIds.has(item.id) &&
    !nonAttireOtherIds.has(item.id) &&
    !clothIds.has(item.id)
);
const shoeOut = [...shoeKept, ...shoes];

writeBoth('bags/bags.json', { bags });
writeBoth('shoes/shoes.json', { shoes: shoeOut });
writeBoth('fashion/fashion.json', { fashion: fashionKept });

const outside = [];
for (const col of mvita.collections || []) {
  if (col.name === 'Attire') continue;
  for (const raw of col.items || []) {
    if (raw && clothIds.has(raw.id)) outside.push(`${col.name} | ${raw.name}`);
  }
}
console.log(JSON.stringify({
  bags: bags.length,
  shoes: shoeOut.length,
  shoesAddedFromMvita: shoes.length,
  fashion: fashionKept.length,
  clothesNewlyAdded: clothesAdded,
  clothesAlreadyPresent: clothes.length - clothesAdded,
  clothesOutsideAttire: outside,
}, null, 2));
