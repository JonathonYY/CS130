import { PATCH } from "./route";
import { NextResponse } from "next/server";

const { db } = jest.requireMock("@/lib/firebase/config");
const { getDoc, doc, updateDoc, increment, serverTimestamp } = jest.requireMock("firebase/firestore");

jest.mock('@/lib/firebase/config', () => ({
    db: {
        users: {
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
        },
        listings: {
            listing1: {
                title: 'listing1',
                owner: 'user1',
                selected_buyer: 'user2',
                ratings: {}
            }
        },
    }
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
    increment: jest.fn((num) => {return num;}),
    serverTimestamp: () => { return "MOCK_TIME";},
  };
});

describe('Rate listing PATCH function', () => {
  beforeEach(() => {
    // Reset mocks before each test to ensure clean state
    jest.clearAllMocks();
  });

  it('Successfully rate buyer', async () => {
    // Mock req object
    const mockReq = new Request('http://localhost', {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: 'user1', rating: 4 }),
    });
    // Mock params as a promise
    const mockParams = Promise.resolve({ listing_id: "listing1" });

    const response: NextResponse = await PATCH(mockReq, { params: mockParams });

    const jsonResponse = await response.json();

    // check for correct output
    expect(jsonResponse.data.listing_id == 'listing1').toBeTruthy();
    expect(jsonResponse.error).toBeNull();

    // check mock calls, db changes
    expect(updateDoc.mock.calls[0][0]).toStrictEqual({name: 'user2', cum_buyer_rating: 4, completed_purchases: 1});
    expect(increment.mock.calls[0][0]).toBe(4);
    expect(db['listings']['listing1'].ratings).toStrictEqual({ user1: 4});
    expect(db['users']['user2']).toStrictEqual({ name: 'user2', cum_buyer_rating: 4, completed_purchases: 1 });
  });
});