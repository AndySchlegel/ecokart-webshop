// ============================================================================
// Top Products Component - Best Selling Products List
// ============================================================================
// Purpose: Display top 5 selling products ranked by sales count
//
// Features:
// - Ranked list with #1, #2, #3, etc.
// - Product name + sales count
// - Visual ranking badges
// - Responsive design
// ============================================================================

'use client';

import React from 'react';

export interface TopProduct {
  id: string;
  name: string;
  salesCount: number;
}

interface TopProductsProps {
  products: TopProduct[];
}

export function TopProducts({ products }: TopProductsProps) {
  // Get medal emoji for top 3
  const getMedalEmoji = (rank: number): string => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '';
    }
  };

  // Get rank badge color
  const getRankBadgeColor = (rank: number): string => {
    switch (rank) {
      case 1: return 'bg-yellow-100 text-yellow-800';
      case 2: return 'bg-gray-100 text-gray-800';
      case 3: return 'bg-orange-100 text-orange-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Top 5 Produkte
      </h3>

      {products.length === 0 ? (
        <p className="text-gray-500 text-center py-8">Keine Verkaufsdaten verfügbar</p>
      ) : (
        <div className="space-y-3">
          {products.map((product, index) => {
            const rank = index + 1;
            const medal = getMedalEmoji(rank);
            const badgeColor = getRankBadgeColor(rank);

            return (
              <div
                key={product.id}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {/* Left: Rank + Product Name */}
                <div className="flex items-center space-x-3 flex-1">
                  <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${badgeColor}`}>
                    {medal || `#${rank}`}
                  </span>
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {product.name}
                  </span>
                </div>

                {/* Right: Sales Count */}
                <div className="ml-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {product.salesCount} verkauft
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
