import admin from "@/lib/firebaseAdmin";
import { logger } from "@/lib/monitoring/config";

async function getUidFromToken(token: string) {
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    return decodedToken.uid;
  } catch (error) {
    if (error instanceof Error) {
      logger.error("Error verifying token:", error);
    } else {
      logger.error("Unknown error verifying token");
    }
    return null;
  }
}

export async function getUidFromAuthorizationHeader(authorizationHeader: string | null) {
  if (!authorizationHeader) {
    throw new Error("Unauthorized: Missing token");
  }

  const token = authorizationHeader.split("Bearer ")[1];
  if (!token) {
    throw new Error("Unauthorized: Invalid token format");
  }

  const uid = await getUidFromToken(token);
  if (!uid) {
    throw new Error("Unauthorized: Invalid token format");
  }

  return uid;
}
