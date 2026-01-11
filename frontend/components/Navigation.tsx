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

  // Price dropdown state
  const [priceDropdownOpen, setPriceDropdownOpen] = useState(false);

  // Tag dropdown state (nicht horizontal expansion, sondern echtes Dropdown)
  const [tagDropdownOpen, setTagDropdownOpen] = useState(false);

  // Products for tag extraction
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  // Get active filters from URL
  const activeTargetGroup = searchParams.get('targetGroup') || 'alle';
  const activeTags = searchParams.get('tags')?.split(',').filter(Boolean) || [];
  const activeMinPrice = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : null;
  const activeMaxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : null;

  // Extract unique tags from all products
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    allProducts.forEach((product) => {
      if (product.tags && Array.isArray(product.tags)) {
        product.tags.forEach((tag: string) => tagSet.add(tag));
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

    setPriceDropdownOpen(false);
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
              return name.includes(query);
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

  // Display first 6 tags inline, rest in dropdown
  const inlineTags = availableTags.slice(0, 6);
  const dropdownTags = availableTags.slice(6);

  return (
    <>
      <nav className="navigation">
        {/* ROW 1: Logo + Icons (rechts gruppiert) */}
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

          <div className="nav-right-icons">
            {/* Search */}
            <div className="nav-search" ref={searchRef}>
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

            {searchOpen && (
              <div className="search-dropdown">
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

        {/* ROW 2: Filter Bar (CategoryTabs + TagFilter + Price) */}
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

          {/* TagFilter + Price Dropdown */}
          {availableTags.length > 0 && (
            <div className="filter-tags-container">
              <div className="filter-tags">
                {/* Erste 6 Tags inline */}
                {inlineTags.map((tag) => (
                  <button
                    key={tag}
                    className={`filter-tag ${activeTags.includes(tag) ? 'active' : ''}`}
                    onClick={() => handleTagToggle(tag)}
                  >
                    {tag}
                  </button>
                ))}

                {/* Dropdown für restliche Tags */}
                {dropdownTags.length > 0 && (
                  <div className="tag-dropdown-container">
                    <button
                      className="filter-tag-expand"
                      onClick={() => {
                        console.log('Tag dropdown clicked, current state:', tagDropdownOpen);
                        setTagDropdownOpen(!tagDropdownOpen);
                      }}
                    >
                      + {dropdownTags.length} mehr
                    </button>

                    {tagDropdownOpen && (
                      <div className="tag-dropdown">
                        {dropdownTags.map((tag) => (
                          <button
                            key={tag}
                            className={`tag-dropdown-item ${activeTags.includes(tag) ? 'active' : ''}`}
                            onClick={() => handleTagToggle(tag)}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Price Dropdown */}
                <div className="price-dropdown-container">
                  <button
                    className={`filter-tag filter-tag-price ${activeMinPrice !== null || activeMaxPrice !== null ? 'active' : ''}`}
                    onClick={() => setPriceDropdownOpen(!priceDropdownOpen)}
                  >
                    Preis {activeMinPrice !== null || activeMaxPrice !== null ? '✓' : '▼'}
                  </button>

                  {priceDropdownOpen && (
                    <div className="price-dropdown">
                      <button onClick={() => handlePriceFilter(null, 50)}>Unter €50</button>
                      <button onClick={() => handlePriceFilter(50, 100)}>€50 - €100</button>
                      <button onClick={() => handlePriceFilter(100, 150)}>€100 - €150</button>
                      <button onClick={() => handlePriceFilter(150, 200)}>€150 - €200</button>
                      <button onClick={() => handlePriceFilter(200, null)}>Über €200</button>
                      {(activeMinPrice !== null || activeMaxPrice !== null) && (
                        <button onClick={() => handlePriceFilter(null, null)} className="price-clear">
                          Filter löschen
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Clear All Filters */}
                {(activeTags.length > 0 || activeTargetGroup !== 'alle' || activeMinPrice !== null || activeMaxPrice !== null) && (
                  <button className="filter-clear-all" onClick={handleClearFilters}>
                    Alle Filter löschen
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

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

        /* ROW 1: Top Bar */
        .nav-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 5vw;
          gap: 2rem;
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

        .nav-search {
          position: relative;
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

        /* Search Dropdown */
        .search-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: #1a1a1a;
          border: 2px solid var(--accent-orange);
          margin-top: 0.5rem;
          z-index: 2000;
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
          gap: 2rem;
          padding: 0.75rem 5vw;
          background: rgba(0, 0, 0, 0.8);
          border-top: 1px solid #222;
          overflow-x: auto;
          scrollbar-width: none;
        }

        .nav-filter-bar::-webkit-scrollbar {
          display: none;
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

        .filter-tags-container {
          flex: 1;
          overflow-x: auto;
          scrollbar-width: none;
        }

        .filter-tags-container::-webkit-scrollbar {
          display: none;
        }

        .filter-tags {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        .filter-tag {
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
          white-space: nowrap;
        }

        .filter-tag:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: var(--accent-green);
          color: var(--accent-green);
        }

        .filter-tag.active {
          background: var(--accent-orange);
          border-color: var(--accent-orange);
          color: #000;
          font-weight: 700;
        }

        .filter-tag-expand {
          background: transparent;
          border: 1px dashed #444;
          color: #999;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.3s ease;
          white-space: nowrap;
          position: relative;
          z-index: 10;
          pointer-events: auto;
        }

        .filter-tag-expand:hover {
          border-color: var(--accent-green);
          color: var(--accent-green);
        }

        /* Tag Dropdown */
        .tag-dropdown-container {
          position: relative;
          z-index: 100;
        }

        .tag-dropdown {
          position: absolute;
          top: calc(100% + 0.5rem);
          left: 0;
          background: #1a1a1a;
          border: 2px solid var(--accent-orange);
          padding: 0.5rem;
          min-width: 200px;
          max-height: 400px;
          overflow-y: auto;
          z-index: 2100;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
        }

        .tag-dropdown-item {
          background: transparent;
          border: none;
          color: white;
          padding: 0.75rem 1rem;
          text-align: left;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.875rem;
          text-transform: capitalize;
          border-radius: 4px;
        }

        .tag-dropdown-item:hover {
          background: rgba(255, 107, 0, 0.1);
          color: var(--accent-orange);
        }

        .tag-dropdown-item.active {
          background: var(--accent-orange);
          color: #000;
          font-weight: 700;
        }

        /* Price Dropdown */
        .price-dropdown-container {
          position: relative;
        }

        .filter-tag-price {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .price-dropdown {
          position: absolute;
          top: calc(100% + 0.5rem);
          right: 0;
          background: #1a1a1a;
          border: 2px solid var(--accent-orange);
          padding: 0.5rem;
          min-width: 180px;
          z-index: 2000;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .price-dropdown button {
          background: transparent;
          border: none;
          color: white;
          padding: 0.75rem 1rem;
          text-align: left;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.875rem;
        }

        .price-dropdown button:hover {
          background: rgba(255, 107, 0, 0.1);
          color: var(--accent-orange);
        }

        .price-dropdown button.price-clear {
          border-top: 1px solid #333;
          margin-top: 0.25rem;
          color: #dc2626;
        }

        .price-dropdown button.price-clear:hover {
          background: rgba(220, 38, 38, 0.1);
        }

        .filter-clear-all {
          background: transparent;
          border: 1px solid #dc2626;
          color: #dc2626;
          padding: 0.5rem 1rem;
          border-radius: 20px;
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

          .sidebar {
            width: 100%;
          }
        }
      `}</style>
    </>
  );
}
