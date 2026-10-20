"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart, useWishlist } from "@/lib/store";
import { ShopButton } from "./ShopButton";
import {
  ShoppingCart,
  Heart,
  Share2,
  Minus,
  Plus,
  Star,
  Truck,
  Shield,
  RotateCcw,
  Facebook,
  Twitter,
  Copy,
  Check,
} from "lucide-react";
import ProductCard from "./ProductCard";
import { Button } from "@/components/ui/button";
import { ProductReviews } from "./ProductReviews";
import { ProductQuestions } from "./ProductQuestions";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice: number | null;
  stock: number;
  images: string[];
  featured: boolean;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  subcategory?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  variants: Array<{
    id: string;
    name: string;
    value: string;
    price: number | null;
    stock: number;
  }>;
}

interface ProductDetailClientProps {
  product: Product;
  relatedProducts: Array<{
    id: string;
    name: string;
    slug: string;
    price: number;
    comparePrice: number | null;
    images: string[];
    stock: number;
  }>;
  reviewStats: {
    count: number;
    average: number;
  };
  featureCards: Array<{
    id: string;
    title: string;
    description: string | null;
    icon: string;
    order: number;
  }>;
}

export default function ProductDetailClient({
  product,
  relatedProducts,
  reviewStats,
  featureCards,
}: ProductDetailClientProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const {
    items: wishlistItems,
    addItem: addToWishlist,
    removeItem: removeFromWishlist,
    isInWishlist,
  } = useWishlist();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"description" | "reviews" | "qa">(
    "description",
  );
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const shareMenuRef = useRef<HTMLDivElement>(null);

  const isWishlisted = isInWishlist(product.id);

  // Auto-select first available variant if product has variants
  useEffect(() => {
    if (product.variants.length > 0 && !selectedVariant) {
      const firstAvailableVariant = product.variants.find(v => v.stock > 0);
      if (firstAvailableVariant) {
        setSelectedVariant(firstAvailableVariant.id);
      }
    }
  }, [product.variants, selectedVariant]);

  // Reset quantity when variant changes
  useEffect(() => {
    if (selectedVariant) {
      setQuantity(1);
    }
  }, [selectedVariant]);

  // Close share menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        shareMenuRef.current &&
        !shareMenuRef.current.contains(event.target as Node)
      ) {
        setShowShareMenu(false);
      }
    };

    if (showShareMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showShareMenu]);

  const discount = product.comparePrice
    ? Math.round(
        ((product.comparePrice - product.price) / product.comparePrice) * 100,
      )
    : 0;

  const selectedVariantData = product.variants.find(
    (v) => v.id === selectedVariant,
  );

  const currentPrice = selectedVariantData?.price
    ? product.price + selectedVariantData.price
    : product.price;

  // Calculate available stock: use variant stock if variant is selected, otherwise use product stock
  const availableStock = product.variants.length > 0
    ? selectedVariantData?.stock ?? 0
    : product.stock;

  // Check if product/variant is out of stock
  const isOutOfStock = availableStock === 0;

  const handleAddToCart = () => {
    if (product.variants.length > 0 && !selectedVariant) {
      toast.error("Please Select Variant");
      return;
    }

    const cartItem = {
      productId: product.id,
      name: product.name,
      price: currentPrice,
      quantity,
      image: product.images[0] || "/placeholder.jpg",
      ...(selectedVariantData && {
        variantId: selectedVariantData.id,
        variantName: `${selectedVariantData.name}: ${selectedVariantData.value}`,
      }),
    };

    addItem(cartItem);
    const productName = product.name;
    const variantName = selectedVariantData ? selectedVariantData.value : "";
    toast.success("Added To Cart", {
      description: `${productName}${
        selectedVariantData ? ` - ${variantName}` : ""
      } (${quantity})`,
    });
  };

  const handleBuyNow = () => {
    if (product.variants.length > 0 && !selectedVariant) {
      toast.error("Please Select Variant");
      return;
    }

    const cartItem = {
      productId: product.id,
      name: product.name,
      nameBn: product.name,
      price: currentPrice,
      quantity,
      image: product.images[0] || "/placeholder.jpg",
      ...(selectedVariantData && {
        variantId: selectedVariantData.id,
        variantName: `${selectedVariantData.name}: ${selectedVariantData.value}`,
        variantNameBn: `${selectedVariantData.name}: ${selectedVariantData.value}`,
      }),
    };

    addItem(cartItem);
    router.push("/checkout");
  };

  const incrementQuantity = () => {
    if (quantity < availableStock) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleWishlistToggle = () => {
    if (isWishlisted) {
      removeFromWishlist(product.id);
      toast.success("Removed From Wishlist");
    } else {
      addToWishlist({
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0] || "/placeholder.jpg",
        slug: product.slug,
      });
      toast.success("Added To Wishlist");
    }
  };

  const handleShare = (platform: "facebook" | "twitter" | "copy") => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const text = `${product.name} - ৳${product.price}`;

    switch (platform) {
      case "facebook":
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            url,
          )}`,
          "_blank",
          "width=600,height=400",
        );
        break;
      case "twitter":
        window.open(
          `https://twitter.com/intent/tweet?url=${encodeURIComponent(
            url,
          )}&text=${encodeURIComponent(text)}`,
          "_blank",
          "width=600,height=400",
        );
        break;
      case "copy":
        navigator.clipboard.writeText(url).then(() => {
          setCopied(true);
          setTimeout(() => {
            setCopied(false);
            setShowShareMenu(false);
          }, 2000);
        });
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600 overflow-x-auto scrollbar-hide">
            <Link href="/" className="hover:text-orange-600">
              {"Home"}
            </Link>
            <span>/</span>
            <Link href="/products" className="hover:text-orange-600">
              {"Products"}
            </Link>
            <span>/</span>
            <Link
              href={`/products?category=${product.category.slug}`}
              className="hover:text-primary"
            >
              {product.category.name}
            </Link>
            <span>/</span>
            <span className="text-gray-900">{product.name}</span>
          </div>
        </div>
      </div>

      {/* Product Detail Section */}
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8 bg-white rounded-lg shadow-sm p-3 sm:p-4 md:p-6">
          {/* Left: Images */}
          <div>
            {/* Main Image */}
            <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden mb-3 sm:mb-4">
              {discount > 0 && (
                <div className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-red-500 text-white px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-bold z-10">
                  -{discount}%
                </div>
              )}
              {isOutOfStock && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
                  <span className="text-white text-lg sm:text-xl md:text-2xl font-bold px-4 text-center">
                    {"Out Of Stock"}
                  </span>
                </div>
              )}
              <img
                src={product.images[selectedImage] || "/placeholder.jpg"}
                alt={product.name}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Thumbnail Images */}
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {product.images.map((image, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    onClick={() => setSelectedImage(index)}
                    className={`shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 p-0 ${
                      selectedImage === index
                        ? "border-primary"
                        : "border-gray-200 hover:border-primary/50"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </Button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Details */}
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2 sm:mb-3">
              {product.name}
            </h1>

            {/* Rating & Stock */}
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${
                      star <= Math.round(reviewStats.average)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
                <span className="text-sm text-gray-600 ml-2">
                  (
                  {reviewStats.average > 0
                    ? reviewStats.average.toFixed(1)
                    : "No Reviews"}
                  )
                  {reviewStats.count > 0 &&
                    ` - ${reviewStats.count} ${"Reviews"}`}
                </span>
              </div>
              <span className="text-gray-400">|</span>
              <span className="text-sm text-gray-600">
                {"Stock"}:{" "}
                <span className={`font-semibold ${
                  availableStock > 0 ? "text-green-600" : "text-red-600"
                }`}>
                  {product.variants.length > 0 && !selectedVariant
                    ? "Select variant to see stock"
                    : availableStock}
                </span>
              </span>
            </div>

            {/* Price */}
            <div className="mb-4 sm:mb-6">
              <div className="flex items-baseline gap-2 sm:gap-3 flex-wrap">
                <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary">
                  ৳{currentPrice.toLocaleString("en-US")}
                </span>
                {product.comparePrice && (
                  <span className="text-lg sm:text-xl text-gray-500 line-through">
                    ৳{product.comparePrice.toLocaleString("en-US")}
                  </span>
                )}
              </div>
              {discount > 0 && (
                <p className="text-xs sm:text-sm text-green-600 mt-1">
                  {"You Are Saving"}: ৳
                  {(product.comparePrice! - currentPrice).toLocaleString(
                    "en-US",
                  )}
                </p>
              )}
            </div>

            {/* Variants */}
            {product.variants.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  {"Select Variant"}:
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant) => (
                    <Button
                      key={variant.id}
                      variant="outline"
                      onClick={() => setSelectedVariant(variant.id)}
                      disabled={variant.stock === 0}
                      className={`px-4 py-2 rounded-lg border-2 ${
                        selectedVariant === variant.id
                          ? "border-primary bg-primary/10 text-primary"
                          : variant.stock === 0
                            ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "border-gray-200 hover:border-primary/50"
                      }`}
                    >
                      <div className="text-sm font-medium">{variant.value}</div>
                      {variant.price && variant.price > 0 && (
                        <div className="text-xs text-gray-500">
                          +৳{variant.price.toLocaleString()}
                        </div>
                      )}
                      {variant.stock === 0 && (
                        <div className="text-xs text-red-500 mt-1">Out of Stock</div>
                      )}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                {"Quantity"}:
              </h3>
              <div className="flex items-center gap-3">
                <div className="flex items-center border-2 border-gray-200 rounded-lg">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={decrementQuantity}
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-5 h-5" />
                  </Button>
                  <span className="px-6 py-2 font-semibold">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={incrementQuantity}
                    disabled={quantity >= availableStock}
                  >
                    <Plus className="w-5 h-5" />
                  </Button>
                </div>
                <span className="text-sm text-gray-600">
                  {"Maximum Quantity"}: {availableStock}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-4 sm:mb-6">
              <ShopButton
                onClick={handleBuyNow}
                disabled={isOutOfStock || (product.variants.length > 0 && !selectedVariant)}
                variant="primary"
                className="py-2.5 sm:py-3 font-semibold text-base sm:text-lg w-full sm:w-auto"
              >
                {"Buy Now"}
              </ShopButton>
              <ShopButton
                variant="outline"
                onClick={handleAddToCart}
                disabled={isOutOfStock || (product.variants.length > 0 && !selectedVariant)}
                className="py-2.5 sm:py-3 font-semibold text-base sm:text-lg gap-2 flex items-center justify-center w-full sm:w-auto"
              >
                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                {"Add to Cart"}
              </ShopButton>
            </div>

            {/* Secondary Actions */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-4 sm:mb-6">
              <Button
                variant="outline"
                onClick={handleWishlistToggle}
                className={`flex-1 border gap-2 ${
                  isWishlisted
                    ? "border-red-500 bg-red-50 text-red-600 hover:bg-red-100"
                    : "border-gray-200 text-gray-700 hover:border-primary/50 hover:text-primary"
                }`}
              >
                <Heart
                  className={`w-5 h-5 ${isWishlisted ? "fill-red-600" : ""}`}
                />
                {isWishlisted ? "In Wishlist" : "Wishlist"}
              </Button>
              <div className="flex-1 relative" ref={shareMenuRef}>
                <Button
                  variant="outline"
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  className="w-full border border-gray-200 text-gray-700 hover:border-primary/50 hover:text-primary gap-2"
                >
                  <Share2 className="w-5 h-5" />
                  {"Share Product"}
                </Button>{" "}
                {/* Share Menu Dropdown */}
                {showShareMenu && (
                  <div className="absolute top-full mt-2 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[200px]">
                    <Button
                      variant="ghost"
                      onClick={() => handleShare("facebook")}
                      className="w-full justify-start gap-3 px-4 py-3 h-auto rounded-none"
                    >
                      <Facebook className="w-5 h-5 text-blue-600" />
                      <span className="text-gray-700">Facebook</span>
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => handleShare("twitter")}
                      className="w-full justify-start gap-3 px-4 py-3 h-auto rounded-none"
                    >
                      <Twitter className="w-5 h-5 text-sky-500" />
                      <span className="text-gray-700">Twitter</span>
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => handleShare("copy")}
                      className="w-full justify-start gap-3 px-4 py-3 h-auto rounded-b-lg rounded-t-none"
                    >
                      {copied ? (
                        <>
                          <Check className="w-5 h-5 text-green-600" />
                          <span className="text-green-600">
                            {"Link Copied"}
                          </span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-5 h-5 text-gray-600" />
                          <span className="text-gray-700">{"Copy Link"}</span>
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Features */}
            {featureCards.length > 0 && (
              <div className="border-t pt-6 space-y-3">
                {featureCards.map((feature) => {
                  // Map icon names to actual icon components
                  const getIcon = (iconName: string) => {
                    switch (iconName.toLowerCase()) {
                      case "truck":
                        return <Truck className="w-5 h-5 text-primary" />;
                      case "shield":
                        return <Shield className="w-5 h-5 text-primary" />;
                      case "rotateccw":
                      case "rotate-ccw":
                        return <RotateCcw className="w-5 h-5 text-primary" />;
                      default:
                        return <Shield className="w-5 h-5 text-primary" />;
                    }
                  };

                  return (
                    <div
                      key={feature.id}
                      className="flex items-center gap-3 text-sm"
                    >
                      {getIcon(feature.icon)}
                      <span className="text-gray-700">
                        {feature.description || feature.title}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Tabbed Section: Description, Reviews, Q&A */}
        <div className="bg-white rounded-lg shadow-sm mt-4 sm:mt-6 md:mt-8">
          {/* Tab Headers */}
          <div className="flex border-b overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setActiveTab("description")}
              className={`px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 font-semibold transition-colors relative whitespace-nowrap text-xs sm:text-sm md:text-base ${
                activeTab === "description"
                  ? "text-primary border-b-2 border-primary"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {"Product Description"}
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 font-semibold transition-colors relative whitespace-nowrap text-xs sm:text-sm md:text-base ${
                activeTab === "reviews"
                  ? "text-primary border-b-2 border-primary"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {"Reviews"} ({reviewStats.count})
            </button>
            <button
              onClick={() => setActiveTab("qa")}
              className={`px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 font-semibold transition-colors relative whitespace-nowrap text-xs sm:text-sm md:text-base ${
                activeTab === "qa"
                  ? "text-primary border-b-2 border-primary"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {"Questions & Answers"}
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-3 sm:p-4 md:p-6">
            {activeTab === "description" && (
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}

            {activeTab === "reviews" && (
              <ProductReviews productId={product.id} />
            )}

            {activeTab === "qa" && <ProductQuestions productId={product.id} />}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-6 sm:mt-8 md:mt-12">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                {"Related Products"}
              </h2>
              <Link
                href={`/products?category=${product.category.slug}`}
                className="text-primary hover:text-primary/90 font-medium text-xs sm:text-sm flex items-center gap-1"
              >
                {"View More"}
                <svg
                  className="w-3 h-3 sm:w-4 sm:h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
