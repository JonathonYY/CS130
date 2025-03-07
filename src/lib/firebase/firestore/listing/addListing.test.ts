import addListing from "./addListing";

const { db } = jest.requireMock("@/lib/firebase/config");
const { doc, getDoc, addDoc } = jest.requireMock("firebase/firestore");

jest.mock('@/lib/firebase/config', () => ({
    db: {}
}))

jest.mock('firebase/firestore', () => {
    return {
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
        arrayUnion: jest.fn((val) => ([val])),
        updateDoc: jest.fn((ref, params) => { Object.assign(ref, params) }),
        serverTimestamp: jest.fn(() => { return 'MOCK_TIME'; }),
    };
});

describe('Test addListing', () => {
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
                },
                active_listings: []
            },
            user2: {
                id: 'user2',
                cum_buyer_rating: 0,
                completed_purchases: 0,
                cum_seller_rating: 9,
                completed_sales: 3,
                last_reported: {
                    toMillis: () => (250000)
                },
                active_listings: []
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

    it('Succesfully call addListing', async () => {
        expect(db['listings']['new_id']).toBe(undefined);
        const result = await addListing({
            'user_id': 'user1',
            'title': 'newlist',
            'price': 100,
            'condition': 'new',
            'category': 'fish',
            'description': 'asdf',
            'image_paths': [],
        });

        expect(doc.mock.calls[0][1]).toBe('users')
        expect(doc.mock.calls[0][2]).toBe('user1')
        expect(getDoc).toHaveBeenCalled();
        expect(addDoc).toHaveBeenCalled();

        // check for correct output
        expect(result).toEqual({ listing_id: 'new_id' });
        expect(db['listings']['new_id']).not.toBe(undefined);

        // check active listings in users is updated
        expect(db['users']['user1']['active_listings']).toEqual(['new_id']);
    });

    it('addListing with invalid user_id', async () => {
        expect(async () => {
            await addListing({
                'user_id': 'user_invalid',
                'title': 'newlist',
                'price': 100,
                'condition': 'new',
                'category': 'fish',
                'description': 'asdf',
                'image_paths': [],
            })
        }).rejects.toThrow("No user exists for given id");
    });

    it('addListing with seller having nonzero prior sells', async () => {
        expect(db['listings']['new_id']).toBe(undefined);
        await addListing({
            'user_id': 'user2',
            'title': 'newlist',
            'price': 100,
            'condition': 'new',
            'category': 'fish',
            'description': 'asdf',
            'image_paths': [],
        });

        expect(db['listings']['new_id']['seller_rating']).toBeCloseTo(3);
    });

    it('addListing with seller having zero prior sells', async () => {
        expect(db['listings']['new_id']).toBe(undefined);
        await addListing({
            'user_id': 'user1',
            'title': 'newlist',
            'price': 100,
            'condition': 'new',
            'category': 'fish',
            'description': 'asdf',
            'image_paths': [],
        });

        expect(db['listings']['new_id']['seller_rating']).toBeCloseTo(3.5);
    });

});
