import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import ListingCard from '../../components/ListingCard';
import { fetchCategories, fetchListings } from '../../lib/api';

const SORT_OPTIONS = [
  { value: 'price_desc', label: 'Price · high to low' },
  { value: 'price_asc', label: 'Price · low to high' },
  { value: 'title', label: 'Title · A–Z' },
  { value: 'brand', label: 'Brand · A–Z' },
];

const PAGE_SIZE = 24;

function readSearchQuery(value) {
  return typeof value === 'string' ? value.trim() : '';
}

export async function getServerSideProps({ query }) {
  const sort = SORT_OPTIONS.some((o) => o.value === query.sort)
    ? query.sort
    : 'price_desc';
  const category = typeof query.category === 'string' ? query.category : '';
  const q = readSearchQuery(query.q);
  const offset = Math.max(0, parseInt(query.offset, 10) || 0);

  try {
    const [categories, listingsData] = await Promise.all([
      fetchCategories(),
      fetchListings({
        sort,
        limit: PAGE_SIZE,
        offset,
        ...(category ? { category } : {}),
        ...(q ? { q } : {}),
      }),
    ]);

    return {
      props: {
        listings: listingsData.listings || [],
        total: listingsData.total || 0,
        sort: listingsData.sort || sort,
        category,
        q,
        offset,
        limit: PAGE_SIZE,
        categories: categories || [],
        error: null,
      },
    };
  } catch (err) {
    return {
      props: {
        listings: [],
        total: 0,
        sort,
        category,
        q,
        offset,
        limit: PAGE_SIZE,
        categories: [],
        error: err.message || 'Failed to load listings',
      },
    };
  }
}

export default function ListingsBrowsePage({
  listings,
  total,
  sort,
  category,
  q,
  offset,
  limit,
  categories,
  error,
}) {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState(q || '');
  const sentQuery = useRef(q || '');
  const pageEnd = Math.min(offset + listings.length, total);
  const hasPrev = offset > 0;
  const hasNext = offset + limit < total;

  useEffect(() => {
    const fromUrl = q || '';
    if (fromUrl === sentQuery.current) return;
    sentQuery.current = fromUrl;
    setSearchInput(fromUrl);
  }, [q]);

  useEffect(() => {
    const next = searchInput.trim();
    if (next === (q || '')) return undefined;
    const timer = setTimeout(() => {
      sentQuery.current = next;
      const query = {
        sort,
        ...(category ? { category } : {}),
      };
      if (next) query.q = next;
      router.replace({ pathname: '/listings', query }, undefined, { scroll: false });
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput, q, sort, category, router]);

  function updateQuery(patch) {
    const next = {
      sort,
      ...(category ? { category } : {}),
      ...(q ? { q } : {}),
      ...(offset ? { offset: String(offset) } : {}),
      ...patch,
    };
    if (!next.category) delete next.category;
    if (!next.offset || next.offset === '0') delete next.offset;
    if (!next.q) delete next.q;
    router.push({ pathname: '/listings', query: next }, undefined, { scroll: true });
  }

  return (
    <div className="container">
      <Head>
        <title>All listings · Prestiege</title>
      </Head>
      <header className="page-hero">
        <p className="page-kicker">Marketplace</p>
        <h1 className="page-title">All listings</h1>
        <p className="page-desc">
          Every holding currently for sale across Prestiege verticals
          {total ? ` · ${total.toLocaleString()} available` : ''}.
        </p>
        <p style={{ marginTop: '1rem' }}>
          <Link href="/" className="section-link">
            ← Prestiege home
          </Link>
        </p>
      </header>

      <div className="browse-toolbar">
        <label className="browse-field">
          <span className="browse-label">Sort</span>
          <select
            className="browse-select"
            value={sort}
            onChange={(e) => updateQuery({ sort: e.target.value, offset: '0' })}
            aria-label="Sort listings"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <label className="browse-field">
          <span className="browse-label">Category</span>
          <select
            className="browse-select"
            value={category}
            onChange={(e) =>
              updateQuery({
                category: e.target.value || undefined,
                offset: '0',
              })
            }
            aria-label="Filter by category"
          >
            <option value="">All categories</option>
            {categories.map((cat) => (
              <option key={cat.slug} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>
        </label>

        <label className="browse-field browse-field-search">
          <span className="browse-label">Search</span>
          <input
            className="browse-search"
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Title, brand, or model"
            aria-label="Search listings"
            autoComplete="off"
          />
        </label>

        <p className="browse-count">
          {total
            ? `Showing ${offset + 1}–${pageEnd} of ${total.toLocaleString()}`
            : 'No results'}
        </p>
      </div>

      {error ? <p className="error-msg">{error}</p> : null}

      <section className="section" style={{ paddingTop: 0 }}>
        {listings.length ? (
          <div className="listing-grid">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : !error ? (
          <p className="state-msg">No listings match these filters.</p>
        ) : null}

        {total > limit ? (
          <div className="browse-pager">
            <button
              type="button"
              className="btn btn-ghost"
              disabled={!hasPrev}
              onClick={() =>
                updateQuery({ offset: String(Math.max(0, offset - limit)) })
              }
            >
              ← Previous
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              disabled={!hasNext}
              onClick={() => updateQuery({ offset: String(offset + limit) })}
            >
              Next →
            </button>
          </div>
        ) : null}
      </section>
    </div>
  );
}
