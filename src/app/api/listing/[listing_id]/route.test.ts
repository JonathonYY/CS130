import { DELETE } from "./route";
import { NextResponse } from "next/server";
import * as deleteListing from "@/lib/firebase/firestore/listing/deleteListing";

const deleteListingMock = jest.spyOn(deleteListing, "default").mockImplementation(
  (listing_id: string, user_id: string) => {
      if (listing_id === "invalid_listing") {
        throw new Error("Listing not found");
      } else if (user_id === "invalid_user") {
        throw new Error("Unauthorized user");
      } else {
        return Promise.resolve(listing_id);
      }
    });

describe('Test listing DELETE API endpoint', () => {
  beforeEach(() => {
    // Reset mocks before each test to ensure clean state
    jest.clearAllMocks();
  });

  it('Invalid listing', async () => {
    // Mock req object
    const mockReq = new Request('http://localhost', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id: 'valid_user' }),
    });
    // Mock params as a promise
    const mockParams = Promise.resolve({ listing_id: "invalid_listing" });

    const response: NextResponse = await DELETE(mockReq, { params: mockParams });
    const jsonResponse = await response.json();

    expect(jsonResponse.data).toBeNull();
    expect(jsonResponse.error).toBe("Listing not found");

    expect(deleteListingMock.mock.calls[0][0]).toBe("invalid_listing");
    expect(deleteListingMock.mock.calls[0][1]).toBe("valid_user");
  });

  it('Unauthorized user', async () => {
    // Mock req object
    const mockReq = new Request('http://localhost', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id: 'invalid_user' }),
    });
    // Mock params as a promise
    const mockParams = Promise.resolve({ listing_id: "valid_listing" });

    const response: NextResponse = await DELETE(mockReq, { params: mockParams });
    const jsonResponse = await response.json();

    expect(jsonResponse.data).toBeNull();
    expect(jsonResponse.error).toBe("Unauthorized user");

    expect(deleteListingMock.mock.calls[0][0]).toBe("valid_listing");
    expect(deleteListingMock.mock.calls[0][1]).toBe("invalid_user");
  });

  it('Successfully delete listing', async () => {
    // Mock req object
    const mockReq = new Request('http://localhost', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id: 'valid_user' }),
    });
    // Mock params as a promise
    const mockParams = Promise.resolve({ listing_id: "valid_listing" });

    const response: NextResponse = await DELETE(mockReq, { params: mockParams });
    const jsonResponse = await response.json();

    expect(jsonResponse.data).toEqual({listing_id: "valid_listing"});
    expect(jsonResponse.error).toBeNull();

    expect(deleteListingMock.mock.calls[0][0]).toBe("valid_listing");
    expect(deleteListingMock.mock.calls[0][1]).toBe("valid_user");
  });
});
