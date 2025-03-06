import deleteListing from "./deleteListing";

const { db, storage } = jest.requireMock("@/lib/firebase/config");
const { getDoc, doc, updateDoc, arrayRemove, deleteDoc } = jest.requireMock("firebase/firestore");
const { ref, deleteObject } = jest.requireMock("firebase/storage");

jest.mock('@/lib/firebase/config', () => ({
  db: {},
  storage: {}
}))

jest.mock('firebase/firestore', () => {
  return {
    ...jest.requireActual('firebase/firestore'),
    doc: jest.fn((db, table, id) => {
      if (!db[table][id]) { // if doc doesn't exist, return ref anyway
        return {
          id: id,
          table: table,
        }
      }
      return db[table][id];
    }),
    getDoc: jest.fn((ref) => ({
      data: () => (db[ref.table][ref.id]),
      exists: () => (db[ref.table][ref.id] !== undefined),
    })),
    updateDoc: jest.fn((ref, params) => {Object.assign(ref, params)}),
    arrayRemove: jest.fn((vals) => ([vals])), // manually confirm correct arguments passed
    deleteDoc: jest.fn(jest.fn((ref) => delete db[ref.table][ref.id])),
  };
});

jest.mock('firebase/storage', () => {
  return {
    ...jest.requireActual('firebase/storage'),
    ref: jest.fn((storge, file_path: string) => {
      // we expect to only receive strings of the format
      // /images/file_name
      const parts = file_path.split('/');
      if (parts.length == 3) {
        return {
          dir: parts[1],
          file_name: parts[2]
        }
      } else {
        return {
          dir: 'images',
          file_name: 'missing_file'
        }
      }
    }),
    deleteObject: jest.fn((ref) => {
      if (!storage[ref.dir][ref.file_name]) {
        return new Promise(() => { throw new Error(); });
      } else {
        delete storage[ref.dir][ref.file_name];
        return new Promise(() => {});
      }
    })
  }
})

const warn = jest.spyOn(console, "warn").mockImplementation(() => {});

