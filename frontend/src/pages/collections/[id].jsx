import Head from 'next/head';
import Link from 'next/link';
import ListingCard from '../../components/ListingCard';
import { fetchCollection, formatPrice } from '../../lib/api';

export async function getServerSideProps({ params }) {
  try {
    const collection = await fetchCollection(params.id);
    return { props: { collection, error: null } };
  } catch (err) {
    if (err.status === 404) return { notFound: true };
    return {
      props: {
        collection: null,
        error: err.message || 'Failed to load collection',
      },
    };
  }
}

export default function CollectionDetailPage({ collection, error }) {
  if (error || !collection) {
    return (
      <div className="container">
        <Head>
          <title>Collection · Prestiege</title>
        </Head>
        <p className="error-msg">{error || 'Collection unavailable'}</p>
        <Link href="/collections" className="section-link">
          ← All collections
        </Link>
      </div>
    );
  }

  return (
    <div className="container">
      <Head>
        <title>{`${collection.name} · Prestiege`}</title>
      </Head>
      <header className="page-hero">
        <p className="page-kicker">Collection · {collection.categoryName || collection.category?.replace(/-/g, ' ')}</p>
        <h1 className="page-title">{collection.name}</h1>
        <p className="page-desc">{collection.summary}</p>
        {collection.estimatedValue ? (
          <p className="page-desc" style={{ color: 'var(--gold-bright)' }}>
            Est. {formatPrice(collection.estimatedValue.amount, collection.estimatedValue.currency)}
            {collection.curator ? ` · ${collection.curator}` : ''}
          </p>
        ) : null}
        <p style={{ marginTop: '1rem' }}>
          <Link href="/collections" className="section-link">
            ← All collections
          </Link>
        </p>
      </header>

      <section className="section" style={{ paddingTop: 0 }}>
        {collection.listings?.length ? (
          <div className="listing-grid">
            {collection.listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <p className="state-msg">No linked listings in this collection.</p>
        )}
      </section>
    </div>
  );
}
