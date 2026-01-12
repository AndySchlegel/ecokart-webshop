'use client';

import React, { useEffect, useState } from 'react';

interface TagStats {
  tag: string;
  count: number;
  products: string[]; // product IDs
}

export default function TagManagementPage() {
  const [tags, setTags] = useState<TagStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadTags() {
    setIsLoading(true);
    setError(null);
    try {
      const apiUrl = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');
      const response = await fetch(`${apiUrl}/api/products`, { cache: 'no-store' });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.message ?? 'Artikel konnten nicht geladen werden.');
      }

      const products = payload.items || [];

      // Extract and count tags
      const tagMap = new Map<string, { count: number; products: string[] }>();

      products.forEach((product: any) => {
        const productTags = product.tags || [];
        productTags.forEach((tag: string) => {
          const existing = tagMap.get(tag) || { count: 0, products: [] };
          existing.count++;
          existing.products.push(product.id);
          tagMap.set(tag, existing);
        });
      });

      // Convert to array and sort by count (descending)
      const tagStatsArray: TagStats[] = Array.from(tagMap.entries())
        .map(([tag, stats]) => ({ tag, count: stats.count, products: stats.products }))
        .sort((a, b) => b.count - a.count);

      setTags(tagStatsArray);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler beim Laden.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadTags();
  }, []);

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Tag-Verwaltung</h1>
        <p className="text-gray-400 mt-1">
          Übersicht aller verwendeten Tags und deren Häufigkeit
        </p>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {isLoading && (
          <div className="card loading">
            Lade Tags...
          </div>
        )}

        {error && (
          <div className="message message--error">
            {error}
          </div>
        )}

        {!isLoading && !error && (
          <div className="card">
            <h2>Alle Tags ({tags.length})</h2>
            <p style={{ color: 'var(--text-gray)', marginBottom: '2rem' }}>
              Verwendung und Häufigkeit aller Tags im Shop
            </p>

            {tags.length === 0 ? (
              <p style={{ color: 'var(--text-gray)', textAlign: 'center', padding: '2rem' }}>
                Keine Tags gefunden. Füge Tags zu Produkten hinzu, um sie hier zu sehen.
              </p>
            ) : (
              <div className="tag-grid">
                {tags.map((tagStat) => (
                  <div key={tagStat.tag} className="tag-card">
                    <div className="tag-card__header">
                      <span className="tag-card__name">{tagStat.tag}</span>
                      <span className="tag-card__count">{tagStat.count}</span>
                    </div>
                    <div className="tag-card__footer">
                      <span className="tag-card__label">
                        {tagStat.count === 1 ? '1 Produkt' : `${tagStat.count} Produkte`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        .tag-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 1rem;
        }

        .tag-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid #333;
          border-radius: 8px;
          padding: 1rem;
          transition: all 0.3s ease;
        }

        .tag-card:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: var(--accent-orange);
          transform: translateY(-2px);
        }

        .tag-card__header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .tag-card__name {
          font-size: 1rem;
          font-weight: 600;
          color: white;
          text-transform: capitalize;
        }

        .tag-card__count {
          background: var(--accent-orange);
          color: #000;
          font-size: 0.875rem;
          font-weight: 700;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
        }

        .tag-card__footer {
          border-top: 1px solid #333;
          padding-top: 0.5rem;
          margin-top: 0.5rem;
        }

        .tag-card__label {
          font-size: 0.75rem;
          color: var(--text-gray);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
      `}</style>
    </div>
  );
}
