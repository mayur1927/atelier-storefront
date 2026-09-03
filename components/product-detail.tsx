"use client";

import Link from "next/link";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { useState } from "react";
import {
  getProductVariants,
  type Product,
} from "@/lib/mockData";
import { useStore } from "@/context/store-context";
import { Breadcrumbs, QuantityPicker } from "@/components/shared";

export function ProductDetail({ product }: { product: Product }) {
  const variants = getProductVariants(product);

  const [size, setSize] = useState(product.sizes[0]);
  const [color, setColor] = useState(variants[0]?.color || product.colors[0]);
  const [selectedImage, setSelectedImage] = useState(
    variants[0]?.image || product.image
  );
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("Description");

  const { addToCart, toggleWishlist, wishlistIds } = useStore();

  const inWishlist = wishlistIds.includes(product.id);

  const add = async () => {
    for (let i = 0; i < quantity; i += 1) {
      await addToCart(product, {
        size,
        color,
        image: selectedImage,
      });
    }
  };

  const handleColorChange = (variant: {
    color: string;
    image: string;
  }) => {
    setColor(variant.color);
    setSelectedImage(variant.image);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          {
            label: product.category,
            href: `/category/${product.category.toLowerCase()}`,
          },
          { label: product.name },
        ]}
      />

      <div className="mt-6 grid gap-8 lg:grid-cols-[1.12fr_0.88fr] lg:gap-14">

        {/* PRODUCT IMAGES */}
        <div className="grid gap-3 sm:grid-cols-[90px_1fr]">

          {/* COLOUR IMAGE THUMBNAILS */}
          <div className="order-2 flex gap-3 sm:order-1 sm:flex-col">
            {variants.map((variant) => (
              <button
                key={variant.color}
                type="button"
                onClick={() => handleColorChange(variant)}
                aria-label={`View ${variant.color} product image`}
                aria-pressed={color === variant.color}
                className={`aspect-square w-16 overflow-hidden rounded-lg border-2 sm:w-auto ${
                  color === variant.color
                    ? "border-zinc-950"
                    : "border-transparent"
                }`}
              >
                <img
                  src={variant.image}
                  alt={`${product.name} in ${variant.color}`}
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>

          {/* MAIN IMAGE */}
          <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-zinc-100">
            <img
              src={selectedImage}
              alt={`${product.name} in ${color}`}
              className="h-full w-full object-cover transition-all duration-300"
            />
          </div>
        </div>

        {/* PRODUCT INFORMATION */}
        <div className="lg:pt-3">

          <p className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-400">
            {product.brand} / {product.category}
          </p>

          <div className="mt-2 flex items-start justify-between gap-4">
            <h1 className="text-3xl font-black tracking-[-0.055em] sm:text-4xl">
              {product.name}
            </h1>

            <button
              onClick={() => toggleWishlist(product.id)}
              className="rounded-full border border-zinc-200 p-3"
              aria-label="Toggle wishlist"
            >
              <Heart
                size={19}
                className={inWishlist ? "fill-zinc-950" : ""}
              />
            </button>
          </div>

          {/* RATING */}
          <div className="mt-4 flex items-center gap-2">
            <Star size={16} className="fill-zinc-950" />
            <span className="font-semibold">
              {product.rating.toFixed(1)}
            </span>
            <span className="text-sm text-zinc-500">
              ({product.reviewCount} reviews)
            </span>
          </div>

          {/* PRICE */}
          <p className="mt-5 text-2xl font-bold">
            ${product.price.toFixed(2)}
          </p>

          <p className="mt-1 text-xs text-zinc-500">
            Inclusive of taxes. Shipping calculated at checkout.
          </p>

          {/* COLOR */}
          <div className="mt-7">
            <div className="flex justify-between text-sm">
              <span className="font-bold">Color</span>
              <span className="text-zinc-500">{color}</span>
            </div>

            <div className="mt-3 flex flex-wrap gap-3">
              {variants.map((variant) => (
                <button
                  key={variant.color}
                  type="button"
                  onClick={() => handleColorChange(variant)}
                  className={`group overflow-hidden rounded-xl border-2 ${
                    color === variant.color
                      ? "border-zinc-950"
                      : "border-zinc-200"
                  }`}
                >
                  <div className="h-20 w-16 overflow-hidden">
                    <img
                      src={variant.image}
                      alt={variant.color}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div
                    className={`px-3 py-2 text-xs font-semibold ${
                      color === variant.color
                        ? "bg-zinc-950 text-white"
                        : "bg-white text-zinc-700"
                    }`}
                  >
                    {variant.color}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* SIZE */}
          <div className="mt-6">
            <p className="text-sm font-bold">Size</p>

            <div className="mt-3 flex flex-wrap gap-2">
              {product.sizes.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setSize(option)}
                  className={`min-w-11 rounded-md border px-3 py-2 text-sm ${
                    size === option
                      ? "border-zinc-950 bg-zinc-950 text-white"
                      : "border-zinc-200"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* QUANTITY */}
          <div className="mt-6">
            <p className="mb-3 text-sm font-bold">Quantity</p>

            <QuantityPicker
              quantity={quantity}
              onChange={setQuantity}
            />
          </div>

          {/* ACTIONS */}
          <div className="mt-7 grid gap-3 sm:grid-cols-[1fr_auto]">
            <button
              onClick={add}
              className="flex items-center justify-center gap-2 rounded-xl bg-zinc-950 px-5 py-4 text-xs font-bold tracking-[0.13em] text-white hover:bg-zinc-700"
            >
              <ShoppingBag size={17} />
              ADD TO CART
            </button>

            <button
              onClick={async () => {
                await add();
                window.location.assign("/checkout");
              }}
              className="rounded-xl border border-zinc-950 px-6 py-4 text-xs font-bold tracking-[0.13em] hover:bg-zinc-100"
            >
              BUY NOW
            </button>
          </div>

          {/* BENEFITS */}
          <div className="mt-7 grid grid-cols-3 gap-3 border-y border-zinc-200 py-5 text-center text-xs text-zinc-500">
            <span>
              Free shipping
              <br />
              <b className="text-zinc-900">over $75</b>
            </span>

            <span>
              Easy returns
              <br />
              <b className="text-zinc-900">30 days</b>
            </span>

            <span>
              Secure checkout
              <br />
              <b className="text-zinc-900">encrypted</b>
            </span>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="mt-14 border-t border-zinc-200">
        <div className="flex overflow-auto">
          {["Description", "Reviews", "Shipping & Returns"].map(
            (tab) => (
              <button
                onClick={() => setActiveTab(tab)}
                key={tab}
                className={`whitespace-nowrap border-b-2 px-4 py-4 text-sm font-bold ${
                  activeTab === tab
                    ? "border-zinc-950"
                    : "border-transparent text-zinc-400"
                }`}
              >
                {tab}
              </button>
            )
          )}
        </div>

        <div className="max-w-2xl py-6 text-sm leading-6 text-zinc-600">
          {activeTab === "Description" ? (
            <>
              <p>{product.description}</p>

              <ul className="mt-3 list-disc pl-5">
                <li>Designed for easy, everyday wear.</li>
                <li>Available in multiple colors and sizes.</li>
                <li>Thoughtfully made in limited quantities.</li>
              </ul>
            </>
          ) : activeTab === "Reviews" ? (
            <p>
              Customers love the fit, quality, and understated details.
              This product is rated {product.rating.toFixed(1)} out of 5
              from {product.reviewCount} verified reviews.
            </p>
          ) : (
            <p>
              Orders over $75 ship free. Returns are accepted within 30
              days of delivery in original condition.{" "}
              <Link href="/shipping" className="underline">
                Read the full policy
              </Link>
              .
            </p>
          )}
        </div>
      </div>
    </div>
  );
}