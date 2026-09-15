import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";
import { calculatePricing } from "@/lib/pricing";
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
    logPrismaError("GET /api/orders", error);
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

    // Resolve shipping address
    let shippingFullName = "";
    let shippingAddress = "";
    let shippingCity = "";
    let shippingState = "";
    let shippingPostalCode = "";
    let shippingCountry = "India";
    let shippingPhone = "";

    if (body.addressId && typeof body.addressId === "string") {
      const savedAddress = await prisma.address.findFirst({
        where: { id: body.addressId, userId },
      });

      if (!savedAddress) {
        return NextResponse.json(
          { error: "Selected address could not be found." },
          { status: 400 }
        );
      }

      shippingFullName = savedAddress.fullName;
      shippingAddress = savedAddress.line1 + (savedAddress.line2 ? `, ${savedAddress.line2}` : "");
      shippingCity = savedAddress.city;
      shippingState = savedAddress.state || "";
      shippingPostalCode = savedAddress.postalCode;
      shippingCountry = savedAddress.country || "India";
      shippingPhone = savedAddress.phone || "";
    } else if (body.shipping && typeof body.shipping === "object") {
      const s = body.shipping;
      shippingFullName = typeof s.fullName === "string" ? s.fullName.trim() : typeof s.name === "string" ? s.name.trim() : "";
      shippingAddress = typeof s.line1 === "string" ? s.line1.trim() : typeof s.address === "string" ? s.address.trim() : "";
      if (s.line2 && typeof s.line2 === "string" && s.line2.trim()) {
        shippingAddress += `, ${s.line2.trim()}`;
      }
      shippingCity = typeof s.city === "string" ? s.city.trim() : "";
      shippingState = typeof s.state === "string" ? s.state.trim() : "";
      shippingPostalCode = typeof s.postalCode === "string" ? s.postalCode.trim() : typeof s.zip === "string" ? s.zip.trim() : "";
      shippingCountry = typeof s.country === "string" && s.country.trim() ? s.country.trim() : "India";
      shippingPhone = typeof s.phone === "string" ? s.phone.trim() : "";

      if (body.saveAddress && shippingFullName && shippingAddress && shippingCity && shippingPostalCode) {
        try {
          await prisma.address.create({
            data: {
              userId,
              fullName: shippingFullName,
              line1: typeof s.line1 === "string" ? s.line1.trim() : typeof s.address === "string" ? s.address.trim() : shippingAddress,
              line2: typeof s.line2 === "string" ? s.line2.trim() : undefined,
              city: shippingCity,
              state: shippingState || undefined,
              postalCode: shippingPostalCode,
              country: shippingCountry,
              phone: shippingPhone || undefined,
            },
          });
        } catch (addrErr) {
          logPrismaError("POST /api/orders:saveAddress", addrErr);
        }
      }
    }

    if (!shippingFullName || !shippingAddress || !shippingCity || !shippingPostalCode) {
      return NextResponse.json(
        { error: "Complete shipping address is required to place an order." },
        { status: 400 }
      );
    }

    // Fetch user cart
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                variants: true,
              },
            },
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

    // Atomic transaction: Validate stock, create Order + OrderItems, decrement inventory, clear Cart
    const newOrder = await prisma.$transaction(async (tx) => {
      // 1. Authoritative inventory check
      for (const item of cart.items) {
        if (!item.variantId && item.product.variants && item.product.variants.length > 0) {
          throw new Error(
            `Variant selection missing for ${item.product.name}. Please re-add the item to your cart.`
          );
        }

        if (item.variantId) {
          const liveVariant = await tx.productVariant.findUnique({
            where: { id: item.variantId },
          });

          if (!liveVariant || liveVariant.productId !== item.productId) {
            throw new Error(
              `Invalid variant for ${item.product.name}. Please re-add the item to your cart.`
            );
          }

          if (liveVariant.inventory < item.quantity) {
            throw new Error(
              `Insufficient stock for ${item.product.name} (${liveVariant.colour || "selected variant"}). Available: ${liveVariant.inventory}`
            );
          }
        }
      }

      // 2. Create Order with complete shipping snapshot
      const order = await tx.order.create({
        data: {
          userId,
          subtotal: pricing.subtotal,
          discount: pricing.discount,
          couponCode: discountAmount > 0 ? couponCode : null,
          total: pricing.total,
          status: "CONFIRMED",
          shippingFullName,
          shippingAddress,
          shippingCity,
          shippingState,
          shippingPostalCode,
          shippingCountry,
          shippingPhone,
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

      // 3. Decrement inventory safely
      for (const item of cart.items) {
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: {
              inventory: { decrement: item.quantity },
            },
          });
        }
      }

      // 4. Clear cart items
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return order;
    });

    return NextResponse.json(
      {
        success: true,
        order: newOrder,
      },
      { status: 201 }
    );
  } catch (error) {
    logPrismaError("POST /api/orders", error);
    const message = error instanceof Error ? error.message : "Failed to process order.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
