import { NextResponse } from "next/server";
import { GET, PATCH, DELETE } from "./route";

const { db } = jest.requireMock("@/lib/firebase/config");
const { getUidFromAuthorizationHeader } = jest.requireMock("@/lib/util");

jest.mock("@/lib/firebase/config", () => ({
  db: {},
}));
jest.mock("firebase/firestore", () => ({
  ...jest.requireActual("firebase/firestore"),
  doc: jest.fn((db, table, id) => {
    if (!db[table][id]) {
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
  updateDoc: jest.fn((ref, data) => Object.assign(ref, data)),
  deleteDoc: jest.fn((ref) => delete db[ref.table][ref.id]),
}));
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

const warn = jest.spyOn(console, "warn").mockImplementation(() => {});

describe("User API", () => {
  beforeEach(() => {
    // Reset mocks before each test to ensure clean state
    jest.clearAllMocks();
    db.users = {
      test_user_id_1: {
        first: "test_first_1",
        active_listings: ["test_listing_id_1", "test_listing_id_2"],
        interested_listings: ["test_listing_id_3", "test_listing_id_4"],
        id: "test_user_id_1", // backwards reference to mock deleteDoc
        table: "users", // backwards reference to mock deleteDoc
      },
      test_user_id_2: {
        first: "test_first_2",
        active_listings: ["test_listing_id_3", "test_listing_id_4"],
        interested_listing: [],
        id: "test_user_id_2", // backwards reference to mock deleteDoc
        table: "users", // backwards reference to mock deleteDoc
      },
    };
    db.listings = {
      test_listing_id_1: {
        title: "test_title_1",
        owner: "test_user_id_1",
        selected_buyer: "test_user_id_1",
        potential_buyers: ["test_user_id_2"],
        image_paths: [],
        id: "test_listing_id_1",
        table: "listings",
      },
      test_listing_id_2: {
        title: "test_title_2",
        owner: "test_user_id_1",
        selected_buyer: "",
        potential_buyers: [],
        image_paths: [],
        id: "test_listing_id_2",
        table: "listings",
      },
      test_listing_id_3: {
        title: "test_title_3",
        owner: "test_user_id_2",
        selected_buyer: "test_user_id_buyer",
        potential_buyers: ["test_user_id_1"],
        image_paths: [],
        id: "test_listing_id_3",
        table: "listings",
      },
      test_listing_id_4: {
        title: "test_title_4",
        owner: "test_user_id_2",
        selected_buyer: "test_user_id_1",
        potential_buyers: ["test_user_id_1"],
        id: "test_listing_id_4",
        image_paths: [],
        table: "listings",
      }
    }
  });
  it("should correctly handle GET request", async () => {
    // mock req object
    const mockReq = new Request("http://localhost", {
      method: "GET",
      headers: { Authorization: "Bearer uid:current_user",},
    });
    // mock params
    const user_id = "test_user_id_1";
    const mockParams = Promise.resolve({ user_id: user_id });

    const response: NextResponse = await GET(mockReq, { params: mockParams });
    const { data, error } = await response.json();

    expect(error).toBe(null);
    expect(data.id).toEqual(user_id);
    expect(getUidFromAuthorizationHeader).toHaveBeenCalled();
  });
  it("should correctly handle GET request with invalid user", async () => {
    // mock req object
    const mockReq = new Request("http://localhost/", {
      method: "GET",
      headers: { Authorization: "Bearer uid:current_user",},
    });
    // mock params
    const user_id = "fake_user_id";
    const mockParams = Promise.resolve({ user_id: user_id });

    const response: NextResponse = await GET(mockReq, { params: mockParams });
    const { error } = await response.json();

    expect(error).toEqual("user does not exist");
    expect(getUidFromAuthorizationHeader).toHaveBeenCalled();
  });
  it("should correctly handle GET request with improper token", async () => {
    // mock params
    const user_id = "fake_user_id";
    const mockParams = Promise.resolve({ user_id: user_id });

    // mock req object without token
    const mockReq1 = new Request("http://localhost/", {
      method: "GET",
    });

    const response1: NextResponse = await GET(mockReq1, { params: mockParams });
    const { error: error1 } = await response1.json();

    expect(error1).toEqual("Unauthorized: Missing token");

    // mock req objects with invalid formats
    const mockReq2 = new Request("http://localhost/", {
      method: "GET",
      headers: { Authorization: "uid:current_user",},
    });

    const response2: NextResponse = await GET(mockReq2, { params: mockParams });
    const { error: error2 } = await response2.json();

    expect(error2).toEqual("Unauthorized: Invalid token format");

    const mockReq3 = new Request("http://localhost/", {
      method: "GET",
      headers: { Authorization: "Bearer current_user",},
    });

    const response3: NextResponse = await GET(mockReq3, { params: mockParams });
    const { error: error3 } = await response3.json();

    expect(error3).toEqual("Unauthorized: Invalid token format");

    expect(getUidFromAuthorizationHeader).toHaveBeenCalledTimes(3);
  });
  it("should correctly handle PATCH request", async () => {
    // mock req object
    const mockReq = new Request("http://localhost", {
      method: "PATCH",
      body: JSON.stringify({
        "first": "test_first_2",
        "last": "test_last",
      }),
      headers: { Authorization: "Bearer uid:test_user_id_1",},
    });
    // mock params
    const user_id = "test_user_id_1";
    const mockParams = Promise.resolve({ user_id: user_id });

    const response: NextResponse = await PATCH(mockReq, { params: mockParams });
    const { data, error } = await response.json();

    expect(error).toBe(null);
    expect(data.first).toEqual("test_first_2");
    expect(data.last).toEqual("test_last");
    expect(data.id).toEqual(user_id);
    expect(getUidFromAuthorizationHeader).toHaveBeenCalled();
  });
  it("should correctly handle PATCH request with invalid field", async () => {
    // mock req object
    const mockReq = new Request("http://localhost", {
      method: "PATCH",
      body: JSON.stringify({
        "test": "test",
      }),
      headers: { Authorization: "Bearer uid:test_user_id_1",},
    });
    // mock params
    const user_id = "test_user_id_1";
    const mockParams = Promise.resolve({ user_id: user_id });

    const response: NextResponse = await PATCH(mockReq, { params: mockParams });
    const { error } = await response.json();

    expect(error).toBe("invalid user field");
    expect(getUidFromAuthorizationHeader).toHaveBeenCalled();
  });
  it("should correctly handle PATCH request with improper token", async () => {
    // mock params
    const user_id = "test_user_id_1";
    const mockParams = Promise.resolve({ user_id: user_id });

    // mock req object without token
    const mockReq1 = new Request("http://localhost", {
      method: "PATCH",
      body: JSON.stringify({
      }),
    });

    const response1: NextResponse = await PATCH(mockReq1, { params: mockParams });
    const { error: error1 } = await response1.json();

    expect(error1).toBe("Unauthorized: Missing token");

    // mock req objects with invalid tokens
    const mockReq2 = new Request("http://localhost", {
      method: "PATCH",
      body: JSON.stringify({
      }),
      headers: { Authorization: "uid:test_user_id_1",},
    });

    const response2: NextResponse = await PATCH(mockReq2, { params: mockParams });
    const { error: error2 } = await response2.json();

    expect(error2).toBe("Unauthorized: Invalid token format");

    const mockReq3 = new Request("http://localhost", {
      method: "PATCH",
      body: JSON.stringify({
      }),
      headers: { Authorization: "uid:test_user_id_1",},
    });

    const response3: NextResponse = await PATCH(mockReq3, { params: mockParams });
    const { error: error3 } = await response3.json();

    expect(error3).toBe("Unauthorized: Invalid token format");

    // mock req object with mismatched token and user_id
    const mockReq4 = new Request("http://localhost", {
      method: "PATCH",
      body: JSON.stringify({
      }),
      headers: { Authorization: "Bearer uid:different_id",},
    });

    const response4: NextResponse = await PATCH(mockReq4, { params: mockParams });
    const { error: error4 } = await response4.json();

    expect(error4).toBe("Provided user_id must match authenticated user");
    expect(getUidFromAuthorizationHeader).toHaveBeenCalledTimes(4);
  });
  it("should correctly handle PATCH request with invalid user", async () => {
    // mock req object
    const mockReq = new Request("http://localhost", {
      method: "PATCH",
      body: JSON.stringify({}),
      headers: { Authorization: "Bearer uid:fake_user_id",},
    });
    // mock params
    const user_id = "fake_user_id";
    const mockParams = Promise.resolve({ user_id: user_id });

    const response: NextResponse = await PATCH(mockReq, { params: mockParams });
    const { error } = await response.json();

    expect(error).toBe("user does not exist");
    expect(getUidFromAuthorizationHeader).toHaveBeenCalled();
  });
  it("should correctly handle DELETE request", async () => {
    // mock req object
    const mockReq = new Request("http://localhost", {
      method: "DELETE",
      headers: { Authorization: "Bearer uid:test_user_id_1",},
    });
    // mock params
    const user_id = "test_user_id_1";
    const mockParams = Promise.resolve({ user_id: user_id });

    const response: NextResponse = await DELETE(mockReq, { params: mockParams });
    const { data, error } = await response.json();

    expect(error).toBe(null);
    expect(data.user_id).toEqual(user_id);
    expect(db["users"][user_id]).toBe(undefined);
    expect(db["listings"]["test_listing_id_1"]).toBe(undefined);
    expect(db["listings"]["test_listing_id_2"]).toBe(undefined);
    expect(db["listings"]["test_listing_id_3"].potential_buyers).not.toContain(user_id);
    expect(db["listings"]["test_listing_id_3"].selected_buyer).toEqual("test_user_id_buyer");
    expect(db["listings"]["test_listing_id_4"].potential_buyers).not.toContain(user_id);
    expect(db["listings"]["test_listing_id_4"].selected_buyer).toEqual("");
  });
  it("should correctly handle DELETE request with invalid user", async () => {
    // mock req object
    const mockReq = new Request("http://localhost", {
      method: "DELETE",
      headers: { Authorization: "Bearer uid:fake_user_id",},
    });
    // mock params
    const user_id = "fake_user_id";
    const mockParams = Promise.resolve({ user_id: user_id });

    const response: NextResponse = await DELETE(mockReq, { params: mockParams });
    const { error } = await response.json();

    expect(error).toBe("user does not exist");
    expect(getUidFromAuthorizationHeader).toHaveBeenCalled();
  });
  it("should correctly handle DELETE request with invalid listings", async () => {
    db.users.test_user_id_1.active_listings.push("fake_listing_id");
    db.users.test_user_id_1.interested_listings.push("fake_listing_id");

    // mock req object
    const mockReq = new Request("http://localhost", {
      method: "DELETE",
      headers: { Authorization: "Bearer uid:test_user_id_1",},
    });
    // mock params
    const user_id = "test_user_id_1";
    const mockParams = Promise.resolve({ user_id: user_id });

    const response: NextResponse = await DELETE(mockReq, { params: mockParams });
    const { data, error } = await response.json();

    expect(error).toBe(null);
    expect(data.user_id).toEqual(user_id);
    expect(db["users"][user_id]).toBe(undefined);
    expect(warn).toHaveBeenCalledWith("listing fake_listing_id not found when deleting user test_user_id_1 from interested listings");
    expect(warn).toHaveBeenCalledWith("Listing not found when deleting listing fake_listing_id from active listings of user test_user_id_1");
    expect(getUidFromAuthorizationHeader).toHaveBeenCalled();
  });
});
