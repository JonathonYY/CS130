import { NextResponse } from "next/server";
import { GET, PATCH, DELETE } from "./route";

const { db } = jest.requireMock("@/lib/firebase/config");

jest.mock("@/lib/firebase/config", () => ({
  db: {
    users: {
      test_user_id: {
        first: "test_first",
        id: "test_user_id", // backwards reference to mock deleteDoc
        table: "users", // backwards reference to mock deleteDoc
      },
    },
    // TODO: mock listing table to test DELETE user API cleanup
  }
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

describe("User API", () => {
  beforeEach(() => {
    // Reset mocks before each test to ensure clean state
    jest.clearAllMocks();
  });
  it("should correctly handle GET request", async () => {
    // mock req object
    const mockReq = new Request("http://localhost", {
      method: "GET",
    });
    // mock params
    const user_id = "test_user_id";
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
    const user_id = "fake_test_id";
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
    const user_id = "test_user_id";
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
    const user_id = "test_user_id";
    const mockParams = Promise.resolve({ user_id: user_id });

    const response: NextResponse = await PATCH(mockReq, { params: mockParams });
    const { data, error } = await response.json();

    expect(error).toBe("invalid user field");
  });
  it("should correctly handle DELETE request", async () => {
    // mock req object
    const mockReq = new Request("http://localhost", {
      method: "DELETE",
    });
    // mock params
    const user_id = "test_user_id";
    const mockParams = Promise.resolve({ user_id: user_id });

    const response: NextResponse = await DELETE(mockReq, { params: mockParams });
    const { data, error } = await response.json();

    expect(error).toBe(null);
    expect(data.user_id).toEqual("test_user_id");
    expect(db["users"][user_id]).toBe(undefined);
    // TODO: DELETE user should remove user_id from potential_buyers in all interested_listings and remove listings in active_listings
  });
});
