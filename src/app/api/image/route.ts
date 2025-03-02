// api/image/route.ts
import { NextRequest, NextResponse } from "next/server";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase/config";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get("image") as File;

    if (!image) {
      return NextResponse.json({ data: null, error: "No image provided" });
    }

    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate a unique file name
    const uniqueFileName = `${uuidv4()}-${image.name}`;

    const storageRef = ref(storage, `images/${uniqueFileName}`);
    await uploadBytes(storageRef, buffer); // Use the Buffer
    const url = await getDownloadURL(storageRef);

    return NextResponse.json({ data: url, error: null });
  } catch (error) {
    console.error("Error uploading image to Firebase:", error);
    return NextResponse.json({ data: null, error: "Internal server error" });
  }
}
