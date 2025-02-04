'use client'

import React, { useState } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import ReactPaginate from "react-paginate";
import "bootstrap/dist/css/bootstrap.min.css";


// Define TypeScript interface for items
interface Item {
  id: number;
  title: string;
  description: string;
}


// Sample Data (Replace with API or dynamic data)
const items: Item[] = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  title: `Item ${i + 1}`,
  description: `Description for item ${i + 1}`,
}));


const HomeGrid: React.FC = () => {
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

  return (
    <Container className="mt-4">
      <Row>
        {currentItems.map((item) => (
          <Col key={item.id} xs={6} md={3} className="mb-3">
            <Card>
              <Card.Body>
                <Card.Title>{item.title}</Card.Title>
                <Card.Text>{item.description}</Card.Text>
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