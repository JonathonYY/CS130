'use client'

import { useRouter } from "next/navigation";
import "../globals.css";
// import SideMenu from "@/components/seller_sidebar";
import { Box } from "@mui/material";
import { AppBar,Toolbar,Avatar, Card, CardContent, List, ListItem, ListItemAvatar, ListItemText, IconButton,Divider} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import StarIcon from "@mui/icons-material/Star";
import AddIcon from "@mui/icons-material/Add";
import React, { useState } from "react";
import icon from "@mui/icons-material/icon";

const products = [
    { id: 1, name: "Product A", image: "https://via.placeholder.com/50" },
    { id: 2, name: "Product B", image: "https://via.placeholder.com/50" },
    { id: 3, name: "Product C", image: "https://via.placeholder.com/50" },
  ];
  
  const interestedUsers: Record<number, { id: string; name: string; avatar: string; rating: number}[]> = {
    1: [
      { id: "u1", name: "Alice", avatar: "https://via.placeholder.com/40", rating: 4 },
      { id: "u2", name: "Bob", avatar: "https://via.placeholder.com/40", rating: 5 },
    ],
    2: [
      { id: "u3", name: "Charlie", avatar: "https://via.placeholder.com/40", rating: 3 },
    ],
    3: [
      { id: "u4", name: "David", avatar: "https://via.placeholder.com/40", rating: 5 },
      { id: "u5", name: "Eve", avatar: "https://via.placeholder.com/40", rating: 1 },
    ],
  };

const SellersHome: React.FC = () => {
    const router = useRouter();
    const [selectedProduct, setSelectedProduct] = useState<number | null>(null);

    return (
        <div className="h-screen flex flex-col">
          {/* Navbar */}
          <AppBar position="sticky" className="bg-white shadow-md" elevation={0}>
            <Toolbar className="flex justify-between bg-white text-black">
              <p className="text-lg font-semibold">My Listings</p>
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
        <div className="w-1/3 bg-white shadow-lg rounded-lg overflow-hidden">
          <h2 className="text-lg font-semibold p-4 border-b">Your Products</h2>
          <List>
            {products.map((product) => (
              <ListItem
                key={product.id}
                component="button"
                onClick={() => setSelectedProduct(product.id)}
                className={`hover:bg-gray-200 ${selectedProduct === product.id ? "bg-gray-300" : ""} mx-2`}
              >
                <ListItemAvatar>
                  <Avatar src={product.image} alt={product.name} />
                </ListItemAvatar>
                <ListItemText primary={product.name} />
              </ListItem>
            ))}
            <Divider className="my-2" />
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
              <ListItemText primary="New Listing" />
            </ListItem>
          </List>
        </div>
        {/* Right Panel: Interested Users */}
        <div className="w-2/3 bg-white shadow-lg rounded-lg ml-4 overflow-hidden">
          <h2 className="text-lg font-semibold p-4 border-b">Interested Users</h2>
          {selectedProduct && interestedUsers[selectedProduct] ? (
            <List>
              {interestedUsers[selectedProduct].map((user) => (
                <div key={user.id} className="mb-2 mx-2">
                  <ListItem className="hover:bg-gray-200 flex items-center border p-2 rounded-lg relative">
                    <div className="flex items-center w-full">
                      <ListItemAvatar>
                        <Avatar src={user.avatar} alt={user.name} />
                      </ListItemAvatar>
                      <ListItemText primary={user.name} className="flex-1" />
                      <div className="flex items-center justify-center w-full">
                        {[...Array(user.rating)].map((_, index) => (
                          <StarIcon key={index} className="text-yellow-500" />
                        ))}
                      </div>
                      <div className="absolute right-4 flex">
                        <IconButton color="success">
                          <CheckIcon />
                        </IconButton>
                        <IconButton color="error">
                          <CloseIcon />
                        </IconButton>
                      </div>
                    </div>
                  </ListItem>
                </div>
              ))}
            </List>
          ) : (
            <p className="p-4 text-gray-500">Select a product to see interested users.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellersHome;

