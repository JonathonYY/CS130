// api/image/route.ts
import { NextRequest, NextResponse } from "next/server";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase/config";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get("image") as File;

    if (!image) {
      return NextResponse.json({ data: null, error: "No image provided" });
    }

    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const storageRef = ref(storage, `images/${image.name}`);
    await uploadBytes(storageRef, buffer); // Use the Buffer
    const url = await getDownloadURL(storageRef);

    return NextResponse.json({ data: url, error: null });
  } catch (error) {
    console.error("Error uploading image to Firebase:", error);
    return NextResponse.json({ data: null, error: "Internal server error" });
  }
}
