import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Impressum - AIR LEGACY',
  description: 'Impressum und rechtliche Hinweise zu AIR LEGACY E-Commerce Demo',
};

export default function ImpressumPage() {
  return (
    <div className="legal-page-container">
      <div className="legal-header">
        <Link href="/" className="back-link">
          ← Zurück zum Shop
        </Link>
        <h1>IMPRESSUM</h1>
        <p className="legal-subtitle">Angaben gemäß § 5 TMG</p>
      </div>

      <div className="legal-content">
        <section className="legal-section">
          <h2>Anbieter</h2>
          <p className="info-block">
            <strong>AIR LEGACY E-Commerce Demonstration</strong>
            <br />
            Andy Schlegel (Portfolio Project)
            <br />
            Musterstraße 123
            <br />
            12345 Musterstadt
            <br />
            Deutschland
          </p>
        </section>

        <section className="legal-section">
          <h2>Kontakt</h2>
          <p className="info-block">
            <strong>E-Mail:</strong> andy.schlegel@chakademie.org
            <br />
            <strong>GitHub:</strong>{' '}
            <a
              href="https://github.com/AndySchlegel/Ecokart-Webshop"
              target="_blank"
              rel="noopener noreferrer"
            >
              github.com/AndySchlegel/Ecokart-Webshop
            </a>
          </p>
        </section>

        <section className="legal-section demo-notice">
          <h2>⚠️ Wichtiger Hinweis</h2>
          <p>
            <strong>Dies ist ein Portfolio-Projekt zu Demonstrationszwecken.</strong>
          </p>
          <ul>
            <li>Es werden <strong>keine echten Produkte</strong> verkauft</li>
            <li>Alle Bestellungen erfolgen im Stripe Test-Modus</li>
            <li>Keine echten Zahlungen werden verarbeitet</li>
            <li>
              Zweck: Demonstration von AWS Serverless Architecture, Infrastructure as Code
              (Terraform), und Full-Stack Development Skills
            </li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>Technologie Stack</h2>
          <p className="info-block">
            <strong>Frontend:</strong> Next.js 14, React 18, TypeScript, AWS Amplify
            <br />
            <strong>Backend:</strong> AWS Lambda (Node.js 20), Express.js, TypeScript
            <br />
            <strong>Database:</strong> AWS DynamoDB
            <br />
            <strong>Authentication:</strong> AWS Cognito
            <br />
            <strong>Infrastructure:</strong> Terraform, GitHub Actions CI/CD
            <br />
            <strong>Payment:</strong> Stripe (Test Mode)
            <br />
            <strong>Email:</strong> Resend API
          </p>
        </section>

        <section className="legal-section">
          <h2>Haftungsausschluss</h2>

          <h3>Haftung für Inhalte</h3>
          <p>
            Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen
            Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir
            als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde
            Informationen zu überwachen oder nach Umständen zu forschen, die auf eine
            rechtswidrige Tätigkeit hinweisen.
          </p>
          <p>
            Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den
            allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist
            jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich.
            Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese Inhalte
            umgehend entfernen.
          </p>

          <h3>Haftung für Links</h3>
          <p>
            Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir
            keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine
            Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige
            Anbieter oder Betreiber der Seiten verantwortlich.
          </p>
        </section>

        <section className="legal-section">
          <h2>Urheberrecht</h2>
          <p>
            Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten
            unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung,
            Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes
            bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
          </p>
          <p>
            Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt wurden, werden die
            Urheberrechte Dritter beachtet. Insbesondere werden Inhalte Dritter als solche
            gekennzeichnet. Sollten Sie trotzdem auf eine Urheberrechtsverletzung aufmerksam
            werden, bitten wir um einen entsprechenden Hinweis.
          </p>
        </section>

        <section className="legal-section">
          <h2>Open Source</h2>
          <p>
            Dieses Projekt ist Open Source und auf GitHub verfügbar:
            <br />
            <a
              href="https://github.com/AndySchlegel/Ecokart-Webshop"
              target="_blank"
              rel="noopener noreferrer"
              className="github-link"
            >
              github.com/AndySchlegel/Ecokart-Webshop
            </a>
          </p>
          <p>
            <strong>Lizenz:</strong> MIT License
            <br />
            <strong>Dokumentation:</strong> Vollständige technische Dokumentation im Repository
          </p>
        </section>
      </div>

      <style jsx>{`
        .legal-page-container {
          min-height: 100vh;
          background: #000;
          padding: 2rem 2rem 4rem;
        }

        .legal-header {
          max-width: 900px;
          margin: 0 auto 3rem;
          animation: fadeInUp 0.6s ease;
        }

        .back-link {
          color: var(--accent-green);
          text-decoration: none;
          font-weight: 600;
          display: inline-block;
          margin-bottom: 2rem;
          transition: all 0.3s ease;
        }

        .back-link:hover {
          color: var(--accent-orange);
          transform: translateX(-5px);
        }

        .legal-header h1 {
          font-size: 3rem;
          font-weight: 900;
          margin-bottom: 0.5rem;
          background: linear-gradient(135deg, var(--accent-orange), var(--accent-green));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .legal-subtitle {
          color: #999;
          font-size: 1.1rem;
        }

        .legal-content {
          max-width: 900px;
          margin: 0 auto;
        }

        .legal-section {
          background: rgba(255, 255, 255, 0.03);
          border: 2px solid #222;
          border-radius: 8px;
          padding: 2rem;
          margin-bottom: 2rem;
          animation: fadeInUp 0.6s ease;
        }

        .legal-section h2 {
          font-size: 1.75rem;
          font-weight: 900;
          margin-bottom: 1.5rem;
          color: var(--accent-green);
          letter-spacing: 1px;
        }

        .legal-section h3 {
          font-size: 1.25rem;
          font-weight: 700;
          margin: 2rem 0 1rem;
          color: var(--accent-orange);
        }

        .legal-section p {
          color: #ccc;
          line-height: 1.8;
          margin-bottom: 1.5rem;
        }

        .info-block {
          background: rgba(255, 255, 255, 0.05);
          padding: 1.5rem;
          border-left: 4px solid var(--accent-orange);
          border-radius: 4px;
        }

        .info-block strong {
          color: white;
        }

        .demo-notice {
          border: 2px solid var(--accent-orange);
          background: rgba(255, 107, 0, 0.05);
        }

        .demo-notice h2 {
          color: var(--accent-orange);
        }

        .demo-notice ul {
          margin: 1rem 0;
          padding-left: 1.5rem;
        }

        .demo-notice li {
          color: #ccc;
          line-height: 1.8;
          margin-bottom: 0.5rem;
        }

        .demo-notice strong {
          color: var(--accent-orange);
        }

        .legal-section a {
          color: var(--accent-orange);
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .legal-section a:hover {
          color: var(--accent-green);
        }

        .github-link {
          display: inline-block;
          margin-top: 0.5rem;
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .legal-page-container {
            padding: 1rem 1rem 3rem;
          }

          .legal-header h1 {
            font-size: 2rem;
          }

          .legal-section {
            padding: 1.5rem;
          }

          .legal-section h2 {
            font-size: 1.5rem;
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
