import Head from 'next/head';
import Link from 'next/link';
import ListingCard from '../components/ListingCard';
import { fetchCategories, fetchCollections, fetchListings } from '../lib/api';

const HERO_IMAGE =
  'https://i.postimg.cc/MTydt249/mvitacompound.png';

export async function getServerSideProps() {
  try {
    const [categories, listingsData, collections] = await Promise.all([
      fetchCategories(),
      fetchListings({ limit: 9, sort: 'price_desc' }),
      fetchCollections(),
    ]);

    // Prefer image-rich featured picks across categories
    const featured =
      listingsData.listings?.filter((l) => l.image)?.slice(0, 6) ||
      listingsData.listings?.slice(0, 6) ||
      [];

    return {
      props: {
        categories: categories || [],
        featured,
        collections: (collections || []).slice(0, 4),
        listingTotal: listingsData.total || 0,
        error: null,
      },
    };
  } catch (err) {
    return {
      props: {
        categories: [],
        featured: [],
        collections: [],
        listingTotal: 0,
        error: err.message || 'Failed to reach Prestiege API',
      },
    };
  }
}

export default function Home({ categories, featured, collections, listingTotal, error }) {
  return (
    <>
      <Head>
        <title>Prestiege</title>
      </Head>
      <section className="hero">
        <div
          className="hero-media"
          style={{ backgroundImage: `url(${HERO_IMAGE})` }}
          aria-hidden="true"
        />
        <div className="container hero-content">
          <h1 className="hero-brand">
            Prestie<em>ge</em>
          </h1>
          <p className="hero-line">
            Cross-category discovery for estates, cars, horology, and private collections —
            curated with registry-grade depth.
          </p>
          <div className="cta-row">
            <Link href="/#featured" className="btn">
              Explore listings
            </Link>
            <Link href="/collections" className="btn btn-ghost">
              View portfolios
            </Link>
          </div>
        </div>
      </section>

      {error ? (
        <div className="container">
          <p className="error-msg">
            {error}. Start the API with <code>npm run dev:api</code> (port 3001).
          </p>
        </div>
      ) : null}

      <section className="section" id="categories">
        <div className="container">
          <div className="section-head">
            <div>
              <h2 className="section-title">Categories</h2>
              <p className="section-sub">
                {listingTotal.toLocaleString()} holdings across {categories.length} luxury verticals
              </p>
            </div>
          </div>
          <div className="category-grid">
            {categories.map((cat) => (
              <Link key={cat.slug} href={`/categories/${cat.slug}`} className="category-chip">
                <strong>{cat.name}</strong>
                <span>{cat.listingCount} listings</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="featured">
        <div className="container">
          <div className="section-head">
            <div>
              <h2 className="section-title">Featured</h2>
              <p className="section-sub">Selected from the live mock registry</p>
            </div>
            <Link href="/listings" className="section-link">
              Browse all →
            </Link>
          </div>
          {featured.length ? (
            <div className="listing-grid">
              {featured.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <p className="state-msg">No listings available yet.</p>
          )}
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <h2 className="section-title">Collections</h2>
              <p className="section-sub">Portfolio-centric holdings, ECR-style depth</p>
            </div>
            <Link href="/collections" className="section-link">
              All collections →
            </Link>
          </div>
          {collections.length ? (
            <div className="listing-grid">
              {collections.map((col) => (
                <Link key={col.id} href={`/collections/${col.id}`} className="listing-card">
                  <div className="listing-card-media">
                    {col.image ? <img src={col.image} alt="" /> : null}
                  </div>
                  <div className="listing-card-body">
                    <div className="listing-meta">{col.categoryName || col.category?.replace(/-/g, ' ')}</div>
                    <h3 className="listing-title">{col.name}</h3>
                    <p className="listing-loc">{col.listingCount} pieces</p>
                    <div className="listing-price">{col.summary}</div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="state-msg">Collections loading…</p>
          )}
        </div>
      </section>
    </>
  );
}
