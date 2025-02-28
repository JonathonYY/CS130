import getListing from "./getListing";

const { db } = jest.requireMock("@/lib/firebase/config");
const { doc, getDoc } = jest.requireMock("firebase/firestore");

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
    };
});

describe('Test getListing', () => {
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

    it('Succesfully call getListing', async () => {
        const result = await getListing('listing1');

        expect(doc.mock.calls[0][1]).toBe('listings')
        expect(doc.mock.calls[0][2]).toBe('listing1')
        expect(getDoc).toHaveBeenCalled();

        // check for correct output
        expect(result).toEqual({
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
    });

    it('getListing with invalid doc_id', async () => {
        expect(async () => {
            await getListing('blah')
        }).rejects.toThrow('No listing exists for given id');
    });
});
