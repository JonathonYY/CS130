"use client";

import HomeGrid from "../../components/homeGrid";
import { useRouter } from "next/navigation";
import "../globals.css";
import { useAuth } from "@/lib/authContext";

const Home: React.FC = () => {
  const router = useRouter();

  const { user, signInWithGoogle, signOutUser } = useAuth();

  return (
    <div>
      {user ? (
        <div>
          <button
            onClick={signOutUser}
            className="border border-black rounded-sm bg-blue-300 p-4"
          >
            Click Here to Sign Out!
          </button>
        </div>
      ) : (
        <div>
          <p>You are not signed in</p>
          <button
            onClick={signInWithGoogle}
            className="border border-black rounded-sm bg-blue-300 p-4"
          >
            Click Here to Sign In!
          </button>
        </div>
      )}
      <h1>Hello {user?.displayName}</h1>
      <div className="logoContainer">
        <img
          src="logo1.png"
          alt="home page logo"
          className="logoGeneral logoHome"
          onClick={() => router.push("/")}
        />

        <p>Search bar goes here</p>

        <img
          src={user?.photoURL ?? "public/icon.png"}
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
