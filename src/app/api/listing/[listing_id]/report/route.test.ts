import { PATCH } from "./route";
import { NextResponse } from "next/server";
import * as deleteListing from "@/lib/firebase/firestore/listing/deleteListing";

const { db } = jest.requireMock("@/lib/firebase/config");
const { getDoc, doc, updateDoc, arrayUnion, serverTimestamp, Timestamp } = jest.requireMock("firebase/firestore");

const deleteListingMock = jest.spyOn(deleteListing, "default").mockImplementation((
  (listing_id: string, user_id: string) => { return Promise.resolve(listing_id); }
));

jest.mock('@/lib/firebase/config', () => ({
  db: {}
}))

jest.mock('firebase/firestore', () => {
  const originalModule = jest.requireActual('firebase/firestore')
  return {
    ...originalModule,
    doc: jest.fn((db, table, id) => {
      return db[table][id];
    }),
    getDoc: jest.fn((ref) => ({
      data: () => {
        return ref;
      },
      exists: () => (ref !== undefined),
    })),
    updateDoc: jest.fn((ref, params) => {Object.assign(ref, params)}),
    arrayUnion: jest.fn((val) => ([val])), // manually confirm correct arguments passed
    serverTimestamp: () => { return "MOCK_TIME";},
    Timestamp: {
      ...originalModule.Timestamp,
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

describe('Report listing PATCH function', () => {
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

  it('Successfully report listing, update listing', async () => {
    // Mock req object
    const mockReq = new Request('http://localhost', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id: 'user1'}),
    });
    // Mock params as a promise
    const mockParams = Promise.resolve({ listing_id: "listing1" });

    const response: NextResponse = await PATCH(mockReq, { params: mockParams });

    const jsonResponse = await response.json();
    // check for correct output
    expect(jsonResponse.data).toEqual({listing_id: 'listing1'});
    expect(jsonResponse.error).toBeNull();

    // check db accesses
    expect(doc.mock.calls[0][1]).toBe('listings');
    expect(doc.mock.calls[0][2]).toBe('listing1');
    expect(doc.mock.calls[1][1]).toBe('users');
    expect(doc.mock.calls[1][2]).toBe('user1');
    expect(Timestamp.now).toHaveBeenCalled();
    expect(updateDoc.mock.calls[0][0].id).toBe('user1');
    expect(arrayUnion.mock.calls[0][0]).toBe('user1');
    expect(updateDoc.mock.calls[1][0].id).toBe('listing1');
    expect(updateDoc.mock.calls[1][1].reporters).toEqual(['user1']);
  });

  it('Successfully report listing, delete listing', async () => {
    // Mock req object
    const mockReq = new Request('http://localhost', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id: 'user1'}),
    });
    // Mock params as a promise
    const mockParams = Promise.resolve({ listing_id: "listing2" });

    const response: NextResponse = await PATCH(mockReq, { params: mockParams });

    const jsonResponse = await response.json();
    // check for correct output
    expect(jsonResponse.data).toEqual({listing_id: 'listing2'});
    expect(jsonResponse.error).toBeNull();

    // check db accesses
    expect(doc.mock.calls[0][1]).toBe('listings');
    expect(doc.mock.calls[0][2]).toBe('listing2');
    expect(doc.mock.calls[1][1]).toBe('users');
    expect(doc.mock.calls[1][2]).toBe('user1');
    // only 1 update doc call as listing is deleted
    expect(updateDoc).toHaveBeenCalledTimes(1);
    expect(updateDoc.mock.calls[0][0].id).toBe('user1');
    expect(deleteListingMock).toHaveBeenCalled();
  });

  it('Error: missing listing', async () => {
    // Mock req object
    const mockReq = new Request('http://localhost', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id: 'user1'}),
    });
    // Mock params as a promise
    const mockParams = Promise.resolve({ listing_id: "invalid_listing" });

    const response: NextResponse = await PATCH(mockReq, { params: mockParams });

    const jsonResponse = await response.json();
    // check for correct output
    expect(jsonResponse.data).toBeNull();
    expect(jsonResponse.error).toBe("Listing not found");

    // check no doc updates
    expect(updateDoc).toHaveBeenCalledTimes(0);
  });

  it('Error: no user provided', async () => {
    // Mock req object
    const mockReq = new Request('http://localhost', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });
    // Mock params as a promise
    const mockParams = Promise.resolve({ listing_id: "listing1" });

    const response: NextResponse = await PATCH(mockReq, { params: mockParams });

    const jsonResponse = await response.json();
    // check for correct output
    expect(jsonResponse.data).toBeNull();
    expect(jsonResponse.error).toBe("User not provided");

    // check no doc updates
    expect(updateDoc).toHaveBeenCalledTimes(0);
  });

  it('Error: missing user', async () => {
    // Mock req object
    const mockReq = new Request('http://localhost', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id: 'invalid_user' }),
    });
    // Mock params as a promise
    const mockParams = Promise.resolve({ listing_id: "listing1" });

    const response: NextResponse = await PATCH(mockReq, { params: mockParams });

    const jsonResponse = await response.json();
    // check for correct output
    expect(jsonResponse.data).toBeNull();
    expect(jsonResponse.error).toBe("User not found");

    // check no doc updates
    expect(updateDoc).toHaveBeenCalledTimes(0);
  });

  it('Error: repeat report', async () => {
    // Mock req object
    const mockReq = new Request('http://localhost', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id: 'user1'}),
    });
    // Mock params as a promise
    const mockParams = Promise.resolve({ listing_id: "listing3" });

    const response: NextResponse = await PATCH(mockReq, { params: mockParams });

    const jsonResponse = await response.json();
    // check for correct output
    expect(jsonResponse.data).toBeNull();
    expect(jsonResponse.error).toBe("User already reported listing");

    // check no doc updates
    expect(updateDoc).toHaveBeenCalledTimes(0);
  });

  it('Error: too recent report', async () => {
    // Mock req object
    const mockReq = new Request('http://localhost', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id: 'user2'}),
    });
    // Mock params as a promise
    const mockParams = Promise.resolve({ listing_id: "listing3" });

    const response: NextResponse = await PATCH(mockReq, { params: mockParams });

    const jsonResponse = await response.json();
    // check for correct output
    expect(jsonResponse.data).toBeNull();
    expect(jsonResponse.error).toBe("User must wait to report another listing");

    // check no doc updates
    expect(Timestamp.now).toHaveBeenCalled();
    expect(updateDoc).toHaveBeenCalledTimes(0);
  });
});
