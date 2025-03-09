// api/image/route.ts
import { NextResponse } from "next/server";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase/config";
import { v4 as uuidv4 } from "uuid";
import { logger } from "@/lib/monitoring/config";
import { getUidFromAuthorizationHeader } from "@/lib/util";

export async function POST(request: Request) {
  const start = performance.now();
  try {
    // check for user token
    const authorizationHeader = request.headers.get("authorization");
    await getUidFromAuthorizationHeader(authorizationHeader);

    const formData = await request.formData();
    const image = formData.get("image") as File;

    if (!image) {
      throw new Error("No image provided");
    }

    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate a unique file name
    const uniqueFileName = `${uuidv4()}-${image.name}`;

    const storageRef = ref(storage, `images/${uniqueFileName}`);
    await uploadBytes(storageRef, buffer); // Use the Buffer
    const url = await getDownloadURL(storageRef);

    logger.increment('uploadedFiles');
    return NextResponse.json({ data: url, error: null });
  } catch (e) {
    logger.error("Error uploading image to Firebase:", e);
    logger.increment('POST_image_API_failure');
    if (e instanceof Error) {
      return NextResponse.json({ data: null, error: e.message });
    }
    return NextResponse.json({ data: null, error: "Internal server error" });
  } finally {
    const end = performance.now();
    logger.log(`POST /api/image in ${end - start} ms`);
  }
}
