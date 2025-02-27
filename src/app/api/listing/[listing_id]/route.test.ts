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

  it('User not provided', async () => {
    // Mock req object
    const mockReq = new Request('http://localhost', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });
    // Mock params as a promise
    const mockParams = Promise.resolve({ listing_id: "invalid_listing" });

    const response: NextResponse = await DELETE(mockReq, { params: mockParams });
    const jsonResponse = await response.json();

    expect(jsonResponse.data).toBeNull();
    expect(jsonResponse.error).toBe("User not provided");

    expect(deleteListingMock).toHaveBeenCalledTimes(0);
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

import { NextResponse } from "next/server";
import { GET, PATCH } from "./route";

import * as getListing from "@/lib/firebase/firestore/listing/getListing";

const { db } = jest.requireMock("@/lib/firebase/config");
const { getDoc, doc, updateDoc, arrayUnion, serverTimestamp, Timestamp } = jest.requireMock("firebase/firestore");

// const getListingMock = jest.spyOn(getListing, "default").mockImplementation((
//     (doc_id: string) => {
//         return Promise.resolve({ doc_id, error

//         }); }
// ));

jest.mock('@/lib/firebase/config', () => ({
    db: {}
}))

jest.mock('firebase/firestore', () => {
    // const originalModule = jest.requireActual('firebase/firestore')
    return {
        // ...originalModule,
        doc: jest.fn((db, table, id) => {
            return db[table][id];
        }),
        getDoc: jest.fn((ref) => ({
            data: () => {
                return ref;
            },
            exists: () => (ref !== undefined),
        })),
        updateDoc: jest.fn((ref, params) => { Object.assign(ref, params) }),
        arrayUnion: jest.fn((val) => ([val])), // manually confirm correct arguments passed
        serverTimestamp: jest.fn(() => { return "MOCK_TIME"; }),
        Timestamp: {
            // ...originalModule.Timestamp,
            now: jest.fn(() => {
                return {
                    toMillis(): number {
                        return 300000; // hardcode to return time as 300000 millis
                    }
                };
            })
        }
    };
});

describe('Test GET, PATCH listing', () => {
    beforeEach(() => {
        // Reset mocks before each test to ensure clean state
        jest.clearAllMocks();
        // Reset mock database to clean slate
        db.users = {
            user1: {
                id: 'user1',
                cum_seller_rating: 0,
                completed_sales: 0,
                last_reported: {
                    toMillis: () => (200000)
                }
            },
            user2: {
                id: 'user2',
                cum_buyer_rating: 0,
                completed_purchases: 0,
                last_reported: {
                    toMillis: () => (250000)
                }
            }
        }
        db.listings = {
            listing1: {
                id: 'listing1',
                owner: 'user3',
                reporters: ['user2']
            },
            listing2: {
                id: 'listing2',
                owner: 'user3',
                reporters: ['r1', 'r2', 'r3', 'r4']
            },
            listing3: {
                id: 'listing3',
                owner: 'user3',
                reporters: ['user1']
            },
        }
    });

    it('Succesfully get listing', async () => {
        // Mock req object
        const mockReq = new Request('http://localhost', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            // body: JSON.stringify({ listing_id: 'user1' }),
        });
        // Mock params as a promise
        const mockParams = Promise.resolve({ listing_id: "listing1" });

        const response: NextResponse = await GET(mockReq, { params: mockParams });

        const jsonResponse = await response.json();

        expect(doc.mock.calls[0][1]).toBe('listings')
        expect(doc.mock.calls[0][2]).toBe('listing1')

        // check for correct output
        expect(jsonResponse.data).toEqual({
            id: 'listing1',
            owner: 'user3',
            reporters: ['user2']
        });
        expect(jsonResponse.error).toBeNull();
    });

    it('Get listing with invalid id', async () => {
        // Mock req object
        const mockReq = new Request('http://localhost', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            // body: JSON.stringify({ listing_id: 'user1' }),
        });
        // Mock params as a promise
        const mockParams = Promise.resolve({ listing_id: "invalid_id" });

        const response: NextResponse = await GET(mockReq, { params: mockParams });

        const jsonResponse = await response.json();

        expect(doc.mock.calls[0][1]).toBe('listings')
        expect(doc.mock.calls[0][2]).toBe('invalid_id')

        // check for correct output
        expect(jsonResponse.data).toEqual({});
        expect(jsonResponse.error).not.toBeNull();
    });

    it('Succesfully update listing', async () => {
        // Mock req object
        const mockReq = new Request('http://localhost', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: 'new_title' }),
        });
        // Mock params as a promise
        const mockParams = Promise.resolve({ listing_id: "listing1" });

        const response: NextResponse = await PATCH(mockReq, { params: mockParams });

        const jsonResponse = await response.json();
        // check for correct output

        expect(doc.mock.calls[0][1]).toBe('listings');
        expect(doc.mock.calls[0][2]).toBe('listing1');
        expect(getDoc).toHaveBeenCalled();
        expect(updateDoc).toHaveBeenCalled();
        expect(serverTimestamp).toHaveBeenCalled();

        expect(jsonResponse.data).toEqual({
            id: 'listing1',
            owner: 'user3',
            reporters: ['user2'],
            name: 'new_title',
            updated: 'MOCK_TIME'
        });
        expect(jsonResponse.error).toBeNull();
    });

    it('Try to update listing on invalid id', async () => {
        // Mock req object
        const mockReq = new Request('http://localhost', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: 'new_title' }),
        });
        // Mock params as a promise
        const mockParams = Promise.resolve({ listing_id: "invalid_id" });

        const response: NextResponse = await PATCH(mockReq, { params: mockParams });

        const jsonResponse = await response.json();
        // check for correct output

        expect(doc.mock.calls[0][1]).toBe('listings');
        expect(doc.mock.calls[0][2]).toBe('invalid_id');
        expect(getDoc).not.toHaveBeenCalled();
        expect(updateDoc).toHaveBeenCalled();
        expect(serverTimestamp).toHaveBeenCalled();

        expect(jsonResponse.data).toEqual({});
        expect(jsonResponse.error).not.toBeNull();
    });
});
