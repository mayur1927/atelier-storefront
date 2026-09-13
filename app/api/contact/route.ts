import { NextResponse } from "next/server";
import { validateEmail, sanitizeString } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = sanitizeString(body.name || "", 100);
    const email = validateEmail(body.email || "");
    const message = sanitizeString(body.message || "", 2000);

    if (!name) {
      return NextResponse.json(
        { error: "Name is required." },
        { status: 400 }
      );
    }

    if (!message || message.length < 5) {
      return NextResponse.json(
        { error: "Please enter a message of at least 5 characters." },
        { status: 400 }
      );
    }

    // In a real application, email/SNS notification or DB inquiry logging happens here
    return NextResponse.json({
      success: true,
      message: "Your message has been received. We will get back to you shortly.",
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to send message.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
