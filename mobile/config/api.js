import { Platform } from 'react-native';

/**
 * API base URL — same priority pattern as Mvita-HQ mobile getApiUrl:
 * 1. EXPO_PUBLIC_API_URL
 * 2. app.json extra.apiUrl (via expo-constants when available)
 * 3. Platform defaults (Android emulator / localhost)
 *
 * Physical device (Expo Go): set EXPO_PUBLIC_API_URL to your LAN IP,
 * e.g. http://192.168.1.10:3001
 */
function embeddedApiUrl() {
  try {
    // Optional peer — Expo SDK usually provides this transitively
    // eslint-disable-next-line global-require
    const Constants = require('expo-constants').default;
    return Constants?.expoConfig?.extra?.apiUrl || null;
  } catch {
    return null;
  }
}

function defaultHost() {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL.replace(/\/$/, '');
  }

  const embedded = embeddedApiUrl();
  if (embedded) {
    return String(embedded).replace(/\/$/, '');
  }

  if (Platform.OS === 'android') return 'http://10.0.2.2:3001';
  return 'http://localhost:3001';
}

export const API_URL = defaultHost();

async function request(path) {
  const res = await fetch(`${API_URL}${path}`);
  if (!res.ok) {
    throw new Error(`API ${res.status}: ${path}`);
  }
  return res.json();
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
  const query = qs.toString();
  const data = await request(`/api/listings${query ? `?${query}` : ''}`);
  return data;
}

export async function fetchListing(id) {
  const data = await request(`/api/listings/${encodeURIComponent(id)}`);
  return data.listing;
}

export async function fetchCollections() {
  const data = await request('/api/collections');
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
    return `${currency} ${Number(amount).toLocaleString('en-US')}`;
  }
}
