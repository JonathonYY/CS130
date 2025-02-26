import { NextResponse } from "next/server";
import { GET, PATCH, DELETE } from "./route";

const { db } = jest.requireMock("@/lib/firebase/config");

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
        id: "test_listing_id_1",
        table: "listings",
      },
      test_listing_id_2: {
        title: "test_title_2",
        owner: "test_user_id_1",
        selected_buyer: "",
        potential_buyers: [],
        id: "test_listing_id_2",
        table: "listings",
      },
      test_listing_id_3: {
        title: "test_title_3",
        owner: "test_user_id_2",
        selected_buyer: "test_user_id_buyer",
        potential_buyers: ["test_user_id_1"],
        id: "test_listing_id_3",
        table: "listings",
      },
      test_listing_id_4: {
        title: "test_title_4",
        owner: "test_user_id_2",
        selected_buyer: "test_user_id_1",
        potential_buyers: ["test_user_id_1"],
        id: "test_listing_id_4",
        table: "listings",
      }
    }
  });
  it("should correctly handle GET request", async () => {
    // mock req object
    const mockReq = new Request("http://localhost", {
      method: "GET",
    });
    // mock params
    const user_id = "test_user_id_1";
    const mockParams = Promise.resolve({ user_id: user_id });

    const response: NextResponse = await GET(mockReq, { params: mockParams });
    const { data, error } = await response.json();

    expect(error).toBe(null);
    expect(data.id).toEqual(user_id);
  });
  it("should correctly handle GET request with invalid user", async () => {
    // mock req object
    const mockReq = new Request("http://localhost/", {
      method: "GET",
    });
    // mock params
    const user_id = "fake_user_id";
    const mockParams = Promise.resolve({ user_id: user_id });

    const response: NextResponse = await GET(mockReq, { params: mockParams });
    const { data, error } = await response.json();

    expect(error).toEqual("user does not exist");
  });
  it("should correctly handle PATCH request", async () => {
    // mock req object
    const mockReq = new Request("http://localhost", {
      method: "PATCH",
      body: JSON.stringify({
        "first": "test_first_2",
        "last": "test_last",
      }),
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
  });
  it("should correctly handle PATCH request with invalid field", async () => {
    // mock req object
    const mockReq = new Request("http://localhost", {
      method: "PATCH",
      body: JSON.stringify({
        "test": "test",
      }),
    });
    // mock params
    const user_id = "test_user_id_1";
    const mockParams = Promise.resolve({ user_id: user_id });

    const response: NextResponse = await PATCH(mockReq, { params: mockParams });
    const { data, error } = await response.json();

    expect(error).toBe("invalid user field");
  });
  it("should correctly handle PATCH request with invalid user", async () => {
    // mock req object
    const mockReq = new Request("http://localhost", {
      method: "PATCH",
      body: JSON.stringify({}),
    });
    // mock params
    const user_id = "fake_user_id";
    const mockParams = Promise.resolve({ user_id: user_id });

    const response: NextResponse = await PATCH(mockReq, { params: mockParams });
    const { data, error } = await response.json();

    expect(error).toBe("user does not exist");
  });
  it("should correctly handle DELETE request", async () => {
    // mock req object
    const mockReq = new Request("http://localhost", {
      method: "DELETE",
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
    });
    // mock params
    const user_id = "fake_user_id";
    const mockParams = Promise.resolve({ user_id: user_id });

    const response: NextResponse = await DELETE(mockReq, { params: mockParams });
    const { data, error } = await response.json();

    expect(error).toBe("user does not exist");
  });
  it("should correctly handle DELETE request with invalid listings", async () => {
    db.users.test_user_id_1.active_listings.push("fake_listing_id");
    db.users.test_user_id_1.interested_listings.push("fake_listing_id");

    // mock req object
    const mockReq = new Request("http://localhost", {
      method: "DELETE",
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
  });
});
