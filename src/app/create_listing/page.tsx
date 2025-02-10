"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import "../globals.css";

const CreateListing: React.FC = () => {
  const router = useRouter();

  async function handleAddListing() {
    const response = await fetch("/api/listing", {
      body: JSON.stringify({
        name: "example product",
        description: "example product's description",
      }),
      method: "POST",
    });
    alert("Item Added!");
    console.log(response);
  }

  return (
    <div>
      <div className="logoContainer">
        <p className="bigHeader">Create Listing</p>

        <img
          src="logo1.png"
          alt="logo"
          className="logoGeneral"
          onClick={() => router.push("/")}
        />
      </div>

      <hr />

      <p>Really cool create listings stuff go here! Wow!</p>

      <button
        onClick={handleAddListing}
        className="bg-blue-300 rounded-md p-2 hover:bg-blue-500 m-10"
      >
        Click me to add an example Product!
      </button>

      <div className="buttonContainer">
        <Link href="/sellers_home" style={{ marginLeft: 25 }}>
          Publish Listing
        </Link>

        <Link href="/sellers_home">Update Listing</Link>

        <Link href="/sellers_home" style={{ marginRight: 25 }}>
          Remove Listing
        </Link>
      </div>
    </div>
  );
};

export default CreateListing;
