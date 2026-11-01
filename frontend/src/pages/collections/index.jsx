import Head from 'next/head';
import Link from 'next/link';
import { fetchCollections, formatPrice } from '../../lib/api';

export async function getServerSideProps() {
  try {
    const collections = await fetchCollections();
    return { props: { collections, error: null } };
  } catch (err) {
    return {
      props: {
        collections: [],
        error: err.message || 'Failed to load collections',
      },
    };
  }
}

export default function CollectionsPage({ collections, error }) {
  return (
    <div className="container">
      <Head>
        <title>Collections · Prestiege</title>
      </Head>
      <header className="page-hero">
        <p className="page-kicker">Portfolios</p>
        <h1 className="page-title">Collections</h1>
        <p className="page-desc">
          Curated holdings across real estate, cars, horology, and soft luxury — registry-aware
          and portfolio-first.
        </p>
      </header>

      {error ? <p className="error-msg">{error}</p> : null}

      <section className="section" style={{ paddingTop: 0 }}>
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
                  <p className="listing-loc">
                    {col.listingCount} pieces
                    {col.curator ? ` · ${col.curator}` : ''}
                  </p>
                  <div className="listing-price">
                    {col.estimatedValue
                      ? formatPrice(col.estimatedValue.amount, col.estimatedValue.currency)
                      : col.summary}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="state-msg">No collections found.</p>
        )}
      </section>
    </div>
  );
}
