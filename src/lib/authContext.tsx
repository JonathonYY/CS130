// authContext.tsx
"use client";

import { createContext, useState, useEffect, useContext } from "react";
import { auth, provider } from "@/lib/firebase/config";
import {
  signInWithPopup,
  onAuthStateChanged,
  signOut,
  User,
} from "firebase/auth";

interface AuthContextType {
  user: User | null | undefined;
  token: string | null;
  signInWithGoogle: () => void;
  signOutUser: () => void;
  loading: boolean; // Add loading state
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true); // Initialize loading to true

  async function signInWithGoogle() {
    try {
      const result = await signInWithPopup(auth, provider);
      //onAuthStateChanged will handle setting the user and token.
    } catch (error: any) {
      if (error.code === "auth/popup-closed-by-user") {
        console.log("Popup closed by user.");
        // Handle the closed popup scenario gracefully.
      } else {
        console.error("Google sign-in error:", error);
        // Handle other sign-in errors.
      }
    }
  }

  function signOutUser() {
    signOut(auth)
      .then(() => {
        //onAuthStateChanged will handle the rest.
      })
      .catch((error) => {
        console.error("Sign-out error:", error);
      });
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const idToken = await currentUser.getIdToken();
          setToken(idToken);
        } catch (error) {
          console.error("Error getting token:", error);
          setToken(null);
        }
      } else {
        setToken(null);
      }
      setLoading(false); // Set loading to false after initial check
    });

    return () => unsubscribe();
  }, []);

  const value: AuthContextType = {
    user,
    token,
    signInWithGoogle,
    signOutUser,
    loading, // Include loading state
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
