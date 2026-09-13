import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";
import { calculatePricing } from "@/lib/pricing";

export async function GET() {
  try {
    const userId = await getSessionUserId();

    if (!userId) {
      return NextResponse.json(
        { error: "Not authenticated." },
        { status: 401 }
      );
    }

    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getSessionUserId();

    if (!userId) {
      return NextResponse.json(
        { error: "Please log in to place an order." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const couponCode = typeof body.couponCode === "string" ? body.couponCode.trim().toUpperCase() : null;

    // Fetch user cart
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

    if (!cart || !cart.items.length) {
      return NextResponse.json(
        { error: "Your cart is empty." },
        { status: 400 }
      );
    }

    // Coupon discount verification
    let discountAmount = 0;
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode },
      });

      if (coupon && coupon.active && (!coupon.expiresAt || coupon.expiresAt >= new Date())) {
        discountAmount = Number(coupon.discountAmount);
      }
    }

    const pricingItems = cart.items.map((item) => ({
      price: Number(item.product.price),
      quantity: item.quantity,
    }));

    const pricing = calculatePricing(pricingItems, discountAmount);

    // Atomic transaction: Create Order + OrderItems, decrement variant inventory if variant exists, clear Cart
    const newOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          userId,
          subtotal: pricing.subtotal,
          discount: pricing.discount,
          couponCode: discountAmount > 0 ? couponCode : null,
          total: pricing.total,
          status: "PAID",
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              variantId: item.variantId,
              productName: item.product.name,
              price: item.product.price,
              quantity: item.quantity,
              size: item.size,
              colour: item.variant?.colour || null,
              image: item.variant?.images?.[0]?.url || item.product.image,
            })),
          },
        },
        include: {
          items: true,
        },
      });

      // Decrement inventory safely where variant exists
      for (const item of cart.items) {
        if (item.variantId) {
          await tx.productVariant.updateMany({
            where: {
              id: item.variantId,
              inventory: { gte: item.quantity },
            },
            data: {
              inventory: { decrement: item.quantity },
            },
          });
        }
      }

      // Clear cart items
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return order;
    });

    return NextResponse.json({
      success: true,
      order: newOrder,
    }, { status: 201 });
  } catch (error) {
    console.error("Failed to process order:", error);
    return NextResponse.json(
      { error: "Failed to process order." },
      { status: 500 }
    );
  }
}
