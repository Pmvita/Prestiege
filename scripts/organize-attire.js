/**
 * Organize bags, clothes, shoes, fragrance, and jewelry after the Mvita import.
 * Drops blank records, renames placeholder titles, and files each group
 * into its category plus a collection.
 */
const fs = require('fs');
const path = require('path');

const SHARED = path.join(__dirname, '..', 'shared', 'mockData');
const DB = path.join(__dirname, '..', 'db', 'mockData');

const RENAME = {
  'suit-1': "Custom Men's Suit",
  'suit-2': "Custom Men's Suit II",
  'suit-3': "Custom Men's Suit, Gold and Crown",
  'dress-1': 'Custom Dress',
  'dress-2': 'Custom Dress II',
  'dress-3': 'Custom Dress III',
  'dress-4': 'Custom Dress IV',
};

const DROP_IDS = new Set(['attire--120', 'chanel-haute-couture-2022']);

function read(rel) {
  return JSON.parse(fs.readFileSync(path.join(SHARED, rel), 'utf8'));
}

function write(rel, data) {
  const body = JSON.stringify(data, null, 2) + '\n';
  for (const root of [SHARED, DB]) {
    const full = path.join(root, rel);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, body, 'utf8');
  }
}

function text(item) {
  return [item.name, item.model, item.brand].filter(Boolean).join(' ');
}

function isFragrance(item) {
  return /parfum|perfume|eau de|\bedp\b|\bedt\b|cologne|elixir|extrait/i.test(text(item));
}

function isSkincare(item) {
  return /lotion|mucin|cerave|amlactin|moistur/i.test(text(item));
}

function isJewelry(item) {
  return /jewel/i.test(item.name || '');
}

function byName(a, b) {
  return String(a.name || '').localeCompare(String(b.name || ''), undefined, { sensitivity: 'base' });
}

function sum(items) {
  return items.reduce((n, item) => n + (item.value && typeof item.value.amount === 'number' ? item.value.amount : 0), 0);
}

function cover(items) {
  const found = items.find((item) => item.images && item.images[0]);
  return found ? found.images[0] : null;
}

function collection(id, name, category, summary, items) {
  return {
    id,
    name,
    category,
    summary,
    image: cover(items),
    listingIds: items.map((item) => item.id),
    estimatedValue: { amount: sum(items), currency: 'USD' },
    curator: 'Mvita Family Office',
    source: 'imported-from-mvita',
  };
}

const fashion = read('fashion/fashion.json').fashion || [];
const spirits = read('spirits/spirits.json').spirits || [];
const jewelry = read('jewelry/jewelry.json').jewelry || [];
const bags = read('bags/bags.json').bags || [];
const shoes = read('shoes/shoes.json').shoes || [];

const spiritIds = new Set(spirits.map((item) => item.id));
const jewelIds = new Set(jewelry.map((item) => item.id));
const jewelNames = new Set(jewelry.map((item) => (item.name || '').toLowerCase()));

const movedFragrance = [];
const movedJewelry = [];
const clothes = [];

for (const item of fashion) {
  if (!item || !item.id || DROP_IDS.has(item.id)) continue;
  if (!item.name || !String(item.name).trim()) continue;
  if (isSkincare(item)) continue;
  item.name = (RENAME[item.id] || item.name).replace(/\s+/g, ' ').trim();
  if (isFragrance(item)) {
    if (!spiritIds.has(item.id)) {
      spirits.push({
        ...item,
        type: item.type || 'fragrance',
        status: item.status || 'available',
      });
      spiritIds.add(item.id);
    }
    movedFragrance.push(item);
    continue;
  }
  if (isJewelry(item)) {
    if (!jewelIds.has(item.id)) {
      const brand = String(item.brand || '').trim();
      let name = brand ? `${brand} Jewelry` : item.name;
      name = name.replace(/\s+/g, ' ').trim();
      if (jewelNames.has(name.toLowerCase())) {
        let n = 2;
        while (jewelNames.has(`${name} ${n}`.toLowerCase())) n += 1;
        name = `${name} ${n}`;
      }
      jewelNames.add(name.toLowerCase());
      jewelry.push({ ...item, name, category: item.category || 'jewelry', status: item.status || 'available' });
      jewelIds.add(item.id);
      movedJewelry.push({ ...item, name });
    }
    continue;
  }
  clothes.push(item);
}

clothes.sort(byName);
bags.sort(byName);
shoes.sort(byName);

write('fashion/fashion.json', { fashion: clothes });
write('bags/bags.json', { bags });
write('shoes/shoes.json', { shoes });
write('spirits/spirits.json', { spirits });
write('jewelry/jewelry.json', { jewelry });

const groups = {
  bags,
  fashion: clothes,
  shoes,
  spirits: movedFragrance,
  jewelry: movedJewelry,
};

write('collections/bags-collections.json', {
  collections: [collection('mvita-bags', 'Bags', 'bags', 'Hermès, Goyard, Louis Vuitton, and the rest of the Attire handbags.', bags)],
});
write('collections/fashion-collections.json', {
  collections: [collection('mvita-clothes', 'Clothes', 'fashion', 'Suits, jackets, knits, and the rest of the Attire wardrobe.', clothes)],
});
write('collections/shoes-collections.json', {
  collections: [collection('mvita-shoes', 'Shoes', 'shoes', 'Sneakers, boots, loafers, and the rest of the Attire footwear.', shoes)],
});

const spiritsCols = read('collections/spirits-collections.json');
const spiritList = Array.isArray(spiritsCols.collections) ? spiritsCols.collections : [];
spiritList.push(collection('mvita-fragrance', 'Fragrance', 'spirits', 'Attire fragrance pulled out of the wardrobe.', movedFragrance));
write('collections/spirits-collections.json', { collections: spiritList });

const jewelryCols = read('collections/jewelry-collections.json');
const jewelList = Array.isArray(jewelryCols.collections) ? jewelryCols.collections : [];
jewelList.push(collection('mvita-attire-jewelry', 'Attire jewelry', 'jewelry', 'Jewelry pieces that were filed with the wardrobe.', movedJewelry));
write('collections/jewelry-collections.json', { collections: jewelList });

const mvita = read('collections/mvita-collections.json');
const placed = new Set([...bags, ...shoes, ...movedFragrance, ...movedJewelry, ...clothes].map((item) => item.id));
for (const col of mvita.collections || []) {
  if (col.id !== 'collection-015') continue;
  col.name = 'Attire';
  col.category = 'fashion';
  col.summary = 'Wardrobe pieces from the Mvita Attire holding. Bags, shoes, and fragrance are filed in their own collections.';
  col.listingIds = (col.listingIds || []).filter((id) => {
    const item = clothes.find((entry) => entry.id === id);
    return Boolean(item);
  });
  col.image = cover(clothes) || col.image;
  col.estimatedValue = { amount: sum(clothes.filter((item) => col.listingIds.includes(item.id))), currency: 'USD' };
}
write('collections/mvita-collections.json', mvita);

console.log(JSON.stringify({
  clothes: clothes.length,
  bags: bags.length,
  shoes: shoes.length,
  fragranceMoved: movedFragrance.length,
  jewelryMoved: movedJewelry.length,
  spirits: spirits.length,
  jewelry: jewelry.length,
  attireIdsStillClothes: (mvita.collections.find((c) => c.id === 'collection-015') || {}).listingIds.length,
  droppedBecauseUnplaced: [...placed].length,
}, null, 2));
