"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Container, Card, CardContent, Typography, Pagination, CardMedia, Avatar, Rating } from '@mui/material';
import Grid from '@mui/material/Grid2';

// Define TypeScript interface for items
interface Product {
  id: string;
  title: string;
  price: number;
  image: string;
  rating: number;
  ownerName: string;
  ownerPfp: string;
}


// Define TypeScript interface for props
type GridProps = {
  query: string;
};


const HomeGrid: React.FC<GridProps> = ({ query }) => {
  // States for informing users data is being fetched
  const [loading, setLoading] = useState(true);

  // Fetch all listings from the database, extract important info for cards
  // This API does not require auth token
  const fetchAllListings = async () => {
    setLoading(true);
    const response = await fetch(query, {
      method: "GET",
    });

    const { data, error } = await response.json();

    if (error) {
      console.log("Error");
      alert("An error has occured, please reload page");
    } else {
      const listings: Product[] = data.listings.map((element: {
        id: string; title: string; price: number; thumbnail: string; seller_rating: number; owner_name: string; owner_pfp: string
      }) => ({
        id: element.id,
        title: element.title || 'TITLE',
        price: element.price || 0,
        image: element.thumbnail || 'no-image.svg',
        rating: element.seller_rating || 0,
        ownerName: element.owner_name || 'NAME',
        ownerPfp: element.owner_pfp || ''
      }));


      setCurrentPage(1);
      setProductListings(listings);
      setLoading(false);
    }
  }

  // define state for productListings
  const [items, setProductListings] = useState<Product[]>([]);

  // run on page load
  useEffect(() => {
    fetchAllListings();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);


  const router = useRouter();


  const itemsPerPage = 8;


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
    return <p className="loading"><b>Loading items...</b></p>;
  } else if (items.length == 0) {
    return <p className="loading"><b>No results found!</b></p>
  }


  // Displays items
  return (
    <Container sx={{ mt: 4 }}>
      <Grid container rowSpacing={3} columnSpacing={{ sm: 6, md: 6 }}>
        {currentItems.map((item) => (
          // For 2x4 grid - md: 3, for 3x3 grid - md: 4
          <Grid size={{ sm: 3, md: 3 }} key={item.id}>
            <Card
              sx={{
                cursor: 'pointer',
                border: '1px solid #ccc',
                borderRadius: 2,
              }}
              onClick={() => viewListing(item)}
            >
              <CardMedia
                component="img"
                sx={{ height: "125px", width: "100%", objectFit: "contain" }}
                image={item.image}
              />

              <CardContent>
                <Typography variant="h5" noWrap>${item.price}</Typography>
                <Typography variant="h6" noWrap>{item.title}</Typography>
                <Grid container alignItems="center" spacing={1} size={{ xs: 12, sm: 12, md: 12 }} wrap="nowrap">
                  <Avatar src={item.ownerPfp} sx={{ width: 20, height: 20 }} />
                  <Typography variant="body1" color="text.secondary" noWrap>{item.ownerName}</Typography>
                  <Rating size="small" value={item.rating} readOnly precision={0.5} />
                </Grid>
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
