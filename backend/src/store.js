const {
  loadCategories,
  loadCategoryItems,
  loadCollectionsRaw,
} = require('prestiege-shared');
const { normalizeListing, toCard, normalizeCollection } = require('./normalize');

let cache = null;

function buildStore() {
  const categories = loadCategories();
  const listings = [];
  const listingsById = new Map();
  const counts = {};

  for (const cat of categories) {
    const rawItems = loadCategoryItems(cat);
    counts[cat.slug] = 0;
    for (const item of rawItems) {
      const listing = normalizeListing(item, cat.slug, cat.name);
      listings.push(listing);
      listingsById.set(listing.id, listing);
      counts[cat.slug] += 1;
    }
  }

  const cardById = new Map(
    [...listingsById.entries()].map(([id, listing]) => [id, toCard(listing)])
  );

  const categoryNames = Object.fromEntries(categories.map((cat) => [cat.slug, cat.name]));
  const collections = loadCollectionsRaw().map((c) =>
    normalizeCollection(c, cardById, categoryNames)
  );

  const categoriesWithCounts = categories.map((cat) => ({
    id: cat.id,
    slug: cat.slug,
    name: cat.name,
    description: cat.description,
    image: cat.image,
    listingCount: counts[cat.slug] || 0,
  }));

  return {
    categories: categoriesWithCounts,
    listings,
    listingsById,
    collections,
    collectionsById: new Map(collections.map((c) => [c.id, c])),
  };
}

function getStore() {
  if (!cache) cache = buildStore();
  return cache;
}

function refreshStore() {
  cache = buildStore();
  return cache;
}

module.exports = { getStore, refreshStore, buildStore };
