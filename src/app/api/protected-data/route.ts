import { NextResponse } from "next/server";
import admin from "@/lib/firebaseAdmin";

async function getUidFromToken(token: string) {
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    return decodedToken.uid;
  } catch (error) {
    console.error("Error verifying token:", error);
    return null;
  }
}

export async function GET(request: Request) {
  const authorizationHeader = request.headers.get("authorization");
  if (!authorizationHeader) {
    return NextResponse.json({
      error: "Unauthorized: Missing token",
      data: null,
    });
  }

  const token = authorizationHeader.split("Bearer ")[1];
  if (!token) {
    return NextResponse.json({
      error: "Unauthorized: Invalid token format",
      data: null,
    });
  }

  const uid = await getUidFromToken(token);
  if (!uid) {
    return NextResponse.json({
      error: "Unauthorized: Invalid token",
      data: null,
    });
  }

  try {
    return NextResponse.json({
      data: `Hello, authenticated user with UID: ${uid}`,
      error: null,
    });
  } catch (error) {
    console.error("Error fetching protected data:", error);
    return NextResponse.json({ error: "Internal server error", data: null });
  }
}
