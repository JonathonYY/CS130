"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Container, Card, CardContent, Typography, Pagination } from '@mui/material';
import Grid from '@mui/material/Grid2'; 

// Define TypeScript interface for items
interface Product {
  id: string;
  name: string;
  description: string;
}

// TODO: switch item descriptions for images
const HomeGrid: React.FC = () => {
  // States for informing users data is being fetched
  const [loading, setLoading] = useState(false);

  // Fetch all listings from the database, extract important info for cards
  async function fetchAllListings() {
    setLoading(true);
    const response = await fetch("/api/listing", {
      method: "GET",
    });

    const { data, error } = await response.json();
    // console.log(data)

    if (error) {
      console.log("Error");
      console.log(error);
    } else {
      const listings: Product[] = data.listings.map((element: { id: any; name: any; description: any; }) => ({
        id: element.id, 
        name: element.name || 'Title', 
        description: element.description || 'Description'
      }));

      // console.log(listings);

      setProductListings(listings);
      setLoading(false);
    }
  }

  // define state for productListings
  const [items, setProductListings] = useState<Product[]>([]);

  // run on page load
  useEffect(() => {
    fetchAllListings();
  }, []);


  const router = useRouter();


  const itemsPerPage = 9; // 3x3 Grid


  // Get current items based on pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const offset = (currentPage - 1) * itemsPerPage;
  const currentItems = items.slice(offset, offset + itemsPerPage);
  const pageCount = Math.ceil(items.length / itemsPerPage);


  // Handle page change
  const handlePageClick = (event: React.ChangeEvent<unknown>, selected: number) => {
    setCurrentPage(selected);
  };


  // Upon clicking on a card, pull view listing page.
  const viewListing = (item: Product) => {
    router.push(`/view_listing?id=${item.id}`);
  };


  // Display while items are being fetched
  if (loading) {
    return <p>Loading items...</p>;
  }


  // Displays items
  return (
    <Container sx={{mt: 4}}>
      <Grid container rowSpacing={3} columnSpacing={{sm: 6, md: 6}}>
        {currentItems.map((item) => (
          // For 2x4 grid - md: 3, for 3x3 grid - md: 4
          <Grid size={{sm: 4, md: 4}} key={item.id}>
            <Card 
              sx={{ 
                cursor: 'pointer', 
                border: '1px solid #ccc', 
                borderRadius: 2,
              }} 
              onClick={() => viewListing(item)}
            >
              <CardContent>
                <Typography variant="h6" noWrap>{item.name}</Typography>
                <Typography variant="body2" color="text.secondary" noWrap>{item.description}</Typography>
                <Typography variant="body2" color="text.secondary" noWrap>View item</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      {/* Pagination */}
      <Pagination
        count={pageCount}
        page={currentPage}
        onChange={handlePageClick}
        sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}
      />
    </Container>
  );
};

export default HomeGrid;
