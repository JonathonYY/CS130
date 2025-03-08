"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import "../globals.css";
import CreateListingForm from "@/components/ItemCreateForm"
import {useAuth} from "@/lib/authContext";


const CreateListing: React.FC = () => {
  const router = useRouter();
  const {user} = useAuth();

  useEffect(() => {
    if (user === undefined) return; // Wait until user is determined
    if (user === null) {
      router.push("/login");
      return;
    }
  }, [user, router]);

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
