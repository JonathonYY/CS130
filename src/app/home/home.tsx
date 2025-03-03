"use client";

import HomeGrid from "../../components/homeGrid";
import { useRouter } from "next/navigation";
import "../globals.css";
import { useAuth } from "@/lib/authContext";
import Image from "next/image";

const Home: React.FC = () => {
  const router = useRouter();

  const { user, signInWithGoogle, signOutUser } = useAuth();

  return (
    <div>
      <div className="logoContainer">
        <Image
          src="/logo1.png"
          alt="home page logo"
          className="logoGeneral logoHome"
          width={20}
          height={20}
          onClick={() => router.push("/")}
        />

        <p>Search bar goes here</p>

        <Image
          src={user?.photoURL ?? "/icon.png"}
          alt="user icon"
          className="userIcon"
          width={20}
          height={20}
          onClick={() => router.push("/login")}
        />
      </div>
      <hr />
      <HomeGrid />
    </div>
  );
};

export default Home;
