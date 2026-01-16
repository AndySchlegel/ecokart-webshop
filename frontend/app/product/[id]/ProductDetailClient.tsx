'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Navigation from '../../../components/Navigation';
import { useCart } from '../../../contexts/CartContext';
import { useAuth } from '../../../contexts/AuthContext';
import { Article } from '../../components/types';
import { QuantitySelector } from '../../../components/QuantitySelector';
import FavoriteButton from '../../../components/wishlist/FavoriteButton';

// Sneaker sizes (US sizes)
const SHOE_SIZES = ['7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12', '13'];

// Colors for clothing (placeholder - can be extended later)
const COLORS = [
  { name: 'Schwarz', hex: '#000000' },
  { name: 'Weiß', hex: '#FFFFFF' },
  { name: 'Rot', hex: '#FF0000' },
  { name: 'Blau', hex: '#0000FF' },
  { name: 'Grün', hex: '#00FF00' },
];

function isShoeProduct(article: Article | null) {
  if (!article) {
    return false;
  }
  const category = article.category?.toLowerCase() ?? '';
  if (category === 'shoes' || category === 'shoe' || category === 'sneakers') {
    return true;
  }
  return /sneaker|runner|shoe/i.test(article.name);
}

function isApparelProduct(article: Article | null) {
  if (!article) {
    return false;
  }
  const category = article.category?.toLowerCase() ?? '';
  if (category === 'apparel' || category === 'clothing' || category === 'bekleidung') {
    return true;
  }
  return /hoodie|jacket|shirt|tee|trikot|shorts|sweat/i.test(article.name);
}

