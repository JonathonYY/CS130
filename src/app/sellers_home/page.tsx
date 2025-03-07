'use client'


import "../globals.css";
import { useRouter } from "next/navigation";
import { User, Listing } from "@/lib/firebase/firestore/types";
// import { useAuth } from "@/lib/authContext"; require rebase

// import SideMenu from "@/components/seller_sidebar";
import { AppBar,Toolbar,Avatar, Card, CardContent, List, ListItem, ListItemAvatar, ListItemText, IconButton,Divider} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import StarIcon from "@mui/icons-material/Star";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from '@mui/icons-material/Edit';

import React, { useState, useEffect } from "react";

interface Product {
  id: string;
  name: string;
  image: string;
}

interface Interesteduser {
  id: string;
  name: string;
  avatar: string;
  rating: string; 
}

// const products = [
//     { id: 1, name: "Product A", image: "https://firebasestorage.googleapis.com/v0/b/bmart-5f635.firebasestorage.app/o/images%2FJavascript.png?alt=media&token=fc37ddb5-01ca-41db-8512-930b59202a43" },
//     { id: 2, name: "Product B", image: "https://via.placeholder.com/50" },
//     { id: 3, name: "Product C", image: "https://via.placeholder.com/50" },
//     { id: 4, name: "Product C", image: "https://via.placeholder.com/50" },
//     { id: 5, name: "Product C", image: "https://via.placeholder.com/50" },
//     { id: 6, name: "Product C", image: "https://via.placeholder.com/50" },
//     { id: 7, name: "Product C", image: "https://via.placeholder.com/50" },
//     { id: 8, name: "Product C", image: "https://via.placeholder.com/50" },
//     { id: 9, name: "Product C", image: "https://via.placeholder.com/50" },
//     { id: 10, name: "Product C", image: "https://via.placeholder.com/50" },
//     { id: 11, name: "Product C", image: "https://via.placeholder.com/50" },
//     { id: 12, name: "Product C", image: "https://via.placeholder.com/50" },
//     { id: 13, name: "Product C", image: "https://via.placeholder.com/50" },
//   ];
  
