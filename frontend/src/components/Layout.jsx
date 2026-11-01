import Link from 'next/link';

export default function Layout({ children }) {
  return (
    <div className="site-shell">
      <header className="site-nav">
        <div className="container site-nav-inner">
          <Link href="/" className="brand-mark">
            Prestie<span>ge</span>
          </Link>
          <nav className="nav-links" aria-label="Primary">
            <Link href="/#categories">Categories</Link>
            <Link href="/collections">Collections</Link>
            <Link href="/#featured">Featured</Link>
          </nav>
        </div>
      </header>
      <main className="site-main">{children}</main>
      <footer className="site-footer">
        <div className="container site-footer-inner">
          <span>PRESTIEGE · Private luxury marketplace</span>
          <span>USD base · Portfolio-centric</span>
        </div>
      </footer>
    </div>
  );
}
