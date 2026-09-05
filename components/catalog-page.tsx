"use client";

import { useMemo, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import {
  brands,
  categories,
  products,
  type ProductCategory,
} from "@/lib/mockData";
import { ProductCard } from "@/components/product-card";
import { Breadcrumbs } from "@/components/shared";

type Props = {
  title: string;
  query?: string;
  initialCategory?: string;
};

const canonical = (value: string) =>
  value.toLowerCase().replace(/[^a-z]/g, "");

export function CatalogPage({ title, query = "", initialCategory }: Props) {
  const [selectedCategories, setSelectedCategories] = useState<
    ProductCategory[]
  >(() => {
    const found = categories.find(
      (category) => canonical(category.name) === canonical(initialCategory ?? "")
    );
    return found ? [found.name] : [];
  });

  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(200);
  const [sizes, setSizes] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [sort, setSort] = useState("popularity");
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filtered = useMemo(() => {
    const matched = products.filter((product) => {
      const text = `${product.name} ${product.category} ${product.brand}`.toLowerCase();
      const matchesQuery = !query || text.includes(query.toLowerCase());
      const matchesCategory =
        !selectedCategories.length ||
        selectedCategories.includes(product.category);
      const matchesBrand =
        !selectedBrands.length || selectedBrands.includes(product.brand);
      const matchesPrice = product.price <= maxPrice;
      const matchesSize =
        !sizes.length || product.sizes.some((size) => sizes.includes(size));
      const matchesColor =
        !colors.length || product.colors.some((color) => colors.includes(color));

      return (
        matchesQuery &&
        matchesCategory &&
        matchesBrand &&
        matchesPrice &&
        matchesSize &&
        matchesColor
      );
    });

    return [...matched].sort((a, b) => {
      if (sort === "price-low") return a.price - b.price;
      if (sort === "price-high") return b.price - a.price;
      if (sort === "rating") return b.rating - a.rating;
      return b.reviewCount - a.reviewCount;
    });
  }, [colors, maxPrice, query, selectedBrands, selectedCategories, sizes, sort]);

  const perPage = 8;
  const pageCount = Math.max(1, Math.ceil(filtered.length / perPage));
  const visible = filtered.slice((page - 1) * perPage, page * perPage);

  const toggle = <T,>(
    value: T,
    values: T[],
    setValues: (values: T[]) => void
  ) => {
    setValues(
      values.includes(value)
        ? values.filter((item) => item !== value)
        : [...values, value]
    );
    setPage(1);
  };

  const reset = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setMaxPrice(200);
    setSizes([]);
    setColors([]);
    setPage(1);
  };

  const filters = (
    <aside className="space-y-7">
      <div className="flex items-center justify-between">
        <p className="font-bold">Filters</p>
        <button onClick={reset} className="text-xs underline">
          Clear all
        </button>
      </div>

      <FilterTitle title="Categories">
        {categories.map((category) => (
          <Check
            key={category.name}
            checked={selectedCategories.includes(category.name)}
            onChange={() =>
              toggle(category.name, selectedCategories, setSelectedCategories)
            }
            label={category.name}
          />
        ))}
      </FilterTitle>

      <FilterTitle title={`Price up to $${maxPrice}`}>
        <input
          aria-label="Maximum price"
          type="range"
          min="25"
          max="200"
          step="5"
          value={maxPrice}
          onChange={(event) => {
            setMaxPrice(Number(event.target.value));
            setPage(1);
          }}
          className="w-full accent-zinc-900"
        />
        <div className="mt-1 flex justify-between text-xs text-zinc-400">
          <span>$0</span>
          <span>$200</span>
        </div>
      </FilterTitle>

      <FilterTitle title="Brand">
        {brands.map((brand) => (
          <Check
            key={brand}
            checked={selectedBrands.includes(brand)}
            onChange={() =>
              toggle(brand, selectedBrands, setSelectedBrands)
            }
            label={brand}
          />
        ))}
      </FilterTitle>

      <FilterTitle title="Size">
        <div className="flex flex-wrap gap-2">
          {["XS", "S", "M", "L", "XL", "7", "8", "9", "10"].map((size) => (
            <button
              key={size}
              onClick={() => toggle(size, sizes, setSizes)}
              className={`min-w-9 rounded-md border px-2 py-1.5 text-xs ${
                sizes.includes(size)
                  ? "border-zinc-950 bg-zinc-950 text-white"
                  : "border-zinc-200"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </FilterTitle>

      <FilterTitle title="Color">
        <div className="flex flex-wrap gap-2">
          {["Black", "White", "Stone", "Ink", "Steel", "Green"].map((color) => (
            <button
              key={color}
              onClick={() => toggle(color, colors, setColors)}
              className={`rounded-full border px-3 py-1.5 text-xs ${
                colors.includes(color)
                  ? "border-zinc-950 bg-zinc-950 text-white"
                  : "border-zinc-200"
              }`}
            >
              {color}
            </button>
          ))}
        </div>
      </FilterTitle>
    </aside>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumbs
        items={[{ label: "Home", href: "/" }, { label: title }]}
      />

      <div className="mt-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-400">
            Curated essentials
          </p>
          <h1 className="mt-1 text-4xl font-black tracking-[-0.06em]">
            {title}
          </h1>
        </div>

        <button
          onClick={() => setFiltersOpen(true)}
          className="flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-sm font-semibold lg:hidden"
        >
          <SlidersHorizontal size={16} /> Filters
        </button>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[230px_1fr]">
        <div className="hidden border-r border-zinc-200 pr-7 lg:block">
          {filters}
        </div>

        <div>
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-zinc-500">
              Showing {filtered.length} product
              {filtered.length === 1 ? "" : "s"}
            </p>

            <select
              value={sort}
              onChange={(event) => {
                setSort(event.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none"
            >
              <option value="popularity">Sort: Popularity</option>
              <option value="rating">Sort: Rating</option>
              <option value="price-low">Price: Low to high</option>
              <option value="price-high">Price: High to low</option>
            </select>
          </div>

          {visible.length ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 xl:grid-cols-4">
              {visible.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-zinc-300 py-20 text-center">
              <p className="font-bold">No products match those filters.</p>
              <button onClick={reset} className="mt-3 text-sm underline">
                Reset filters
              </button>
            </div>
          )}

          <div className="mt-12 flex justify-center gap-2">
            {Array.from({ length: pageCount }, (_, index) => (
              <button
                key={index}
                onClick={() => setPage(index + 1)}
                className={`grid h-9 w-9 place-items-center rounded-md border text-sm ${
                  page === index + 1
                    ? "border-zinc-950 bg-zinc-950 text-white"
                    : "border-zinc-200"
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filtersOpen && (
        <div className="fixed inset-0 z-50 bg-zinc-950/30 lg:hidden">
          <div className="absolute bottom-0 top-0 w-[min(340px,90vw)] overflow-y-auto bg-white p-5 shadow-xl">
            <button
              onClick={() => setFiltersOpen(false)}
              className="mb-6 flex items-center gap-2 text-sm font-semibold"
            >
              <X size={17} /> Close filters
            </button>
            {filters}
          </div>
        </div>
      )}
    </div>
  );
}

function FilterTitle({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-3 text-sm font-bold">{title}</h2>
      <div className="grid gap-2">{children}</div>
    </section>
  );
}

function Check({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-600">
      <input
        checked={checked}
        onChange={onChange}
        type="checkbox"
        className="accent-zinc-950"
      />
      {label}
    </label>
  );
}
