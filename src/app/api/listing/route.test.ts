import { GET } from "./route";
import * as getAllListings from "@/lib/firebase/firestore/listing/getAllListings";

const getAllListingsMock = jest.spyOn(getAllListings, "default").mockImplementation();

describe('Test GET all listings API endpoint', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('request with no query params', async () => {
    const mockReq = new Request('http://localhost', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    await GET(mockReq);
    expect(getAllListingsMock.mock.calls[0]).toEqual([undefined, NaN, NaN, NaN]);
  });

  it('request with query params', async () => {
    const searchParams: Record<string, any> = new URLSearchParams();
    searchParams.append("query", "this is a query string");
    searchParams.append("limit", 150);
    searchParams.append("last_rating", 4.5);
    searchParams.append("last_updated", 199000000);
    const baseUrl = new URL('http://localhost');
    baseUrl.search = searchParams.toString();
    const mockReq = new Request(baseUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    await GET(mockReq);
    expect(getAllListingsMock.mock.calls[0]).toEqual(["this is a query string", 150, 4.5, 199000000]);
  });
});
