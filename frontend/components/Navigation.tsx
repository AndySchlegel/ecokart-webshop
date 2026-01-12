'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { API_BASE_URL } from '../lib/config';
import { logger } from '@/lib/logger';

interface Product {
  id: string;
  name: string;
  price: number;
  category?: string;
  imageUrl: string;
  tags?: string[];
}

export default function Navigation() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, signOut } = useAuth();
  const { cart, cartItemCount } = useCart();

  // Search state
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Cart dropdown state
  const [cartOpen, setCartOpen] = useState(false);

  // Mega Filter Menu state
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const filterMenuRef = useRef<HTMLDivElement>(null);

  // Products for tag extraction
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  // Get active filters from URL
  const activeTargetGroup = searchParams.get('targetGroup') || 'alle';
  const activeTags = searchParams.get('tags')?.split(',').filter(Boolean) || [];
  const activeMinPrice = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : null;
  const activeMaxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : null;

  // Extract unique tags from all products (exclude "Sale" - it goes to Price section)
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    allProducts.forEach((product) => {
      if (product.tags && Array.isArray(product.tags)) {
        product.tags.forEach((tag: string) => {
          if (tag.toLowerCase() !== 'sale') {
            tagSet.add(tag);
          }
        });
      }
    });
    return Array.from(tagSet).sort();
  }, [allProducts]);

  // Load products for tag extraction
  useEffect(() => {
    async function loadProducts() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/products`);
        if (response.ok) {
          const data = await response.json();
          setAllProducts(data.items || []);
        }
      } catch (error) {
        logger.error('Failed to load products for tags', { component: 'Navigation' }, error as Error);
      }
    }
    loadProducts();
  }, []);

  // Handle target group (Kinder/Männer/Frauen) filter
  const handleTargetGroupClick = (group: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (group === 'alle') {
      params.delete('targetGroup');
    } else {
      params.set('targetGroup', group);
    }
    router.push(`/?${params.toString()}`);
  };

  // Handle tag toggle
  const handleTagToggle = (tag: string) => {
    const params = new URLSearchParams(searchParams.toString());
    let newTags: string[];

    if (activeTags.includes(tag)) {
      newTags = activeTags.filter((t) => t !== tag);
    } else {
      newTags = [...activeTags, tag];
    }

    if (newTags.length > 0) {
      params.set('tags', newTags.join(','));
    } else {
      params.delete('tags');
    }

    router.push(`/?${params.toString()}`);
  };

  // Handle price filter
  const handlePriceFilter = (minPrice: number | null, maxPrice: number | null) => {
    const params = new URLSearchParams(searchParams.toString());

    if (minPrice !== null) {
      params.set('minPrice', minPrice.toString());
    } else {
      params.delete('minPrice');
    }

    if (maxPrice !== null) {
      params.set('maxPrice', maxPrice.toString());
    } else {
      params.delete('maxPrice');
    }

    router.push(`/?${params.toString()}`);
  };

  // Clear all filters
  const handleClearFilters = () => {
    router.push('/');
  };

  // Fetch search suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/products`);
        if (response.ok) {
          const data = await response.json();
          const products = data.items || [];
          const query = searchQuery.toLowerCase();

          const filtered = products
            .filter((product: Product) => {
              const name = product.name.toLowerCase();
              const description = (product as any).description?.toLowerCase() ?? '';
              const tags = (product as any).tags?.join(' ').toLowerCase() ?? '';
              const searchTerms = (product as any).searchTerms?.join(' ').toLowerCase() ?? '';
              const targetGroup = (product as any).targetGroup?.toLowerCase() ?? '';
              const category = product.category?.toLowerCase() ?? '';

              return name.includes(query) ||
                     description.includes(query) ||
                     tags.includes(query) ||
                     searchTerms.includes(query) ||
                     targetGroup.includes(query) ||
                     category.includes(query);
            })
            .slice(0, 5);

          setSearchSuggestions(filtered);
          setShowSuggestions(filtered.length > 0);
        }
      } catch (error) {
        logger.error('Failed to fetch search suggestions', {
          searchQuery,
          component: 'Navigation'
        }, error as Error);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setSearchOpen(false);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (productId: string) => {
    router.push(`/product/${productId}`);
    setSearchQuery('');
    setSearchOpen(false);
    setShowSuggestions(false);
  };

  // Close filter menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target as Node)) {
        setFilterMenuOpen(false);
      }
    };

    if (filterMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [filterMenuOpen]);

  // Count active filters
  const activeFilterCount = activeTags.length +
    (activeTargetGroup !== 'alle' ? 1 : 0) +
    (activeMinPrice !== null || activeMaxPrice !== null ? 1 : 0);

  // Prevent body scroll when filter menu is open (Mobile Fix)
  useEffect(() => {
    if (filterMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [filterMenuOpen]);


  return (
    <>
      <nav className="navigation">
        {/* ROW 1: Logo + Search (mittig) + Icons (rechts) */}
        <div className="nav-top">
          <Link
            href="/"
            className="nav-logo"
            style={{
              background: 'linear-gradient(90deg, #ff6b00, #00ff87)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            AIR LEGACY
          </Link>

          {/* Search (center) */}
          <div className="nav-search-center" ref={searchRef}>
            {searchOpen && (
              <div className="search-dropdown-center">
                <form onSubmit={handleSearch} className="search-form">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Produkte suchen..."
                    className="search-input"
                    autoFocus
                  />
                  <button type="submit" className="search-submit">
                    Suchen
                  </button>
                </form>

                {showSuggestions && searchSuggestions.length > 0 && (
                  <div className="search-suggestions">
                    {searchSuggestions.map((product) => (
                      <div
                        key={product.id}
                        className="search-suggestion-item"
                        onClick={() => handleSuggestionClick(product.id)}
                      >
                        <div className="suggestion-image">
                          <img src={product.imageUrl} alt={product.name} />
                        </div>
                        <div className="suggestion-info">
                          <p className="suggestion-name">{product.name}</p>
                          <p className="suggestion-price">€{product.price.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="nav-right-icons">
            {/* Search Icon */}
            <button
              className="nav-icon-btn"
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label="Search"
            >
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </button>

            {/* User Icon */}
            {user ? (
              <div className="nav-user-menu">
                <button className="nav-icon-btn" aria-label="User Menu">
                  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </button>
                <div className="user-dropdown">
                  <p className="user-email">{user.email}</p>
                  <button onClick={() => signOut()} className="user-signout">
                    Abmelden
                  </button>
                </div>
              </div>
            ) : (
              <Link href="/login" className="nav-icon-btn" aria-label="Login">
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </Link>
            )}

            {/* Cart Icon */}
            <button
              className="nav-icon-btn nav-cart-btn"
              onClick={() => setCartOpen(!cartOpen)}
              aria-label="Shopping Cart"
            >
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              {cartItemCount > 0 && (
                <span className="cart-badge">{cartItemCount}</span>
              )}
            </button>
          </div>
        </div>

        {/* ROW 2: Filter Bar (CategoryTabs + Filter Button) */}
        <div className="nav-filter-bar">
          {/* CategoryTabs */}
          <div className="filter-category-tabs">
            {['alle', 'kinder', 'männer', 'frauen'].map((group) => (
              <button
                key={group}
                className={`category-tab ${activeTargetGroup === group ? 'active' : ''}`}
                onClick={() => handleTargetGroupClick(group)}
              >
                {group.charAt(0).toUpperCase() + group.slice(1)}
              </button>
            ))}
          </div>

          {/* Filter Button */}
          <button
            className={`filter-menu-btn ${activeFilterCount > 0 ? 'active' : ''}`}
            onClick={() => setFilterMenuOpen(!filterMenuOpen)}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '0.5rem' }}>
              <line x1="4" y1="6" x2="16" y2="6" />
              <line x1="4" y1="12" x2="16" y2="12" />
              <line x1="4" y1="18" x2="16" y2="18" />
              <circle cx="8" cy="6" r="2" fill="currentColor" />
              <circle cx="12" cy="12" r="2" fill="currentColor" />
              <circle cx="10" cy="18" r="2" fill="currentColor" />
            </svg>
            Filter
            {activeFilterCount > 0 && (
              <span className="filter-badge">{activeFilterCount}</span>
            )}
          </button>

          {/* Clear All Filters (compact) */}
          {activeFilterCount > 0 && (
            <button className="filter-clear-all" onClick={handleClearFilters}>
              Alle löschen
            </button>
          )}
        </div>
      </nav>

      {/* Mega Filter Menu */}
      {filterMenuOpen && (
        <div className="filter-mega-menu" ref={filterMenuRef}>
          <div className="filter-mega-content">
            {/* Tags Section */}
            {availableTags.length > 0 && (
              <div className="filter-section">
                <h3 className="filter-section-title">Tags</h3>
                <div className="filter-tag-grid">
                  {availableTags.map((tag) => (
                    <button
                      key={tag}
                      className={`filter-tag-item ${activeTags.includes(tag) ? 'active' : ''}`}
                      onClick={() => handleTagToggle(tag)}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Price Section */}
            <div className="filter-section">
              <h3 className="filter-section-title">Preis</h3>
              <div className="filter-price-options">
                <button
                  className={`filter-price-btn ${activeMinPrice === null && activeMaxPrice === 50 ? 'active' : ''}`}
                  onClick={() => handlePriceFilter(null, 50)}
                >
                  Unter €50
                </button>
                <button
                  className={`filter-price-btn ${activeMinPrice === 50 && activeMaxPrice === 100 ? 'active' : ''}`}
                  onClick={() => handlePriceFilter(50, 100)}
                >
                  €50 - €100
                </button>
                <button
                  className={`filter-price-btn ${activeMinPrice === 100 && activeMaxPrice === 150 ? 'active' : ''}`}
                  onClick={() => handlePriceFilter(100, 150)}
                >
                  €100 - €150
                </button>
                <button
                  className={`filter-price-btn ${activeMinPrice === 150 && activeMaxPrice === 200 ? 'active' : ''}`}
                  onClick={() => handlePriceFilter(150, 200)}
                >
                  €150 - €200
                </button>
                <button
                  className={`filter-price-btn ${activeMinPrice === 200 && activeMaxPrice === null ? 'active' : ''}`}
                  onClick={() => handlePriceFilter(200, null)}
                >
                  Über €200
                </button>
                {/* Sale Tag - special styling */}
                <button
                  className={`filter-price-btn filter-price-btn--sale ${activeTags.includes('Sale') ? 'active' : ''}`}
                  onClick={() => handleTagToggle('Sale')}
                >
                  🏷️ Sale
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="filter-actions">
              <button className="filter-action-clear" onClick={() => { handleClearFilters(); setFilterMenuOpen(false); }}>
                Alle Filter löschen
              </button>
              <button className="filter-action-apply" onClick={() => setFilterMenuOpen(false)}>
                Filter anwenden
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cart Sidebar (right) */}
      <div className={`sidebar sidebar-right ${cartOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>WARENKORB</h2>
          <button onClick={() => setCartOpen(false)} className="sidebar-close">
            ✕
          </button>
        </div>
        <div className="sidebar-content">
          {cartItemCount > 0 && cart ? (
            <>
              {/* Mini-Cart Product List (max 5 items) */}
              <div className="mini-cart-items">
                {cart.items.slice(0, 5).map((item) => (
                  <div key={item.productId} className="mini-cart-item">
                    <div className="mini-cart-item-image">
                      <img src={item.imageUrl} alt={item.name} />
                    </div>
                    <div className="mini-cart-item-info">
                      <p className="mini-cart-item-name">{item.name}</p>
                      <p className="mini-cart-item-details">
                        {item.quantity}x €{item.price.toFixed(2)}
                      </p>
                    </div>
                    <div className="mini-cart-item-total">
                      €{(item.quantity * item.price).toFixed(2)}
                    </div>
                  </div>
                ))}

                {cart.items.length > 5 && (
                  <p className="mini-cart-more">
                    + {cart.items.length - 5} weitere Artikel
                  </p>
                )}
              </div>

              {/* Subtotal */}
              <div className="mini-cart-subtotal">
                <span>Zwischensumme:</span>
                <span className="mini-cart-subtotal-amount">
                  €{cart.items.reduce((sum, item) => sum + (item.quantity * item.price), 0).toFixed(2)}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="mini-cart-actions">
                <Link href="/cart" onClick={() => setCartOpen(false)} className="mini-cart-btn mini-cart-btn--secondary">
                  Zum Warenkorb
                </Link>
                <Link href="/checkout" onClick={() => setCartOpen(false)} className="mini-cart-btn mini-cart-btn--primary">
                  Zur Kasse
                </Link>
              </div>
            </>
          ) : (
            <p className="empty-cart">Dein Warenkorb ist leer</p>
          )}
        </div>
      </div>

      {/* Overlay */}
      {cartOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setCartOpen(false)}
        />
      )}

      <style jsx>{`
        .navigation {
          position: sticky;
          top: 0;
          z-index: 1000;
          background: #000;
          border-bottom: 2px solid var(--accent-orange);
        }

        /* ROW 1: Top Bar - Logo + Search (center) + Icons (right) */
        .nav-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 5vw;
          gap: 2rem;
          position: relative;
        }

        .nav-logo {
          font-size: 1.5rem;
          font-weight: 900;
          letter-spacing: 2px;
          text-decoration: none;
          text-transform: uppercase;
          white-space: nowrap;
          background: linear-gradient(90deg, var(--accent-orange), var(--accent-green));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .nav-right-icons {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        /* Search Center Container */
        .nav-search-center {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          width: 500px;
          max-width: calc(100vw - 400px);
          z-index: 1500;
        }

        .nav-icon-btn {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          padding: 0.5rem;
          transition: all 0.3s ease;
          position: relative;
        }

        .nav-icon-btn:hover {
          color: var(--accent-orange);
          transform: scale(1.1);
        }

        .nav-cart-btn {
          position: relative;
        }

        .cart-badge {
          position: absolute;
          top: 0;
          right: 0;
          background: var(--accent-orange);
          color: #000;
          font-size: 0.75rem;
          font-weight: 900;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Search Dropdown Center */
        .search-dropdown-center {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: #1a1a1a;
          border: 2px solid var(--accent-orange);
          margin-top: 0.5rem;
          z-index: 2000;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.8);
          border-radius: 4px;
        }

        .search-form {
          display: flex;
          padding: 1rem;
          gap: 0.5rem;
        }

        .search-input {
          flex: 1;
          background: #000;
          border: 1px solid #333;
          color: white;
          padding: 0.75rem;
          font-size: 1rem;
        }

        .search-input:focus {
          outline: none;
          border-color: var(--accent-orange);
        }

        .search-submit {
          background: var(--accent-orange);
          border: none;
          color: #000;
          padding: 0.75rem 1.5rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .search-submit:hover {
          background: #ff8533;
        }

        .search-suggestions {
          border-top: 1px solid #333;
        }

        .search-suggestion-item {
          display: flex;
          gap: 1rem;
          padding: 0.75rem 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          align-items: center;
        }

        .search-suggestion-item:hover {
          background: rgba(255, 107, 0, 0.1);
        }

        .suggestion-image {
          width: 50px;
          height: 50px;
          background: #000;
        }

        .suggestion-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .suggestion-info {
          flex: 1;
        }

        .suggestion-name {
          margin: 0;
          color: white;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .suggestion-price {
          margin: 0;
          color: var(--accent-orange);
          font-size: 0.875rem;
          font-weight: 700;
        }

        /* User Menu */
        .nav-user-menu {
          position: relative;
        }

        .nav-user-menu:hover .user-dropdown {
          display: block;
        }

        .user-dropdown {
          display: none;
          position: absolute;
          top: 100%;
          right: 0;
          background: #1a1a1a;
          border: 2px solid var(--accent-orange);
          padding: 1rem;
          margin-top: 0.5rem;
          min-width: 200px;
          z-index: 2000;
        }

        .user-email {
          margin: 0 0 0.75rem 0;
          color: white;
          font-size: 0.875rem;
          word-break: break-all;
        }

        .user-signout {
          width: 100%;
          background: var(--accent-orange);
          border: none;
          color: #000;
          padding: 0.5rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .user-signout:hover {
          background: #ff8533;
        }

        /* ROW 2: Filter Bar */
        .nav-filter-bar {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.75rem 5vw;
          background: rgba(0, 0, 0, 0.8);
          border-top: 1px solid #222;
        }

        .filter-category-tabs {
          display: flex;
          gap: 0.5rem;
          flex-shrink: 0;
        }

        .category-tab {
          background: transparent;
          border: none;
          border-bottom: 3px solid transparent;
          color: #999;
          font-size: 0.875rem;
          font-weight: 600;
          padding: 0.75rem 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 1px;
          white-space: nowrap;
        }

        .category-tab:hover {
          color: #fff;
          background: rgba(255, 255, 255, 0.05);
        }

        .category-tab.active {
          color: var(--accent-orange);
          border-bottom-color: var(--accent-orange);
          background: rgba(255, 107, 0, 0.1);
        }

        /* Filter Menu Button */
        .filter-menu-btn {
          display: flex;
          align-items: center;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid #333;
          color: #ccc;
          padding: 0.75rem 1.25rem;
          border-radius: 4px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          white-space: nowrap;
        }

        .filter-menu-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: var(--accent-green);
          color: var(--accent-green);
        }

        .filter-menu-btn.active {
          background: var(--accent-orange);
          border-color: var(--accent-orange);
          color: #000;
        }

        .filter-badge {
          position: absolute;
          top: -8px;
          right: -8px;
          background: var(--accent-green);
          color: #000;
          font-size: 0.75rem;
          font-weight: 900;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Mega Filter Menu */
        .filter-mega-menu {
          position: fixed;
          top: 124px;
          left: 0;
          right: 0;
          bottom: 0;
          background: #1a1a1a;
          border-bottom: 2px solid var(--accent-orange);
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.8);
          z-index: 2000;
          animation: slideDown 0.3s ease;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .filter-mega-content {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem 5vw;
        }

        .filter-section {
          margin-bottom: 2rem;
        }

        .filter-section:last-of-type {
          margin-bottom: 0;
        }

        .filter-section-title {
          margin: 0 0 1rem 0;
          font-size: 0.875rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: var(--accent-orange);
        }

        /* Tag Grid */
        .filter-tag-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 0.75rem;
        }

        .filter-tag-item {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid #333;
          color: #ccc;
          padding: 0.75rem 1rem;
          border-radius: 4px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: capitalize;
          text-align: center;
        }

        .filter-tag-item:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: var(--accent-green);
          color: var(--accent-green);
          transform: translateY(-2px);
        }

        .filter-tag-item.active {
          background: var(--accent-orange);
          border-color: var(--accent-orange);
          color: #000;
          font-weight: 700;
        }

        /* Price Options */
        .filter-price-options {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: 0.75rem;
        }

        .filter-price-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid #333;
          color: #ccc;
          padding: 0.75rem 1rem;
          border-radius: 4px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: center;
        }

        .filter-price-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: var(--accent-green);
          color: var(--accent-green);
          transform: translateY(-2px);
        }

        .filter-price-btn.active {
          background: var(--accent-green);
          border-color: var(--accent-green);
          color: #000;
          font-weight: 700;
        }

        /* Sale Button - Special Red Styling */
        .filter-price-btn--sale {
          border-color: #dc2626;
          color: #dc2626;
          font-weight: 600;
        }

        .filter-price-btn--sale:hover {
          background: rgba(220, 38, 38, 0.1);
          border-color: #dc2626;
          color: #dc2626;
        }

        .filter-price-btn--sale.active {
          background: #dc2626;
          border-color: #dc2626;
          color: #fff;
          font-weight: 700;
        }

        /* Filter Actions */
        .filter-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          padding-top: 1.5rem;
          border-top: 1px solid #333;
          margin-top: 2rem;
        }

        .filter-action-clear {
          background: transparent;
          border: 1px solid #dc2626;
          color: #dc2626;
          padding: 0.75rem 1.5rem;
          border-radius: 4px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .filter-action-clear:hover {
          background: #dc2626;
          color: #fff;
        }

        .filter-action-apply {
          background: var(--accent-orange);
          border: 1px solid var(--accent-orange);
          color: #000;
          padding: 0.75rem 2rem;
          border-radius: 4px;
          font-size: 0.875rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .filter-action-apply:hover {
          background: #ff8533;
          border-color: #ff8533;
          transform: translateY(-2px);
        }

        .filter-clear-all {
          background: transparent;
          border: 1px solid #dc2626;
          color: #dc2626;
          padding: 0.75rem 1rem;
          border-radius: 4px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          white-space: nowrap;
        }

        .filter-clear-all:hover {
          background: #dc2626;
          color: #fff;
        }

        /* Cart Sidebar */
        .sidebar {
          position: fixed;
          top: 0;
          bottom: 0;
          width: 400px;
          background: #000;
          border-left: 2px solid var(--accent-orange);
          transform: translateX(100%);
          transition: transform 0.3s ease;
          z-index: 1500;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
        }

        .sidebar-right {
          right: 0;
        }

        .sidebar.open {
          transform: translateX(0);
        }

        .sidebar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 2rem;
          border-bottom: 2px solid #222;
        }

        .sidebar-header h2 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 900;
          color: var(--accent-orange);
          letter-spacing: 2px;
        }

        .sidebar-close {
          background: none;
          border: none;
          color: white;
          font-size: 2rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .sidebar-close:hover {
          color: var(--accent-orange);
          transform: rotate(90deg);
        }

        .sidebar-content {
          flex: 1;
          padding: 2rem;
          overflow-y: auto;
        }

        .empty-cart {
          color: #666;
          text-align: center;
          font-style: italic;
        }

        /* Mini-Cart Styles */
        .mini-cart-items {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 1.5rem;
          max-height: 400px;
          overflow-y: auto;
        }

        .mini-cart-item {
          display: grid;
          grid-template-columns: 60px 1fr auto;
          gap: 0.75rem;
          align-items: center;
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid #333;
          transition: all 0.3s ease;
        }

        .mini-cart-item:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: var(--accent-orange);
        }

        .mini-cart-item-image {
          width: 60px;
          height: 60px;
          position: relative;
          background: #1a1a1a;
          overflow: hidden;
        }

        .mini-cart-item-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .mini-cart-item-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .mini-cart-item-name {
          margin: 0;
          font-size: 0.875rem;
          font-weight: 600;
          color: #fff;
          line-height: 1.3;
        }

        .mini-cart-item-details {
          margin: 0;
          font-size: 0.75rem;
          color: #999;
        }

        .mini-cart-item-total {
          font-size: 0.875rem;
          font-weight: 700;
          color: var(--accent-orange);
        }

        .mini-cart-more {
          margin: 0;
          padding: 0.5rem;
          text-align: center;
          color: #999;
          font-size: 0.875rem;
          font-style: italic;
        }

        .mini-cart-subtotal {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 0;
          border-top: 2px solid #333;
          border-bottom: 2px solid #333;
          margin-bottom: 1rem;
          font-size: 1.125rem;
          font-weight: 700;
        }

        .mini-cart-subtotal-amount {
          color: var(--accent-green);
          font-size: 1.25rem;
        }

        .mini-cart-actions {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .mini-cart-btn {
          display: block;
          width: 100%;
          padding: 1rem;
          text-align: center;
          text-decoration: none;
          font-weight: 900;
          letter-spacing: 1px;
          text-transform: uppercase;
          font-size: 0.875rem;
          transition: all 0.3s ease;
          border: 2px solid transparent;
        }

        .mini-cart-btn--primary {
          background: var(--accent-orange);
          color: #000;
        }

        .mini-cart-btn--primary:hover {
          background: #ff8533;
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(255, 107, 0, 0.4);
        }

        .mini-cart-btn--secondary {
          background: transparent;
          color: var(--accent-green);
          border-color: var(--accent-green);
        }

        .mini-cart-btn--secondary:hover {
          background: var(--accent-green);
          color: #000;
        }

        .sidebar-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          z-index: 1400;
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .nav-top {
            padding: 0.75rem 1rem;
            gap: 1rem;
          }

          .nav-logo {
            font-size: 1.25rem;
          }

          /* Hide center search on mobile, keep icon */
          .nav-search-center {
            display: none;
          }

          /* Show search dropdown below icons on mobile */
          .search-dropdown-center {
            position: fixed;
            top: 60px;
            left: 1rem;
            right: 1rem;
            width: auto;
          }

          .nav-filter-bar {
            padding: 0.5rem 1rem;
            flex-direction: column;
            align-items: flex-start;
            gap: 0.75rem;
          }

          .filter-category-tabs,
          .filter-tags-container {
            width: 100%;
            overflow-x: auto;
          }

          .filter-mega-menu {
            top: 110px;
          }

          .filter-mega-content {
            padding: 1.5rem 1rem;
          }

          .filter-tag-grid {
            grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
            gap: 0.5rem;
          }

          .filter-price-options {
            grid-template-columns: 1fr;
          }

          .sidebar {
            width: 100%;
          }
        }
      `}</style>
    </>
  );
}
