import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logPrismaError } from "@/lib/logger";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  _request: Request,
  { params }: RouteContext
) {
  try {
    const { id } = await params;

    const product = await prisma.product.findFirst({
      where: {
        OR: [
          { id },
          { slug: id },
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

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    const formattedProduct = {
      ...product,
      price: Number(product.price),
      colors: Array.from(new Set(product.variants.map((v) => v.colour))),
      variants: product.variants.map((v) => ({
        id: v.id,
        color: v.colour,
        colour: v.colour,
        sku: v.sku,
        inventory: v.inventory,
        image: v.images[0]?.url || product.image,
        images: v.images.map((img) => img.url),
      })),
    };

    return NextResponse.json(formattedProduct);
  } catch (error) {
    logPrismaError("GET /api/products/[id]", error);

    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}
