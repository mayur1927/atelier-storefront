import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secret = process.env.AUTH_SECRET;

if (!secret) {
  throw new Error("AUTH_SECRET is not set");
}

const secretKey = new TextEncoder().encode(secret);

export async function createSession(userId: string) {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey);

  const cookieStore = await cookies();

  cookieStore.set("atelier_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
}

export async function getSessionUserId() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("atelier_session")?.value;

    if (!token) return null;

    const { payload } = await jwtVerify(token, secretKey);

    return typeof payload.userId === "string"
      ? payload.userId
      : null;
  } catch {
    return null;
  }
}

export async function clearSession() {
  const cookieStore = await cookies();

  cookieStore.set("atelier_session", "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  });
}