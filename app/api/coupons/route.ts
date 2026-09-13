import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateCouponCode } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawCode = typeof body.code === "string" ? body.code : "";
    const code = validateCouponCode(rawCode);

    const coupon = await prisma.coupon.findUnique({
      where: { code },
    });

    if (!coupon || !coupon.active) {
      return NextResponse.json(
        { error: "Invalid coupon code." },
        { status: 404 }
      );
    }

    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Coupon has expired." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discountAmount: Number(coupon.discountAmount),
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to validate coupon.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
