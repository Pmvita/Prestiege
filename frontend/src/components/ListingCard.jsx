import Link from 'next/link';
import { formatPrice } from '../lib/api';

export default function ListingCard({ listing }) {
  if (!listing) return null;
  return (
    <Link href={`/listings/${listing.id}`} className="listing-card">
      <div className="listing-card-media">
        {listing.image ? (
          <img src={listing.image} alt={listing.title || ''} />
        ) : null}
      </div>
      <div className="listing-card-body">
        <div className="listing-meta">{listing.categoryName || listing.category?.replace(/-/g, ' ')}</div>
        <h3 className="listing-title">{listing.title}</h3>
        {listing.location ? <p className="listing-loc">{listing.location}</p> : null}
        <div className="listing-price">{formatPrice(listing.price, listing.currency)}</div>
      </div>
    </Link>
  );
}
