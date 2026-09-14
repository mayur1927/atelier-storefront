import { prisma } from "@/lib/prisma";

export type ProductVariant = {
  id: string;
  color: string;
  colour: string;
  sku: string;
  inventory: number;
  image: string;
  images: string[];
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  category: string;
  brand: string;
  sizes: string[];
  image: string;
  rating: number;
  reviewCount: number;
  isBestSeller?: boolean;
  colors: string[];
  variants: ProductVariant[];
};

export type CategoryInfo = {
  name: string;
  caption: string;
  image: string;
};

const CATEGORY_METADATA: Record<string, { caption: string; image: string }> = {
  Men: {
    caption: "Everyday tailoring",
    image:
      "https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=800&q=80",
  },
  Women: {
    caption: "Effortless layers",
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80",
  },
  Footwear: {
    caption: "Grounded in comfort",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
  },
  Bags: {
    caption: "Carry it beautifully",
    image:
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80",
  },
  Watches: {
    caption: "Time, refined",
    image:
      "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80",
  },
};

export async function getDbCategories(): Promise<CategoryInfo[]> {
  try {
    const results = await prisma.product.findMany({
      select: {
        category: true,
      },
      distinct: ["category"],
    });

    return results
      .map((r) => r.category)
      .filter(Boolean)
      .map((cat) => ({
        name: cat,
        caption: CATEGORY_METADATA[cat]?.caption || "Curated collection",
        image:
          CATEGORY_METADATA[cat]?.image ||
          "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80",
      }));
  } catch (error) {
    console.error("Failed to load categories from database:", error);
    return Object.entries(CATEGORY_METADATA).map(([name, meta]) => ({
      name,
      ...meta,
    }));
  }
}

export async function getDbBrands(): Promise<string[]> {
  try {
    const results = await prisma.product.findMany({
      select: {
        brand: true,
      },
      distinct: ["brand"],
    });

    return results.map((r) => r.brand).filter(Boolean);
  } catch (error) {
    console.error("Failed to load brands from database:", error);
    return [];
  }
}

export async function getDbProducts(filters?: {
  category?: string;
  brand?: string;
  search?: string;
  bestSeller?: boolean;
  sort?: string;
}): Promise<Product[]> {
  try {
    const where: Record<string, unknown> = {};

    if (filters?.category && filters.category !== "all") {
      where.category = {
        equals: filters.category,
        mode: "insensitive",
      };
    }

    if (filters?.brand) {
      where.brand = {
        equals: filters.brand,
        mode: "insensitive",
      };
    }

    if (filters?.bestSeller) {
      where.isBestSeller = true;
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
        { category: { contains: filters.search, mode: "insensitive" } },
        { brand: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    let orderBy: Record<string, string> = { createdAt: "asc" };

    if (filters?.sort === "price-low") {
      orderBy = { price: "asc" };
    } else if (filters?.sort === "price-high") {
      orderBy = { price: "desc" };
    } else if (filters?.sort === "rating") {
      orderBy = { rating: "desc" };
    } else if (filters?.sort === "popularity") {
      orderBy = { reviewCount: "desc" };
    }

    const products = await prisma.product.findMany({
      where,
      orderBy,
      include: {
        variants: {
          include: {
            images: {
              orderBy: { position: "asc" },
            },
          },
        },
        images: {
          orderBy: { position: "asc" },
        },
      },
    });

    return products.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      description: p.description,
      price: Number(p.price),
      category: p.category,
      brand: p.brand,
      sizes: p.sizes,
      image: p.image,
      rating: p.rating,
      reviewCount: p.reviewCount,
      isBestSeller: p.isBestSeller,
      colors: Array.from(new Set(p.variants.map((v) => v.colour))),
      variants: p.variants.map((v) => ({
        id: v.id,
        color: v.colour,
        colour: v.colour,
        sku: v.sku,
        inventory: v.inventory,
        image: v.images[0]?.url || p.image,
        images: v.images.map((img) => img.url),
      })),
    }));
  } catch (error) {
    console.error("Failed to load products from database:", error);
    return [];
  }
}

export async function getDbProductByIdOrSlug(
  idOrSlug: string
): Promise<Product | null> {
  try {
    const p = await prisma.product.findFirst({
      where: {
        OR: [
          { id: idOrSlug },
          { slug: idOrSlug },
        ],
      },
      include: {
        variants: {
          include: {
            images: {
              orderBy: { position: "asc" },
            },
          },
        },
        images: {
          orderBy: { position: "asc" },
        },
      },
    });

    if (!p) return null;

    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      description: p.description,
      price: Number(p.price),
      category: p.category,
      brand: p.brand,
      sizes: p.sizes,
      image: p.image,
      rating: p.rating,
      reviewCount: p.reviewCount,
      isBestSeller: p.isBestSeller,
      colors: Array.from(new Set(p.variants.map((v) => v.colour))),
      variants: p.variants.map((v) => ({
        id: v.id,
        color: v.colour,
        colour: v.colour,
        sku: v.sku,
        inventory: v.inventory,
        image: v.images[0]?.url || p.image,
        images: v.images.map((img) => img.url),
      })),
    };
  } catch (error) {
    console.error(`Failed to load product ${idOrSlug} from database:`, error);
    return null;
  }
}