describe('Test deleteListing function', () => {
  beforeEach(() => {
    // Reset mocks before each test to ensure clean state
    jest.clearAllMocks();
    // Reset mock database to clean slate
    db.users = {
        user1: {
          id: 'user1', // back references for consistency with listings
          table: 'users', // back references for consistency with listings
          active_listings: ['listing1'],
          interested_listings: ['listing2']
        },
        user2: {
          id: 'user2', // back references for consistency with listings
          table: 'users', // back references for consistency with listings
          interested_listings: ['listing1', 'listing2']
        },
        user3: {
          id: 'user3', // back references for consistency with listings
          table: 'users', // back references for consistency with listings
          interested_listings: ['listing1']
        }
      };
    db.listings = {
        listing1: {
          id: 'listing1', // back reference to mock deleteDoc
          table: 'listings', // back reference to mock deleteDoc
          owner: 'user1',
          potential_buyers: ['user2', 'user3'],
          image_paths: [
            'https://firebasestorage.googleapis.com/v0/b/bucket.firebasestorage.app/o/images%2Fimage1?alt=media&token=token',
            'https://firebasestorage.googleapis.com/v0/b/bucket.firebasestorage.app/o/images%2Fimage2?alt=media&token=token'
          ]
        },
        listing2: {
          id: 'listing2', // back reference to mock deleteDoc
          table: 'listings', // back reference to mock deleteDoc
          owner: 'missing_owner',
          potential_buyers: ['missing_buyer1', 'missing_buyer2', 'user1', 'user2'],
          image_paths: [
            'https://firebasestorage.googleapis.com/v0/b/bucket.firebasestorage.app/o/images%2Fimage1?alt=media&token=token',
            'https://firebasestorage.googleapis.com/v0/b/bucket.firebasestorage.app/o/images%2Fbad_image?alt=media&token=token'
          ]
        }
      };
    // set mock images
    storage.images = {
      image1: 'img1',
      image2: 'img2'
    };
  });

  it('Invalid listing', async () => {
    // expect error when called with listing that doesn't exist
    expect(async () => {
      await deleteListing("invalid_listing", "user_id");
    }).rejects.toThrow("Listing not found");

    // confirm getDoc, doc have been called once, and other Firestore mocks are not called
    expect(getDoc).toHaveBeenCalledTimes(1);
    expect(doc).toHaveBeenCalledTimes(1);
    expect(updateDoc).not.toHaveBeenCalled();
    expect(arrayRemove).not.toHaveBeenCalled();
    expect(deleteDoc).not.toHaveBeenCalled();
  });

  it('Unauthorized user', async () => {
    // expect error when called with user that isn't owner
    expect(async () => {
      await deleteListing("listing1", "user_id");
    }).rejects.toThrow("Unauthorized user");

    // confirm getDoc, doc have been called once, and other Firestore mocks are not called
    expect(getDoc).toHaveBeenCalledTimes(1);
    expect(doc).toHaveBeenCalledTimes(1);
    expect(updateDoc).not.toHaveBeenCalled();
    expect(arrayRemove).not.toHaveBeenCalled();
    expect(deleteDoc).not.toHaveBeenCalled();
    expect(deleteObject).not.toHaveBeenCalled();
  });

  it('Listing deleted; invalid owner/potential_buyers', async () => {
    // confirm listing exists before delete
    expect(db["listings"]["listing2"]).toEqual({
      id: 'listing2',
      table: 'listings',
      owner: 'missing_owner',
      potential_buyers: ['missing_buyer1', 'missing_buyer2', 'user1', 'user2'],
      image_paths: [
        'https://firebasestorage.googleapis.com/v0/b/bucket.firebasestorage.app/o/images%2Fimage1?alt=media&token=token',
        'https://firebasestorage.googleapis.com/v0/b/bucket.firebasestorage.app/o/images%2Fbad_image?alt=media&token=token'
      ]
    });
    // confirm images exist before delete
    expect(storage["images"]).toEqual({ image1: 'img1', image2: 'img2' });

    const ret_id = await deleteListing("listing2", "missing_owner");
    expect(ret_id).toBe("listing2");

    // confirm listing is removed
    expect(db["listings"]["listing2"]).toBe(undefined);
    // confirm only image1 is removed
    expect(storage["images"]).toEqual({ image2: 'img2' });

    // confirm warning is given for missing_owner, missing_buyer1, missing_buyer2
    expect(warn).toHaveBeenCalledTimes(4);
    expect(warn.mock.calls[0][0]).toBe("owner missing_owner not found");
    expect(warn.mock.calls[1][0]).toBe("potential buyer missing_buyer1 not found");
    expect(warn.mock.calls[2][0]).toBe("potential buyer missing_buyer2 not found");
    expect(warn.mock.calls[3][0]).toBe("Error deleting /images/bad_image");

    // confirm listing is removed from valid buyers
    expect(arrayRemove).toHaveBeenCalledTimes(2);
    expect(arrayRemove.mock.calls[0][0]).toBe("listing2");
    expect(arrayRemove.mock.calls[1][0]).toBe("listing2");

    expect(updateDoc).toHaveBeenCalledTimes(2);
    expect(updateDoc.mock.calls[0][0].id).toBe('user1');
    expect(updateDoc.mock.calls[0][1]).toEqual({interested_listings: ['listing2']});
    expect(updateDoc.mock.calls[1][0].id).toBe('user2');
    expect(updateDoc.mock.calls[1][1]).toEqual({interested_listings: ['listing2']});

    expect(ref).toHaveBeenCalledTimes(2);
    expect(deleteObject).toHaveBeenCalledTimes(2);
    expect(deleteObject.mock.calls[0][0]).toEqual({dir: "images", file_name: "image1"});
    expect(deleteObject.mock.calls[1][0]).toEqual({dir: "images", file_name: "bad_image"});
  });

  it('Listing deleted; clean up listing from owner, potential_buyers', async () => {
    // confirm listing exists before delete
    expect(db["listings"]["listing1"]).toEqual({
      id: 'listing1',
      table: 'listings',
      owner: 'user1',
      potential_buyers: ['user2', 'user3'],
      image_paths: [
        'https://firebasestorage.googleapis.com/v0/b/bucket.firebasestorage.app/o/images%2Fimage1?alt=media&token=token',
        'https://firebasestorage.googleapis.com/v0/b/bucket.firebasestorage.app/o/images%2Fimage2?alt=media&token=token'
      ]
    });
    // confirm images exist before delete
    expect(storage["images"]).toEqual({
      image1: 'img1',
      image2: 'img2'
    });

    const ret_id = await deleteListing("listing1", "user1");
    expect(ret_id).toBe("listing1");

    // confirm listing is removed
    expect(db["listings"]["listing1"]).toBe(undefined);

    // confirm images removed
    expect(storage["images"]).toEqual({});

    // confirm no warnings
    expect(warn).not.toHaveBeenCalled();

    // confirm listing is removed from owner active_listings, buyer interested_listings
    expect(arrayRemove).toHaveBeenCalledTimes(3);
    expect(arrayRemove.mock.calls[0][0]).toBe("listing1");
    expect(arrayRemove.mock.calls[1][0]).toBe("listing1");
    expect(arrayRemove.mock.calls[2][0]).toBe("listing1");

    expect(updateDoc).toHaveBeenCalledTimes(3);
    expect(updateDoc.mock.calls[0][0].id).toBe('user1');
    expect(updateDoc.mock.calls[0][1]).toEqual({active_listings: ['listing1']});
    expect(updateDoc.mock.calls[1][0].id).toBe('user2');
    expect(updateDoc.mock.calls[1][1]).toEqual({interested_listings: ['listing1']});
    expect(updateDoc.mock.calls[2][0].id).toBe('user3');
    expect(updateDoc.mock.calls[2][1]).toEqual({interested_listings: ['listing1']});

    expect(ref).toHaveBeenCalledTimes(2);
    expect(deleteObject).toHaveBeenCalledTimes(2);
    expect(deleteObject.mock.calls[0][0]).toEqual({dir: "images", file_name: "image1"});
    expect(deleteObject.mock.calls[1][0]).toEqual({dir: "images", file_name: "image2"});
  });
});
