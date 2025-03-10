'use client'


import "../globals.css";
import { useRouter } from "next/navigation";
import { User } from "@/lib/firebase/firestore/types";
import { useAuth } from "@/lib/authContext";

import { AppBar, Toolbar, Avatar, Box, CircularProgress, List, ListItem, ListItemAvatar, ListItemText, IconButton, Rating } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from '@mui/icons-material/Edit';
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";

import React, { useState, useEffect } from "react";


const SellersHome: React.FC = () => {
  const { user, token } = useAuth();
  const user_id = user?.uid;

  // States for informing users data is being fetched
  const [loading, setLoading] = useState(false);
  const [productListings, setProductListings] = useState<any[]>([]);
  const [interestedUsers, setInterestedUsers] = useState<Record<string, any[]>>({});
  const [selectedBuyers, setSelectedBuyers] = useState<Record<string, User | null>>({});
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  // Fetch active user from the database
  async function fetchUser() {
    if (!token) {
      return;
    }
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
        fetchActiveListings(data.active_listings || []); // Fetch listings after setting them
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }

  // Fetch active listings from database
  async function fetchActiveListings(listingIds: string[]) {
    if (!token) {
      return;
    }
    try {
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
            return data;
          }
        })
      );

      const validListings = listingData.filter(Boolean);
      setProductListings(validListings);

      // Fetch users for potential buyers
      fetchInterestedUsers(validListings);
      fetchSelectedBuyers(validListings);
    } catch (err) {
      console.error("Error fetching listings:", err);
    }
  }

  // Fetch user info for potential buyers and map to listing ID
  async function fetchInterestedUsers(listings: any[]) {
    if (!token) {
      return;
    }
    try {
      const interestedUsersMap: Record<string, User[]> = {};

      await Promise.all(
        listings.map(async (listing) => {
          if (!listing.potential_buyers || listing.potential_buyers.length === 0) {
            interestedUsersMap[listing.id] = [];
            return;
          }

          const users = await Promise.all(
            listing.potential_buyers.map(async (user_id: string) => {
              const user_response = await fetch(`/api/user/${user_id}`, {
                method: "GET",
                headers: { "Authorization": `Bearer ${token}`, },
              });
              const { data, error } = await user_response.json();

              if (error) {
                console.error(`Error fetching user ${user_id}:`, error);
                return null;
              }
              return data;
            })
          );

          interestedUsersMap[listing.id] = users.filter(Boolean);
        })
      );
      setInterestedUsers(interestedUsersMap);
    } catch (err) {
      console.error("Error fetching interested users:", err);
    }
  }
  async function fetchSelectedBuyers(listings: any[]) {
    if (!token) {
      return;
    }
    const selectedBuyersMap: Record<string, any | null> = {};

    try {
      await Promise.all(
        listings.map(async (product) => {
          try {
            // Fetch listing data
            const listingResponse = await fetch(`/api/listing/${product.id}`, {
              method: "GET",
              headers: { "Authorization": `Bearer ${token}`, },
            });
            const { data: listingData, error: listingError } = await listingResponse.json();
            if (listingError) {
              console.error('Error fetching listing', listingError);
            }
            if (!listingData.selected_buyer) {
              selectedBuyersMap[product.id] = null;
              return;
            }

            // Fetch selected buyer's user data
            const userResponse = await fetch(`/api/user/${listingData.selected_buyer}`, {
              method: "GET",
              headers: { "Authorization": `Bearer ${token}`, },
            });
            const { data: userData, error: userError } = await userResponse.json();

            if (userError) {
              console.error(`Error fetching user data for buyer ${listingData.selected_buyer}:`, userError);
              selectedBuyersMap[product.id] = null;
            } else {
              selectedBuyersMap[product.id] = userData;
            }
            setSelectedBuyers(selectedBuyersMap)
          } catch (err) {
            console.error(`Unexpected error fetching data for ${product.id}:`, err);
            selectedBuyersMap[product.id] = null;
          }
        })
      );

      return selectedBuyersMap; // Return the final mapping of product_id -> User
    } catch (err) {
      console.error("Error in fetchSelectedBuyers:", err);
      return {}; // Return empty object on failure
    }
  }
  const router = useRouter();

  useEffect(() => {
    if (user === undefined) return; // Wait until user is determined
    if (user === null) {
      router.push("/login");
      return;
    }
    fetchUser();
  }, [user, router]); // Ensure it reacts to user state, not just user_id

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

  const submitRating = async (listing_id: string, newRating: number): Promise<void> => {
    if (!token) {
      console.log("Unauthorized user");
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

  if (!isClient) return null;

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

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Navbar */}
      <AppBar position="sticky" className="bg-white shadow-md">
        <Toolbar className="flex justify-between bg-white text-black dark:text-black">
          <p className="text-lg font-semibold text-black">My Listings</p>
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
          <h2 className="text-lg font-semibold p-4 border-b text-black">Your Products</h2>
          <div className="overflow-y-scroll overflow-x-hidden flex-1" style={{ maxHeight: "calc(100vh - 75px)" }}>
            <List>
              {productListings.map((product) => (
                <ListItem
                  key={product.id}
                  component="button"
                  onClick={() => {
                    setSelectedProduct(product.id)
                    setRating(0);
                  }
                  }
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
          <hr className="border-gray-300 my-2" />
          <div className="p-2 bg-white sticky bottom-0 flex-1" style={{ maxHeight: "75px" }}>
            <ListItem
              component="button"
              onClick={() => router.push("/create_listing")}
              className="hover:bg-gray-200 mx-2 flex items-center"
            >
              <ListItemAvatar>
                <Avatar>
                  <AddIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText primaryTypographyProps={{ style: { color: 'black' } }} primary="New Listing" />
            </ListItem>
          </div>
        </div>

        {/* Right Panel: Interested Users */}
        <div className="w-2/3 bg-white shadow-lg rounded-lg ml-4 overflow-hidden flex flex-col relative">
          {selectedProduct && selectedBuyers[selectedProduct] ? (
            // Show selected buyer details
            <>
              <h2 className="text-lg font-semibold p-4 border-b text-black">Selected Buyer</h2>
              <div className="p-4">
                <div className="flex items-center space-x-4">
                  <Avatar src={selectedBuyers[selectedProduct].pfp} alt={selectedBuyers[selectedProduct].first} />
                  <div>
                    <p className="text-lg font-semibold text-black">
                      {selectedBuyers[selectedProduct].first} {selectedBuyers[selectedProduct].last}
                    </p>
                    <p className="text-gray-600">📧 {selectedBuyers[selectedProduct].email_address}</p>
                    <p className="text-gray-600"> {selectedBuyers[selectedProduct].phone_number ? (selectedBuyers[selectedProduct].phone_number) : ""}</p>
                  </div>
                </div>
                <div className="flex justify-left items-center p-1 pb-4">
                  <p className="text-black font-semibold">Rate Buyer:</p>
                  <Rating
                    name="simple-controlled"
                    value={rating}
                    onChange={(event, newValue) => {
                      handleRatingChange(selectedProduct, newValue);
                    }}
                    precision={0.5} // half star precision
                  />
                </div>
              </div>
            </>
          ) : (<>
            <h2 className="text-lg font-semibold p-4 border-b text-black">Interested Users</h2>
            <div className="overflow-y-scroll overflow-x-hidden flex-1" style={{ maxHeight: "calc(100vh - 75px)" }}>
              {selectedProduct && interestedUsers[selectedProduct] && interestedUsers[selectedProduct].length != 0 ? (
                <List>
                  {interestedUsers[selectedProduct].map((user) => (
                    <div key={user.id} className="mb-2 mx-2">
                      <ListItem className="hover:bg-gray-200 flex items-center border p-2 rounded-lg relative">
                        <div className="flex items-center w-full">
                          <ListItemAvatar>
                            <Avatar src={user.pfp} alt={user.first} />
                          </ListItemAvatar>
                          <ListItemText primary={user.first} className="flex-1 text-black" />
                          <div className="absolute right-[40%] flex items-center">
                            <Rating name="read-only" value={user.buyer_rating} readOnly />
                            </div>
                          <div className="absolute right-4 flex">
                            <IconButton
                              color="success"
                              onClick={async () => {
                                try {
                                  await fetch(`/api/listing/${selectedProduct}`, {
                                    method: 'PATCH',
                                    headers: {
                                      "Content-Type": "application/json",
                                      "Authorization": `Bearer ${token}`,
                                    },
                                    body: JSON.stringify({ selected_buyer: user.id }),
                                  });

                                  // Update selectedBuyers state for this product
                                  setSelectedBuyers((prev) => ({
                                    ...prev,
                                    [selectedProduct]: user, // Store selected buyer for the product
                                  }));
                                } catch (error) {
                                  console.error("Error selecting buyer:", error);
                                }
                              }}
                            >
                              <CheckIcon />
                            </IconButton>
                            <IconButton
                              color="error"
                              onClick={async () => {
                                try {
                                  // Get the current potential buyers for the selected product
                                  const updatedBuyers = interestedUsers[selectedProduct].filter(
                                    (buyer) => buyer.id !== user.id
                                  ).map((buyer) => buyer.id); // Extract just the user IDs

                                  // Send the PATCH request with the updated list
                                  await fetch(`/api/listing/${selectedProduct}`, {
                                    method: 'PATCH',
                                    headers: {
                                      "Content-Type": "application/json",
                                      "Authorization": `Bearer ${token}`,
                                    },
                                    body: JSON.stringify({ potential_buyers: updatedBuyers }),
                                  });

                                  // Update state after successful request
                                  setInterestedUsers((prev) => ({
                                    ...prev,
                                    [selectedProduct]: prev[selectedProduct].filter(
                                      (buyer) => buyer.id !== user.id
                                    ),
                                  }));
                                } catch (error) {
                                  console.error("Error updating potential buyers:", error);
                                }
                              }}
                            >
                              <CloseIcon />
                            </IconButton>
                          </div>
                        </div>
                      </ListItem>
                    </div>
                  ))}
                </List>
              ) : selectedProduct ? (<p className="p-4 text-gray-500">No interested users.</p>) :
                <p className="p-4 text-gray-500">Select a product to see interested users.</p>
              }
            </div>
          </>)}
          {/* <hr className="border-gray-300 my-2" /> */}
          <div className="p-2 bg-white sticky bottom-0 flex-1" style={{ maxHeight: "75px" }}>
            {selectedProduct ? (
              <ListItem
                component="button"
                onClick={() => router.push(`/modify-listing?id=${selectedProduct}`)}
                className="hover:bg-gray-200 mx-2 flex bottom-0 items-center"
              >
                <ListItemAvatar>
                  <Avatar>
                    <EditIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText primaryTypographyProps={{ style: { color: 'black' } }} primary="Modify Listing" />
              </ListItem>) : (<div />)}
          </div>
        </div>
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
