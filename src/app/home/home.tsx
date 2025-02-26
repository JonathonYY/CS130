"use client";

import HomeGrid from "../../components/homeGrid";
import { useRouter } from "next/navigation";
import "../globals.css";
import { auth } from "@/lib/firebase/config";
import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";

const Home: React.FC = () => {
  const router = useRouter();

  const [currUser, setCurrUser] = useState(null);

  onAuthStateChanged(auth, (user) => {
    if (user) {
      setCurrUser(user);
    } else {
      setCurrUser(null);
    }
  });

  return (
    <div>
      <h1>Hello {currUser?.displayName}</h1>
      <div className="logoContainer">
        <img
          src="logo1.png"
          alt="home page logo"
          className="logoGeneral logoHome"
          onClick={() => router.push("/")}
        />

        <p>Search bar goes here</p>

        <img
          src={currUser?.photoURL ?? "icon.png"}
          alt="user icon"
          className="userIcon"
          onClick={() => router.push("/login")}
        />
      </div>

      <hr />

      <HomeGrid />
    </div>
  );
};

export default Home;