export default function ProductDetailClient({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0].name);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [addedQuantity, setAddedQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [fromAnchor, setFromAnchor] = useState<string | null>(null);

  // ✅ SALE: Calculate discount percentage
  const discountPercentage = product?.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  // Get search params on client side only
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      setFromAnchor(searchParams.get('from'));
    }
  }, []);

  useEffect(() => {
    // ✅ CRITICAL FIX: Only run in browser (not SSR)
    if (typeof window === 'undefined') {
      return;
    }

    let cancelled = false;

    async function loadProduct() {
      try {
        // ✅ FIX: Use environment variable with fallback
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.aws.his4irness23.de';
        const url = `${apiUrl}/api/products/${params.id}`;

        console.log('Fetching product from:', url);
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!cancelled) {
          if (!response.ok) {
            if (response.status === 404) {
              throw new Error('Produkt nicht gefunden');
            }
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
          }
          const data = await response.json();
          setProduct(data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Product fetch error:', err);
          setError(err instanceof Error ? err.message : 'Fehler beim Laden des Produkts');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadProduct();

    return () => {
      cancelled = true;
    };
  }, [params.id]);

  const handleAddToCart = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    // Check if size is selected for shoes
    if (isShoeProduct(product) && !selectedSize) {
      alert('Bitte wähle eine Größe aus');
      return;
    }

    setIsAdding(true);
    try {
      await addToCart(product!.id, quantity);
      setAddedQuantity(quantity);
      setShowSuccess(true);
      setQuantity(1);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error: any) {
      alert(error.message || 'Fehler beim Hinzufügen zum Warenkorb');
    } finally {
      setIsAdding(false);
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<span key={i} className="star star--full">★</span>);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<span key={i} className="star star--half">★</span>);
      } else {
        stars.push(<span key={i} className="star star--empty">★</span>);
      }
    }
    return stars;
  };

  if (isLoading) {
    return (
      <>
        <Navigation />
        <div className="product-detail-page">
          <div className="product-loading">Lade Produkt...</div>
        </div>
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <Navigation />
        <div className="product-detail-page">
          <div className="product-error">
            <h2>Fehler</h2>
            <p>{error || 'Produkt nicht gefunden'}</p>
            <button onClick={() => router.push('/')} className="back-button">
              Zurück zum Shop
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <div className="product-detail-page">
        <button
          onClick={() => {
            if (fromAnchor) {
              router.push(`/#${fromAnchor}`);
            } else {
              router.push('/#featured-products');
            }
          }}
          className="back-button"
        >
          ← Zurück zum Shop
        </button>

        <div className="product-detail-container">
          {/* Product Image */}
          <div className="product-image-section">
            <div className="product-image-wrapper">
              {/* ✅ SALE BADGE */}
              {product.originalPrice && discountPercentage && (
                <div className="product-sale-badge">
                  -{discountPercentage}%
                </div>
              )}
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                style={{ objectFit: 'cover' }}
                priority
              />
            </div>
          </div>

          {/* Product Info */}
          <div className="product-info-section">
            <h1 className="product-title">{product.name}</h1>

            {/* Rating */}
            {product.rating && (
              <div className="product-rating">
                <div className="stars">
                  {renderStars(product.rating)}
                </div>
                <span className="rating-text">
                  {product.rating.toFixed(1)} {product.reviewCount && `(${product.reviewCount} Bewertungen)`}
                </span>
              </div>
            )}

            {/* Price */}
            {product.originalPrice ? (
              <div className="product-price-container">
                <div className="product-price--original">€{product.originalPrice.toFixed(2)}</div>
                <div className="product-price--sale">€{product.price.toFixed(2)}</div>
              </div>
            ) : (
              <div className="product-price">€{product.price.toFixed(2)}</div>
            )}

            {/* ✅ INVENTORY: Stock Display */}
            {product.stock !== undefined && (
              <div className="product-stock">
                {product.stock - (product.reserved || 0) <= 0 ? (
                  <span style={{ color: '#dc2626', fontSize: '1.25rem', fontWeight: '700' }}>
                    ❌ Ausverkauft
                  </span>
                ) : product.stock - (product.reserved || 0) <= 5 ? (
                  <span style={{ color: '#f59e0b', fontSize: '1.25rem', fontWeight: '700' }}>
                    ⚠️ Nur noch {product.stock - (product.reserved || 0)} auf Lager
                  </span>
                ) : (
                  <span style={{ color: '#10b981', fontSize: '1.25rem', fontWeight: '700' }}>
                    ✅ {product.stock - (product.reserved || 0)} auf Lager
                  </span>
                )}
              </div>
            )}

            {/* Description */}
            <p className="product-description">{product.description}</p>

            {/* Size Selection for Shoes */}
            {isShoeProduct(product) && (
              <div className="product-option">
                <label className="option-label">Größe auswählen:</label>
                <div className="size-grid">
                  {SHOE_SIZES.map((size) => (
                    <button
                      key={size}
                      className={`size-button ${selectedSize === size ? 'selected' : ''}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selection for Apparel */}
            {isApparelProduct(product) && (
              <div className="product-option">
                <label className="option-label">Farbe: {selectedColor}</label>
                <div className="color-grid">
                  {COLORS.map((color) => (
                    <button
                      key={color.name}
                      className={`color-button ${selectedColor === color.name ? 'selected' : ''}`}
                      onClick={() => setSelectedColor(color.name)}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    >
                      {selectedColor === color.name && <span className="checkmark">✓</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            {product.stock !== undefined && product.stock - (product.reserved || 0) > 0 && (
              <div className="product-option">
                <label className="option-label">Menge:</label>
                <div style={{ display: 'inline-block' }}>
                  <QuantitySelector
                    quantity={quantity}
                    onChange={setQuantity}
                    min={1}
                    max={product.stock - (product.reserved || 0)}
                    disabled={isAdding}
                  />
                </div>
                {/* Stock Warning at 80% */}
                {quantity > (product.stock - (product.reserved || 0)) * 0.8 && (
                  <p style={{ color: '#f59e0b', marginTop: '0.5rem', fontSize: '0.875rem' }}>
                    ⚠️ Nur noch {product.stock - (product.reserved || 0)} Stück verfügbar
                  </p>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="product-actions">
              <button
                className="add-to-cart-button"
                onClick={handleAddToCart}
                disabled={isAdding || (product.stock !== undefined && product.stock - (product.reserved || 0) <= 0)}
                style={(product.stock !== undefined && product.stock - (product.reserved || 0) <= 0) ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
              >
                {isAdding
                  ? 'Wird hinzugefügt...'
                  : showSuccess
                  ? `✓ ${addedQuantity}x zum Warenkorb hinzugefügt!`
                  : (product.stock !== undefined && product.stock - (product.reserved || 0) <= 0)
                  ? 'Ausverkauft'
                  : 'In den Warenkorb'}
              </button>
              <FavoriteButton productId={product.id} variant="inline" />
            </div>

            {/* Product Details */}
            <div className="product-details">
              <h3>Produktdetails</h3>
              <ul>
                <li>Artikel-ID: {product.id}</li>
                {product.category && <li>Kategorie: {product.category}</li>}
                <li>Kostenloser Versand ab 50€</li>
                <li>30 Tage Rückgaberecht</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .product-detail-page {
          min-height: 100vh;
          background: #000;
          padding: 2rem 5vw;
          color: white;
        }

        .back-button {
          background: none;
          border: 2px solid var(--accent-orange);
          color: var(--accent-orange);
          padding: 0.75rem 1.5rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-bottom: 2rem;
          font-size: 1rem;
        }

        .back-button:hover {
          background: var(--accent-orange);
          color: #000;
          transform: translateX(-5px);
        }

        .product-loading,
        .product-error {
          text-align: center;
          padding: 4rem 2rem;
          font-size: 1.25rem;
        }

        .product-error h2 {
          color: var(--accent-orange);
          margin-bottom: 1rem;
        }

        .product-detail-container {
          max-width: 1400px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: start;
        }

        .product-image-section {
          position: sticky;
          top: 100px;
        }

        .product-image-wrapper {
          position: relative;
          width: 100%;
          aspect-ratio: 1;
          background: #1a1a1a;
          border: 2px solid #222;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .product-image-wrapper:hover {
          border-color: var(--accent-orange);
          box-shadow: 0 0 40px rgba(255, 107, 0, 0.3);
        }

        /* ✅ SALE BADGE */
        .product-sale-badge {
          position: absolute;
          top: 2rem;
          right: 2rem;
          background: var(--accent-orange);
          color: #000;
          font-weight: 800;
          font-size: 1.5rem;
          padding: 1rem 1.5rem;
          border-radius: 8px;
          z-index: 10;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          box-shadow: 0 6px 20px rgba(255, 107, 0, 0.5);
        }

        .product-info-section {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .product-title {
          font-size: 3rem;
          font-weight: 900;
          margin: 0;
          text-transform: uppercase;
          letter-spacing: -0.02em;
          background: linear-gradient(135deg, var(--accent-orange), var(--accent-green));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .product-rating {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .stars {
          display: flex;
          gap: 0.25rem;
        }

        .star {
          font-size: 1.5rem;
        }

        .star--full {
          color: var(--accent-orange);
          text-shadow: 0 0 10px rgba(255, 107, 0, 0.5);
        }

        .star--half {
          background: linear-gradient(90deg, var(--accent-orange) 50%, #444 50%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .star--empty {
          color: #444;
        }

        .rating-text {
          color: #999;
          font-size: 1rem;
        }

        .product-price {
          font-size: 2.5rem;
          font-weight: 900;
          color: var(--accent-orange);
          letter-spacing: -0.02em;
        }

        /* ✅ SALE PRICE DISPLAY */
        .product-price-container {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .product-price--original {
          font-size: 1.5rem;
          color: #666;
          text-decoration: line-through;
          font-weight: 500;
        }

        .product-price--sale {
          font-size: 2.5rem;
          font-weight: 900;
          color: #dc2626;
          letter-spacing: -0.02em;
        }

        .product-description {
          font-size: 1.125rem;
          line-height: 1.8;
          color: #ccc;
          margin: 0;
        }

        .product-option {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .option-label {
          font-size: 1.125rem;
          font-weight: 700;
          color: #fff;
          letter-spacing: 0.5px;
        }

        .size-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
          gap: 0.75rem;
        }

        .size-button {
          padding: 1rem;
          background: transparent;
          border: 2px solid #333;
          color: #fff;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
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
          gap: 1rem;
        }

        .color-button {
          width: 50px;
          height: 50px;
          border: 3px solid #333;
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
          font-size: 1.5rem;
          font-weight: 900;
          text-shadow: 0 0 10px rgba(0, 0, 0, 0.8);
        }

        .product-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-top: 1rem;
        }

        .add-to-cart-button {
          flex: 1;
          padding: 1.5rem;
          background: var(--accent-orange);
          border: none;
          color: #000;
          font-size: 1.25rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 2px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .add-to-cart-button:hover:not(:disabled) {
          background: var(--accent-green);
          transform: translateY(-3px);
          box-shadow: 0 10px 30px rgba(0, 255, 135, 0.4);
        }

        .add-to-cart-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .product-details {
          margin-top: 2rem;
          padding: 2rem;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid #333;
        }

        .product-details h3 {
          margin: 0 0 1rem 0;
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--accent-orange);
        }

        .product-details ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .product-details li {
          padding: 0.75rem 0;
          color: #ccc;
          border-bottom: 1px solid #222;
        }

        .product-details li:last-child {
          border-bottom: none;
        }

        @media (max-width: 1024px) {
          .product-detail-container {
            grid-template-columns: 1fr;
            gap: 2rem;
          }

          .product-image-section {
            position: relative;
            top: 0;
          }

          .product-title {
            font-size: 2rem;
          }

          .product-price {
            font-size: 2rem;
          }
        }

        @media (max-width: 640px) {
          .product-detail-page {
            padding: 1rem;
          }

          .product-title {
            font-size: 1.75rem;
          }

          .size-grid {
            grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
          }
        }
      `}</style>
    </>
  );
}
