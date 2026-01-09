'use client';

import Link from 'next/link';

export default function DatenschutzPage() {
  return (
    <div className="legal-page-container">
      <div className="legal-header">
        <Link href="/" className="back-link">
          ← Zurück zum Shop
        </Link>
        <h1>DATENSCHUTZERKLÄRUNG</h1>
        <p className="legal-subtitle">Informationen zur Datenverarbeitung gemäß DSGVO</p>
      </div>

      <div className="legal-content">
        <section className="legal-section demo-notice">
          <h2>⚠️ Wichtiger Hinweis</h2>
          <p>
            <strong>Dies ist ein Portfolio-Projekt zu Demonstrationszwecken.</strong>
          </p>
          <p>
            Es werden <strong>keine echten Produkte verkauft</strong> und{' '}
            <strong>keine echten Zahlungen verarbeitet</strong>. Alle Daten dienen ausschließlich
            Demonstrationszwecken und werden vertraulich behandelt.
          </p>
        </section>

        <section className="legal-section">
          <h2>1. Datenschutz auf einen Blick</h2>

          <h3>Allgemeine Hinweise</h3>
          <p>
            Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren
            personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene
            Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können.
          </p>

          <h3>Datenerfassung auf dieser Website</h3>
          <p>
            <strong>Wer ist verantwortlich für die Datenerfassung auf dieser Website?</strong>
          </p>
          <p>
            Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen
            Kontaktdaten können Sie dem Impressum dieser Website entnehmen.
          </p>

          <p>
            <strong>Wie erfassen wir Ihre Daten?</strong>
          </p>
          <p>
            Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen. Hierbei
            kann es sich z.B. um Daten handeln, die Sie in ein Kontaktformular eingeben oder bei
            der Registrierung angeben.
          </p>
        </section>

        <section className="legal-section">
          <h2>2. Verarbeitete Daten</h2>

          <h3>Registrierung & Authentifizierung (AWS Cognito)</h3>
          <p className="info-block">
            <strong>Welche Daten:</strong> E-Mail-Adresse, Passwort (verschlüsselt)
            <br />
            <strong>Zweck:</strong> Benutzerauthentifizierung, Kontoverwaltung
            <br />
            <strong>Rechtsgrundlage:</strong> Vertragserfüllung (Art. 6 Abs. 1 lit. b DSGVO)
            <br />
            <strong>Speicherdauer:</strong> Bis zur Kontolöschung
            <br />
            <strong>Verarbeiter:</strong> AWS Cognito (Amazon Web Services)
          </p>

          <h3>Bestelldaten (DynamoDB)</h3>
          <p className="info-block">
            <strong>Welche Daten:</strong> Name, Lieferadresse (Straße, PLZ, Stadt), Bestellhistorie
            <br />
            <strong>Zweck:</strong> Bestellabwicklung (Demo), Order History
            <br />
            <strong>Rechtsgrundlage:</strong> Vertragserfüllung (Art. 6 Abs. 1 lit. b DSGVO)
            <br />
            <strong>Speicherdauer:</strong> Bis zur Löschung durch Benutzer
            <br />
            <strong>Verarbeiter:</strong> AWS DynamoDB (Amazon Web Services)
          </p>

          <h3>Zahlungsinformationen (Stripe)</h3>
          <p className="info-block">
            <strong>Welche Daten:</strong> KEINE! Kreditkartendaten werden ausschließlich von Stripe
            verarbeitet
            <br />
            <strong>Zweck:</strong> Zahlungsabwicklung (Test-Modus)
            <br />
            <strong>Rechtsgrundlage:</strong> Vertragserfüllung (Art. 6 Abs. 1 lit. b DSGVO)
            <br />
            <strong>Hinweis:</strong> Wir speichern KEINE Zahlungsdaten. Stripe ist PCI-DSS Level 1
            zertifiziert
            <br />
            <strong>Verarbeiter:</strong> Stripe, Inc. (USA, EU-US Data Privacy Framework)
          </p>

          <h3>E-Mail-Versand (Resend API)</h3>
          <p className="info-block">
            <strong>Welche Daten:</strong> E-Mail-Adresse, Bestellbestätigungen
            <br />
            <strong>Zweck:</strong> Transaktions-E-Mails (Bestellbestätigungen)
            <br />
            <strong>Rechtsgrundlage:</strong> Vertragserfüllung (Art. 6 Abs. 1 lit. b DSGVO)
            <br />
            <strong>Verarbeiter:</strong> Resend (USA, EU-US Data Privacy Framework)
          </p>
        </section>

        <section className="legal-section">
          <h2>3. Hosting & AWS Services</h2>

          <p>
            Diese Website wird gehostet bei Amazon Web Services (AWS). Die Server-Standorte befinden
            sich in der <strong>EU-Region eu-central-1 (Frankfurt, Deutschland)</strong>.
          </p>

          <h3>Genutzte AWS Services:</h3>
          <ul>
            <li>
              <strong>AWS Lambda:</strong> Backend-API (Node.js, keine persistente Datenspeicherung)
            </li>
            <li>
              <strong>AWS DynamoDB:</strong> Datenbank (Benutzer, Bestellungen, Warenkorb)
            </li>
            <li>
              <strong>AWS Cognito:</strong> Authentifizierung & Benutzerverwaltung
            </li>
            <li>
              <strong>AWS Amplify:</strong> Frontend-Hosting (Next.js)
            </li>
            <li>
              <strong>AWS CloudFront:</strong> Content Delivery Network (CDN) für Assets
            </li>
            <li>
              <strong>AWS S3:</strong> Speicherung von Produkt-Bildern
            </li>
          </ul>

          <p>
            AWS ist DSGVO-konform und bietet Data Processing Agreements (DPA) nach Art. 28 DSGVO.
            <br />
            Weitere Informationen:{' '}
            <a
              href="https://aws.amazon.com/de/compliance/gdpr-center/"
              target="_blank"
              rel="noopener noreferrer"
            >
              AWS GDPR Center
            </a>
          </p>
        </section>

        <section className="legal-section">
          <h2>4. Cookies</h2>

          <h3>Welche Cookies verwenden wir?</h3>
          <p>Diese Website verwendet ausschließlich technisch notwendige Cookies:</p>

          <ul>
            <li>
              <strong>Session-Token (Cognito):</strong> Authentifizierung (JWT Token)
            </li>
            <li>
              <strong>Cart State:</strong> Warenkorb-Persistierung
            </li>
          </ul>

          <p>
            <strong>Keine Tracking-Cookies:</strong> Wir verwenden KEINE Analytics, Werbung oder
            Tracking-Cookies. Keine Google Analytics, Facebook Pixel oder ähnliche Tools.
          </p>
        </section>

        <section className="legal-section">
          <h2>5. Ihre Rechte</h2>

          <p>Sie haben folgende Rechte bezüglich Ihrer personenbezogenen Daten:</p>

          <h3>Auskunftsrecht (Art. 15 DSGVO)</h3>
          <p>
            Sie haben das Recht, jederzeit Auskunft über die von uns verarbeiteten personenbezogenen
            Daten zu erhalten.
          </p>

          <h3>Recht auf Berichtigung (Art. 16 DSGVO)</h3>
          <p>
            Sie haben das Recht, die Berichtigung unrichtiger oder die Vervollständigung
            unvollständiger personenbezogener Daten zu verlangen.
          </p>

          <h3>Recht auf Löschung (Art. 17 DSGVO)</h3>
          <p>
            Sie haben das Recht, die Löschung Ihrer personenbezogenen Daten zu verlangen. Dies
            können Sie jederzeit über Ihr Benutzerkonto durchführen oder uns kontaktieren.
          </p>

          <h3>Recht auf Datenübertragbarkeit (Art. 20 DSGVO)</h3>
          <p>
            Sie haben das Recht, die Sie betreffenden personenbezogenen Daten in einem
            strukturierten, gängigen und maschinenlesbaren Format zu erhalten.
          </p>

          <h3>Widerspruchsrecht (Art. 21 DSGVO)</h3>
          <p>
            Sie haben das Recht, jederzeit gegen die Verarbeitung Sie betreffender
            personenbezogener Daten Widerspruch einzulegen.
          </p>

          <h3>Beschwerderecht</h3>
          <p>
            Sie haben das Recht, sich bei einer Aufsichtsbehörde zu beschweren, wenn Sie der
            Ansicht sind, dass die Verarbeitung Ihrer Daten gegen Datenschutzrecht verstößt.
          </p>
        </section>

        <section className="legal-section">
          <h2>6. Datensicherheit</h2>

          <h3>Technische Maßnahmen</h3>
          <ul>
            <li>
              <strong>HTTPS/TLS:</strong> Alle Datenübertragungen sind verschlüsselt
            </li>
            <li>
              <strong>AWS IAM:</strong> Least-Privilege Zugriffskontrolle
            </li>
            <li>
              <strong>Encryption at Rest:</strong> DynamoDB-Daten sind verschlüsselt gespeichert
            </li>
            <li>
              <strong>JWT Tokens:</strong> Kurze Lebensdauer (1 Stunde), sichere Signierung
            </li>
            <li>
              <strong>CloudWatch Monitoring:</strong> 24/7 Sicherheitsüberwachung
            </li>
            <li>
              <strong>Security Scanning:</strong> Automatische Scans mit tfsec, Checkov, Trufflehog
            </li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>7. Datenlöschung</h2>

          <h3>Wie Sie Ihre Daten löschen können:</h3>
          <p>
            Da dies ein Demo-Projekt ist, können Sie Ihre Daten jederzeit löschen lassen. Senden
            Sie uns einfach eine E-Mail an:{' '}
            <a href="mailto:andy.schlegel@chakademie.org">andy.schlegel@chakademie.org</a>
          </p>

          <p>
            <strong>Was wird gelöscht:</strong>
          </p>
          <ul>
            <li>Cognito User Account</li>
            <li>DynamoDB Bestellhistorie</li>
            <li>Warenkorb-Daten</li>
          </ul>

          <p>
            <strong>Löschfristen:</strong> Daten werden innerhalb von 7 Tagen nach Ihrer Anfrage
            vollständig gelöscht.
          </p>
        </section>

        <section className="legal-section">
          <h2>8. Kontakt</h2>

          <p className="info-block">
            Bei Fragen zum Datenschutz oder zur Ausübung Ihrer Rechte kontaktieren Sie uns:
            <br />
            <br />
            <strong>E-Mail:</strong>{' '}
            <a href="mailto:andy.schlegel@chakademie.org">andy.schlegel@chakademie.org</a>
            <br />
            <strong>Impressum:</strong> <Link href="/impressum">Siehe Impressum</Link>
          </p>
        </section>

        <section className="legal-section">
          <h2>9. Änderungen dieser Datenschutzerklärung</h2>
          <p>
            Wir behalten uns vor, diese Datenschutzerklärung anzupassen, damit sie stets den
            aktuellen rechtlichen Anforderungen entspricht oder um Änderungen unserer Leistungen in
            der Datenschutzerklärung umzusetzen.
          </p>
          <p>
            <strong>Stand:</strong> 9. Januar 2026
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

        .legal-section ul {
          margin: 1rem 0 1.5rem 1.5rem;
          color: #ccc;
          line-height: 1.8;
        }

        .legal-section li {
          margin-bottom: 0.75rem;
        }

        .legal-section strong {
          color: white;
        }

        .info-block {
          background: rgba(255, 255, 255, 0.05);
          padding: 1.5rem;
          border-left: 4px solid var(--accent-orange);
          border-radius: 4px;
        }

        .demo-notice {
          border: 2px solid var(--accent-orange);
          background: rgba(255, 107, 0, 0.05);
        }

        .demo-notice h2 {
          color: var(--accent-orange);
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
