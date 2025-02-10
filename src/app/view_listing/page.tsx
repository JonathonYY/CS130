"use client";

import { useRouter, useSearchParams } from "next/navigation";

const Listing: React.FC = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get("id"); // use this id to call backend function to get full item details
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
          Item: {id} <br /> $22{" "}
        </p>
        <p>Todo: add the other item content and fix formatting</p>
      </div>
    </div>
  );
};

export default Listing;
