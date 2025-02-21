import { NextResponse } from "next/server";
import { User } from "@/lib/firebase/firestore/types";
import { Timestamp } from "firebase/firestore";
import { GET, PATCH, DELETE } from "./route";

// mock firestore methods
jest.mock('firebase/firestore');
jest.mock('firebase/firestore', () => ({
  ...jest.requireActual('firebase/firestore'),
  doc: jest.fn((db, table, id) => ({
    id: id,
  })),
  getDoc: jest.fn((ref) => ({
    data: () => ({
      "first": "test_first",
      "last": "test_last",
      "email_address": "test@g.ucla.edu",
      "phone_number": "123-456-7890",
      "active_listings": [],
      "interested_listings": [],
      "completed_sales": 0,
      "completed_purchases": 0,
      "cum_buyer_rating": 0,
      "cum_seller_rating": 0,
      "last_reported": Timestamp.fromMillis(0),
      "pfp": "/some/path/to/img",
      }),
    exists: () => (!ref.id.includes("FAKE")),
  })),
}));

describe("User API", () => {
  it('should correctly handle GET request', async () => {
    // mock req object
    const mockReq = new Request('http://localhost/', {
        method: 'GET',
    });
    // mock params
    const user_id = "TEST_ID";
    const mockParams = Promise.resolve({ user_id: user_id });

    const response: NextResponse = await GET(mockReq, { params: mockParams });
    const jsonResponse = await response.json();
    const user: User = jsonResponse.data;

    expect(jsonResponse.error).toBe(null);
    expect(user.id).toEqual(user_id);
  });
  it('should correctly handle GET request with invalid user', async () => {
    // mock req object
    const mockReq = new Request('http://localhost/', {
        method: 'GET',
    });
    // mock params
    const user_id = "FAKE_TEST_ID";
    const mockParams = Promise.resolve({ user_id: user_id });

    const response: NextResponse = await GET(mockReq, { params: mockParams });
    const jsonResponse = await response.json();
    const user: User = jsonResponse.data;

    expect(jsonResponse.error).toEqual("user does not exist");
  });
});
