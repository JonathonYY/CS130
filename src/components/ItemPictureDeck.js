import React, { useState } from "react";
import { Box, IconButton, Typography, Avatar, Rating } from "@mui/material";
import { ArrowBackIos, ArrowForwardIos, Edit, Chat } from "@mui/icons-material";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import {useAuth} from "@/lib/authContext";

const Slideshow = ({ images, timestamp, listingObj}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const prevImage = () => {
    setCurrentIndex((prev) => (prev === 0 ? 0 : prev - 1));
  };

  const nextImage = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? images.length - 1 : prev + 1));
  };
  const {user} = useAuth();
  const expressInterest = async () => {
    let newPotentialBuyers = listingObj.potential_buyers;
    newPotentialBuyers.push(user.uid);
    const uniquePotentialBuyers = [...new Set(newPotentialBuyers)];
    //console.log(newPotentialBuyers);
    try {
      const response = await fetch(`/api/listing/${listingObj.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
            title: listingObj.title,
            price: listingObj.price,
            condition: listingObj.condition,
            category: listingObj.category,
            description: listingObj.description,
            selected_buyer: listingObj.selected_buyer,
            potential_buyers: uniquePotentialBuyers,
            image_paths: listingObj.image_paths
        }),
      });

      setSnackbarMessage("Message sent!");
      setSnackbarOpen(true);
    } catch (error) {
      setSnackbarMessage("Error sending message!");
      setSnackbarOpen(true);
    }
  };

  const handleClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "20px",
      }}
    >
        <Box
        sx={{
            position: "relative",
            width: `50vw`,
            height: `300px`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
        }}
        >
            {currentIndex > 0 && (<IconButton
            onClick={prevImage}
            sx={{
                position: "absolute",
                left: "5px",
                color: "white",
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.8)" },
            }}
            >
            <ArrowBackIos />
            </IconButton>)}

            <Box
            component="img"
            src={images[currentIndex]}
            onError={(e) => (e.target.src = "no_image.png")}
            alt="Slideshow image"
            sx={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                borderRadius: "10px",
                boxShadow: "0px 4px 8px rgba(0,0,0,0.2)",
                transition: "opacity 0.5s ease-in-out",
            }}
            />

            {currentIndex < images.length - 1 && (<IconButton
            onClick={nextImage}
            sx={{
                position: "absolute",
                right: "5px",
                color: "white",
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.8)" },
            }}
            >
            <ArrowForwardIos />
            </IconButton>)}
        </Box>
        
        {/*Seller Information Container*/}
        <Box sx={{ display: "flex", gap: "17px" }}>

            {/*Product Category*/}
            <Box
            sx={{
                padding: "8px 16px",
                backgroundColor: "#0077b6",
                color: "white",
                borderRadius: "20px",
                fontSize: "0.9rem",
                fontWeight: "bold",
            }}
            >
                {listingObj.category}
            </Box>

            {/*Product Condition*/}
            <Box
            sx={{
                padding: "8px 16px",
                backgroundColor: "#ffb703",
                color: "white",
                borderRadius: "20px",
                fontSize: "0.9rem",
                fontWeight: "bold",
            }}
            >
                {listingObj.condition}
            </Box>

            {/*Seller Rating*/}
            <Box
            sx={{
                padding: "7px 10px",
                backgroundColor: "#6a4c93",
                color: "white",
                borderRadius: "20px",
                fontSize: "0.0rem",
                fontWeight: "bold",
            }}
            >
                <Rating value={listingObj.seller_rating} precision={0.5} readOnly></Rating>
            </Box>
            
        </Box>

        {/*Product Description*/}
        <Box sx={{ marginTop: "10px", padding: "15px", backgroundColor: "#f9f9f9", borderRadius: "5px" }}>
                <Typography variant="body1" sx={{ color: "#333", lineHeight: "1.6" }}>
                    {listingObj.description}
                </Typography>
        </Box>
        
        {/* Seller Information and Last Edited Container */}
        <Box>
            
            {/* Seller Name and Profile Picture */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar alt="Seller Name" src={listingObj.owner_pfp} sx={{ width: 40, height: 40, marginRight: '10px' }} />
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {listingObj.owner_name}
                </Typography>
                <IconButton color="primary" onClick={expressInterest}>
                    <Chat/>
                </IconButton>

                <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={handleClose} anchorOrigin={{ vertical: "bottom", horizontal: "right" }} >
                    <MuiAlert onClose={handleClose} severity="success" sx={{ width: "100%" }}>
                    {snackbarMessage}
                    </MuiAlert>
                </Snackbar>
            </Box>

            {/* Last Edited Timestamp */}
            <Box sx={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
                <Edit sx={{ fontSize: 20, marginRight: 1 }} />
                <Typography variant="body2" sx={{ color: '#888' }}>
                    Last updated: {timestamp}
                </Typography>
            </Box>

        </Box>
    </Box>
  );
};

export default Slideshow;
