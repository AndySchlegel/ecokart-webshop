'use client';

import React from 'react';
import type { Article } from '@/lib/articles';

type ProductGridProps = {
  articles: Article[];
  onDelete: (id: string) => Promise<void>;
  onEdit: (article: Article) => void;
};

export function ProductGrid({ articles, onDelete, onEdit }: ProductGridProps) {
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
      <style jsx>{`
        .product-grid-header {
          background: var(--bg-dark);
          border: 2px solid transparent;
          border-radius: 0;
          padding: 2rem;
          box-shadow: 0 8px 32px rgba(255, 107, 0, 0.15);
          margin-bottom: 2rem;
        }

        .product-grid-header h2 {
          margin-bottom: 0.5rem;
        }

        .product-grid-header p {
          color: var(--text-gray);
          margin-bottom: 0;
        }

        .product-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        @media (max-width: 767px) {
          .product-grid {
            grid-template-columns: 1fr;
          }
        }

        .product-card {
          background: var(--bg-dark);
          border: 2px solid var(--bg-darker);
          border-radius: 0;
          overflow: hidden;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
        }

        .product-card:hover {
          border-color: var(--accent-orange);
          box-shadow: 0 12px 48px rgba(255, 107, 0, 0.25);
          transform: translateY(-4px);
        }

        .product-card-image {
          width: 100%;
          height: 240px;
          object-fit: cover;
          border-bottom: 2px solid var(--bg-darker);
        }

        .product-card-content {
          padding: 1.5rem;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .product-card-name {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-white);
          margin: 0;
          line-height: 1.3;
        }

        .product-card-info {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
          margin-top: auto;
        }

        .product-info-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .product-info-label {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--accent-orange);
          font-weight: 700;
        }

        .product-info-value {
          font-size: 0.875rem;
          color: var(--text-light-gray);
          font-weight: 600;
        }

        .product-price {
          font-size: 1.5rem;
          color: var(--accent-green);
        }

        .product-stock {
          font-weight: 700;
        }

        .product-stock.high {
          color: #10b981;
        }

        .product-stock.medium {
          color: #f59e0b;
        }

        .product-stock.low {
          color: #dc2626;
        }

        .product-rating {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .product-description {
          font-size: 0.875rem;
          color: var(--text-gray);
          line-height: 1.5;
          margin: 0.5rem 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .product-card-actions {
          display: flex;
          gap: 0.75rem;
          padding: 1.5rem;
          padding-top: 0;
        }

        .product-card-actions button {
          flex: 1;
          border: 2px solid;
          border-radius: 0;
          padding: 0.75rem 1rem;
          font-size: 0.875rem;
          font-weight: 700;
          background: transparent;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          position: relative;
          overflow: hidden;
          white-space: nowrap;
        }

        .product-card-actions button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          transition: left 0.3s ease;
          z-index: -1;
        }

        .product-card-actions button:hover::before {
          left: 0;
        }

        .product-card-actions button:active {
          transform: translateY(1px);
        }

        .btn-edit {
          border-color: var(--accent-green);
          color: var(--accent-green);
        }

        .btn-edit::before {
          background: var(--accent-green);
        }

        .btn-edit:hover {
          color: var(--bg-black);
        }

        .btn-delete {
          border-color: #ff4444;
          color: #ff4444;
        }

        .btn-delete::before {
          background: #ff4444;
        }

        .btn-delete:hover {
          color: var(--bg-black);
        }
      `}</style>

      {/* Header Card */}
      <div className="product-grid-header">
        <h2>Produkte verwalten</h2>
        <p>
          {articles.length} {articles.length === 1 ? 'Produkt' : 'Produkte'} gefunden
        </p>
      </div>

      {/* Product Grid */}
      <div className="product-grid">
        {articles.map((article) => {
          const availableStock = (article.stock ?? 0) - (article.reserved ?? 0);
          const stockStatus = availableStock <= 0 ? 'low' : availableStock <= 10 ? 'medium' : 'high';

          return (
            <div key={article.id} className="product-card">
              {/* Product Image */}
              <img
                src={article.imageUrl}
                alt={article.name}
                className="product-card-image"
              />

              {/* Product Content */}
              <div className="product-card-content">
                <h3 className="product-card-name">{article.name}</h3>

                {article.description && (
                  <p className="product-description">{article.description}</p>
                )}

                {/* Product Info Grid */}
                <div className="product-card-info">
                  {/* Price */}
                  <div className="product-info-item" style={{ gridColumn: '1 / -1' }}>
                    <span className="product-info-label">Preis</span>
                    <span className="product-info-value product-price">
                      {article.price.toFixed(2)} €
                    </span>
                  </div>

                  {/* Category */}
                  <div className="product-info-item">
                    <span className="product-info-label">Kategorie</span>
                    <span className="product-info-value">
                      {article.category || '–'}
                    </span>
                  </div>

                  {/* Stock */}
                  <div className="product-info-item">
                    <span className="product-info-label">Lager</span>
                    <span className={`product-info-value product-stock ${stockStatus}`}>
                      {article.stock !== undefined ? (
                        <>
                          {availableStock}
                          {article.reserved ? ` (${article.reserved} res.)` : ''}
                        </>
                      ) : '–'}
                    </span>
                  </div>

                  {/* Rating */}
                  <div className="product-info-item">
                    <span className="product-info-label">Rating</span>
                    <span className="product-info-value product-rating">
                      {article.rating ? (
                        <>
                          ⭐ {article.rating.toFixed(1)}
                        </>
                      ) : '–'}
                    </span>
                  </div>

                  {/* Reviews */}
                  <div className="product-info-item">
                    <span className="product-info-label">Reviews</span>
                    <span className="product-info-value">
                      {article.reviewCount || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="product-card-actions">
                <button
                  type="button"
                  onClick={() => onEdit(article)}
                  className="btn-edit"
                >
                  Bearbeiten
                </button>
                <button
                  type="button"
                  onClick={() => void handleDelete(article.id, article.name)}
                  className="btn-delete"
                >
                  Löschen
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
