import { GET, PATCH, DELETE } from "./route";
import { NextResponse } from "next/server";
import * as deleteListing from "@/lib/firebase/firestore/listing/deleteListing";

const { db } = jest.requireMock("@/lib/firebase/config");
const { getDoc, doc, updateDoc, serverTimestamp } = jest.requireMock("firebase/firestore");
const { getUidFromAuthorizationHeader } = jest.requireMock("@/lib/util");

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

jest.mock('@/lib/firebase/config', () => ({
    db: {}
}))

jest.mock('firebase/firestore', () => {
    return {
        doc: jest.fn((db, table, id) => {
            return db[table][id];
        }),
        getDoc: jest.fn((ref) => ({
            data: () => {
                return ref;
            },
            exists: () => (ref !== undefined),
        })),
        arrayUnion: jest.fn((val) => ([val])),
        updateDoc: jest.fn((ref, params) => { Object.assign(ref, params) }),
        serverTimestamp: jest.fn(() => { return 'MOCK_TIME'; }),
    };
});

jest.mock("@/lib/util", () => ({
    getUidFromAuthorizationHeader: jest.fn((authorizationHeader) => {
        if (!authorizationHeader) {
            throw new Error("Unauthorized: Missing token");
        }

        const token = authorizationHeader.split("Bearer ")[1];
        if (!token) {
            throw new Error("Unauthorized: Invalid token format");
        }

        const uid = token.split("uid:")[1];
        if (!uid) {
            throw new Error("Unauthorized: Invalid token format");
        }

        return uid;
    })
}));

describe('Test GET listing', () => {
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
                'updated': 'MOCK_TIME0',
                'title': 'Listing1',
                'price': 30,
                'condition': 'good',
                'category': 'food',
                'description': '',
                'owner': 'user1',
                'owner_name': 'A',
                'owner_pfp': '',
                'seller_rating': 4,
                'selected_buyer': '',
                'potential_buyers': [],
                'reporters': [],
                'ratings': {},
                'image_paths': [],
            },
            listing2: {
                'updated': 'MOCK_TIME0',
                'title': 'Listing2',
                'price': 60,
                'condition': 'used',
                'category': 'object',
                'description': 'asdf',
                'owner': 'user2',
                'owner_name': 'A',
                'owner_pfp': '',
                'seller_rating': 3.5,
                'selected_buyer': '',
                'potential_buyers': [],
                'reporters': [],
                'ratings': {},
                'image_paths': [], 
            },
        }
    });

    it('Succesfully get listing', async () => {
        // Mock req object
        const mockReq = new Request('http://localhost', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer uid:uid',
            },
        });
        // Mock params as a promise
        const mockParams = Promise.resolve({ listing_id: 'listing1' });

        const response: NextResponse = await GET(mockReq, { params: mockParams });

        const jsonResponse = await response.json();

        expect(doc.mock.calls[0][1]).toBe('listings')
        expect(doc.mock.calls[0][2]).toBe('listing1')

        expect(getUidFromAuthorizationHeader).toHaveBeenCalled();

        // check for correct output
        expect(jsonResponse.data).toEqual({
            'id': 'listing1',
            'updated': 'MOCK_TIME0',
            'title': 'Listing1',
            'price': 30,
            'condition': 'good',
            'category': 'food',
            'description': '',
            'owner': 'user1',
            'owner_name': 'A',
            'owner_pfp': '',
            'seller_rating': 4,
            'selected_buyer': '',
            'potential_buyers': [],
            'image_paths': [],
        });
        expect(jsonResponse.error).toBeNull();
    });

    it('Get listing with invalid id', async () => {
        // Mock req object
        const mockReq = new Request('http://localhost', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer uid:uid',
            },
        });
        // Mock params as a promise
        const mockParams = Promise.resolve({ listing_id: 'invalid_id' });

        const response: NextResponse = await GET(mockReq, { params: mockParams });

        const jsonResponse = await response.json();

        expect(doc.mock.calls[0][1]).toBe('listings')
        expect(doc.mock.calls[0][2]).toBe('invalid_id')

        expect(getUidFromAuthorizationHeader).toHaveBeenCalled();

        // check for correct output
        expect(jsonResponse.data).toBeNull();
        expect(jsonResponse.error).toEqual('No listing exists for given id');
    });
});

