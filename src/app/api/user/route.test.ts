import { NextResponse } from "next/server";
import { POST } from "./route";

const { db } = jest.requireMock("@/lib/firebase/config");

jest.mock("@/lib/firebase/config", () => ({
  db: {
    users: {},
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
  setDoc: jest.fn((ref, data) => {
    Object.assign(ref, data)
    db[ref.table][ref.id] = ref;
  }),
}));

describe("User API", () => {
  beforeEach(() => {
    // Reset mocks before each test to ensure clean state
    jest.clearAllMocks();
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
});
