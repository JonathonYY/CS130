"use client"; // Important for client-side rendering
import Home from "./home/home";

import { useState, useEffect } from "react";

export default function Entry() {
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 1000 || window.innerHeight < 500);
    };

    // Initial check
    handleResize();

    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (isSmallScreen) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          textAlign: "center",
        }}
      >
        <div className="absolute w-[1000px] h-[500px] bg-gray-300"></div>
        <span className="z-10 w-96">
          For the best experience, please increase the screen size until it
          encompasses this grey box. You may then refresh the page. If you would
          like to bypass this warning, click{" "}
          <button
            onClick={() => {
              setIsSmallScreen(false);
            }}
            className="inline z-10 text-red-500"
          >
            here
          </button>
        </span>
      </div>
    );
  }

  return <Home />;
}
