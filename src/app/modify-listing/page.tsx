"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import "../globals.css";
import UpdateListingForm from "@/components/ItemUpdateForm"

interface Listing {
  id: string;
  title: string;
  description: string;
  category: string;
  condition: string;
  price: number;
  image_paths: string[];
  owner: string;
  owner_name: string;
  owner_pfp: string;
  potential_buyers: string[]; 
  selected_buyer: string;
  seller_rating: number;
  updated: Timestamp;
}

interface Timestamp {
  seconds: number;
  nanoseconds: number;
}


const ModifyListing: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
      async function fetchListingById(listingId : string | null) {
        const response = await fetch(`/api/listing/${listingId}`);
        const { data, error } = await response.json();
        if (error) {
          console.log(error);
        } else {
          console.log("received listing:", data);
          setListing(data);
          setLoading(false);
        }
      }
      fetchListingById(id);
  }, [id]);

  if (loading) {
    return <p>Loading...</p>;
  }
  
  if (!listing) {
    return <p>No listing found</p>;
  }
  return (
    <div>
      <div className="logoContainer">
        <p className="bigHeader">Modify Listing</p>
        <img
          src="logo1.png"
          alt="logo"
          className="logoGeneral"
          onClick={() => router.push("/")}
        />
      </div>
      <hr />
      
      <UpdateListingForm listingId={id} listingObj={listing}/>
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

export default ModifyListing;
