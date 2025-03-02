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
  token: string | null; // Add token to the context type
  signInWithGoogle: () => void;
  signOutUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [token, setToken] = useState<string | null>(null); // Add token state

  async function signInWithGoogle() {
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
      const idToken = await result.user.getIdToken();
      setToken(idToken); // Set the token
    } catch (error) {
      console.error("Google sign-in error:", error);
    }
  }

  function signOutUser() {
    signOut(auth)
      .then(() => {
        setUser(null);
        setToken(null); // Clear the token on sign-out
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
          setToken(idToken); // Set the token
        } catch (error) {
          console.error("Error getting token:", error);
          setToken(null);
        }
      } else {
        setToken(null); // Clear the token when user is signed out
      }
    });

    return () => unsubscribe(); // Cleanup subscription
  }, []);

  const value: AuthContextType = {
    user,
    token, // Include token in the context value
    signInWithGoogle,
    signOutUser,
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
