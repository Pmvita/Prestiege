const PLACEHOLDERS = {
  'real-estate': 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=80',
  mobility: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&q=80',
  yachts: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=1200&q=80',
  jets: 'https://images.unsplash.com/photo-1540962351504-52999f29f18b?w=1200&q=80',
  watches: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=1200&q=80',
  jewelry: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1200&q=80',
  bags: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=1200&q=80',
  shoes: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=1200&q=80',
  fashion: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&q=80',
  art: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=1200&q=80',
  books: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1200&q=80',
  spirits: 'https://images.unsplash.com/photo-1569529465841-dfecdab6093f?w=1200&q=80',
  foods: 'https://cdn.shopify.com/s/files/1/0525/9899/7148/products/almas-osetra-123962.jpg',
  collectibles: 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=1200&q=80',
  experiences: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',
  default: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80',
};

function formatLocation(location) {
  if (!location || typeof location !== 'object') return null;
  const city = location.city || '';
  const country = location.country || '';
  if (city && country) return `${city}, ${country}`;
  return city || country || location.address || null;
}

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Prefer street/full address fields when present (esp. real estate).
 * Falls back to marketing name / brand-model for other categories.
 */
function pickAddress(item) {
  const loc = item.location && typeof item.location === 'object' ? item.location : null;
  const candidates = [
    loc?.address,
    loc?.street,
    loc?.fullAddress,
    item.address,
    item.street,
    item.fullAddress,
  ];
  for (const value of candidates) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return null;
}

function pickTitle(item, categorySlug) {
  const address = pickAddress(item);
  // Address-like fields win when present (real estate always prefers place over marketing name).
  if (address) return address;
  if (categorySlug === 'real-estate') {
    const place = formatLocation(item.location);
    if (place) return place;
  }

  if (item.name) return item.name;
  if (item.displayName) return item.displayName;
  const make = item.make || item.brand || '';
  const model = item.model || '';
  const year = item.year ? ` ${item.year}` : '';
  const composed = `${make} ${model}${year}`.trim();
  return composed || item.id;
}

/** City/country line; omit when the title already carries the same place info. */
function formatLocationSubtitle(location, title) {
  const label = formatLocation(location);
  if (!label) return null;
  if (!title) return label;

  const titleNorm = normalizeText(title);
  const labelNorm = normalizeText(label);
  if (titleNorm === labelNorm || titleNorm.includes(labelNorm)) return null;

  const city = location?.city ? normalizeText(location.city) : '';
  const country = location?.country ? normalizeText(location.country) : '';
  if (city && country && titleNorm.includes(city) && titleNorm.includes(country)) {
    return null;
  }
  // City-only address titles (e.g. "Dubai, UAE") — don't repeat city,country.
  if (city && titleNorm === city) return null;
  if (city && country && titleNorm.startsWith(`${city},`)) return null;

  return label;
}

function pickSummary(item) {
  if (typeof item.provenance === 'string' && item.provenance) return item.provenance;
  if (Array.isArray(item.notes) && item.notes.length) return item.notes[0];
  if (typeof item.notes === 'string' && item.notes) return item.notes;
  if (item.details?.provenance) return item.details.provenance;
  if (item.details?.purpose) return item.details.purpose;
  if (Array.isArray(item.includes) && item.includes.length) {
    return item.includes.slice(0, 3).join(' · ');
  }
  if (item.artist) return `${item.artist}${item.year ? `, ${item.year}` : ''}`;
  if (item.brand && item.model) return `${item.brand} ${item.model}`;
  if (item.type) return String(item.type).replace(/-/g, ' ');
  return null;
}

function pickImages(item, categorySlug) {
  const images = Array.isArray(item.images)
    ? item.images.filter((url) => typeof url === 'string' && url.startsWith('http'))
    : [];
  if (images.length) return images;
  return [PLACEHOLDERS[categorySlug] || PLACEHOLDERS.default];
}

function pickPrice(item) {
  const value = item.value || {};
  const amount = typeof value.amount === 'number' ? value.amount : null;
  const currency = value.currency || 'USD';
  return { amount, currency };
}

/**
 * Normalize raw mock items into a shared listing card + detail shape.
 */
function normalizeListing(item, categorySlug, categoryName) {
  const { amount, currency } = pickPrice(item);
  const images = pickImages(item, categorySlug);
  const title = pickTitle(item, categorySlug);
  const locationLabel = formatLocationSubtitle(item.location, title);

  return {
    id: item.id,
    title,
    category: categorySlug,
    categoryName: categoryName || categorySlug,
    price: amount,
    currency,
    location: locationLabel,
    locationDetail: item.location || null,
    image: images[0],
    images,
    summary: pickSummary(item),
    status: item.status || null,
    condition: item.condition || item.details?.condition || null,
    brand: item.brand || item.make || item.builder || item.artist || null,
    model: item.model || null,
    year: item.year || null,
    type: item.type || null,
    // Full raw payload for detail views
    raw: item,
  };
}

function toCard(listing) {
  return {
    id: listing.id,
    title: listing.title,
    category: listing.category,
    categoryName: listing.categoryName || listing.category,
    price: listing.price,
    currency: listing.currency,
    location: listing.location,
    image: listing.image,
    summary: listing.summary,
    status: listing.status,
    brand: listing.brand,
    model: listing.model,
    year: listing.year,
  };
}

function normalizeCollection(collection, listingCardsById, categoryNames) {
  const listingIds = Array.isArray(collection.listingIds) ? collection.listingIds : [];
  const listings = listingIds
    .map((id) => listingCardsById.get(id))
    .filter(Boolean);
  const names = categoryNames || {};

  const estimated =
    collection.estimatedValue ||
    (listings.length
      ? {
          amount: listings.reduce((sum, l) => sum + (l.price || 0), 0),
          currency: 'USD',
        }
      : null);

  return {
    id: collection.id,
    name: collection.name,
    category: collection.category,
    categoryName: names[collection.category] || collection.category,
    summary: collection.summary || null,
    image: collection.image || listings[0]?.image || PLACEHOLDERS[collection.category] || PLACEHOLDERS.default,
    listingIds,
    listingCount: listings.length,
    listings,
    estimatedValue: estimated,
    curator: collection.curator || null,
  };
}

module.exports = {
  PLACEHOLDERS,
  normalizeListing,
  toCard,
  normalizeCollection,
};
