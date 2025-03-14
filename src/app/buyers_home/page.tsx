'use client'

import Slideshow from "@/components/ItemPictureDeck";
import PriceTag from "@/components/PriceTag"
import ReportButton from "@/components/ReportButton"

import "../globals.css";
import { useRouter } from "next/navigation";
import { User, ListingWithID } from "@/lib/firebase/firestore/types";
import { useAuth } from "@/lib/authContext";

// import SideMenu from "@/components/seller_sidebar";
import { AppBar, Avatar, Box, Button, CircularProgress, List, ListItem, ListItemAvatar, ListItemText, Rating, Toolbar } from "@mui/material";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import React, { useState, useEffect } from "react";

function getDateFromTimestamp(secs: number, nanos: number): string {
  const ms = secs * 1000 + nanos / 1e6;
  const date = new Date(ms);
  const formatTime = date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const formatDate = date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  return `${formatDate} at ${formatTime}`
}

const SellersHome: React.FC = () => {
  const { user, token } = useAuth();
  const user_id = user?.uid;

  // States for informing users data is being fetched
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | undefined>("");
  const [productListings, setProductListings] = useState<ListingWithID[]>([]);
  const [productMap, setProductMap] = useState<Record<string, ListingWithID>>({});
  const [listingOwners, setListingOwners] = useState<Record<string, User>>({});
  const [listingImages, setListingImages] = useState<Record<string, string[]>>({});
  const [listingTimestamp, setListingTimestamp] = useState<Record<string, string>>({});
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  // Fetch active user from the database
  async function fetchUser() {
    if (!token) {
      return;
    }
    setUserId(user_id)
    setLoading(true);
    try {
      const response = await fetch(`/api/user/${user_id}`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}`, },
      });
      const { data, error } = await response.json();

      if (error) {
        console.error("Error fetching user:", error);
      } else {
        fetchInterestedListings(data.interested_listings || []); // Fetch listings after setting them
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }

  // Fetch interested listings from database
  async function fetchInterestedListings(listingIds: string[]) {
    if (!token) {
      return null;
    }
    try {
      const listingMap: Record<string, ListingWithID> = {};
      const listingData = await Promise.all(
        listingIds.map(async (listing_id) => {
          const listing_response = await fetch(`/api/listing/${listing_id}`, {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}`, },
          });
          const { data, error } = await listing_response.json();

          if (error) {
            console.error(`Error fetching listing ${listing_id}:`, error);
            return null;
          } else {
            listingMap[listing_id] = data;
            return data;
          }
        })
      );

      setProductListings(listingData);
      setProductMap(listingMap);
      fetchListingOwners(listingData);
      fetchImages(listingData);
      fetchTimestamps(listingData);
    } catch (err) {
      console.error("Error fetching listings:", err);
    }
  }

  // Fetch user info for potential buyers and map to listing ID
  async function fetchListingOwners(listings: ListingWithID[]) {
    if (!token) {
      return;
    }
    try {
      const listingOwnersMap: Record<string, User> = {};

      await Promise.all(
        listings.map(async (listing) => {
          const owner_id = listing.owner;
          const user_response = await fetch(`/api/user/${owner_id}`, {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}`, },
          });
          const { data, error } = await user_response.json();

          if (error) {
            console.error(`Error fetching user ${owner_id}:`, error);
          }
          else {
            listingOwnersMap[listing.id] = data;
          }
        })
      );

      setListingOwners(listingOwnersMap);
    } catch (err) {
      console.error("Error fetching listing owners", err);
    }
  }

  // Fetch user info for potential buyers and map to listing ID
  async function fetchImages(listings: ListingWithID[]) {
    try {
      const listingImagesMap: Record<string, string[]> = {};

      await Promise.all(
        listings.map((listing) => {
          listingImagesMap[listing.id] = listing.image_paths && listing.image_paths.length === 0
                                          ? ["noimage.png"]
                                          : listing.image_paths;
        })
      );

      setListingImages(listingImagesMap);
    } catch (err) {
      console.error("Error fetching listing images", err);
    }
  }

  async function fetchTimestamps(listings: ListingWithID[]) {
    try {
      const timestampsMap: Record<string, string> = {};

      await Promise.all(
        listings.map((listing) => {
          const timestampSec = listing.updated.seconds;
          const timestampNano = listing.updated.nanoseconds;
          const dateString = getDateFromTimestamp(timestampSec, timestampNano);

          timestampsMap[listing.id] = dateString;
        })
      );

      setListingTimestamp(timestampsMap);
    } catch (err) {
      console.error("Error fetching listing images", err);
    }
  }

  async function removeInterest(listing_id: string) {
    try {
      if (!user_id || !token) {
        return;
      }
      const potential_buyers = productMap[listing_id].potential_buyers;
      const index = potential_buyers.indexOf(user_id);
      if (index > -1) { // only splice potential_buyers when item is found
        potential_buyers.splice(index, 1); // 2nd parameter means remove one item only
      }

      const selected_buyer = productMap[listing_id].selected_buyer == user_id ? "" : productMap[listing_id].selected_buyer;

      await fetch(`/api/listing/${listing_id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ potential_buyers: potential_buyers, selected_buyer: selected_buyer }),
      });

      if (typeof window != 'undefined') {
        window.location.reload()
      }
    } catch (err) {
      console.error("Error removing interest", err);
    }
  }

  useEffect(() => {
    if (user === undefined) return; // Wait until user is determined
    if (user === null) {
      router.push("/login");
      return;
    }
    fetchUser();
  }, [user, user_id]);

  const router = useRouter();
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const [rating, setRating] = useState<number>(0);

  // Handle rating change
  const handleRatingChange = (listing_id: string, newRating: number | null): void => {
    if (newRating !== null) {
      setRating(newRating); // Update the rating
      submitRating(listing_id, newRating); // Call API to submit the rating
    }
  };

  // API request to submit the rating
  const submitRating = async (listing_id: string, newRating: number): Promise<void> => {
    if (!token) {
      return;
    }
    try {
      const response = await fetch(`/api/listing/${listing_id}/rate`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ user_id: user_id, rating: newRating }),
      });

      const data = await response.json();
      if (data.error) {
        console.log(`Error when rating ${data.error}`);
        return;
      }
      setSnackbarMessage(`You have given a rating of ${newRating}`);
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error submitting rating:', error);
    }
  };

  const handleClose = () => {
    setSnackbarOpen(false);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          width: '100vw',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isClient) return null;

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Navbar */}
      <AppBar position="sticky" className="bg-white shadow-md">
        <Toolbar className="flex justify-between bg-white text-black dark:text-black">
          <p className="text-lg font-semibold text-black">Interested Listings</p>
          <img
            src="logo1.png"
            alt="logo"
            className="h-10 cursor-pointer"
            onClick={() => router.push("/")}
          />
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <div className="flex flex-1 p-4 bg-gray-100">
        {/* Left Panel: Products */}
        <div className="w-1/3 bg-white shadow-lg rounded-lg flex flex-col relative">
          <h2 className="text-lg font-semibold p-4 border-b text-black">Listings</h2>
          <div className="overflow-y-scroll overflow-x-hidden flex-1" style={{ maxHeight: "calc(100vh - 150px)" }}>
            <List>
              {productListings.map((product) => (
                <ListItem
                  key={product.id}
                  component="button"
                  onClick={() => {
                    setSelectedProduct(product.id)
                    setRating(0);
                  }}
                  className={`hover:bg-gray-200 ${selectedProduct === product.id ? "bg-gray-300" : ""} mx-2`}
                >
                  <ListItemAvatar>
                    <Avatar src={product.image_paths[0]} alt={product.title} />
                  </ListItemAvatar>
                  <ListItemText primaryTypographyProps={{ style: { color: 'black' } }} primary={product.title} />
                </ListItem>
              ))}
            </List>
          </div>
        </div>

        {/* Right Panel: Interested Users TODO: fix format of listing & description, figure out how to handle sales that are closed to other buyers,  */}
        {selectedProduct ? (
          <div className="w-2/3 bg-white shadow-lg rounded-lg ml-4 overflow-hidden flex flex-col relative" style={{ maxHeight: "90vh" }}>
            <div className="overflow-y-auto overflow-x-hidden flex-grow mt-4 mb-4" style={{ maxHeight: "calc(90vh - 60px)" }}>
              <div className="viewListingsContainer" style={{ clear: "right" }}>
                <div className="viewListingsTitle">
                  <PriceTag price={productMap[selectedProduct].price}></PriceTag>
                  {productMap[selectedProduct].title}
                  <ReportButton listingId={selectedProduct} />
                </div>

                <Slideshow
                  images={listingImages[selectedProduct]}
                  timestamp={listingTimestamp[selectedProduct]}
                  listingObj={productMap[selectedProduct]}>
                </Slideshow>
              </div>
            </div>
            <hr className="border-gray-300" />
            {productMap[selectedProduct].selected_buyer ? (
              productMap[selectedProduct].selected_buyer == userId ? (
                <div className="p-4 font-bold flex justify-between items-center bg-white">
                  <div>
                    <div className="flex items-center p-1 font-bold">
                      Listing owner has agreed to complete the sale with you!
                    </div>
                    <div className="flex items-center p-1">
                      Contact info: {listingOwners[selectedProduct]?.email_address || ""} 
                      {listingOwners[selectedProduct]?.phone_number ? `, phone: ${listingOwners[selectedProduct].phone_number}` : ""}
                    </div>
                    <div className="flex items-center p-1">
                      Rate seller:
                      <Rating
                        name="simple-controlled"
                        value={rating}
                        onChange={(event, newValue) => handleRatingChange(selectedProduct, newValue)}
                        precision={0.5}
                      />
                    </div>
                  </div>
                  <Button variant="contained" color="error" onClick={() => removeInterest(selectedProduct)}>
                    I&apos;m no longer interested.
                  </Button>
                </div>
              ) : (
                <div className="p-4 font-bold flex justify-between items-center bg-white">
                  Listing owner has chosen another buyer.
                  <Button variant="contained" color="error" onClick={() => removeInterest(selectedProduct)}>
                    I&apos;m no longer interested.
                  </Button>
                </div>
              )
            ) : (
              <div className="p-4 font-bold flex justify-between items-center bg-white">
                Listing owner is still choosing a buyer.
                <Button variant="contained" color="error" onClick={() => removeInterest(selectedProduct)}>
                  I&apos;m no longer interested.
                </Button>
              </div>
            )}
          </div>

        ) :
          <div className="w-2/3 bg-white shadow-lg rounded-lg ml-4 overflow-hidden flex flex-col relative">
            <p className="p-4 text-gray-500">Select a product.</p>
          </div>
        }
      </div>
      <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={handleClose} anchorOrigin={{ vertical: "top", horizontal: "center" }} >
          <MuiAlert onClose={handleClose} severity={"success"} sx={{ width: "100%" }}>
          {snackbarMessage}
          </MuiAlert>
      </Snackbar>
    </div>
  );
};

export default SellersHome;
