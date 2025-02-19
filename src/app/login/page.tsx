"use client";
import Link from "next/link";
import "../globals.css";
import { auth, provider } from "@/lib/firebase/config";
import { signInWithPopup, onAuthStateChanged, signOut } from "firebase/auth";
import { useEffect, useState } from "react";

const Login: React.FC = () => {
  const [currUser, setCurrUser] = useState();

  function signInWithGoogle() {
    signInWithPopup(auth, provider)
      .then((result) => {
        // The signed-in user info.
        const user = result.user;
        setCurrUser(user);
      })
      .catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode);
        console.log(errorMessage);
      });
  }

  function signOutUser() {
    signOut(auth)
      .then(() => {
        console.log("Sign out successful!");
      })
      .catch((error) => {
        console.log(error);
      });
    setCurrUser(null);
  }

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrUser(user);
      } else {
        console.log("User is signed out!");
      }
    });
  }, []);

  return (
    <div className="loginBackground">
      <div className="loginContainer">
        <img src="logo2.png" alt="login page logo" className="logoLogin" />

        <Link href="/account" className="loginButton">
          Login button goes here
        </Link>
        <button onClick={signInWithGoogle}>Sign In</button>
        <p className="boldText">Please sign in with your google email</p>
        {currUser ? (
          <>
            <p>Hello {currUser.displayName}</p>
            <p>Hello {currUser.email}</p>
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
