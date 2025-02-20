"use client";

import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import ReactPaginate from "react-paginate";
import { useRouter } from "next/navigation";
import "bootstrap/dist/css/bootstrap.min.css";

// Define TypeScript interface for items
interface Product {
  id: string;
  title: string;
  description: string;
}

const HomeGrid: React.FC = () => {
  const [loading, setLoading] = useState(false);

  async function fetchAllListings() {
    setLoading(true);
    const response = await fetch("/api/listing", {
      method: "GET",
    });

    const test = await fetch("/api/user/123456789", {
      method: "DELETE",
    });

    const { data, error } = await response.json();

    if (error) {
      console.log(error);
    } else {
      console.log(data);
      setProductListings(data.listings);
      setLoading(false);
    }
  }

  // define state for productListings
  const [items, setProductListings] = useState<Product[]>([]);

  // fetch all listings from firestore database and update state

  // run on page load
  useEffect(() => {
    fetchAllListings();
  }, []);

  const router = useRouter();

  const itemsPerPage = 8; // 4x2 Grid
  const [currentPage, setCurrentPage] = useState<number>(0);

  // Get current items based on pagination
  const offset = currentPage * itemsPerPage;
  const currentItems = items.slice(offset, offset + itemsPerPage);
  const pageCount = Math.ceil(items.length / itemsPerPage);

  // Handle page change
  const handlePageClick = (selectedItem: { selected: number }) => {
    setCurrentPage(selectedItem.selected);
  };

  // Upon clicking on a card, pull view listing page.
  // NOTE: NextJS does not allow for a way to pass data to other page apart from passing it in url. Will need to make another db query in
  // view listing page. Alternatively put view listings in pop up window on the same page as this?
  const viewListing = (item: Product) => {
    router.push(`/view_listing?id=${item.id}`);
  };

  if (loading) {
    return <p>Loading items...</p>;
  }

  return (
    <Container className="mt-4">
      <Row>
        {currentItems.map((item) => (
          <Col key={item.id} xs={6} md={3} className="mb-3">
            <Card
              onClick={() => viewListing(item)}
              style={{ cursor: "pointer" }}
            >
              <Card.Body>
                <Card.Title>{item.title}</Card.Title>
                <Card.Text>{item.description}</Card.Text>
                <Card.Text>View item</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
      {/* Pagination */}
      <ReactPaginate
        previousLabel={"← Previous"}
        nextLabel={"Next →"}
        breakLabel={"..."}
        pageCount={pageCount}
        marginPagesDisplayed={2}
        pageRangeDisplayed={3}
        onPageChange={handlePageClick}
        containerClassName={"pagination justify-content-center mt-3"}
        pageClassName={"page-item"}
        pageLinkClassName={"page-link"}
        previousClassName={"page-item"}
        previousLinkClassName={"page-link"}
        nextClassName={"page-item"}
        nextLinkClassName={"page-link"}
        breakClassName={"page-item"}
        breakLinkClassName={"page-link"}
        activeClassName={"active"}
      />
    </Container>
  );
};

export default HomeGrid;
