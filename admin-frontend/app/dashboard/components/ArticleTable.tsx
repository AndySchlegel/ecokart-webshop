import React from 'react';

import type { Article } from '@/lib/articles';

type ArticleTableProps = {
  articles: Article[];
  onDelete: (id: string) => Promise<void>;
  onEdit: (article: Article) => void;
};

export function ArticleTable({ articles, onDelete, onEdit }: ArticleTableProps) {
  async function handleDelete(id: string, name: string) {
    if (!window.confirm(`Wirklich "${name}" löschen?`)) {
      return;
    }
    await onDelete(id);
  }

  if (articles.length === 0) {
    return (
      <div className="card">
        <h2>Keine Produkte</h2>
        <p>Noch keine Produkte vorhanden. Nutze das Formular unten, um neue anzulegen.</p>
      </div>
    );
  }

  return (
    <>
      {/* DIV-based Grid Layout - NO HTML table element */}
      <style jsx>{`
        .products-grid-container {
          overflow-x: auto;
          overflow-y: visible;
          background: var(--bg-dark);
          margin-top: 2rem;
          border-radius: 0;
          box-shadow: 0 8px 32px rgba(255, 107, 0, 0.15);
          -webkit-overflow-scrolling: touch;
        }

        .products-grid {
          display: grid;
          grid-template-columns: 80px 200px 100px 120px 100px 100px 100px minmax(250px, 1fr) 220px;
          min-width: 1200px;
          width: max-content;
        }

        .grid-header {
          display: contents;
        }

        .grid-header > div {
          padding: 1rem;
          text-align: left;
          font-weight: 700;
          text-transform: uppercase;
          font-size: 0.875rem;
          letter-spacing: 0.1em;
          color: var(--accent-orange);
          white-space: nowrap;
          background: var(--bg-darker);
          border-bottom: 2px solid var(--accent-orange);
          position: sticky;
          top: 0;
          z-index: 1;
        }

        .grid-row {
          display: contents;
        }

        .grid-row > div {
          padding: 1.25rem 1rem;
          border-bottom: 1px solid var(--bg-darker);
          color: var(--text-light-gray);
          display: flex;
          align-items: center;
        }

        .grid-row:hover > div {
          background: rgba(255, 107, 0, 0.05);
        }

        .grid-row img {
          width: 48px;
          height: 48px;
          object-fit: cover;
          border-radius: 4px;
          border: 1px solid var(--bg-darker);
        }

        .grid-actions {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
      `}</style>

      {/* Header Card */}
      <div className="card">
        <h2>Produkte verwalten</h2>
        <p style={{ color: 'var(--text-gray)', marginBottom: 0 }}>
          {articles.length} {articles.length === 1 ? 'Produkt' : 'Produkte'} gefunden
        </p>
      </div>

      {/* Grid Container - DIV-based, no HTML table */}
      <div className="products-grid-container">
        <div className="products-grid">
          {/* Header Row */}
          <div className="grid-header">
            <div>Bild</div>
            <div>Name</div>
            <div>Preis</div>
            <div>Kategorie</div>
            <div>Rating</div>
            <div>Reviews</div>
            <div>Lager</div>
            <div>Beschreibung</div>
            <div>Aktionen</div>
          </div>

          {/* Data Rows */}
          {articles.map((article) => (
            <div key={article.id} className="grid-row">
              <div>
                <img src={article.imageUrl} alt={article.name} />
              </div>
              <div>{article.name}</div>
              <div>{article.price.toFixed(2)} €</div>
              <div>{article.category || '–'}</div>
              <div>
                {article.rating ? `⭐ ${article.rating.toFixed(1)}` : '-'}
              </div>
              <div>{article.reviewCount || 0}</div>
              <div>
                {article.stock !== undefined ? (
                  <span style={{
                    color: article.stock <= 0 ? '#dc2626' : article.stock <= 10 ? '#f59e0b' : '#10b981',
                    fontWeight: '600'
                  }}>
                    {article.stock} {article.reserved ? `(${article.reserved} res.)` : ''}
                  </span>
                ) : '–'}
              </div>
              <div>{article.description}</div>
              <div className="grid-actions">
                <button
                  onClick={() => onEdit(article)}
                  className="button button--secondary"
                  type="button"
                >
                  Bearbeiten
                </button>
                <button
                  onClick={() => void handleDelete(article.id, article.name)}
                  className="button button--delete"
                  type="button"
                >
                  Löschen
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
