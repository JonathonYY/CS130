"use client";

import { useAuth } from "@/lib/authContext";
import { useState, useEffect } from "react";

interface ProtectedData {
  message: string;
}

interface ApiResponse {
  data: ProtectedData | null;
  error: string | null;
}

export default function ProtectedPage() {
  const { token, loading } = useAuth();
  const [data, setData] = useState<ProtectedData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!token) {
        return; // Don't fetch if there's no token
      }

      try {
        const response = await fetch("/api/protected-data", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }

        const jsonData: ApiResponse = await response.json();

        if (jsonData.error) {
          setError(jsonData.error);
          setData(null);
        } else {
          setData(jsonData.data);
          setError(null);
        }
      } catch (err: any) {
        // Type the error as any or Error
        setError(err.message);
        setData(null);
      }
    }

    if (!loading) {
      fetchData();
    }
  }, [token, loading]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  if (data) {
    return (
      <div>
        <h1>Protected Page</h1>
        <p>{data.message}</p>
      </div>
    );
  }

  return <p>Please log in to see protected data.</p>;
}
