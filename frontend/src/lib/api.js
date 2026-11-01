const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function request(path) {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) {
    const err = new Error(`API ${res.status}: ${path}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

export function getApiBase() {
  return API_BASE;
}

export async function fetchCategories() {
  const data = await request('/api/categories');
  return data.categories || [];
}

export async function fetchListings(params = {}) {
  const qs = new URLSearchParams();
  if (params.category) qs.set('category', params.category);
  if (params.limit) qs.set('limit', String(params.limit));
  if (params.offset) qs.set('offset', String(params.offset));
  if (params.sort) qs.set('sort', params.sort);
  if (params.q) qs.set('q', params.q);
  const query = qs.toString();
  const data = await request(`/api/listings${query ? `?${query}` : ''}`);
  return data;
}

export async function fetchListing(id) {
  const data = await request(`/api/listings/${encodeURIComponent(id)}`);
  return data.listing;
}

export async function fetchCollections(params = {}) {
  const qs = new URLSearchParams();
  if (params.category) qs.set('category', params.category);
  const query = qs.toString();
  const data = await request(`/api/collections${query ? `?${query}` : ''}`);
  return data.collections || [];
}

export async function fetchCollection(id) {
  const data = await request(`/api/collections/${encodeURIComponent(id)}`);
  return data.collection;
}

export function formatPrice(amount, currency = 'USD') {
  if (amount == null || Number.isNaN(amount)) return 'Price on request';
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString('en-US')}`;
  }
}
