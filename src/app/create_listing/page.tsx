"use client";

import { useRouter } from "next/navigation";
import "../globals.css";
import CreateListingForm from "../../components/ItemCreateForm"


const CreateListing: React.FC = () => {
  const router = useRouter();

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
      
    </div>
  );
};

export default CreateListing;
