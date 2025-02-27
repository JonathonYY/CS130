import { NextResponse } from "next/server";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase/config";

export async function POST(req) {
  const formData = await req.formData();
  const file = formData.get("img"); // Assuming the input name is 'img'

  if (!file) {
    return NextResponse.json({ data: null, error: "No file uploaded" });
  }

  const storageRef = ref(storage, `images/${file.name}`);
  try {
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return NextResponse.json({ data: { path: downloadURL }, error: null });
  } catch (error) {
    return NextResponse.json({ data: null, error: error });
  }
}

// export async function GET(req) {
//   try {
//     const imageUrls = await Promise.all(
//       imageNames.map(async (imageName) => {
//         const imageRef = ref(storage, `images/${imageName}`);
//         const downloadURL = await getDownloadURL(imageRef);
//         return { name: imageName, url: downloadURL };
//       })
//     );

//     return NextResponse.json({ data: imageUrls, error: null });
//   } catch (error) {
//     return NextResponse.json({ data: null, error: error.message }, { status: 500 });
//   }
// }
