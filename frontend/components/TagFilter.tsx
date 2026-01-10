'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

interface TagFilterProps {
  availableTags: string[];
}

export default function TagFilter({ availableTags }: TagFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isExpanded, setIsExpanded] = useState(false);

  // Parse active tags from URL
  const activeTags = searchParams.get('tags')?.split(',').filter(Boolean) || [];

  const handleTagToggle = (tag: string) => {
    const params = new URLSearchParams(searchParams.toString());
    let newTags: string[];

    if (activeTags.includes(tag)) {
      // Remove tag
      newTags = activeTags.filter((t) => t !== tag);
    } else {
      // Add tag
      newTags = [...activeTags, tag];
    }

    if (newTags.length > 0) {
      params.set('tags', newTags.join(','));
    } else {
      params.delete('tags');
    }

    router.push(`/?${params.toString()}#featured-products`);
  };

  const handleClearAll = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('tags');
    router.push(`/?${params.toString()}#featured-products`);
  };

  // Don't render if no tags available
  if (availableTags.length === 0) {
    return null;
  }

  // Show first 6 tags by default, expand to show all
  const displayedTags = isExpanded ? availableTags : availableTags.slice(0, 6);

  return (
    <div className="tag-filter-container">
      <div className="tag-filter">
        <div className="tag-filter-header">
          <span className="filter-label">Filter:</span>
          {activeTags.length > 0 && (
            <button
              className="clear-button"
              onClick={handleClearAll}
              type="button"
            >
              Filter löschen
            </button>
          )}
        </div>

        <div className="tag-list">
          {displayedTags.map((tag) => (
            <button
              key={tag}
              className={`tag ${activeTags.includes(tag) ? 'active' : ''}`}
              onClick={() => handleTagToggle(tag)}
              type="button"
            >
              {tag}
            </button>
          ))}

          {availableTags.length > 6 && (
            <button
              className="expand-button"
              onClick={() => setIsExpanded(!isExpanded)}
              type="button"
            >
              {isExpanded ? '← Weniger' : `+ ${availableTags.length - 6} mehr`}
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        .tag-filter-container {
          width: 100%;
          background: rgba(0, 0, 0, 0.4);
          border-bottom: 1px solid #222;
        }

        .tag-filter {
          max-width: 1400px;
          margin: 0 auto;
          padding: 1rem 2rem;
        }

        .tag-filter-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 0.75rem;
        }

        .filter-label {
          font-size: 0.875rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #999;
        }

        .clear-button {
          background: transparent;
          border: 1px solid var(--accent-orange);
          color: var(--accent-orange);
          padding: 0.25rem 0.75rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .clear-button:hover {
          background: var(--accent-orange);
          color: #000;
        }

        .tag-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .tag {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid #333;
          color: #ccc;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: capitalize;
        }

        .tag:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: var(--accent-green);
          color: var(--accent-green);
          transform: translateY(-2px);
        }

        .tag.active {
          background: var(--accent-orange);
          border-color: var(--accent-orange);
          color: #000;
          font-weight: 700;
        }

        .expand-button {
          background: transparent;
          border: 1px dashed #444;
          color: #999;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .expand-button:hover {
          border-color: var(--accent-green);
          color: var(--accent-green);
        }

        @media (max-width: 768px) {
          .tag-filter {
            padding: 0.875rem 1rem;
          }

          .tag {
            padding: 0.375rem 0.75rem;
            font-size: 0.8rem;
          }

          .filter-label {
            font-size: 0.8rem;
          }
        }
      `}</style>
    </div>
  );
}
