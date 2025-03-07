"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

const ListingContent = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const router = useRouter();

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
        <p className="viewListingsTitle">
          Item: {id} <br /> $22
        </p>
        <p>Todo: add the other item content and fix formatting</p>
      </div>
    </div>
  );
};

const Listing: React.FC = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ListingContent />
    </Suspense>
  );
};

export default Listing;
