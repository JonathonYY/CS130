"use client";
import React, { useState } from "react";

const Example = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState(null);

  async function handleUpload() {}

  return (
    <div>
      <h1>The input accept attribute</h1>

      <label htmlFor="img">Select image:</label>
      <input
        type="file"
        id="img"
        name="img"
        accept="image/*"
        onChange={(event) => event.target.files[0]}
      />
      <button onClick={handleUpload}></button>

      <p>
        <strong>Note:</strong> Because of security issues, this example will not
        allow you to upload files.
      </p>
    </div>
  );
};

export default Example;
