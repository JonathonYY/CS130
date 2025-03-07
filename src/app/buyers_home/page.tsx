'use client'

import Slideshow from "@/components/ItemPictureDeck";
import PriceTag from "@/components/PriceTag"
import ReportButton from "@/components/ReportButton"

import "../globals.css";
import { useRouter } from "next/navigation";
import { User, Listing, ListingWithID } from "@/lib/firebase/firestore/types";
import { useAuth } from "@/lib/authContext";

// import SideMenu from "@/components/seller_sidebar";
import { AppBar,Toolbar,Avatar, Button, Card, CardContent, List, ListItem, ListItemAvatar, ListItemText, IconButton, Rating, Divider} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import StarIcon from "@mui/icons-material/Star";
import AddIcon from "@mui/icons-material/Add";
import { yellow } from '@mui/material/colors';
import React, { useState, useEffect } from "react";
import { time } from "console";

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

function getDateFromTimestamp(secs: number, nanos: number): string {
  const ms = secs * 1000 + nanos / 1e6;
  const date = new Date(ms);
  const formatTime = date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const formatDate = date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  return `${formatDate} at ${formatTime}`
}

const SellersHome: React.FC = () => {
  const { user } = useAuth();
  const user_id = user?.uid;

  // if (!user) {
  //   if (typeof window !== 'undefined') {
  //     // window.location.href = "/login";
  //   }
  // }

  // States for informing users data is being fetched
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | undefined>("");
  const [userData, setActiveUser] = useState<User>();
  const [productIds, setProductIds] = useState<string[]>([]);
  const [productListings, setProductListings] = useState<ListingWithID[]>([]);
  const [productMap, setProductMap] = useState<Record<string, ListingWithID>>({});
  const [listingOwners, setListingOwners] = useState<Record<string, User>>({});
  const [listingImages, setListingImages] = useState<Record<string, string[]>>({});
  const [listingTimestamp, setListingTimestamp] = useState<Record<string, string>>({});

  // Fetch active user from the database
  async function fetchUser() {
    setUserId(user_id)
    setLoading(true);
    try {
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
      fetchImages(listingData);
      fetchTimestamps(listingData);
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
          const owner_id = listing.owner;
          const user_response = await fetch(`/api/user/${owner_id}`);
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
      console.log("Listing owners map:", listingOwnersMap);
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
          listingImagesMap[listing.id] = listing.image_paths.length === 0
                                          ? ["noimage.png"]
                                          : listing.image_paths;
        })
      );

      setListingImages(listingImagesMap);
      console.log("Listing images map:", listingImagesMap);
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
      console.log("Timestamps map:", timestampsMap);
    } catch (err) {
      console.error("Error fetching listing images", err);
    }
  }

  async function removeInterest(listing_id: string) {
    try {
      if (!user_id) {
        return;
      }
      console.log('asdf', productMap[listing_id])
      const potential_buyers = productMap[listing_id].potential_buyers;
      const index = potential_buyers.indexOf(user_id);
      if (index > -1) { // only splice potential_buyers when item is found
        potential_buyers.splice(index, 1); // 2nd parameter means remove one item only
      }
      console.log('asdf2', potential_buyers)

      const selected_buyer = productMap[listing_id].selected_buyer == user_id ? "" : productMap[listing_id].selected_buyer;

      console.log('id', listing_id)
      await fetch(`/api/listing/${listing_id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
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
    if (!user_id) {
      return;
    }
    fetchUser();
  }, [user_id]);

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

  // Simulate an API request to submit the rating
  const submitRating = async (listing_id: string, newRating: number): Promise<void> => {
    try {
      const response = await fetch(`/api/listing/${listing_id}/rate`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: user_id, rating: newRating }),
      });

      const data = await response.json();
      console.log('Listing updated:', data);
    } catch (error) {
      console.error('Error submitting rating:', error);
    }
  };

  if (!isClient) return null;
  console.log(productListings)

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
          <div className="w-2/3 bg-white shadow-lg rounded-lg ml-4 overflow-hidden flex flex-col relative">
            <div className="overflow-y-scroll overflow-x-hidden flex-1 mt-4 mb-4" style={{ maxHeight: "calc(100vh - 150px)" }}>
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
            {productMap[selectedProduct].selected_buyer ?
              productMap[selectedProduct].selected_buyer == userId ? (
                <div className="p-4 font-bold flex justify-between items-center">
                  <div>
                    <div className="flex items-center p-1 font-bold">
                      Listing owner has agreed to complete the sale with you!
                    </div>
                    <div className="flex items-center p-1">
                      Contact info: {listingOwners[selectedProduct].email_address}{
                        listingOwners[selectedProduct].phone_number ?
                          ", phone: " + listingOwners[selectedProduct].phone_number : ""
                      }
                    </div>
                    <div className="flex items-center p-1">
                      Rate seller:
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
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => removeInterest(selectedProduct)}
                  >
                    I'm no longer interested.
                  </Button>
                </div>
              ) : (
                <div className="p-4 font-bold flex justify-between items-center">
                  Listing owner has chosen another buyer.
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => removeInterest(selectedProduct)}
                  >
                    I'm no longer interested.
                  </Button>
                </div>
              ) : (
                <div className="p-4 font-bold flex justify-between items-center">
                  Listing owner is still choosing a buyer.
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => removeInterest(selectedProduct)}
                  >
                    I'm no longer interested.
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
    </div>
  );
};

export default SellersHome;
