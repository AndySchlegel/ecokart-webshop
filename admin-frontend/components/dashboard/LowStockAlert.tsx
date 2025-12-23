// ============================================================================
// Low Stock Alert Component - Products with Low Inventory
// ============================================================================
// Purpose: Display alert list of products with low stock (< 10 items)
//
// Features:
// - Warning badge for low stock products
// - Product name + current stock
// - Color-coded stock levels (red = critical, yellow = warning)
// - Sorted by stock ascending (lowest first)
// ============================================================================

'use client';

import React from 'react';

export interface LowStockProduct {
  id: string;
  name: string;
  stock: number;
}

interface LowStockAlertProps {
  products: LowStockProduct[];
}

export function LowStockAlert({ products }: LowStockAlertProps) {
  // Get stock level badge color based on quantity
  const getStockBadgeColor = (stock: number): string => {
    if (stock === 0) return 'bg-red-100 text-red-800 border-red-200';
    if (stock <= 3) return 'bg-red-100 text-red-800 border-red-200';
    if (stock <= 5) return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  };

  // Get warning icon based on stock level
  const getWarningIcon = (stock: number) => {
    if (stock === 0) {
      return (
        <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      );
    }
    return (
      <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    );
  };

  return (
    <div className="bg-bg-dark border-2 border-bg-darker rounded-lg shadow-md p-6 hover:border-accent-orange transition-all">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">
          Niedriger Lagerbestand
        </h3>
        {products.length > 0 && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            {products.length} Produkt{products.length !== 1 ? 'e' : ''}
          </span>
        )}
      </div>

      {products.length === 0 ? (
        <div className="text-center py-8">
          <svg className="mx-auto h-12 w-12 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="mt-2 text-sm text-gray-400">Alle Produkte haben ausreichend Lagerbestand</p>
        </div>
      ) : (
        <div className="space-y-2">
          {products.map((product) => {
            const badgeColor = getStockBadgeColor(product.stock);
            const warningIcon = getWarningIcon(product.stock);

            return (
              <div
                key={product.id}
                className="flex items-center justify-between p-3 rounded-lg border border-bg-darker hover:bg-bg-darker transition-colors"
              >
                {/* Left: Warning Icon + Product Name */}
                <div className="flex items-center space-x-3 flex-1">
                  {warningIcon}
                  <span className="text-sm font-medium text-white truncate">
                    {product.name}
                  </span>
                </div>

                {/* Right: Stock Badge */}
                <div className="ml-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold border ${badgeColor}`}>
                    {product.stock === 0 ? 'Ausverkauft' : `${product.stock} auf Lager`}
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
