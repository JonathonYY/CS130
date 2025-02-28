"use client";

import Image from "next/image";
import { ChangeEvent, useState } from "react";

export default function Upload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    } else {
      setFile(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("image", file); // 'image' is the field name on the backend

    try {
      const response = await fetch("/api/image", {
        method: "POST",
        body: formData,
      });

      const { data, error } = await response.json();
      if (error) {
        throw new Error("Upload failed");
      }

      setUploadedUrl(data); // Access the URL directly
    } catch (error) {
      console.error("error uploading file", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={uploading}>
        {uploading ? "Uploading..." : "Upload Image"}
      </button>
      {uploadedUrl && (
        <div>
          <p>Uploaded image:</p>
          <Image
            src={uploadedUrl}
            alt="Uploaded image"
            width={300}
            height={300}
          />
        </div>
      )}
    </div>
  );
}
