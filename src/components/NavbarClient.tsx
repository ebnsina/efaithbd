'use client';

import { Button } from '@/components/ui/button';
import { useCart, useWishlist } from '@/lib/store';
import {
  ChevronDown,
  HamburgerIcon,
  Heart,
  LogIn,
  LogOut,
  Menu,
  Search,
  ShoppingCart,
  SquareMenu,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

interface MenuItem {
  id: string;
  label: string;
  url: string;
  megaMenu: boolean;
  children?: MenuItem[];
}

interface SubCategory {
  id: string;
  name: string;
  slug: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  subcategories: SubCategory[];
}

interface NavbarClientProps {
  siteName: string;
  logo?: string | null;
  isLoggedIn: boolean;
  userName?: string | null;
  menuItems?: MenuItem[];
  categories?: Category[];
}

export default function NavbarClient({
  siteName,
  logo,
  isLoggedIn,
  userName,
  menuItems = [],
  categories = [],
}: NavbarClientProps) {
  const { items } = useCart();
  const { items: wishlistItems } = useWishlist();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
  const [showCategoriesMega, setShowCategoriesMega] = useState(false);
  const [mobileExpandedCategories, setMobileExpandedCategories] = useState<Set<string>>(new Set());

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistCount = wishlistItems.length;

  const toggleMobileCategory = (categoryId: string) => {
    setMobileExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <div className="bg-white">
      <div className="container mx-auto px-3 sm:px-4 md:px-6">
        <div className="flex items-center justify-between gap-2 sm:gap-4 py-3 sm:py-4 md:py-5">
          <Link href="/" className="flex items-center shrink-0">
            {logo ? (
              <img src={logo} alt={siteName} className="h-8 sm:h-10 w-auto" />
            ) : (
              <span className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                {siteName}
              </span>
            )}
          </Link>

          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-3xl mx-4">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search here..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 md:h-12 pl-12 pr-4 text-sm border border-gray-300 focus:rounded-none! focus:outline-none focus:border-primary! transition-colors"
              />
            </div>
          </form>

          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
            {/* Account (Desktop) */}
            {isLoggedIn ? (
              <div className="hidden lg:flex items-center gap-2">
                <Link
                  href="/orders"
                  className="flex flex-col items-start px-2 py-1 text-gray-700 hover:bg-gray-100 rounded transition-all"
                >
                  <span className="text-xs">Hello, {userName?.length ? userName : 'User'}</span>
                  <span className="text-sm font-bold">Account & Orders</span>
                </Link>
                <form action="/api/auth/signout" method="POST">
                  <Button
                    type="submit"
                    variant="ghost"
                    size="sm"
                    className="text-gray-700 hover:bg-gray-100 gap-1"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm">Logout</span>
                  </Button>
                </form>
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden lg:flex flex-col items-start px-2 py-1 text-gray-700 hover:bg-gray-100 rounded transition-all"
              >
                <span className="text-xs">Sign in</span>
              </Link>
            )}

            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="relative text-gray-700 hover:bg-gray-100 p-1.5 sm:p-2 rounded transition-all hidden md:flex items-center"
              title="Wishlist"
            >
              <Heart className="w-5 h-5 sm:w-6 sm:h-6" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-[10px] sm:text-xs font-bold">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              className="relative text-gray-700 hover:bg-gray-100 p-1.5 sm:p-2 rounded transition-all flex items-center gap-1 sm:gap-2"
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-[10px] sm:text-xs font-bold">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="hidden lg:block text-sm font-bold">Cart</span>
            </Link>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-gray-700 hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-white border-t border-slate-200">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 relative">
          <div className="hidden md:flex items-center gap-1 sm:gap-2 py-2 sm:py-3 overflow-x-auto scrollbar-hide">
            {/* All Categories Mega Menu Button */}
            {categories.length > 0 && (
              <div>
                <button
                  onMouseEnter={() => setShowCategoriesMega(true)}
                  className="text-gray-700 hover:text-gray-900 text-xs sm:text-sm font-semibold flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 hover:bg-gray-50 rounded-lg transition-all whitespace-nowrap"
                >
                  <SquareMenu className="size-4" />
                  All Categories
                  <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 transition-transform" />
                </button>
              </div>
            )}

            {menuItems.length > 0 ? (
              menuItems.map((item) => (
                <div
                  key={item.id}
                  className="relative"
                  onMouseEnter={() =>
                    item.children && item.children.length > 0 ? setHoveredMenu(item.id) : null
                  }
                  onMouseLeave={() => setHoveredMenu(null)}
                >
                  <Link
                    href={item.url}
                    className="text-gray-700 hover:text-gray-900 text-xs sm:text-sm font-semibold flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 hover:bg-gray-50 rounded-lg transition-all whitespace-nowrap"
                  >
                    {item.label}
                    {item.children && item.children.length > 0 && (
                      <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 transition-transform group-hover:translate-y-0.5" />
                    )}
                  </Link>

                  {/* Dropdown Menu - Positioned from this parent */}
                  {item.children && item.children.length > 0 && hoveredMenu === item.id && (
                    <div
                      className={`absolute left-0 top-full z-[9999] mt-0 ${
                        item.megaMenu ? 'w-[600px]' : 'min-w-60'
                      }`}
                    >
                      <div
                        className={`bg-white border border-slate-100 shadow-2xl overflow-hidden rounded-lg ${
                          item.megaMenu ? 'grid grid-cols-2 gap-1 p-3' : 'py-2'
                        }`}
                      >
                        {item.children.map((child) => (
                          <Link
                            key={child.id}
                            href={child.url}
                            className={`block text-sm hover:bg-gray-100 text-gray-700 hover:text-gray-900 transition-all font-medium ${
                              item.megaMenu
                                ? 'p-3 rounded-lg'
                                : 'px-4 py-2.5 text-sm rounded-md mx-1'
                            }`}
                            onClick={() => setHoveredMenu(null)}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <>
                <Link
                  href="/"
                  className="text-gray-700 hover:text-gray-900 text-sm font-semibold px-4 py-2 hover:bg-gray-50 rounded-lg transition-all"
                >
                  Home
                </Link>
                <Link
                  href="/products"
                  className="text-gray-700 hover:text-gray-900 text-sm font-semibold px-4 py-2 hover:bg-gray-50 rounded-lg transition-all"
                >
                  Products
                </Link>
                <Link
                  href="/categories"
                  className="text-gray-700 hover:text-gray-900 text-sm font-semibold px-4 py-2 hover:bg-gray-50 rounded-lg transition-all"
                >
                  Categories
                </Link>
                <Link
                  href="/orders/track"
                  className="text-gray-700 hover:text-gray-900 text-sm font-semibold px-4 py-2 hover:bg-gray-50 rounded-lg transition-all"
                >
                  Track Order
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mega Menu Dropdown - Outside overflow container */}
        {showCategoriesMega && (
          <div
            className="container mx-auto absolute left-0 right-0 top-full z-[9999] bg-white border rounded-md shadow-lg border-gray-200"
            onMouseEnter={() => setShowCategoriesMega(true)}
            onMouseLeave={() => setShowCategoriesMega(false)}
          >
            <div className="container mx-auto px-3 sm:px-4 md:px-6 py-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 max-h-[70vh] overflow-y-auto">
                {categories.map((category) => (
                  <div key={category.id} className="space-y-2">
                    <Link
                      href={`/categories/${category.slug}`}
                      className="font-bold text-gray-900 hover:text-primary hover:bg-emerald-50 transition-all block py-2 px-3 text-sm rounded-md"
                      onClick={() => setShowCategoriesMega(false)}
                    >
                      {category.name}
                    </Link>
                    {category.subcategories.length > 0 && (
                      <ul className="space-y-1">
                        {category.subcategories.map((subcategory) => (
                          <li key={subcategory.id}>
                            <Link
                              href={`/categories/${category.slug}/${subcategory.slug}`}
                              className="text-xs text-gray-600 hover:text-primary hover:bg-emerald-50 transition-all block py-1.5 px-3 rounded-md"
                              onClick={() => setShowCategoriesMega(false)}
                            >
                              {subcategory.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white py-4 space-y-4 border-t border-gray-200 max-h-[calc(100vh-200px)] overflow-y-auto">
          <div className="container mx-auto px-4">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search here..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-11 sm:h-12 pl-10 sm:pl-12 pr-4 text-sm border-2 border-gray-300 rounded-xl focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </form>

            {/* Mobile Links */}
            <div className="space-y-1">
              {/* All Categories - Mobile Expandable */}
              {categories.length > 0 && (
                <div>
                  <button
                    onClick={() => toggleMobileCategory('all-categories')}
                    className="w-full flex items-center justify-between py-2.5 px-3 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 font-semibold rounded-lg transition-all"
                  >
                    <span>All Categories</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        mobileExpandedCategories.has('all-categories') ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {mobileExpandedCategories.has('all-categories') && (
                    <div className="pl-4 space-y-1 mt-1">
                      {categories.map((category) => (
                        <div key={category.id}>
                          <button
                            onClick={() => toggleMobileCategory(category.id)}
                            className="w-full flex items-center justify-between py-2 px-3 text-sm text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 font-medium rounded-lg transition-all"
                          >
                            <Link
                              href={`/categories/${category.slug}`}
                              className="flex-1 text-left"
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              {category.name}
                            </Link>
                            {category.subcategories.length > 0 && (
                              <ChevronDown
                                className={`w-3.5 h-3.5 transition-transform ${
                                  mobileExpandedCategories.has(category.id) ? 'rotate-180' : ''
                                }`}
                              />
                            )}
                          </button>
                          {mobileExpandedCategories.has(category.id) &&
                            category.subcategories.length > 0 && (
                              <div className="pl-4 space-y-0.5 mt-1">
                                {category.subcategories.map((subcategory) => (
                                  <Link
                                    key={subcategory.id}
                                    href={`/categories/${category.slug}/${subcategory.slug}`}
                                    className="block py-1.5 px-3 text-xs text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                    onClick={() => setMobileMenuOpen(false)}
                                  >
                                    {subcategory.name}
                                  </Link>
                                ))}
                              </div>
                            )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {menuItems.length > 0 ? (
                menuItems.map((item) => (
                  <div key={item.id}>
                    <Link
                      href={item.url}
                      className="block py-2.5 px-3 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 font-semibold rounded-lg transition-all"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                    {item.children && item.children.length > 0 && (
                      <div className="pl-4 space-y-0.5 mt-1">
                        {item.children.map((child) => (
                          <Link
                            key={child.id}
                            href={child.url}
                            className="block py-2 px-3 text-sm text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 font-medium rounded-lg transition-all"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <>
                  <Link
                    href="/"
                    className="block py-2.5 px-3 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 font-semibold rounded-lg transition-all"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Home
                  </Link>
                  <Link
                    href="/products"
                    className="block py-2.5 px-3 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 font-semibold rounded-lg transition-all"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Products
                  </Link>
                  <Link
                    href="/categories"
                    className="block py-2.5 px-3 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 font-semibold rounded-lg transition-all"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Categories
                  </Link>
                  <Link
                    href="/orders/track"
                    className="block py-2.5 px-3 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 font-semibold rounded-lg transition-all"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Track Order
                  </Link>
                </>
              )}
              <Link
                href="/wishlist"
                className="flex items-center justify-between py-2 text-gray-700 hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span>Wishlist</span>
                {wishlistCount > 0 && (
                  <span className="bg-red-500 text-white rounded-full px-2 py-1 text-xs">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Login/Logout Mobile */}
              {isLoggedIn ? (
                <>
                  <Link
                    href="/orders"
                    className="block py-2 text-gray-700 hover:text-primary"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Orders
                  </Link>
                  <form action="/api/auth/signout" method="POST">
                    <Button
                      type="submit"
                      variant="ghost"
                      className="w-full justify-start py-2 text-gray-700 hover:text-primary"
                    >
                      <LogOut className="w-5 h-5 mr-2" />
                      Logout
                    </Button>
                  </form>
                </>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center py-2 text-gray-700 hover:text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <LogIn className="w-5 h-5 mr-2" />
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
