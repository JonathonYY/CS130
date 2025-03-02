"use client";
import Link from "next/link";
import "../globals.css";
import { useAuth } from "@/lib/authContext";
import Image from "next/image";

const Login: React.FC = () => {
  const { user, token, signInWithGoogle, signOutUser } = useAuth();
  if (user) {
    window.location.href = "/account";
  }
  return (
    <div className="loginBackground">
      <div className="loginContainer">
        <Image
          src="/logo2.png"
          alt="login page logo"
          width={300}
          height={300}
          className="logoLogin"
        />

        <button
          onClick={signInWithGoogle}
          className="my-4 mr-2 inline-flex bg-[#3e72aa] items-center justify-between rounded-lg px-5 py-2.5 text-center text-white text-sm font-medium hover:bg-[#24476b]"
        >
          <svg
            className="-ml-1 mr-2 h-4 w-4"
            aria-hidden="true"
            focusable="false"
            data-prefix="fab"
            data-icon="google"
            role="img"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 488 512"
          >
            <path
              fill="currentColor"
              d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
            />
          </svg>
          Sign in with Google
          <div />
        </button>
      </div>
    </div>
  );
};

export default Login;
