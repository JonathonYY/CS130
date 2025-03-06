'use client'


import "../globals.css";
import { useRouter } from "next/navigation";
import { User, Listing, ListingWithID } from "@/lib/firebase/firestore/types";
// import { useAuth } from "@/lib/authContext"; require rebase

// import SideMenu from "@/components/seller_sidebar";
import { AppBar,Toolbar,Avatar, Button, Card, CardContent, List, ListItem, ListItemAvatar, ListItemText, IconButton,Divider} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import StarIcon from "@mui/icons-material/Star";
import AddIcon from "@mui/icons-material/Add";
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
  const [productListings, setProductListings] = useState<ListingWithID[]>([]);
  const [productMap, setProductMap] = useState<Record<string, ListingWithID>>({});
  const [listingOwners, setListingOwners] = useState<Record<string, User>>({});

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
        setProductIds(data.interested_listings || []); // Ensure it's an array
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
    try {
      const listingMap: Record<string, ListingWithID> = {};
      const listingData = await Promise.all(
        listingIds.map(async (listing_id) => {
          const listing_response = await fetch(`/api/listing/${listing_id}`);
          const { data, error } = await listing_response.json();

          if (error) {
            console.error(`Error fetching listing ${listing_id}:`, error);
            return null;
          } else {
            console.log(`Fetched listing data for ${listing_id}:`, data);
            listingMap[listing_id] = data;
            return data;
          }
        })
      );

      setProductListings(listingData);
      setProductMap(listingMap);
      fetchListingOwners(listingData);
    } catch (err) {
      console.error("Error fetching listings:", err);
    }
  }

  // Fetch user info for potential buyers and map to listing ID
  async function fetchListingOwners(listings: ListingWithID[]) {
    try {
      const listingOwnersMap: Record<string, User> = {};

      await Promise.all(
        listings.map(async (listing) => {
          const user_id = listing.owner;
          const user_response = await fetch(`/api/user/${user_id}`);
          const { data, error } = await user_response.json();

          if (error) {
            console.error(`Error fetching user ${user_id}:`, error);
          }
          else {
            listingOwnersMap[listing.id] = data;
          }
        })
      );

      setListingOwners(listingOwnersMap);
      console.log("Listing owners map:", listingOwnersMap);
    } catch (err) {
      console.error("Error fetching interested users:", err);
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
          <h2 className="text-lg font-semibold p-4 border-b text-black">Interested Products</h2>
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
                  <ListItemText primaryTypographyProps={{ style: { color: 'black' } }} primary={product.title} />
                </ListItem>
              ))}
            </List>
          </div>
        </div>

        {/* Right Panel: Interested Users TODO: fix format of listing & description, figure out how to handle sales that are closed to other buyers,  */}
        {selectedProduct ? (
          <div className="w-2/3 bg-white shadow-lg rounded-lg ml-4 overflow-hidden flex flex-col relative">
            <div className="overflow-y-scroll overflow-x-hidden flex-1" style={{ maxHeight: "calc(100vh - 150px)" }}>
              <h2 className="text-lg font-semibold p-4 border-b text-black">
                {productMap[selectedProduct].title}
              </h2>
              <div className="p-4">
                {productMap[selectedProduct].description}
              </div>
            </div>
            <hr className="border-gray-300" />
            {productMap[selectedProduct].selected_buyer ?
              productMap[selectedProduct].selected_buyer == 'test-user' ? (
                <div>
                <div className="p-4">
                  rate seller
                </div>
                <div className="px-4 pb-4">
                  email: {listingOwners[selectedProduct].email_address}{
                    listingOwners[selectedProduct].phone_number ?
                    ", phone: " + listingOwners[selectedProduct].phone_number : ""
                  }
                </div>
                </div>
              ) : (
                <div className="p-4">
                  sale closed to other buyer
                </div>
              ) : (
                <div className="p-4">
                  sale pending
                </div>
              )}
          </div>
        ) :
          <div className="w-2/3 bg-white shadow-lg rounded-lg ml-4 overflow-hidden flex flex-col relative">
            <p className="p-4 text-gray-500">Select a product.</p>
          </div>
        }
      </div>
    </div>
  );
};

export default SellersHome;
