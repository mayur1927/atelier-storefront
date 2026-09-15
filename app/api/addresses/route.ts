import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";
import { validateAddress } from "@/lib/validations";
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

    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ addresses });
  } catch (error) {
    logPrismaError("GET /api/addresses", error);

    return NextResponse.json(
      { error: "Failed to fetch addresses." },
      { status: 500 }
    );
  }
}

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
    const result = validateAddress({
      fullName: body.fullName || body.name,
      line1: body.line1 || body.address,
      line2: body.line2,
      city: body.city,
      state: body.state,
      postalCode: body.postalCode || body.zip,
      country: body.country || "India",
      phone: body.phone,
    });

    if (!result.valid || !result.data) {
      return NextResponse.json(
        { error: result.error || "Invalid address." },
        { status: 400 }
      );
    }

    const validated = result.data;

    const address = await prisma.address.create({
      data: {
        userId,
        fullName: validated.fullName,
        line1: validated.line1,
        line2: validated.line2,
        city: validated.city,
        state: validated.state,
        postalCode: validated.postalCode,
        country: validated.country,
        phone: validated.phone,
      },
    });

    return NextResponse.json({ address }, { status: 201 });
  } catch (error) {
    logPrismaError("POST /api/addresses", error);
    const message = error instanceof Error ? error.message : "Failed to create address.";
    return NextResponse.json({ error: message }, { status: 400 });
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
    const id = typeof body.id === "string" ? body.id : "";

    if (!id) {
      return NextResponse.json(
        { error: "Address ID is required." },
        { status: 400 }
      );
    }

    const address = await prisma.address.findFirst({
      where: { id, userId },
    });

    if (!address) {
      return NextResponse.json(
        { error: "Address not found." },
        { status: 404 }
      );
    }

    await prisma.address.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Address deleted successfully." });
  } catch (error) {
    logPrismaError("DELETE /api/addresses", error);
    return NextResponse.json(
      { error: "Failed to delete address." },
      { status: 500 }
    );
  }
}
