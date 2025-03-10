"use client";

import { useRouter, useSearchParams } from "next/navigation";
import React, { useState, useEffect, Suspense } from "react";
import { useAuth } from "@/lib/authContext";
import "../globals.css";
import UpdateListingForm from "@/components/ItemUpdateForm";

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

const ModifyListingContent: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const { user, token } = useAuth();

  useEffect(() => {
    if (user === undefined) return; // Wait until user is determined
    if (user === null) {
      router.push("/login");
      return;
    }
  }, [user, router]);

  useEffect(() => {
    if (!token) {
      console.log("Unauthorized user");
      setLoading(false);
      setListing(null);
      return;
    }
    async function fetchListingById(listingId: string | null) {
      const response = await fetch(`/api/listing/${listingId}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const { data, error } = await response.json();
      if (error) {
        console.log(error);
        setLoading(false);
        setListing(null);
      } else {
        setListing(data);
        setLoading(false);
      }
    }
    fetchListingById(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!user) {
    return <p>No user found</p>;
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

      <UpdateListingForm listingId={id} listingObj={listing} />
    </div>
  );
};

const ModifyListing: React.FC = () => {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <ModifyListingContent />
    </Suspense>
  );
};

export default ModifyListing;
