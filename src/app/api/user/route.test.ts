import { NextResponse } from "next/server";
import { POST } from "./route";

const { db } = jest.requireMock("@/lib/firebase/config");
const { setDoc } = jest.requireMock("firebase/firestore");
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
  setDoc: jest.fn((ref, data) => {
    Object.assign(ref, data)
    db[ref.table][ref.id] = ref;
  }),
}));
jest.mock("@/lib/util", () => ({
  getUidFromAuthorizationHeader: jest.fn((authorizationHeader) => {
    return authorizationHeader.split("Bearer ")[1];
  })
}));

describe("User API", () => {
  beforeEach(() => {
    // Reset mocks before each test to ensure clean state
    jest.clearAllMocks();
    db.users = {};
  });
  it("should correctly handle POST request", async () => {
    // mock req object
    const mockReq = new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({
        "user_id": "test_user_id",
        "first": "test_first",
        "last": "test_last",
        "email_address": "test@g.ucla.edu",
      }),
      headers: { Authorization: "Bearer test_user_id"},
    });

    const response: NextResponse = await POST(mockReq);
    const { data, error } = await response.json();

    expect(error).toBe(null);
    expect(data.user_id).toEqual("test_user_id");
    expect(db["users"]["test_user_id"]).toMatchObject({
      "first": "test_first",
      "last": "test_last",
      "email_address": "test@g.ucla.edu",
    });
  });
  it("should correctly handle POST request with missing fields", async () => {
    // mock req object
    const mockReq = new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({
        "user_id": "test_user_id",
        "last": "test_last",
      }),
      headers: { Authorization: "Bearer test_user_id"},
    });

    const response: NextResponse = await POST(mockReq);
    const { error } = await response.json();

    expect(getUidFromAuthorizationHeader).toHaveBeenCalled();
    expect(error).toBe("missing required fields");
  });
  it("should correctly handle POST request with when user already exists", async () => {
    db.users = {
      test_user_id: {
        id: "test_user_id", // backwards reference to mock setDoc
        table: "users", // backwards reference to mock setDoc
      },
    }

    // mock req object
    const mockReq = new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({
        "user_id": "test_user_id",
        "first": "test_first",
        "last": "test_last",
        "email_address": "test@g.ucla.edu",
      }),
      headers: { Authorization: "Bearer test_user_id"},
    });

    const response: NextResponse = await POST(mockReq);
    const { data, error } = await response.json();

    expect(error).toBe(null);
    expect(data.user_id).toEqual("test_user_id");
    expect(setDoc).not.toHaveBeenCalled();
    expect(getUidFromAuthorizationHeader).toHaveBeenCalled();
  });
});
