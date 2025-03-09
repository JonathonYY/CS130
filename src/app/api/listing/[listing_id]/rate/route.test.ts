import { PATCH } from "./route";
import { NextResponse } from "next/server";

const { db } = jest.requireMock("@/lib/firebase/config");
const { getDoc, doc, updateDoc, increment, serverTimestamp } = jest.requireMock("firebase/firestore");
const { getUidFromAuthorizationHeader } = jest.requireMock("@/lib/util");

jest.mock('@/lib/firebase/config', () => ({
  db: {}
}))

jest.mock('firebase/firestore', () => {
  return {
    ...jest.requireActual('firebase/firestore'),
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
    increment: jest.fn((num) => {return num;}), // we just check inputs to increment, not increment behavior
    serverTimestamp: jest.fn(() => { return "MOCK_TIME";}),
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

describe('Rate listing PATCH function', () => {
  beforeEach(() => {
    // Reset mocks before each test to ensure clean state
    jest.clearAllMocks();
    // Reset mock database to clean slate
    db.users = {
        user1: {
          name: 'user1',
          cum_seller_rating: 0,
          completed_sales: 0,
        },
        user2: {
          name: 'user2',
          cum_buyer_rating: 0,
          completed_purchases: 0,
        }
      }
    db.listings = {
        listing1: {
          title: 'listing1',
          owner: 'user1',
          selected_buyer: 'user2',
          ratings: {} // no existing ratings
        },
        listing2: {
          title: 'listing2',
          owner: 'user1',
          selected_buyer: 'user2',
          ratings: {'user1': 4, 'user2': 3} // listing with existing ratings
        },
        listing3: {
          title: 'listing3',
          owner: 'invalid_seller',
          selected_buyer: 'invalid_buyer',
          ratings: {}
        }
      }
  });

  it('Successfully rate buyer, no prior rating', async () => {
    // Mock req object
    const mockReq = new Request('http://localhost', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer uid:user1',
      },
      body: JSON.stringify({ user_id: 'user1', rating: 4 }),
    });
    // Mock params as a promise
    const mockParams = Promise.resolve({ listing_id: "listing1" });

    const response: NextResponse = await PATCH(mockReq, { params: mockParams });

    const jsonResponse = await response.json();

    // check for correct output
    expect(jsonResponse.data).toEqual({listing_id: 'listing1'});
    expect(jsonResponse.error).toBeNull();

    // check mock calls, db changes
    // update user
    expect(updateDoc.mock.calls[0][1]).toStrictEqual({cum_buyer_rating: 4, completed_purchases: 1});
    // rating
    expect(increment.mock.calls[0][0]).toBe(4);
    // new rating, increment purchases
    expect(increment.mock.calls[1][0]).toBe(1);
    expect(increment).toHaveBeenCalledTimes(2);
    // update listing
    expect(updateDoc.mock.calls[1][1]).toStrictEqual({ratings: {user1: 4}, updated: "MOCK_TIME"})

    // confirm mock db changes
    expect(db['listings']['listing1'].ratings).toStrictEqual({ user1: 4});
    expect(db['users']['user2']).toStrictEqual({ name: 'user2', cum_buyer_rating: 4, completed_purchases: 1 });
  });

  it('Successfully rate buyer, change prior rating', async () => {
    // Mock req object
    const mockReq = new Request('http://localhost', {
      method: 'PATCH',
      headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer uid:user1',
      },
      body: JSON.stringify({ user_id: 'user1', rating: 2 }),
    });
    // Mock params as a promise
    const mockParams = Promise.resolve({ listing_id: "listing2" });

    const response: NextResponse = await PATCH(mockReq, { params: mockParams });

    const jsonResponse = await response.json();

    // check for correct output
    expect(jsonResponse.data).toEqual({listing_id: 'listing2'});
    expect(jsonResponse.error).toBeNull();

    // check mock calls, db changes
    // update user
    expect(updateDoc.mock.calls[0][1]).toStrictEqual({cum_buyer_rating: -2});
    // rating is incremented by difference between old rating and new rating
    expect(increment.mock.calls[0][0]).toBe(2 - 4);
    // updating existing rating, only 1 call to increment
    expect(increment).toHaveBeenCalledTimes(1);
    // update listing
    expect(updateDoc.mock.calls[1][1]).toStrictEqual({ratings: {user1: 2, user2: 3}, updated: "MOCK_TIME"})

    // confirm mock db changes
    expect(db['listings']['listing2'].ratings).toStrictEqual({ user1: 2, user2: 3});
    // mocked user is set to match rating difference passed by increment; assume Firestore increment works
    expect(db['users']['user2']).toStrictEqual({ name: 'user2', cum_buyer_rating: -2, completed_purchases: 0 });
  });

  it('Successfully rate seller, no prior rating', async () => {
    // Mock req object
    const mockReq = new Request('http://localhost', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer uid:user2',
      },
      body: JSON.stringify({ user_id: 'user2', rating: 3 }),
    });
    // Mock params as a promise
    const mockParams = Promise.resolve({ listing_id: "listing1" });

    const response: NextResponse = await PATCH(mockReq, { params: mockParams });

    const jsonResponse = await response.json();

    // check for correct output
    expect(jsonResponse.data).toEqual({listing_id: 'listing1'});
    expect(jsonResponse.error).toBeNull();

    // check mock calls, db changes
    // update user
    expect(updateDoc.mock.calls[0][1]).toStrictEqual({cum_seller_rating: 3, completed_sales: 1});
    // rating
    expect(increment.mock.calls[0][0]).toBe(3);
    // new rating, increment sales
    expect(increment.mock.calls[1][0]).toBe(1);
    expect(increment).toHaveBeenCalledTimes(2);
    // update listing
    expect(updateDoc.mock.calls[1][1]).toStrictEqual({ratings: {user2: 3}, updated: "MOCK_TIME"})

    // confirm mock db changes
    expect(db['listings']['listing1'].ratings).toStrictEqual({ user2: 3});
    expect(db['users']['user1']).toStrictEqual({ name: 'user1', cum_seller_rating: 3, completed_sales: 1 });
  });

  it('Successfully rate seller, change prior rating', async () => {
    // Mock req object
    const mockReq = new Request('http://localhost', {
      method: 'PATCH',
      headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer uid:user2',
      },
      body: JSON.stringify({ user_id: 'user2', rating: 5 }),
    });
    // Mock params as a promise
    const mockParams = Promise.resolve({ listing_id: "listing2" });

    const response: NextResponse = await PATCH(mockReq, { params: mockParams });

    const jsonResponse = await response.json();

    // check for correct output
    expect(jsonResponse.data).toEqual({listing_id: 'listing2'});
    expect(jsonResponse.error).toBeNull();

    // check mock calls, db changes
    // update user
    expect(updateDoc.mock.calls[0][1]).toStrictEqual({cum_seller_rating: 2});
    // rating is incremented by difference between old rating and new rating
    expect(increment.mock.calls[0][0]).toBe(5 - 3);
    // updating existing rating, only 1 call to increment
    expect(increment).toHaveBeenCalledTimes(1);
    // update listing
    expect(updateDoc.mock.calls[1][1]).toStrictEqual({ratings: {user1: 4, user2: 5}, updated: "MOCK_TIME"})

    // confirm mock db changes
    expect(db['listings']['listing2'].ratings).toStrictEqual({ user1: 4, user2: 5});
    // mocked user is set to match rating difference passed by increment; assume Firestore increment works
    expect(db['users']['user1']).toStrictEqual({ name: 'user1', cum_seller_rating: 2, completed_sales: 0 });
  });

  it('Error: invalid ratings', async () => {
    // Mock params as a promise
    const mockParams = Promise.resolve({ listing_id: "listing1" });

    // Mock req object: no rating
    const mockReq1 = new Request('http://localhost', {
      method: 'PATCH',
      headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer uid:user2',
      },
      body: JSON.stringify({ user_id: 'user2' }),
    });

    const response1: NextResponse = await PATCH(mockReq1, { params: mockParams });

    const jsonResponse1 = await response1.json();

    // check for correct output
    expect(jsonResponse1.data).toBeNull();
    expect(jsonResponse1.error).toBe('Must provide a rating between 1 and 5');

    // Mock req object: non-numeric rating
    const mockReq2 = new Request('http://localhost', {
      method: 'PATCH',
      headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer uid:user2',
      },
      body: JSON.stringify({ user_id: 'user2', rating: '3' }),
    });

    const response2: NextResponse = await PATCH(mockReq2, { params: mockParams });

    const jsonResponse2 = await response2.json();

    // check for correct output
    expect(jsonResponse2.data).toBeNull();
    expect(jsonResponse2.error).toBe('Must provide a rating between 1 and 5');

    // Mock req object: rating too small
    const mockReq3 = new Request('http://localhost', {
      method: 'PATCH',
      headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer uid:user2',
      },
      body: JSON.stringify({ user_id: 'user2', rating: 0 }),
    });

    const response3: NextResponse = await PATCH(mockReq3, { params: mockParams });

    const jsonResponse3 = await response3.json();

    // check for correct output
    expect(jsonResponse3.data).toBeNull();
    expect(jsonResponse3.error).toBe('Must provide a rating between 1 and 5');

    // Mock req object: rating too large
    const mockReq4 = new Request('http://localhost', {
      method: 'PATCH',
      headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer uid:user2',
      },
      body: JSON.stringify({ user_id: 'user2', rating: 6 }),
    });

    const response4: NextResponse = await PATCH(mockReq4, { params: mockParams });

    const jsonResponse4 = await response4.json();

    // check for correct output
    expect(jsonResponse4.data).toBeNull();
    expect(jsonResponse4.error).toBe('Must provide a rating between 1 and 5');

    // confirm none of the mocked firebase functions are reached
    expect(getDoc).not.toHaveBeenCalled();
    expect(doc).not.toHaveBeenCalled();
    expect(updateDoc).not.toHaveBeenCalled();
    expect(increment).not.toHaveBeenCalled();
    expect(serverTimestamp).not.toHaveBeenCalled();

    expect(getUidFromAuthorizationHeader).toHaveBeenCalledTimes(4);
  });

  it('Error: missing listing', async () => {
    // Mock params as a promise
    const mockParams = Promise.resolve({ listing_id: "invalid_listing" });

    // Mock req object
    const mockReq = new Request('http://localhost', {
      method: 'PATCH',
      headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer uid:user2',
      },
      body: JSON.stringify({ user_id: 'user2', rating: 3 }),
    });

    const response: NextResponse = await PATCH(mockReq, { params: mockParams });

    const jsonResponse = await response.json();

    expect(getUidFromAuthorizationHeader).toHaveBeenCalled();

    // check for correct output
    expect(jsonResponse.data).toBeNull();
    expect(jsonResponse.error).toBe('Listing not found');

    // confirm update is not reached
    expect(getDoc).toHaveBeenCalledTimes(1);
    expect(doc).toHaveBeenCalledTimes(1);
    expect(updateDoc).not.toHaveBeenCalled();
    expect(increment).not.toHaveBeenCalled();
    expect(serverTimestamp).not.toHaveBeenCalled();
  });

  it('Error: user not provided', async () => {
    // Mock params as a promise
    const mockParams = Promise.resolve({ listing_id: "invalid_listing" });

    // Mock req object
    const mockReq = new Request('http://localhost', {
      method: 'PATCH',
      headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer uid:some_user',
      },
      body: JSON.stringify({ rating: 3 }),
    });

    const response: NextResponse = await PATCH(mockReq, { params: mockParams });

    const jsonResponse = await response.json();

    expect(getUidFromAuthorizationHeader).toHaveBeenCalled();

    // check for correct output
    expect(jsonResponse.data).toBeNull();
    expect(jsonResponse.error).toBe('Provided user_id must match authenticated user');

    // confirm update is not reached
    expect(getDoc).not.toHaveBeenCalled();
    expect(doc).not.toHaveBeenCalled();
    expect(updateDoc).not.toHaveBeenCalled();
    expect(increment).not.toHaveBeenCalled();
    expect(serverTimestamp).not.toHaveBeenCalled();
  });

  it('Error: unauthorized user', async () => {
    // Mock params as a promise
    const mockParams = Promise.resolve({ listing_id: "listing1" });

    // Mock req object
    const mockReq = new Request('http://localhost', {
      method: 'PATCH',
      headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer uid:invalid_user',
      },
      body: JSON.stringify({ user_id: 'invalid_user', rating: 3 }),
    });

    const response: NextResponse = await PATCH(mockReq, { params: mockParams });

    const jsonResponse = await response.json();

    expect(getUidFromAuthorizationHeader).toHaveBeenCalled();

    // check for correct output
    expect(jsonResponse.data).toBeNull();
    expect(jsonResponse.error).toBe('User cannot rate this listing');

    // confirm update is not reached
    expect(getDoc).toHaveBeenCalledTimes(1);
    expect(doc).toHaveBeenCalledTimes(1);
    expect(updateDoc).not.toHaveBeenCalled();
    expect(increment).not.toHaveBeenCalled();
    expect(serverTimestamp).not.toHaveBeenCalled();
  });

  it('Error: unauthorized caller', async () => {
    // Mock params as a promise
    const mockParams = Promise.resolve({ listing_id: "listing1" });

    // Mock req object
    const mockReq = new Request('http://localhost', {
      method: 'PATCH',
      headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer uid:user2',
      },
      body: JSON.stringify({ user_id: 'user1', rating: 3 }),
    });

    const response: NextResponse = await PATCH(mockReq, { params: mockParams });

    const jsonResponse = await response.json();

    expect(getUidFromAuthorizationHeader).toHaveBeenCalled();

    // check for correct output
    expect(jsonResponse.data).toBeNull();
    expect(jsonResponse.error).toBe('Provided user_id must match authenticated user');

    // confirm update is not reached
    expect(getDoc).not.toHaveBeenCalled();
    expect(doc).not.toHaveBeenCalled();
    expect(updateDoc).not.toHaveBeenCalled();
    expect(increment).not.toHaveBeenCalled();
    expect(serverTimestamp).not.toHaveBeenCalled();
  });

  it('Error: missing rated user', async () => {
    // Mock params as a promise
    const mockParams = Promise.resolve({ listing_id: "listing3" });

    // Mock req object
    const mockReq1 = new Request('http://localhost', {
      method: 'PATCH',
      headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer uid:invalid_buyer',
      },
      body: JSON.stringify({ user_id: 'invalid_buyer', rating: 3 }),
    });

    const response1: NextResponse = await PATCH(mockReq1, { params: mockParams });

    const jsonResponse1 = await response1.json();

    expect(getUidFromAuthorizationHeader).toHaveBeenCalled();

    // check for correct output
    expect(jsonResponse1.data).toBeNull();
    expect(jsonResponse1.error).toBe('Owner not found');

    // Mock req object
    const mockReq2 = new Request('http://localhost', {
      method: 'PATCH',
      headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer uid:invalid_seller',
      },
      body: JSON.stringify({ user_id: 'invalid_seller', rating: 3 }),
    });

    const response2: NextResponse = await PATCH(mockReq2, { params: mockParams });

    const jsonResponse2 = await response2.json();

    // check for correct output
    expect(jsonResponse2.data).toBeNull();
    expect(jsonResponse2.error).toBe('Selected buyer not found');

    // confirm update is not reached
    expect(getDoc).toHaveBeenCalledTimes(4);
    expect(doc).toHaveBeenCalledTimes(4);
    expect(updateDoc).not.toHaveBeenCalled();
    expect(increment).not.toHaveBeenCalled();
    expect(serverTimestamp).not.toHaveBeenCalled();
  });
});
