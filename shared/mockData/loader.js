/**
 * CommonJS mock-data loader for Node (API) consumers.
 * Prefer this over the TypeScript loader when requiring from Express.
 *
 * Marketplace categories live under shared/mockData/<slug>/<slug>.json.
 * Faithful Mvita-HQ copy lives under imported-from-mvita/ (office domains).
 */
const path = require('path');
const fs = require('fs');

const ROOT = __dirname;
const IMPORTED_ROOT = path.join(ROOT, 'imported-from-mvita');

function readJson(relPath) {
  const full = path.isAbsolute(relPath) ? relPath : path.join(ROOT, relPath);
  return JSON.parse(fs.readFileSync(full, 'utf8'));
}

function loadCategories() {
  return readJson('marketplace/categories.json').categories || [];
}

function loadCategoryItems(category) {
  const data = readJson(category.file);
  const items = data[category.arrayKey];
  if (!Array.isArray(items)) return [];
  return items.filter((item) => item && typeof item === 'object' && item.id);
}

function loadAllListingsRaw() {
  const categories = loadCategories();
  const byCategory = {};
  for (const cat of categories) {
    byCategory[cat.slug] = loadCategoryItems(cat);
  }
  return { categories, byCategory };
}

function loadCollectionsRaw() {
  const marketplace = readJson('marketplace/collections.json').collections || [];
  const collectionsDir = path.join(ROOT, 'collections');
  const extras = [];
  if (fs.existsSync(collectionsDir)) {
    for (const file of fs.readdirSync(collectionsDir)) {
      if (!file.endsWith('.json')) continue;
      try {
        const data = readJson(path.join('collections', file));
        if (Array.isArray(data.collections)) {
          extras.push(...data.collections.filter((c) => c && c.id));
        }
      } catch {
        /* skip broken files */
      }
    }
  }
  const seen = new Set();
  const merged = [];
  for (const c of [...marketplace, ...extras]) {
    if (!c?.id || seen.has(c.id)) continue;
    seen.add(c.id);
    merged.push(c);
  }
  return merged;
}

/** Paths relative to imported-from-mvita/ for family-office domains. */
const IMPORTED_FILES = {
  vehicles: 'mobility/vehicles.json',
  properties: 'estates/properties.json',
  guests: 'estates/guests.json',
  events: 'events/events.json',
  finance: 'finance/manifestPortfolio.json',
  security: 'security/data.json',
  staff: 'staff/members.json',
  bucketList: 'bucketList/bucketList.json',
  collections: 'collections/collections.json',
  vaultDocuments: 'vault/documents.json',
  vaultGive: 'vault/Give.json',
  vaultLegacy: 'vault/legacyEstate.json',
  vaultRoster: 'vault/roster.json',
};

function loadImported(key) {
  const rel = IMPORTED_FILES[key];
  if (!rel) return null;
  const full = path.join(IMPORTED_ROOT, rel);
  if (!fs.existsSync(full)) return null;
  return readJson(full);
}

function listImportedKeys() {
  return Object.keys(IMPORTED_FILES).filter((key) =>
    fs.existsSync(path.join(IMPORTED_ROOT, IMPORTED_FILES[key]))
  );
}

module.exports = {
  ROOT,
  IMPORTED_ROOT,
  readJson,
  loadCategories,
  loadCategoryItems,
  loadAllListingsRaw,
  loadCollectionsRaw,
  loadImported,
  listImportedKeys,
  IMPORTED_FILES,
};