describe('Test PATCH listing', () => {
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
                'updated': 'MOCK_TIME0',
                'title': 'Listing1',
                'price': 30,
                'condition': 'good',
                'category': 'food',
                'description': '',
                'owner': 'user1',
                'owner_name': 'A',
                'owner_pfp': '',
                'seller_rating': 4,
                'selected_buyer': '',
                'potential_buyers': [],
                'reporters': [],
                'ratings': {},
                'image_paths': [],
            },
            listing2: {
                'updated': 'MOCK_TIME0',
                'title': 'Listing2',
                'price': 60,
                'condition': 'used',
                'category': 'object',
                'description': 'asdf',
                'owner': 'user2',
                'owner_name': 'A',
                'owner_pfp': '',
                'seller_rating': 3.5,
                'selected_buyer': '',
                'potential_buyers': [],
                'reporters': [],
                'ratings': {},
                'image_paths': [], 
            },
        }
    });
    it('Succesfully update listing', async () => {
        // Mock req object
        const mockReq = new Request('http://localhost', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer uid:uid',
            },
            body: JSON.stringify({ title: 'new_title', potential_buyers: ['user1'] }),
        });
        // Mock params as a promise
        const mockParams = Promise.resolve({ listing_id: 'listing2' });

        const response: NextResponse = await PATCH(mockReq, { params: mockParams });

        const jsonResponse = await response.json();

        expect(doc.mock.calls[0][1]).toBe('listings');
        expect(doc.mock.calls[0][2]).toBe('listing2');
        expect(getDoc).toHaveBeenCalled();
        expect(updateDoc).toHaveBeenCalled();
        expect(serverTimestamp).toHaveBeenCalled();

        expect(getUidFromAuthorizationHeader).toHaveBeenCalled();

        // check for correct output
        expect(jsonResponse.data).toEqual({
            'updated': 'MOCK_TIME',
            'title': 'NEW_TITLE',
            'price': 60,
            'condition': 'used',
            'category': 'object',
            'description': 'asdf',
            'owner': 'user2',
            'owner_name': 'A',
            'owner_pfp': '',
            'seller_rating': 3.5,
            'selected_buyer': '',
            'potential_buyers': ["user1"],
            'image_paths': [], 
        });
        expect(jsonResponse.error).toBeNull();

        expect(db['users']['user1']).toMatchObject({
            interested_listings: ["listing2"],
        })
    });

    it('Try to update listing an invalid id', async () => {
        // Mock req object
        const mockReq = new Request('http://localhost', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer uid:uid',
            },
            body: JSON.stringify({ title: 'new_title' }),
        });
        // Mock params as a promise
        const mockParams = Promise.resolve({ listing_id: 'invalid_id' });

        const response: NextResponse = await PATCH(mockReq, { params: mockParams });

        const jsonResponse = await response.json();

        expect(doc.mock.calls[0][1]).toBe('listings');
        expect(doc.mock.calls[0][2]).toBe('invalid_id');
        expect(getDoc).toHaveBeenCalled();
        expect(updateDoc).not.toHaveBeenCalled();
        expect(serverTimestamp).not.toHaveBeenCalled();

        expect(getUidFromAuthorizationHeader).toHaveBeenCalled();

        // check for correct output
        expect(jsonResponse.data).toBeNull();
        expect(jsonResponse.error).toEqual('No listing exists for given id');
    });

    it('Try to update listing with an invalid field', async () => {
        // Mock req object
        const mockReq = new Request('http://localhost', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer uid:uid',
            },
            body: JSON.stringify({ blah: 'blah' }),
        });
        // Mock params as a promise
        const mockParams = Promise.resolve({ listing_id: 'listing1' });

        const response: NextResponse = await PATCH(mockReq, { params: mockParams });

        const jsonResponse = await response.json();

        expect(doc).not.toHaveBeenCalled();
        expect(getDoc).not.toHaveBeenCalled();
        expect(updateDoc).not.toHaveBeenCalled();
        expect(serverTimestamp).not.toHaveBeenCalled();

        expect(getUidFromAuthorizationHeader).toHaveBeenCalled();

        // check for correct output
        expect(jsonResponse.data).toBeNull();
        expect(jsonResponse.error).toEqual('invalid listing field');
    });

    it('Try to update listing with a negative price', async () => {
        // Mock req object
        const mockReq = new Request('http://localhost', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer uid:uid',
            },
            body: JSON.stringify({ price: -5 }),
        });
        // Mock params as a promise
        const mockParams = Promise.resolve({ listing_id: 'listing1' });

        const response: NextResponse = await PATCH(mockReq, { params: mockParams });

        const jsonResponse = await response.json();

        expect(doc).not.toHaveBeenCalled();
        expect(getDoc).not.toHaveBeenCalled();
        expect(updateDoc).not.toHaveBeenCalled();
        expect(serverTimestamp).not.toHaveBeenCalled();

        expect(getUidFromAuthorizationHeader).toHaveBeenCalled();

        // check for correct output
        expect(jsonResponse.data).toBeNull();
        expect(jsonResponse.error).toEqual('price must be nonnegative');
    });
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
        'Authorization': 'Bearer uid:valid_user',
      },
      body: JSON.stringify({ user_id: 'valid_user' }),
    });
    // Mock params as a promise
    const mockParams = Promise.resolve({ listing_id: "invalid_listing" });

    const response: NextResponse = await DELETE(mockReq, { params: mockParams });
    const jsonResponse = await response.json();

    expect(jsonResponse.data).toBeNull();
    expect(jsonResponse.error).toBe("Listing not found");

    expect(getUidFromAuthorizationHeader).toHaveBeenCalled();

    expect(deleteListingMock.mock.calls[0][0]).toBe("invalid_listing");
    expect(deleteListingMock.mock.calls[0][1]).toBe("valid_user");
  });

  it('User not provided', async () => {
    // Mock req object
    const mockReq = new Request('http://localhost', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer uid:uid',
      },
      body: JSON.stringify({}),
    });
    // Mock params as a promise
    const mockParams = Promise.resolve({ listing_id: "invalid_listing" });

    const response: NextResponse = await DELETE(mockReq, { params: mockParams });
    const jsonResponse = await response.json();

    expect(jsonResponse.data).toBeNull();
    expect(jsonResponse.error).toBe("Provided user_id must match authenticated user");

    expect(getUidFromAuthorizationHeader).toHaveBeenCalled();

    expect(deleteListingMock).not.toHaveBeenCalled();
  });

  it('User provided does not match authenticated user', async () => {
    // Mock req object
    const mockReq = new Request('http://localhost', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer uid:uid',
      },
      body: JSON.stringify({user_id: 'other_user'}),
    });
    // Mock params as a promise
    const mockParams = Promise.resolve({ listing_id: "invalid_listing" });

    const response: NextResponse = await DELETE(mockReq, { params: mockParams });
    const jsonResponse = await response.json();

    expect(jsonResponse.data).toBeNull();
    expect(jsonResponse.error).toBe("Provided user_id must match authenticated user");

    expect(getUidFromAuthorizationHeader).toHaveBeenCalled();

    expect(deleteListingMock).not.toHaveBeenCalled();
  });

  it('Unauthorized user', async () => {
    // Mock req object
    const mockReq = new Request('http://localhost', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer uid:invalid_user',
      },
      body: JSON.stringify({ user_id: 'invalid_user' }),
    });
    // Mock params as a promise
    const mockParams = Promise.resolve({ listing_id: "valid_listing" });

    const response: NextResponse = await DELETE(mockReq, { params: mockParams });
    const jsonResponse = await response.json();

    expect(jsonResponse.data).toBeNull();
    expect(jsonResponse.error).toBe("Unauthorized user");

    expect(getUidFromAuthorizationHeader).toHaveBeenCalled();

    expect(deleteListingMock.mock.calls[0][0]).toBe("valid_listing");
    expect(deleteListingMock.mock.calls[0][1]).toBe("invalid_user");
  });

  it('Successfully delete listing', async () => {
    // Mock req object
    const mockReq = new Request('http://localhost', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer uid:valid_user',
      },
      body: JSON.stringify({ user_id: 'valid_user' }),
    });
    // Mock params as a promise
    const mockParams = Promise.resolve({ listing_id: "valid_listing" });

    const response: NextResponse = await DELETE(mockReq, { params: mockParams });
    const jsonResponse = await response.json();

    expect(jsonResponse.data).toEqual({listing_id: "valid_listing"});
    expect(jsonResponse.error).toBeNull();

    expect(getUidFromAuthorizationHeader).toHaveBeenCalled();

    expect(deleteListingMock.mock.calls[0][0]).toBe("valid_listing");
    expect(deleteListingMock.mock.calls[0][1]).toBe("valid_user");
  });
});
