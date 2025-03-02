"use client";
import Link from "next/link";
import "../globals.css";
import { useAuth } from "@/lib/authContext";

const Login: React.FC = () => {
  const { user, token, signInWithGoogle, signOutUser } = useAuth();
  if (user) {
    window.location.href = "/account";
  }
  return (
    <div className="loginBackground">
      <div className="loginContainer">
        <img src="logo2.png" alt="login page logo" className="logoLogin" />

        <Link href="/account" className="loginButton">
          Login button goes here
        </Link>
        <button onClick={signInWithGoogle}>Sign In</button>
        {user ? (
          <>
            <p>Hello {user.displayName}</p>
            <p>Hello {user.email}</p>
            <button onClick={signOutUser}>Log out</button>
          </>
        ) : (
          <p></p>
        )}
      </div>
    </div>
  );
};

export default Login;
