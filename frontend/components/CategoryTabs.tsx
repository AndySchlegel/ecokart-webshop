'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export default function CategoryTabs() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeGroup = searchParams.get('targetGroup') || 'alle';

  const tabs = [
    { id: 'alle', label: 'Alle', icon: '🏠' },
    { id: 'kinder', label: 'Kinder', icon: '👦' },
    { id: 'männer', label: 'Männer', icon: '👨' },
    { id: 'frauen', label: 'Frauen', icon: '👩' }
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
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
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
          min-width: 120px;
          padding: 1rem 1.5rem;
          background: transparent;
          border: none;
          border-bottom: 3px solid transparent;
          color: #999;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
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

        .tab-icon {
          font-size: 1.2rem;
        }

        .tab-label {
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        /* Mobile: Stack tabs or make them scrollable */
        @media (max-width: 640px) {
          .tab {
            min-width: 100px;
            padding: 0.875rem 1rem;
            font-size: 0.875rem;
          }

          .tab-icon {
            font-size: 1rem;
          }

          .tab-label {
            letter-spacing: 0.5px;
          }
        }

        @media (max-width: 480px) {
          .tab {
            flex-direction: column;
            gap: 0.25rem;
            padding: 0.75rem 0.5rem;
          }

          .tab-icon {
            font-size: 1.25rem;
          }

          .tab-label {
            font-size: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
}
