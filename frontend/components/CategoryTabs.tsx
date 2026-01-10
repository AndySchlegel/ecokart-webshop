'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export default function CategoryTabs() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeGroup = searchParams.get('targetGroup') || 'alle';

  const tabs = [
    { id: 'alle', label: 'Alle' },
    { id: 'kinder', label: 'Kinder' },
    { id: 'männer', label: 'Männer' },
    { id: 'frauen', label: 'Frauen' }
  ];

  const handleTabClick = (tabId: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (tabId === 'alle') {
      params.delete('targetGroup');
    } else {
      params.set('targetGroup', tabId);
    }

    // Preserve other params (category, search, etc.)
    router.push(`/?${params.toString()}#featured-products`);
  };

  return (
    <div className="category-tabs-container">
      <div className="category-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab ${activeGroup === tab.id ? 'active' : ''}`}
            onClick={() => handleTabClick(tab.id)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>

      <style jsx>{`
        .category-tabs-container {
          width: 100%;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(10px);
          border-bottom: 2px solid #222;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .category-tabs {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          gap: 0;
          padding: 0;
          overflow-x: auto;
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* IE/Edge */
        }

        .category-tabs::-webkit-scrollbar {
          display: none; /* Chrome/Safari */
        }

        .tab {
          flex: 1;
          min-width: 100px;
          padding: 1rem 1.5rem;
          background: transparent;
          border: none;
          border-bottom: 3px solid transparent;
          color: #999;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          white-space: nowrap;
        }

        .tab:hover {
          background: rgba(255, 255, 255, 0.05);
          color: #fff;
        }

        .tab.active {
          color: var(--accent-orange);
          border-bottom-color: var(--accent-orange);
          background: rgba(255, 107, 0, 0.1);
        }

        /* Mobile: Make tabs scrollable */
        @media (max-width: 640px) {
          .tab {
            min-width: 90px;
            padding: 0.875rem 1rem;
            font-size: 0.875rem;
            letter-spacing: 1px;
          }
        }

        @media (max-width: 480px) {
          .tab {
            min-width: 80px;
            padding: 0.75rem 0.75rem;
            font-size: 0.8rem;
            letter-spacing: 0.5px;
          }
        }
      `}</style>
    </div>
  );
}
