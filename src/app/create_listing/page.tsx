"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import "../globals.css";
import CreateListingForm from "../../components/ItemCreateForm"


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

    console.log(response);
    alert("Item added!");
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
      
      <CreateListingForm/>
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
