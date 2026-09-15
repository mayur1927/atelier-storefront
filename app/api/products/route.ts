import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logPrismaError } from "@/lib/logger";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const category = searchParams.get("category");
    const brand = searchParams.get("brand");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const search = searchParams.get("search") || searchParams.get("q");
    const bestSeller = searchParams.get("bestSeller");
    const sort = searchParams.get("sort");

    const where: Record<string, unknown> = {};

    if (category && category !== "all") {
      where.category = {
        equals: category,
        mode: "insensitive",
      };
    }

    if (brand) {
      where.brand = {
        equals: brand,
        mode: "insensitive",
      };
    }

    if (bestSeller === "true") {
      where.isBestSeller = true;
    }

    if (minPrice || maxPrice) {
      const priceFilter: Record<string, number> = {};
      if (minPrice) priceFilter.gte = Number(minPrice);
      if (maxPrice) priceFilter.lte = Number(maxPrice);
      where.price = priceFilter;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { category: { contains: search, mode: "insensitive" } },
        { brand: { contains: search, mode: "insensitive" } },
      ];
    }

    let orderBy: Record<string, string> = { createdAt: "asc" };

    if (sort === "price-low") {
      orderBy = { price: "asc" };
    } else if (sort === "price-high") {
      orderBy = { price: "desc" };
    } else if (sort === "rating") {
      orderBy = { rating: "desc" };
    } else if (sort === "popularity") {
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

    const formattedProducts = products.map((p) => ({
      ...p,
      price: Number(p.price),
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

    return NextResponse.json(formattedProducts);
  } catch (error) {
    logPrismaError("GET /api/products", error);

    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}