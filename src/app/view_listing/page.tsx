"use client";

import Slideshow from "@/components/ItemPictureDeck";
import PriceTag from "@/components/PriceTag"
import ReportButton from "@/components/ReportButton"

import { useRouter, useSearchParams } from "next/navigation";
import React, { useState, useEffect } from "react";

function getDateFromTimestamp(secs: number, nanos: number): string {
  const ms = secs * 1000 + nanos / 1e6;
  const date = new Date(ms);
  const formatTime = date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const formatDate = date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  return `${formatDate} at ${formatTime}`
}

const Listing: React.FC = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get("id"); // use this id to call backend function to get full item details
  const router = useRouter();
  const [listing, setListing] = useState<any | null>(null);;
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchListingById(listingId : string | null) {
      const response = await fetch(`/api/listing/${listingId}`);
      const { data, error } = await response.json();
      if (error) {
        console.log(error);
      } else {
        //console.log("received listing:", data);
        setListing(data);
        setLoading(false);
      }
    }
    fetchListingById(id);
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }
  
  if (!listing) {
    return <p>No listing found</p>;
  }
  const timestampSec = listing.updated.seconds;
  const timestampNano = listing.updated.nanoseconds;
  const dateString = getDateFromTimestamp(timestampSec, timestampNano);
  
  return (
    <div>
      <div style={{ float: "right" }}>
        <img
          src="logo1.png"
          alt="logo"
          className="logoGeneral"
          onClick={() => router.push("/")}
        />
      </div>

      <div className="viewListingsContainer" style={{ clear: "right" }}>
        <div className="viewListingsTitle">
          <PriceTag price={listing.price}></PriceTag>
          {listing.title}
          <ReportButton/>
        </div>
        <Slideshow images={listing.image_paths} category={listing.category} condition={listing.condition} rating={listing.seller_rating} description={listing.description} name={listing.owner_name} timestamp={dateString}></Slideshow>
        
      </div>
    </div>
  );
};

export default Listing;
