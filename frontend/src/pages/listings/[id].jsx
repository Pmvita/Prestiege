import Head from 'next/head';
import Link from 'next/link';
import { fetchListing, formatPrice } from '../../lib/api';

export async function getServerSideProps({ params }) {
  try {
    const listing = await fetchListing(params.id);
    return { props: { listing, error: null } };
  } catch (err) {
    if (err.status === 404) return { notFound: true };
    return {
      props: {
        listing: null,
        error: err.message || 'Failed to load listing',
      },
    };
  }
}

export default function ListingDetailPage({ listing, error }) {
  if (error || !listing) {
    return (
      <div className="container">
        <Head>
          <title>Listing · Prestiege</title>
        </Head>
        <p className="error-msg">{error || 'Listing unavailable'}</p>
        <Link href="/" className="section-link">
          ← Back home
        </Link>
      </div>
    );
  }

  const raw = listing.raw || {};
  const thumbs = (listing.images || []).slice(0, 4);

  return (
    <div className="container">
      <Head>
        <title>{`${listing.title} · Prestiege`}</title>
      </Head>
      <header className="page-hero">
        <p className="page-kicker">
          <Link href={`/categories/${listing.category}`} className="section-link">
            {listing.categoryName || listing.category?.replace(/-/g, ' ')}
          </Link>
        </p>
      </header>

      <div className="detail-layout">
        <div className="detail-gallery">
          <div className="detail-hero-img">
            {listing.image ? <img src={listing.image} alt={listing.title || ''} /> : null}
          </div>
          {thumbs.length > 1 ? (
            <div className="detail-thumbs">
              {thumbs.map((url, index) => (
                <div key={`${url}-${index}`}>
                  <img src={url} alt="" />
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <aside className="detail-panel">
          <h1>{listing.title}</h1>
          <p className="detail-price">{formatPrice(listing.price, listing.currency)}</p>
          {listing.summary ? <p className="detail-summary">{listing.summary}</p> : null}

          <ul className="meta-list">
            {listing.location ? (
              <li>
                <span>Location</span>
                <span>{listing.location}</span>
              </li>
            ) : null}
            {listing.status ? (
              <li>
                <span>Status</span>
                <span>{listing.status}</span>
              </li>
            ) : null}
            {listing.condition ? (
              <li>
                <span>Condition</span>
                <span>{listing.condition}</span>
              </li>
            ) : null}
            {listing.brand ? (
              <li>
                <span>Maison / Make</span>
                <span>{listing.brand}</span>
              </li>
            ) : null}
            {listing.year ? (
              <li>
                <span>Year</span>
                <span>{listing.year}</span>
              </li>
            ) : null}
            {raw.reference ? (
              <li>
                <span>Reference</span>
                <span>{raw.reference}</span>
              </li>
            ) : null}
            {raw.serialNumber || raw.details?.serialNumber ? (
              <li>
                <span>Serial / Registry</span>
                <span>{raw.serialNumber || raw.details?.serialNumber}</span>
              </li>
            ) : null}
            {raw.provenance || raw.details?.provenance ? (
              <li>
                <span>Provenance</span>
                <span>{raw.provenance || raw.details?.provenance}</span>
              </li>
            ) : null}
          </ul>

          <div className="cta-row" style={{ marginTop: '1.75rem' }}>
            <Link href={`/categories/${listing.category}`} className="btn">
              More in {listing.categoryName || listing.category?.replace(/-/g, ' ')}
            </Link>
            <Link href="/collections" className="btn btn-ghost">
              Collections
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
