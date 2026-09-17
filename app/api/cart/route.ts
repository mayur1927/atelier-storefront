import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";
import { logPrismaError } from "@/lib/logger";

export async function GET() {
  try {
    const userId = await getSessionUserId();

    if (!userId) {
      return NextResponse.json(
        { error: "Not authenticated." },
        { status: 401 }
      );
    }

    const cart = await prisma.cart.findUnique({
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

    return NextResponse.json(cart ?? { items: [] });
  } catch (error) {
    logPrismaError("GET /api/cart", error);

    return NextResponse.json(
      { error: "Failed to fetch cart." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getSessionUserId();

    if (!userId) {
      return NextResponse.json(
        { error: "Please log in to add items to your cart." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const productId =
      typeof body.productId === "string" ? body.productId : "";

    const variantId =
      typeof body.variantId === "string" ? body.variantId : null;

    const size =
      typeof body.size === "string" ? body.size : null;

    const quantity =
      typeof body.quantity === "number" ? body.quantity : 1;

    if (!productId) {
      return NextResponse.json(
        { error: "Product is required." },
        { status: 400 }
      );
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      return NextResponse.json(
        { error: "Quantity must be at least 1." },
        { status: 400 }
      );
    }

    const product = await prisma.product.findFirst({
      where: {
        OR: [
          { id: productId },
          { slug: productId },
        ],
      },
      include: {
        variants: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found." },
        { status: 404 }
      );
    }

    let resolvedVariantId: string | null = null;
    let availableInventory = 999;

    if (variantId) {
      const variant = product.variants.find((v) => v.id === variantId);
      if (!variant) {
        return NextResponse.json(
          { error: "Selected product variant is invalid for this product." },
          { status: 400 }
        );
      }
      resolvedVariantId = variant.id;
      availableInventory = variant.inventory;
    } else if (product.variants.length > 0) {
      const defaultVariant = product.variants[0];
      resolvedVariantId = defaultVariant.id;
      availableInventory = defaultVariant.inventory;
    }

    const cart = await prisma.cart.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });

    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: product.id,
        variantId: resolvedVariantId,
        size,
      },
    });

    const totalQuantity = (existingItem?.quantity || 0) + quantity;

    if (totalQuantity > availableInventory) {
      return NextResponse.json(
        {
          error: `Only ${availableInventory} items available in stock.`,
        },
        { status: 400 }
      );
    }

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: totalQuantity,
        },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: product.id,
          variantId: resolvedVariantId,
          size,
          quantity,
        },
      });
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
    logPrismaError("POST /api/cart", error);

    return NextResponse.json(
      { error: "Failed to add item to cart." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const userId = await getSessionUserId();

    if (!userId) {
      return NextResponse.json(
        { error: "Not authenticated." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const itemId =
      typeof body.itemId === "string" ? body.itemId : "";

    const quantity =
      typeof body.quantity === "number" ? body.quantity : 0;

    if (!itemId || !Number.isInteger(quantity)) {
      return NextResponse.json(
        { error: "Item ID and valid quantity are required." },
        { status: 400 }
      );
    }

    const cart = await prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      return NextResponse.json(
        { error: "Cart not found." },
        { status: 404 }
      );
    }

    const item = await prisma.cartItem.findFirst({
      where: {
        id: itemId,
        cartId: cart.id,
      },
    });

    if (!item) {
      return NextResponse.json(
        { error: "Cart item not found." },
        { status: 404 }
      );
    }

    if (quantity <= 0) {
      await prisma.cartItem.delete({
        where: { id: itemId },
      });
    } else {
      if (item.variantId) {
        const variant = await prisma.productVariant.findUnique({
          where: { id: item.variantId },
        });

        if (variant && quantity > variant.inventory) {
          return NextResponse.json(
            { error: `Only ${variant.inventory} items available in stock.` },
            { status: 400 }
          );
        }
      }

      await prisma.cartItem.update({
        where: { id: itemId },
        data: { quantity },
      });
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
    logPrismaError("PATCH /api/cart", error);

    return NextResponse.json(
      { error: "Failed to update cart." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const userId = await getSessionUserId();

    if (!userId) {
      return NextResponse.json(
        { error: "Not authenticated." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const itemId =
      typeof body.itemId === "string" ? body.itemId : "";

    if (!itemId) {
      return NextResponse.json(
        { error: "Item ID is required." },
        { status: 400 }
      );
    }

    const cart = await prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      return NextResponse.json(
        { error: "Cart not found." },
        { status: 404 }
      );
    }

    const item = await prisma.cartItem.findFirst({
      where: {
        id: itemId,
        cartId: cart.id,
      },
    });

    if (!item) {
      return NextResponse.json(
        { error: "Cart item not found." },
        { status: 404 }
      );
    }

    await prisma.cartItem.delete({
      where: { id: itemId },
    });

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
    logPrismaError("DELETE /api/cart", error);

    return NextResponse.json(
      { error: "Failed to remove cart item." },
      { status: 500 }
    );
  }
}