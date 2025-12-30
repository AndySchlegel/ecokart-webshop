'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Article } from '@/app/components/types';

// Sneaker sizes (US sizes) - copied from detail page
const SHOE_SIZES = ['7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12', '13'];

// Colors for clothing - copied from detail page
const COLORS = [
  { name: 'Schwarz', hex: '#000000' },
  { name: 'Weiß', hex: '#FFFFFF' },
  { name: 'Rot', hex: '#FF0000' },
  { name: 'Blau', hex: '#0000FF' },
  { name: 'Grün', hex: '#00FF00' },
];

function isShoeProduct(article: Article | null) {
  if (!article) return false;
  const category = article.category?.toLowerCase() ?? '';
  if (category === 'shoes' || category === 'shoe' || category === 'sneakers') return true;
  return /sneaker|runner|shoe/i.test(article.name);
}

function isApparelProduct(article: Article | null) {
  if (!article) return false;
  const category = article.category?.toLowerCase() ?? '';
  if (category === 'apparel' || category === 'clothing' || category === 'bekleidung') return true;
  return /hoodie|jacket|shirt|tee|trikot|shorts|sweat/i.test(article.name);
}

type QuickSelectModalProps = {
  product: Article | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (size?: string, color?: string) => Promise<void>;
};

export function QuickSelectModal({ product, isOpen, onClose, onAddToCart }: QuickSelectModalProps) {
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0].name);
  const [isAdding, setIsAdding] = useState(false);

  // Reset selections when product changes
  useEffect(() => {
    setSelectedSize('');
    setSelectedColor(COLORS[0].name);
  }, [product]);

  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  const handleAddToCart = async () => {
    // Validate size for shoes
    if (isShoeProduct(product) && !selectedSize) {
      alert('Bitte wähle eine Größe aus');
      return;
    }

    setIsAdding(true);
    try {
      await onAddToCart(selectedSize, selectedColor);
      onClose();
    } catch (error) {
      // Error is already handled in parent
    } finally {
      setIsAdding(false);
    }
  };

  const availableStock = product.stock !== undefined
    ? product.stock - (product.reserved || 0)
    : null;
  const isOutOfStock = availableStock !== null && availableStock <= 0;

  return (
    <>
      {/* Backdrop */}
      <div className="modal-backdrop" onClick={onClose} />

      {/* Modal */}
      <div className="modal-container">
        <div className="modal-content">
          {/* Close Button */}
          <button className="modal-close" onClick={onClose} aria-label="Schließen">
            ✕
          </button>

          {/* Product Image & Basic Info */}
          <div className="modal-header">
            <div className="modal-image">
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                sizes="300px"
                style={{ objectFit: 'cover' }}
              />
            </div>
            <div className="modal-info">
              <h2 className="modal-title">{product.name}</h2>
              <div className="modal-price">€{product.price.toFixed(2)}</div>

              {/* Stock Display */}
              {availableStock !== null && (
                <div className="modal-stock">
                  {isOutOfStock ? (
                    <span style={{ color: '#dc2626' }}>❌ Ausverkauft</span>
                  ) : availableStock <= 5 ? (
                    <span style={{ color: '#f59e0b' }}>⚠️ Nur noch {availableStock} auf Lager</span>
                  ) : (
                    <span style={{ color: '#10b981' }}>✅ Auf Lager</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Size Selection (for shoes) */}
          {isShoeProduct(product) && (
            <div className="modal-option">
              <label className="option-label">Größe auswählen:</label>
              <div className="size-grid">
                {SHOE_SIZES.map((size) => (
                  <button
                    key={size}
                    className={`size-button ${selectedSize === size ? 'selected' : ''}`}
                    onClick={() => setSelectedSize(size)}
                    type="button"
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color Selection (for apparel) */}
          {isApparelProduct(product) && (
            <div className="modal-option">
              <label className="option-label">Farbe: {selectedColor}</label>
              <div className="color-grid">
                {COLORS.map((color) => (
                  <button
                    key={color.name}
                    className={`color-button ${selectedColor === color.name ? 'selected' : ''}`}
                    onClick={() => setSelectedColor(color.name)}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                    type="button"
                  >
                    {selectedColor === color.name && <span className="checkmark">✓</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Add to Cart Button */}
          <button
            className="modal-cta"
            onClick={handleAddToCart}
            disabled={isAdding || isOutOfStock}
            type="button"
          >
            {isAdding
              ? 'Wird hinzugefügt...'
              : isOutOfStock
              ? 'Ausverkauft'
              : 'In den Warenkorb'}
          </button>
        </div>
      </div>

      <style jsx>{`
        .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.85);
          z-index: 9998;
          animation: fadeIn 0.2s ease;
        }

        .modal-container {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 2rem;
          animation: fadeIn 0.2s ease;
        }

        .modal-content {
          background: rgba(26, 26, 26, 0.98);
          border: 2px solid var(--accent-orange);
          border-radius: 8px;
          max-width: 600px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          padding: 2rem;
          position: relative;
          box-shadow: 0 20px 60px rgba(255, 107, 0, 0.3);
          animation: slideUp 0.3s ease;
        }

        .modal-close {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: transparent;
          border: 2px solid #666;
          color: #fff;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          font-size: 1.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1;
        }

        .modal-close:hover {
          border-color: var(--accent-orange);
          background: var(--accent-orange);
          color: #000;
          transform: rotate(90deg);
        }

        .modal-header {
          display: flex;
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .modal-image {
          position: relative;
          width: 150px;
          height: 150px;
          flex-shrink: 0;
          background: #000;
          border: 2px solid #333;
          border-radius: 4px;
          overflow: hidden;
        }

        .modal-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .modal-title {
          font-size: 1.5rem;
          font-weight: 900;
          margin: 0;
          color: #fff;
          text-transform: uppercase;
          letter-spacing: -0.02em;
          line-height: 1.2;
        }

        .modal-price {
          font-size: 1.75rem;
          font-weight: 900;
          color: var(--accent-orange);
        }

        .modal-stock {
          font-size: 1rem;
          font-weight: 600;
        }

        .modal-option {
          margin-bottom: 2rem;
        }

        .option-label {
          display: block;
          margin-bottom: 1rem;
          font-size: 1rem;
          font-weight: 700;
          color: var(--accent-green);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .size-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
          gap: 0.5rem;
        }

        .size-button {
          padding: 0.75rem;
          background: transparent;
          border: 2px solid #333;
          color: #fff;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          border-radius: 4px;
        }

        .size-button:hover {
          border-color: var(--accent-orange);
          background: rgba(255, 107, 0, 0.1);
        }

        .size-button.selected {
          border-color: var(--accent-orange);
          background: var(--accent-orange);
          color: #000;
        }

        .color-grid {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .color-button {
          width: 45px;
          height: 45px;
          border: 3px solid #333;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .color-button:hover {
          border-color: var(--accent-orange);
          transform: scale(1.1);
        }

        .color-button.selected {
          border-color: var(--accent-orange);
          box-shadow: 0 0 20px rgba(255, 107, 0, 0.5);
        }

        .checkmark {
          color: var(--accent-orange);
          font-size: 1.25rem;
          font-weight: 900;
          text-shadow: 0 0 10px rgba(0, 0, 0, 0.8);
        }

        .modal-cta {
          width: 100%;
          padding: 1.25rem;
          background: var(--accent-orange);
          border: none;
          color: #000;
          font-size: 1.125rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 2px;
          cursor: pointer;
          transition: all 0.3s ease;
          border-radius: 4px;
          margin-top: 1rem;
        }

        .modal-cta:hover:not(:disabled) {
          background: var(--accent-green);
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(0, 255, 135, 0.4);
        }

        .modal-cta:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 640px) {
          .modal-container {
            padding: 1rem;
          }

          .modal-content {
            padding: 1.5rem;
          }

          .modal-header {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }

          .modal-image {
            width: 200px;
            height: 200px;
          }

          .modal-title {
            font-size: 1.25rem;
          }

          .size-grid {
            grid-template-columns: repeat(auto-fill, minmax(50px, 1fr));
          }
        }
      `}</style>
    </>
  );
}
