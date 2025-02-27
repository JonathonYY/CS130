<<<<<<< HEAD
import { GET } from "./route";
import * as getAllListings from "@/lib/firebase/firestore/listing/getAllListings";

const getAllListingsMock = jest.spyOn(getAllListings, "default").mockImplementation();

describe('Test GET all listings API endpoint', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('request with no query params', async () => {
    const mockReq = new Request('http://localhost', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    await GET(mockReq);
    expect(getAllListingsMock.mock.calls[0]).toEqual([undefined, NaN, NaN, NaN]);
  });

  it('request with query params', async () => {
    const searchParams: Record<string, any> = new URLSearchParams();
    searchParams.append("query", "this is a query string");
    searchParams.append("limit", 150);
    searchParams.append("last_rating", 4.5);
    searchParams.append("last_updated", 199000000);
    const baseUrl = new URL('http://localhost');
    baseUrl.search = searchParams.toString();
    const mockReq = new Request(baseUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    await GET(mockReq);
    expect(getAllListingsMock.mock.calls[0]).toEqual(["this is a query string", 150, 4.5, 199000000]);
  });
=======
import { NextResponse } from 'next/server';
import { POST } from './route';
import { GET } from './[listing_id]/route'

const { db } = jest.requireMock('@/lib/firebase/config');
const { getDoc, doc, collection, addDoc } = jest.requireMock('firebase/firestore');

// const getListingMock = jest.spyOn(getListing, 'default').mockImplementation((
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
        collection: jest.fn((db, table) => {
            return db[table];
        }),
        getDoc: jest.fn((ref) => ({
            data: () => {
                return ref;
            },
            exists: () => (ref !== undefined),
        })),
        addDoc: jest.fn((collection, data) => {
            collection['new_id'] = data
            
            return {
                id: 'new_id'
            }
        }),
        arrayUnion: jest.fn((val) => ([val])), // manually confirm correct arguments passed
        serverTimestamp: jest.fn(() => { return 'MOCK_TIME'; }),
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

describe('Test POST listing', () => {
    beforeEach(() => {
        // Reset mocks before each test to ensure clean state
        jest.clearAllMocks();
        // Reset mock database to clean slate
        db.users = {
            user1: {
                id: 'user1',
                first: 'Joe',
                last: 'Bruin',
                cum_seller_rating: 0,
                completed_sales: 0,
                last_reported: {
                    toMillis: () => (200000)
                },
                pfp: ''
            },
            user2: {
                id: 'user2',
                first: "Josephine",
                last: "Bruin",
                cum_buyer_rating: 0,
                completed_purchases: 0,
                last_reported: {
                    toMillis: () => (250000)
                },
                pfp: ''
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

    it('Succesfully POST listing, then GET', async () => {
        // Mock req object
        const mockReq = new Request('http://localhost', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                'user_id': 'user1',
                'title': 'newlist',
                'price': 100,
                'condition': 'new',
                'category': 'fish',
                'description': 'asdf',
                'image_paths': [],
            }),
        });
        const response: NextResponse = await POST(mockReq);

        const jsonResponse = await response.json();

        expect(doc.mock.calls[0][1]).toBe('users')
        expect(doc.mock.calls[0][2]).toBe('user1')
        expect(addDoc).toHaveBeenCalled();

        // check for correct output
        expect(jsonResponse.data).toEqual({ listing_id: 'new_id' });
        expect(jsonResponse.error).toBeNull();

        const mockReq2 = new Request('http://localhost', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        const mockParams = Promise.resolve(jsonResponse.data);
        const response2: NextResponse = await GET(mockReq, {params: mockParams});

        const jsonResponse2 = await response2.json();

        expect(jsonResponse2.data).toEqual({
            'updated': 'MOCK_TIME',
            'title': 'newlist',
            'price': 100,
            'condition': 'new',
            'category': 'fish',
            'description': 'asdf',
            'owner': 'user1',
            'owner_name': 'Joe Bruin',
            'owner_pfp': '',
            'seller_rating': 0,
            'selected_buyer': '',
            'potential_buyers': [],
            'image_paths': [], 
        })
        expect(jsonResponse2.error).toBeNull();
    });

    it('POST with invalid user_id', async () => {
        // Mock req object
        const mockReq = new Request('http://localhost', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                'user_id': 'user_invalid',
                'title': 'newlist',
                'price': 100,
                'condition': 'new',
                'category': 'fish',
                'description': 'asdf',
                'image_paths': [],
            }),
        });
        const response: NextResponse = await POST(mockReq);

        const jsonResponse = await response.json();

        expect(doc.mock.calls[0][1]).toBe('users')
        expect(doc.mock.calls[0][2]).toBe('user_invalid')
        expect(addDoc).not.toHaveBeenCalled();

        // check for correct output
        expect(jsonResponse.data).toBeNull;
        expect(jsonResponse.error).not.toBeNull();
    });

    it('POST with missing field', async () => {
        // Mock req object
        const mockReq = new Request('http://localhost', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                'user_id': 'user1',
                'title': 'newlist',
                'condition': 'new',
                'category': 'fish',
                'description': 'asdf',
                'image_paths': [],
            }),
        });
        const response: NextResponse = await POST(mockReq);

        const jsonResponse = await response.json();

        expect(doc).not.toHaveBeenCalled();
        expect(addDoc).not.toHaveBeenCalled();

        // check for correct output
        expect(jsonResponse.data).toBeNull;
        expect(jsonResponse.error).not.toBeNull();
    });

    it('POST with extra invalid field', async () => {
        // Mock req object
        const mockReq = new Request('http://localhost', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                'user_id': 'user1',
                'price': 100,
                'invalid_field': 5,
                'title': 'newlist',
                'condition': 'new',
                'category': 'fish',
                'description': 'asdf',
                'image_paths': [],
            }),
        });
        const response: NextResponse = await POST(mockReq);

        const jsonResponse = await response.json();

        expect(doc).not.toHaveBeenCalled();
        expect(addDoc).not.toHaveBeenCalled();

        // check for correct output
        expect(jsonResponse.data).toBeNull;
        expect(jsonResponse.error).not.toBeNull();
    });
>>>>>>> 45f20bd (fix up POST listing and add unit tests)
});
