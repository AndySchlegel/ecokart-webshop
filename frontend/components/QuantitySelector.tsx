'use client';

import React from 'react';

interface QuantitySelectorProps {
  quantity: number;
  onChange: (newQuantity: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
}

export function QuantitySelector({
  quantity,
  onChange,
  min = 1,
  max = 99,
  disabled = false,
}: QuantitySelectorProps) {
  const handleDecrease = () => {
    if (quantity > min && !disabled) {
      onChange(quantity - 1);
    }
  };

  const handleIncrease = () => {
    if (quantity < max && !disabled) {
      onChange(quantity + 1);
    }
  };

  const isMinReached = quantity <= min;
  const isMaxReached = quantity >= max;

  return (
    <div className="quantity-selector">
      <button
        type="button"
        onClick={handleDecrease}
        disabled={disabled || isMinReached}
        className="quantity-btn quantity-btn-decrease"
        aria-label="Menge verringern"
      >
        −
      </button>
      <span className="quantity-display">{quantity}</span>
      <button
        type="button"
        onClick={handleIncrease}
        disabled={disabled || isMaxReached}
        className="quantity-btn quantity-btn-increase"
        aria-label="Menge erhöhen"
      >
        +
      </button>

      <style jsx>{`
        .quantity-selector {
          display: inline-flex;
          align-items: center;
          gap: 0;
          background: var(--bg-dark, #1a1a1a);
          border: 2px solid var(--accent-green, #10b981);
          border-radius: 8px;
          overflow: hidden;
        }

        .quantity-btn {
          width: 44px;
          height: 44px;
          border: none;
          background: var(--bg-darker, #0a0a0a);
          color: var(--accent-green, #10b981);
          font-size: 1.5rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .quantity-btn:hover:not(:disabled) {
          background: var(--accent-green, #10b981);
          color: var(--bg-black, #000);
        }

        .quantity-btn:active:not(:disabled) {
          transform: scale(0.95);
        }

        .quantity-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .quantity-display {
          min-width: 50px;
          padding: 0 1rem;
          text-align: center;
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--text-light, #f5f5f5);
          background: var(--bg-dark, #1a1a1a);
          user-select: none;
        }

        /* Mobile optimizations */
        @media (max-width: 768px) {
          .quantity-btn {
            width: 40px;
            height: 40px;
            font-size: 1.25rem;
          }

          .quantity-display {
            min-width: 45px;
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  );
}