//   const interestedUsers: Record<number, { id: string; name: string; avatar: string; rating: number}[]> = {
//     1: [
//       { id: "u1", name: "Alice", avatar: "https://via.placeholder.com/40", rating: 4 },
//       { id: "u2", name: "Bob", avatar: "https://via.placeholder.com/40", rating: 5 },
//       { id: "u3", name: "Alice", avatar: "https://via.placeholder.com/40", rating: 4 },
//       { id: "u4", name: "Bob", avatar: "https://via.placeholder.com/40", rating: 5 },
//       { id: "u5", name: "Alice", avatar: "https://via.placeholder.com/40", rating: 4 },
//       { id: "u6", name: "Bob", avatar: "https://via.placeholder.com/40", rating: 5 },
//       { id: "u7", name: "Alice", avatar: "https://via.placeholder.com/40", rating: 4 },
//       { id: "u8", name: "Bob", avatar: "https://via.placeholder.com/40", rating: 5 },
//       { id: "u9", name: "Alice", avatar: "https://via.placeholder.com/40", rating: 4 },
//       { id: "u10", name: "Bob", avatar: "https://via.placeholder.com/40", rating: 5 },
//       { id: "u11", name: "Alice", avatar: "https://via.placeholder.com/40", rating: 4 },
//       { id: "u12", name: "Bob", avatar: "https://via.placeholder.com/40", rating: 5 },
//       { id: "u13", name: "Alice", avatar: "https://via.placeholder.com/40", rating: 4 },
//       { id: "u14", name: "Bob", avatar: "https://via.placeholder.com/40", rating: 5 },
//       { id: "u15", name: "Alice", avatar: "https://via.placeholder.com/40", rating: 4 },
//       { id: "u16", name: "Bob", avatar: "https://via.placeholder.com/40", rating: 5 },
//       { id: "u17", name: "Alice", avatar: "https://via.placeholder.com/40", rating: 4 },
//       { id: "u18", name: "Bob", avatar: "https://via.placeholder.com/40", rating: 5 },
//     ],
//     2: [
//       { id: "u3", name: "Charlie", avatar: "https://via.placeholder.com/40", rating: 3 },
//     ],
//     3: [
//       { id: "u4", name: "David", avatar: "https://via.placeholder.com/40", rating: 5 },
//       { id: "u5", name: "Eve", avatar: "https://via.placeholder.com/40", rating: 1 },
//     ],
//   };

  const SellersHome: React.FC = () => {
    // require rebase
    // const { user, token, signInWithGoogle, signOutUser } = useAuth();
    // if (!user) {
    //   window.location.href = "/login";
    // }
    // States for informing users data is being fetched
    const [loading, setLoading] = useState(false);
    const [userData, setActiveUser] = useState<User>();
    const [productIds, setProductIds] = useState<string[]>([]);
    const [productListings, setProductListings] = useState<any[]>([]);
    const [interestedUsers, setInterestedUsers] = useState<Record<string, any[]>>({});
    const [selectedBuyers, setSelectedBuyers] = useState<Record<string, User | null>>({});

    // Fetch active user from the database
    async function fetchUser() {
      setLoading(true);
      try {
        const user_id = "test-user"; // Replace with actual user.uid later
        const response = await fetch(`/api/user/${user_id}`);
        const { data, error } = await response.json();
    
        if (error) {
          console.error("Error fetching user:", error);
        } else {
          setActiveUser(data); // Set user data
          console.log(data.active_listings);
          setProductIds(data.active_listings || []); // Ensure it's an array
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
      try {
        const listingData = await Promise.all(
          listingIds.map(async (listing_id) => {
            const listing_response = await fetch(`/api/listing/${listing_id}`);
            const { data, error } = await listing_response.json();
    
            if (error) {
              console.error(`Error fetching listing ${listing_id}:`, error);
              return null;
            } else {
              console.log(`Fetched listing data for ${listing_id}:`, data);
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
                const user_response = await fetch(`/api/user/${user_id}`);
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
        console.log("Interested users map:", interestedUsersMap);
      } catch (err) {
        console.error("Error fetching interested users:", err);
      }
    }
    async function fetchSelectedBuyers(listings: any[]) {
      const selectedBuyersMap: Record<string, any | null> = {};
      try {
        console.log(listings)
      await Promise.all(
        listings.map(async (productId) => {
          const response = await fetch(`/api/listing/${productId.id}`);
          const { data, error } = await response.json();
  
          if (error) {
            console.error(`Error fetching selected buyer for ${productId}:`, error);
            selectedBuyersMap[productId.id] = null; // Default to null on error
          } else {
            selectedBuyersMap[productId.id] = data.selected_buyer || null;
          }
        })
      );
    
        setSelectedBuyers(selectedBuyersMap);
        console.log("selected buyers map:", selectedBuyersMap);
      } catch (err) {
        console.error("Error fetching selected buyers:", err);
      }
    }    
    useEffect(() => {
      fetchUser();
    }, []);

    const router = useRouter();
    const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
    const [isClient, setIsClient] = useState(false);
  
    useEffect(() => {
      setIsClient(true);
    }, []);
  
    if (!isClient) return null;
    console.log(productListings)
    
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
            <div className="overflow-y-scroll overflow-x-hidden flex-1" style={{ maxHeight: "calc(100vh - 150px)" }}>
              <List>
                {productListings.map((product) => (
                  <ListItem
                    key={product.id}
                    component="button"
                    onClick={() => setSelectedProduct(product.id)}
                    className={`hover:bg-gray-200 ${selectedProduct === product.id ? "bg-gray-300" : ""} mx-2`}
                  >
                    <ListItemAvatar>
                      <Avatar src={product.image_paths[0]} alt={product.title} />
                    </ListItemAvatar>
                    <ListItemText primaryTypographyProps={{style: {color: 'black'}}} primary={product.title} />
                  </ListItem>
                ))}
              </List>
            </div>
            <hr className="border-gray-300 my-2" />
            <div className="p-2 bg-white sticky flex-1" style={{ maxHeight: "75px" }}>
              <ListItem
                component="button"
                onClick={() => router.push("/new-listing")}
                className="hover:bg-gray-200 mx-2 flex items-center"
              >
                <ListItemAvatar>
                  <Avatar>
                    <AddIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText primaryTypographyProps={{style: {color: 'black'}}}   primary="New Listing" />
              </ListItem>
            </div>
          </div>
  
          {/* Right Panel: Interested Users */}
          <div className="w-2/3 bg-white shadow-lg rounded-lg ml-4 overflow-hidden flex flex-col relative">
            <h2 className="text-lg font-semibold p-4 border-b text-black">Interested Users</h2>
            <div className="overflow-y-scroll overflow-x-hidden flex-1" style={{ maxHeight: "calc(100vh - 150px)" }}>
              {selectedProduct && interestedUsers[selectedProduct].length != 0 ? (
                <List>
                  {interestedUsers[selectedProduct].map((user) => (
                    <div key={user.id} className="mb-2 mx-2">
                      <ListItem className="hover:bg-gray-200 flex items-center border p-2 rounded-lg relative">
                        <div className="flex items-center w-full">
                          <ListItemAvatar>
                            <Avatar src={user.pfp} alt={user.first} />
                          </ListItemAvatar>
                          <ListItemText primary={user.first} className="flex-1 text-black" />
                          <div className="flex items-center justify-center w-full">
                            {[...Array(Math.round(user.cum_buyer_rating))].map((_, index) => (
                              <StarIcon key={index} className="text-yellow-500" />
                            ))}
                          </div>
                          <div className="absolute right-4 flex">
                          <IconButton
                            color="success"
                            onClick={async () => {
                              try {
                                await fetch(`/api/listing/${selectedProduct}`, {
                                  method: 'PATCH',
                                  headers: { "Content-Type": "application/json" },
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
                                    headers: { "Content-Type": "application/json" },
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
              ) : selectedProduct ? (<p className="p-4 text-gray-500">No interested users.</p>): 
                <p className="p-4 text-gray-500">Select a product to see interested users.</p>
              }
            </div>
            
            {/* <hr className="border-gray-300 my-2" /> */}
            <div className="p-2 bg-white sticky flex-1" style={{ maxHeight: "75px" }}>
            {selectedProduct ? (
              <ListItem
                component="button"
                onClick={() => router.push(`/modify-listing?id=${selectedProduct}`)}
                className="hover:bg-gray-200 mx-2 flex items-center"
              >
                <ListItemAvatar>
                  <Avatar>
                    <EditIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText primaryTypographyProps={{style: {color: 'black'}}}   primary="Modify Listing" />
              </ListItem>) : (<div/>)}
            </div>         
          </div>
        </div>
      </div>
    );
  };
  
  export default SellersHome;
  