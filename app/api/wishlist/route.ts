import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";

export async function GET() {
  try {
    const userId = await getSessionUserId();

    if (!userId) {
      return NextResponse.json(
        { error: "Not authenticated." },
        { status: 401 }
      );
    }

    const items = await prisma.wishlistItem.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            variants: {
              include: {
                images: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const wishlist = items.map((item) => ({
      id: item.product.id,
      slug: item.product.slug,
      name: item.product.name,
      description: item.product.description,
      price: Number(item.product.price),
      category: item.product.category,
      brand: item.product.brand,
      sizes: item.product.sizes,
      image: item.product.image,
      rating: item.product.rating,
      reviewCount: item.product.reviewCount,
      isBestSeller: item.product.isBestSeller,
      colors: Array.from(new Set(item.product.variants.map((v) => v.colour))),
    }));

    return NextResponse.json({
      items: wishlist,
      ids: wishlist.map((w) => w.id),
    });
  } catch (error) {
    console.error("Failed to fetch wishlist:", error);

    return NextResponse.json(
      { error: "Failed to fetch wishlist." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getSessionUserId();

    if (!userId) {
      return NextResponse.json(
        { error: "Please log in to manage your wishlist." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const productId = typeof body.productId === "string" ? body.productId : "";

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required." },
        { status: 400 }
      );
    }

    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id: productId }, { slug: productId }],
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found." },
        { status: 404 }
      );
    }

    const existing = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId: product.id,
        },
      },
    });

    let action = "added";

    if (existing) {
      await prisma.wishlistItem.delete({
        where: { id: existing.id },
      });
      action = "removed";
    } else {
      await prisma.wishlistItem.create({
        data: {
          userId,
          productId: product.id,
        },
      });
    }

    const allItems = await prisma.wishlistItem.findMany({
      where: { userId },
      select: { productId: true },
    });

    return NextResponse.json({
      action,
      ids: allItems.map((item) => item.productId),
    });
  } catch (error) {
    console.error("Failed to update wishlist:", error);

    return NextResponse.json(
      { error: "Failed to update wishlist." },
      { status: 500 }
    );
  }
}
