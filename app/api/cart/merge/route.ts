import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";
import { logPrismaError } from "@/lib/logger";

export async function POST(request: Request) {
  try {
    const userId = await getSessionUserId();

    if (!userId) {
      return NextResponse.json(
        { error: "Not authenticated." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const items = Array.isArray(body.items) ? body.items : [];

    if (!items.length) {
      const currentCart = await prisma.cart.findUnique({
        where: { userId },
        include: {
          items: {
            include: {
              product: true,
              variant: {
                include: {
                  images: true,
                },
              },
            },
          },
        },
      });

      return NextResponse.json(currentCart ?? { items: [] });
    }

    const cart = await prisma.cart.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });

    for (const item of items) {
      const productId = typeof item.productId === "string" ? item.productId : item.id;
      if (!productId) continue;

      const product = await prisma.product.findFirst({
        where: {
          OR: [{ id: productId }, { slug: productId }],
        },
      });

      if (!product) continue;

      let resolvedVariantId: string | null = null;
      let availableStock = 999;

      if (item.variantId) {
        const variant = await prisma.productVariant.findFirst({
          where: {
            id: item.variantId,
            productId: product.id,
          },
        });

        if (variant) {
          resolvedVariantId = variant.id;
          availableStock = variant.inventory;
        }
      }


      const size = typeof item.size === "string" ? item.size : null;
      const addQuantity = Math.max(1, Math.round(typeof item.quantity === "number" ? item.quantity : 1));


      const existingItem = await prisma.cartItem.findFirst({
        where: {
          cartId: cart.id,
          productId: product.id,
          variantId: resolvedVariantId,
          size,
        },
      });

      const currentQty = existingItem ? existingItem.quantity : 0;
      const newQuantity = Math.max(1, Math.min(availableStock, currentQty + addQuantity));

      if (existingItem) {
        await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: newQuantity },
        });
      } else {
        await prisma.cartItem.create({
          data: {
            cartId: cart.id,
            productId: product.id,
            variantId: resolvedVariantId,
            size,
            quantity: newQuantity,
          },
        });
      }
    }

    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: {
        items: {
          include: {
            product: true,
            variant: {
              include: {
                images: true,
              },
            },
          },
        },
      },
    });


    return NextResponse.json(updatedCart);
  } catch (error) {
    logPrismaError("POST /api/cart/merge", error);
    return NextResponse.json(
      { error: "Failed to merge cart." },
      { status: 500 }
    );
  }
}
