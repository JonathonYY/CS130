import { POST } from "./route";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid"; // Import uuidv4

const { ref, uploadBytes, getDownloadURL } =
  jest.requireMock("firebase/storage");

jest.mock("@/lib/firebase/config", () => ({
  storage: "STORAGE",
}));

jest.mock("firebase/storage", () => {
  const originalModule = jest.requireActual("firebase/storage");
  return {
    ...originalModule,
    ref: jest.fn((storage, path) => path),
    uploadBytes: jest.fn(),
    getDownloadURL: jest.fn((ref) => ref),
  };
});

jest.mock("uuid", () => ({
  v4: jest.fn(() => "mocked-uuid"), // Mock uuidv4
}));

describe("/api/image", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (uuidv4 as jest.Mock).mockClear(); // Clear uuid mock
  });

  it("should return an error if no image is provided", async () => {
    const mockRequest = {
      formData: () => Promise.resolve(new FormData()),
    } as unknown as NextRequest;

    const response = await POST(mockRequest);

    expect(response).toBeInstanceOf(NextResponse);

    const { data, error } = await response.json();
    expect(data).toBe(null);
    expect(error).toBe("No image provided");
  });

  it("should return url to uploaded image with uuid prefix", async () => {
    const mockRequest = {
      formData: () =>
        Promise.resolve({
          get: () => {
            return {
              name: "test_image.png",
              arrayBuffer: () => {
                return "test_image_buffer.png";
              },
            };
          },
        }),
    } as unknown as NextRequest;

    const response = await POST(mockRequest);

    expect(response).toBeInstanceOf(NextResponse);

    const { data, error } = await response.json();
    expect(data).toBe("images/mocked-uuid-test_image.png");
    expect(error).toBe(null);

    expect(uuidv4).toHaveBeenCalled(); // Check uuidv4 was called

    expect(ref.mock.calls[0]).toEqual([
      "STORAGE",
      "images/mocked-uuid-test_image.png",
    ]);
    const exp_buffer = Buffer.from("test_image_buffer.png");
    expect(uploadBytes.mock.calls[0]).toEqual([
      "images/mocked-uuid-test_image.png",
      exp_buffer,
    ]);
    expect(getDownloadURL.mock.calls[0]).toEqual([
      "images/mocked-uuid-test_image.png",
    ]);
  });
});
