import getAllListings from "./getAllListings";

const { collection, orderBy, where, limit, startAt, Timestamp } = jest.requireMock("firebase/firestore");

jest.mock('@/lib/firebase/config', () => ({
  db: {},
}))

jest.mock('firebase/firestore', () => {
  const originalModule = jest.requireActual('firebase/firestore')
  return {
    ...originalModule,
    collection: jest.fn(),
    getDocs: jest.fn(() => {
      return {docs: []};
    }),
    query: jest.fn(),
    orderBy: jest.fn(),
    where: jest.fn(),
    limit: jest.fn(),
    startAt: jest.fn(),
    Timestamp: {
      ...originalModule.Timestamp,
      fromMillis: jest.fn((num) => {
        return num;
      }),
      now: jest.fn(() => {
        return 1000;
      })
    }
  };
});

describe('Test getAllListings function', () => {
  // Note that this function relies heavily on Firebase
  // Here we test expected calls occur, but functionality tests
  // will require integration testing

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('No search request, no pagination arguments', async () => {
    await getAllListings();

    // every successful call begins with getting collection
    expect(collection.mock.calls[0][1]).toBe('listings');

    // check ordering
    expect(orderBy).toHaveBeenCalledTimes(2);
    expect(orderBy.mock.calls[0]).toEqual(['seller_rating', 'desc']);
    expect(orderBy.mock.calls[1]).toEqual(['updated', 'desc']);

    // no pagination arguments: use default for prev_rating, prev_ts, q_limit
    expect(Timestamp.fromMillis).not.toHaveBeenCalled();
    expect(Timestamp.now).toHaveBeenCalled();
    expect(startAt.mock.calls[0]).toEqual([5.1, 1000]);
    expect(limit.mock.calls[0]).toEqual([100]);

    // no search request: where only called once
    expect(where).toHaveBeenCalledTimes(1);
    expect(where.mock.calls[0]).toEqual(['selected_buyer', '==', '']);
  });

  it('No search request, pagination arguments', async () => {
    await getAllListings(undefined, 10, 3, 50);

    // every successful call begins with getting collection
    expect(collection.mock.calls[0][1]).toBe('listings');

    // check ordering
    expect(orderBy).toHaveBeenCalledTimes(2);
    expect(orderBy.mock.calls[0]).toEqual(['seller_rating', 'desc']);
    expect(orderBy.mock.calls[1]).toEqual(['updated', 'desc']);

    // use passed-in vals for prev_rating, prev_ts, q_limit
    expect(Timestamp.fromMillis).toHaveBeenCalled();
    expect(Timestamp.now).not.toHaveBeenCalled();
    expect(startAt.mock.calls[0]).toEqual([3, 50]);
    expect(limit.mock.calls[0]).toEqual([10]);

    // no search request: where only called once
    expect(where).toHaveBeenCalledTimes(1);
    expect(where.mock.calls[0]).toEqual(['selected_buyer', '==', '']);
  });

  it('search request: title', async () => {
    await getAllListings('listing_title', 3, 2, 1);

    // every successful call begins with getting collection
    expect(collection.mock.calls[0][1]).toBe('listings');

    // check ordering
    expect(orderBy).toHaveBeenCalledTimes(2);
    expect(orderBy.mock.calls[0]).toEqual(['seller_rating', 'desc']);
    expect(orderBy.mock.calls[1]).toEqual(['updated', 'desc']);

    // pagination arguments while querying
    expect(Timestamp.fromMillis).toHaveBeenCalled();
    expect(Timestamp.now).not.toHaveBeenCalled();
    expect(startAt.mock.calls[0]).toEqual([2, 1]);
    expect(limit.mock.calls[0]).toEqual([3]);

    // search request: check where calls with default values
    expect(where).toHaveBeenCalledTimes(10);
    expect(where.mock.calls[0]).toEqual(['selected_buyer', '==', '']);
    expect(where.mock.calls[1]).toEqual(['title', '>=', 'LISTING_TITLE']);
    expect(where.mock.calls[2]).toEqual(['title', '<=', 'LISTING_TITLE\uf8ff']);
    expect(where.mock.calls[3]).toEqual(['category', '>=', '']);
    expect(where.mock.calls[4]).toEqual(['category', '<=', '\uf8ff']);
    expect(where.mock.calls[5]).toEqual(['condition', '>=', '']);
    expect(where.mock.calls[6]).toEqual(['condition', '<=', '\uf8ff']);
    expect(where.mock.calls[7]).toEqual(['owner_name', '>=', '']);
    expect(where.mock.calls[8]).toEqual(['owner_name', '<=', '\uf8ff']);
    expect(where.mock.calls[9]).toEqual(['price', '>=', 0]);
  });

  it('search request: other fields', async () => {
    await getAllListings('price<:100 condition:new listing_title seller:firstname category:food');

    // search request: check where calls with default values
    expect(where).toHaveBeenCalledTimes(10);
    expect(where.mock.calls[0]).toEqual(['selected_buyer', '==', '']);
    expect(where.mock.calls[1]).toEqual(['title', '>=', 'LISTING_TITLE']);
    expect(where.mock.calls[2]).toEqual(['title', '<=', 'LISTING_TITLE\uf8ff']);
    expect(where.mock.calls[3]).toEqual(['category', '>=', 'FOOD']);
    expect(where.mock.calls[4]).toEqual(['category', '<=', 'FOOD\uf8ff']);
    expect(where.mock.calls[5]).toEqual(['condition', '>=', 'NEW']);
    expect(where.mock.calls[6]).toEqual(['condition', '<=', 'NEW\uf8ff']);
    expect(where.mock.calls[7]).toEqual(['owner_name', '>=', 'FIRSTNAME']);
    expect(where.mock.calls[8]).toEqual(['owner_name', '<=', 'FIRSTNAME\uf8ff']);
    expect(where.mock.calls[9]).toEqual(['price', '<', 100]);
  });

  it('search request: quoted name', async () => {
    await getAllListings('price<=:135 condition:new seller:"firstname middlename lastname " category:food multi word listing title');

    // search request: check where calls with default values
    expect(where).toHaveBeenCalledTimes(10);
    expect(where.mock.calls[0]).toEqual(['selected_buyer', '==', '']);
    expect(where.mock.calls[1]).toEqual(['title', '>=', 'MULTI WORD LISTING TITLE']);
    expect(where.mock.calls[2]).toEqual(['title', '<=', 'MULTI WORD LISTING TITLE\uf8ff']);
    expect(where.mock.calls[3]).toEqual(['category', '>=', 'FOOD']);
    expect(where.mock.calls[4]).toEqual(['category', '<=', 'FOOD\uf8ff']);
    expect(where.mock.calls[5]).toEqual(['condition', '>=', 'NEW']);
    expect(where.mock.calls[6]).toEqual(['condition', '<=', 'NEW\uf8ff']);
    expect(where.mock.calls[7]).toEqual(['owner_name', '>=', 'FIRSTNAME MIDDLENAME LASTNAME']);
    expect(where.mock.calls[8]).toEqual(['owner_name', '<=', 'FIRSTNAME MIDDLENAME LASTNAME\uf8ff']);
    expect(where.mock.calls[9]).toEqual(['price', '<=', 135]);
  });
});
