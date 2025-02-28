import React from "react";
import { Box } from "@mui/material";

const PriceTag = ({ price }) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "90px",
        height: "40px",
        borderRadius: "15px",
        background: "#FFD100",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
        color: "dark-gray",
        fontWeight: "bold",
        fontSize: "1.2rem",
        "&:hover": {
          transform: "scale(1.1)",
          transition: "0.3s ease-in-out",
        },
      }}
    >
      ${price}
    </Box>
  );
};

export default PriceTag;
