import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>AIR LEGACY</h3>
          <p className="footer-tagline">Premium Streetwear & Performance Gear</p>
          <p className="footer-demo-note">
            Dies ist ein Portfolio-Projekt zu Demonstrationszwecken.
            <br />
            Es werden keine echten Produkte verkauft.
          </p>
        </div>

        <div className="footer-section">
          <h4>Shop</h4>
          <ul>
            <li><Link href="/">Alle Produkte</Link></li>
            <li><Link href="/cart">Warenkorb</Link></li>
            <li><Link href="/login">Anmelden</Link></li>
            <li><Link href="/register">Registrieren</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Rechtliches</h4>
          <ul>
            <li><Link href="/impressum">Impressum</Link></li>
            <li><Link href="/datenschutz">Datenschutz</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Projekt</h4>
          <ul>
            <li>
              <a href="https://github.com/AndySchlegel/Ecokart-Webshop" target="_blank" rel="noopener noreferrer">
                GitHub
              </a>
            </li>
            <li>
              <a href="https://github.com/AndySchlegel/Ecokart-Webshop#readme" target="_blank" rel="noopener noreferrer">
                Dokumentation
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>
          &copy; {currentYear} AIR LEGACY - Serverless E-Commerce Demo |
          Built with AWS Lambda, DynamoDB, Next.js & Terraform
        </p>
      </div>

      <style jsx>{`
        .site-footer {
          background: #000;
          border-top: 2px solid #222;
          margin-top: 4rem;
          padding: 3rem 2rem 1.5rem;
        }

        .footer-content {
          max-width: 1400px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 3rem;
          margin-bottom: 2rem;
        }

        .footer-section h3 {
          font-size: 1.5rem;
          font-weight: 900;
          margin-bottom: 1rem;
          background: linear-gradient(135deg, var(--accent-orange), var(--accent-green));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .footer-section h4 {
          font-size: 1rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 1rem;
          color: var(--accent-green);
        }

        .footer-tagline {
          color: #999;
          font-size: 0.95rem;
          margin-bottom: 1rem;
        }

        .footer-demo-note {
          color: #666;
          font-size: 0.875rem;
          line-height: 1.6;
          font-style: italic;
        }

        .footer-section ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .footer-section ul li {
          margin-bottom: 0.75rem;
        }

        .footer-section ul li a {
          color: #ccc;
          text-decoration: none;
          font-size: 0.95rem;
          transition: all 0.3s ease;
          display: inline-block;
        }

        .footer-section ul li a:hover {
          color: var(--accent-orange);
          transform: translateX(5px);
        }

        .footer-bottom {
          max-width: 1400px;
          margin: 0 auto;
          padding-top: 2rem;
          border-top: 1px solid #222;
          text-align: center;
        }

        .footer-bottom p {
          color: #666;
          font-size: 0.875rem;
          line-height: 1.6;
        }

        @media (max-width: 1024px) {
          .footer-content {
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
          }
        }

        @media (max-width: 640px) {
          .site-footer {
            padding: 2rem 1rem 1rem;
          }

          .footer-content {
            grid-template-columns: 1fr;
            gap: 2rem;
          }

          .footer-section:first-child {
            border-bottom: 1px solid #222;
            padding-bottom: 2rem;
          }
        }
      `}</style>
    </footer>
  );
}
