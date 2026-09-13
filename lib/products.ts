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
