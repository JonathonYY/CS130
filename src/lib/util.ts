import admin from "./firebaseAdmin";
import { logger } from "./monitoring/config";

export function extractFilePath(url: string): string {
  // Regular expression to find the file path part of the URL
  const regex = /firebasestorage\.app\/o(\/images%2F[^?]+)/;

  // Check if the URL matches the expected pattern
  const match = url.match(regex);

  if (match && match[1]) {
    // Decode the URL-encoded file path
    return decodeURIComponent(match[1]);
  }

  // If no match, return it directly
  return url;
}

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
