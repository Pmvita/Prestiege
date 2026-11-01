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

function readSearchQuery(value) {
  return typeof value === 'string' ? value.trim() : '';
}

export async function getServerSideProps({ params, query }) {
  const slug = params.slug;
  const sort = SORT_OPTIONS.some((o) => o.value === query.sort)
    ? query.sort
    : 'price_desc';
  const q = readSearchQuery(query.q);

  try {
    const [categories, listingsData] = await Promise.all([
      fetchCategories(),
      fetchListings({
        category: slug,
        limit: q ? 1000 : 100,
        sort,
        ...(q ? { q } : {}),
      }),
    ]);
    const category = categories.find((c) => c.slug === slug) || null;
    if (!category) {
      return { notFound: true };
    }
    return {
      props: {
        category,
        listings: listingsData.listings || [],
        total: listingsData.total || 0,
        sort: listingsData.sort || sort,
        q,
        error: null,
      },
    };
  } catch (err) {
    return {
      props: {
        category: { slug, name: slug, description: '' },
        listings: [],
        total: 0,
        sort,
        q,
        error: err.message || 'Failed to load category',
      },
    };
  }
}

export default function CategoryPage({ category, listings, total, sort, q, error }) {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState(q || '');
  const sentQuery = useRef(q || '');

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
      const query = { slug: category.slug, sort };
      if (next) query.q = next;
      router.replace(
        { pathname: '/categories/[slug]', query },
        undefined,
        { scroll: false }
      );
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput, q, sort, category.slug, router]);

  function updateSort(nextSort) {
    const query = { slug: category.slug, sort: nextSort };
    const term = searchInput.trim();
    if (term) query.q = term;
    router.push(
      {
        pathname: '/categories/[slug]',
        query,
      },
      undefined,
      { scroll: true }
    );
  }

  return (
    <div className="container">
      <Head>
        <title>{`${category.name} · Prestiege`}</title>
      </Head>
      <header className="page-hero">
        <p className="page-kicker">Category</p>
        <h1 className="page-title">{category.name}</h1>
        <p className="page-desc">
          {category.description || 'Browse available holdings in this vertical.'} · {total} listings
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
            onChange={(e) => updateSort(e.target.value)}
            aria-label="Sort listings"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <label className="browse-field browse-field-brand">
          <span className="browse-label">Brand</span>
          <select
            className="browse-select"
            value={sort === 'brand' ? 'brand' : ''}
            onChange={(e) => {
              if (e.target.value === 'brand') updateSort('brand');
              else if (sort === 'brand') updateSort('price_desc');
            }}
            aria-label="Sort by brand"
          >
            <option value="">Any</option>
            <option value="brand">A–Z</option>
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
            ? `${total.toLocaleString()} listing${total === 1 ? '' : 's'}`
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
          <p className="state-msg">
            {q ? 'No listings match your search.' : 'No listings in this category.'}
          </p>
        ) : null}
      </section>
    </div>
  );
}
