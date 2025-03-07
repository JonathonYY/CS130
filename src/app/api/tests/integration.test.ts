import { NextResponse } from "next/server";
import { POST as POST_user } from "../user/route";
import { GET as GET_user, PATCH as PATCH_user, DELETE as DELETE_user } from "../user/[user_id]/route";
import { POST as POST_listing } from "../listing/route";
import { GET as GET_listing, PATCH as PATCH_listing, DELETE as DELETE_listing } from "../listing/[listing_id]/route";
import { POST as POST_img } from "../image/route";
import { PATCH as PATCH_report } from "../listing/[listing_id]/report/route";
import { PATCH as PATCH_rate } from "../listing/[listing_id]/rate/route";
import { ref, getDownloadURL } from "firebase/storage";
import fs from "node:fs";

const { storage } = jest.requireMock("@/lib/firebase/config");

jest.mock("@/lib/firebase/config", () => ({
  ...jest.requireActual("@/lib/firebase/config.mock")
}));

async function clearFirestore() {
  const response = await fetch(
    `http://${process.env.NEXT_PUBLIC_FIREBASE_EMULATOR_HOST}/emulator/v1/projects/${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}/databases/(default)/documents`,
    {
      method: 'DELETE',
    }
  );
  if (response.status !== 200) {
    throw new Error('Trouble clearing Emulator: ' + (await response.text()));
  }
}

async function createUser(i: number) {
  const req = new Request("http://localhost", {
    method: "POST",
    body: JSON.stringify({
      'user_id': `test_user_id_${i}`,
      'first': `test_first_${i}`,
      'last': `test_last_${i}`,
      'email_address': `test_${i}@g.ucla.edu`,
    }),
  });
  const res: NextResponse = await POST_user(req);
  const { data, error } = await res.json();
  return { data, error }
}

async function createListing(i: number, user_id: string) {
  const req = new Request('http://localhost', {
    method: 'POST',
    body: JSON.stringify({
      'user_id': user_id,
      'title': `test_listing_${i}`,
      'price': 100 * i,
      'condition': 'test_cond',
      'category': 'test_cat',
      'description': 'test_desc',
      'image_paths': [],
    }),
  });
  const res: NextResponse = await POST_listing(req);
  const { data, error } = await res.json();
  return { data, error };
}

describe("Integration tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearFirestore();
  });
  it("should correctly handle User workflow", async () => {
    // create user
    var { data, error } = await createUser(1);
    expect(error).toBe(null);
    expect(data.user_id).toEqual("test_user_id_1");
    const user_id_1 = data.user_id;
    const user_param_1 = Promise.resolve({ user_id: user_id_1 });

    // check user is created
    const req1 = new Request("http://localhost", {
      method: "GET",
    });
    const res1: NextResponse = await GET_user(req1, { params: user_param_1 });
    var { data, error } = await res1.json();
    expect(error).toBe(null);
    expect(data).toEqual({
      first: 'test_first_1',
      last: 'test_last_1',
      email_address: 'test_1@g.ucla.edu',
      phone_number: '',
      active_listings: [],
      interested_listings: [],
      buyer_rating: 3.5,
      seller_rating: 3.5,
      pfp: '',
      id: user_id_1,
    });

    // patch user
    const req2 = new Request("http://localhost", {
      method: "PATCH",
      body: JSON.stringify({
        'first': 'test_first_patched',
        'last': 'test_last_patched',
        'pfp': 'pfp_patched',
        'phone_number': '123-456-7890'
      }),
    });
    const res2: NextResponse = await PATCH_user(req2, { params: user_param_1 });
    var { data, error } = await res2.json();
    expect(error).toBe(null);
    expect(data).toEqual({
      first: 'test_first_patched',
      last: 'test_last_patched',
      email_address: 'test_1@g.ucla.edu',
      phone_number: '123-456-7890',
      active_listings: [],
      interested_listings: [],
      buyer_rating: 3.5,
      seller_rating: 3.5,
      pfp: 'pfp_patched',
      id: user_id_1,
    });

    // check user is updated
    const req3 = new Request("http://localhost", {
      method: "GET",
    });
    const res3: NextResponse = await GET_user(req3, { params: user_param_1 });
    var { data, error } = await res3.json();
    expect(error).toBe(null);
    expect(data).toEqual({
      first: 'test_first_patched',
      last: 'test_last_patched',
      email_address: 'test_1@g.ucla.edu',
      phone_number: '123-456-7890',
      active_listings: [],
      interested_listings: [],
      buyer_rating: 3.5,
      seller_rating: 3.5,
      pfp: 'pfp_patched',
      id: user_id_1,
    });

    // delete user
    const req4 = new Request("http://localhost", {
      method: "DELETE",
    });
    const res4: NextResponse = await DELETE_user(req4, { params: user_param_1 });
    var { data, error } = await res4.json();
    expect(error).toBe(null);
    expect(data.user_id).toEqual(user_id_1);

    // check user is deleted
    const req5 = new Request("http://localhost", {
      method: "GET",
    });
    const res5: NextResponse = await GET_user(req5, { params: user_param_1 });
    var { data, error } = await res5.json();
    expect(error).toBe("user does not exist");
  });
  it("should correctly handle invalid User workflows", async () => {
    // create user
    var { data, error } = await createUser(2);
    expect(error).toBe(null);
    expect(data.user_id).toEqual("test_user_id_2");
    const user_id_1 = data.user_id;
    const user_param_1 = Promise.resolve({ user_id: user_id_1 });

    // get invalid user
    const fake_user_param = Promise.resolve({ user_id: "fake_user_id" });
    const req1 = new Request("http://localhost", {
      method: "GET",
    });
    const res1: NextResponse = await GET_user(req1, { params: fake_user_param });
    var { data, error } = await res1.json();
    expect(error).toBe("user does not exist");

    // patch invalid user
    const req2 = new Request("http://localhost", {
      method: "PATCH",
      body: JSON.stringify({
        'first': 'test_first_patched',
        'last': 'test_last_patched',
        'pfp': 'pfp_patched',
        'phone_number': '123-456-7890'
      }),
    });
    const res2: NextResponse = await PATCH_user(req2, { params: fake_user_param });
    var { data, error } = await res2.json();
    expect(error).toBe("user does not exist");

    // patch invalid user
    const req3 = new Request("http://localhost", {
      method: "PATCH",
      body: JSON.stringify({
        'first': 'test_first_patched',
        'bad_field': 'bad_field_value',
      }),
    });
    const res3: NextResponse = await PATCH_user(req3, { params: user_param_1 });
    var { data, error } = await res3.json();
    expect(error).toBe("invalid user field");

    // delete invalid user
    const req4 = new Request("http://localhost", {
      method: "DELETE",
    });
    const res4: NextResponse = await DELETE_user(req4, { params: fake_user_param });
    var { data, error } = await res4.json();
    expect(error).toBe("user does not exist");
  });
  it("should correctly handle Listing workflow", async () => {
    // create 6 users so that we can delete a listing via report later
    var { data, error } = await createUser(3);
    const user_id_1 = data.user_id;
    const user_param_1 = Promise.resolve({ user_id: user_id_1 });

    var { data, error } = await createUser(4);
    const user_id_2 = data.user_id;
    const user_param_2 = Promise.resolve({ user_id: user_id_2 });

    var { data, error } = await createUser(5);
    const user_id_3 = data.user_id;
    const user_param_3 = Promise.resolve({ user_id: user_id_3 });

    var { data, error } = await createUser(6);
    const user_id_4 = data.user_id;
    const user_param_4 = Promise.resolve({ user_id: user_id_4 });

    var { data, error } = await createUser(7);
    const user_id_5 = data.user_id;
    const user_param_5 = Promise.resolve({ user_id: user_id_5 });

    var { data, error } = await createUser(8);
    const user_id_6 = data.user_id;

    // create two listings for user 1 and one for user 2
    var { data, error } = await createListing(1, user_id_1);
    expect(error).toBe(null);
    const listing_id_1 = data.listing_id;
    const listing_param_1 = Promise.resolve({ listing_id: listing_id_1 });

    var { data, error } = await createListing(2, user_id_1);
    expect(error).toBe(null);
    const listing_id_2 = data.listing_id;
    const listing_param_2 = Promise.resolve({ listing_id: listing_id_2 });

    var { data, error } = await createListing(3, user_id_2);
    expect(error).toBe(null);
    const listing_id_3 = data.listing_id;
    const listing_param_3 = Promise.resolve({ listing_id: listing_id_3 });

    // get listings
    const req1 = new Request("http://localhost", {
      method: "GET",
    });
    const res1: NextResponse = await GET_listing(req1, { params: listing_param_1 });
    var { data, error } = await res1.json();
    expect(error).toBe(null);
    expect(data).toMatchObject({
      'title': 'test_listing_1',
      'price': 100,
      'condition': 'test_cond',
      'category': 'test_cat',
      'description': 'test_desc',
      'owner': user_id_1,
      'owner_name': 'test_first_3 test_last_3',
      'owner_pfp': '',
      'seller_rating': 3.5,
      'selected_buyer': '',
      'potential_buyers': [],
      'image_paths': [], 
      'id': listing_id_1, 
    });

    const req2 = new Request("http://localhost", {
      method: "GET",
    });
    const res2: NextResponse = await GET_listing(req2, { params: listing_param_2 });
    var { data, error } = await res2.json();
    expect(error).toBe(null);
    expect(data).toMatchObject({
      'title': 'test_listing_2',
      'price': 200,
      'condition': 'test_cond',
      'category': 'test_cat',
      'description': 'test_desc',
      'owner': user_id_1,
      'owner_name': 'test_first_3 test_last_3',
      'owner_pfp': '',
      'seller_rating': 3.5,
      'selected_buyer': '',
      'potential_buyers': [],
      'image_paths': [],  
      'id': listing_id_2,
    });

    const req3 = new Request("http://localhost", {
      method: "GET",
    });
    const res3: NextResponse = await GET_listing(req3, { params: listing_param_3 });
    var { data, error } = await res3.json();
    expect(error).toBe(null);
    expect(data).toMatchObject({
      'title': 'test_listing_3',
      'price': 300,
      'condition': 'test_cond',
      'category': 'test_cat',
      'description': 'test_desc',
      'owner': user_id_2,
      'owner_name': 'test_first_4 test_last_4',
      'owner_pfp': '',
      'seller_rating': 3.5,
      'selected_buyer': '',
      'potential_buyers': [],
      'image_paths': [],  
      'id': listing_id_3,
    });

    const req4 = new Request("http://localhost", {
      method: "GET",
    });
    const res4: NextResponse = await GET_user(req4, { params: user_param_1 });
    var { data, error } = await res4.json();
    expect(error).toBe(null);
    expect(data).toMatchObject({
      active_listings: [listing_id_1, listing_id_2],
      id: user_id_1,
    });

    // upload image
    const form = new FormData();
    const img = new Blob([fs.readFileSync('./public/logo2.png')]);
    form.append('image', img);
    const req5 = new Request("http://localhost", {
      method: "POST",
      body: form,
    });
    const res5: NextResponse = await POST_img(req5);
    var { data, error } = await res5.json();
    expect(error).toBe(null);
    expect(data).toContain('/images');
    const img_path = data;

    const req6 = new Request("http://localhost", {
      method: "PATCH",
      body: JSON.stringify({
        'image_paths': [img_path],
      }),
    });
    const res6: NextResponse = await PATCH_listing(req6, { params: listing_param_1 });
    var { data, error } = await res6.json();
    expect(error).toBe(null);
    expect(data).toMatchObject({
      image_paths: [img_path],
    });

    // update listing 1 (user 2 and 3 interested, user 2 selected)
    const req7 = new Request("http://localhost", {
      method: "PATCH",
      body: JSON.stringify({
        'potential_buyers': [user_id_2, user_id_3],
        'selected_buyer': user_id_2,
      }),
    });
    const res7: NextResponse = await PATCH_listing(req7, { params: listing_param_1 });
    var { data, error } = await res7.json();
    expect(error).toBe(null);
    expect(data).toMatchObject({
      potential_buyers: [user_id_2, user_id_3],
      selected_buyer: user_id_2,
    });

    // update listing 1 (user 3 not interested, user 4 and user 5 interested)
    const req8 = new Request("http://localhost", {
      method: "PATCH",
      body: JSON.stringify({
        'potential_buyers': [user_id_2, user_id_4, user_id_5], // must pass in entire updated list
      }),
    });
    const res8: NextResponse = await PATCH_listing(req8, { params: listing_param_1 });
    var { data, error } = await res8.json();
    expect(error).toBe(null);
    expect(data).toMatchObject({
      potential_buyers: [user_id_2, user_id_4, user_id_5],
      selected_buyer: user_id_2,
    });

    // check user interested_listings are updated
    const get_req = new Request("http://localhost", {
      method: "GET",
    });
    const res9: NextResponse = await GET_user(get_req, { params: user_param_2 });
    var { data, error } = await res9.json();
    expect(error).toBe(null);
    expect(data).toMatchObject({
      'interested_listings': [listing_id_1],
    });
    const res9a: NextResponse = await GET_user(get_req, { params: user_param_3 });
    var { data, error } = await res9a.json();
    expect(error).toBe(null);
    expect(data).toMatchObject({
      'interested_listings': [],
    });
    const res10: NextResponse = await GET_user(get_req, { params: user_param_4 });
    var { data, error } = await res10.json();
    expect(error).toBe(null);
    expect(data).toMatchObject({
      'interested_listings': [listing_id_1],
    });
    const res11: NextResponse = await GET_user(get_req, { params: user_param_5 });
    var { data, error } = await res11.json();
    expect(error).toBe(null);
    expect(data).toMatchObject({
      'interested_listings': [listing_id_1],
    });

    // user 1 and user 2 rate listing 1
    const req12 = new Request("http://localhost", {
      method: "PATCH",
      body: JSON.stringify({
        "user_id": user_id_2,
        "rating": 4.5,
      })
    });
    const res12: NextResponse = await PATCH_rate(req12, { params: listing_param_1 });
    var { data, error } = await res12.json();
    expect(error).toBe(null);

    const req13 = new Request("http://localhost", {
      method: "GET",
    });
    const res13: NextResponse = await GET_user(req13, { params: user_param_1 });
    var { data, error } = await res13.json();
    expect(error).toBe(null);
    expect(data).toMatchObject({
      seller_rating: 4.5,
    })

    const req14 = new Request("http://localhost", {
      method: "PATCH",
      body: JSON.stringify({
        "user_id": user_id_1,
        "rating": 3.5,
      })
    });
    const res14: NextResponse = await PATCH_rate(req14, { params: listing_param_1 });
    var { data, error } = await res14.json();
    expect(error).toBe(null);

    const req15 = new Request("http://localhost", {
      method: "GET",
    });
    const res15: NextResponse = await GET_user(req15, { params: user_param_2 });
    var { data, error } = await res15.json();
    expect(error).toBe(null);
    expect(data).toMatchObject({
      buyer_rating: 3.5,
    })

    const req14a = new Request("http://localhost", {
      method: "PATCH",
      body: JSON.stringify({
        "user_id": user_id_1,
        "rating": 1,
      })
    });
    const res14a: NextResponse = await PATCH_rate(req14a, { params: listing_param_1 });
    var { data, error } = await res14a.json();
    expect(error).toBe(null);

    const req15a = new Request("http://localhost", {
      method: "GET",
    });
    const res15a: NextResponse = await GET_user(req15a, { params: user_param_2 });
    var { data, error } = await res15a.json();
    expect(error).toBe(null);
    expect(data).toMatchObject({
      buyer_rating: 1,
    })

    // report listing 2 until delete (5 times)
    const req16 = new Request("http://localhost", {
      method: "PATCH",
      body: JSON.stringify({
        "user_id": user_id_2,
      })
    });
    const res16: NextResponse = await PATCH_report(req16, { params: listing_param_2 });
    var { data, error } = await res16.json();
    expect(error).toBe(null);
    const req17 = new Request("http://localhost", {
      method: "PATCH",
      body: JSON.stringify({
        "user_id": user_id_3,
      })
    });
    const res17: NextResponse = await PATCH_report(req17, { params: listing_param_2 });
    var { data, error } = await res17.json();
    expect(error).toBe(null);
    const req18 = new Request("http://localhost", {
      method: "PATCH",
      body: JSON.stringify({
        "user_id": user_id_4,
      })
    });
    const res18: NextResponse = await PATCH_report(req18, { params: listing_param_2 });
    var { data, error } = await res18.json();
    expect(error).toBe(null);
    const req19 = new Request("http://localhost", {
      method: "PATCH",
      body: JSON.stringify({
        "user_id": user_id_5,
      })
    });
    const res19: NextResponse = await PATCH_report(req19, { params: listing_param_2 });
    var { data, error } = await res19.json();
    expect(error).toBe(null);

    const req20 = new Request("http://localhost", {
      method: "PATCH",
      body: JSON.stringify({
        "user_id": user_id_6,
      })
    });
    const res20: NextResponse = await PATCH_report(req20, { params: listing_param_2 });
    var { data, error } = await res20.json();
    expect(error).toBe(null);

    const req21 = new Request("http://localhost", {
      method: "GET",
    });
    const res21: NextResponse = await GET_listing(req21, { params: listing_param_2 });
    var { data, error } = await res21.json();
    expect(error).toBe("No listing exists for given id");

    // delete selected user 2
    const req22 = new Request("http://localhost", {
      method: "DELETE",
    });
    const res22: NextResponse = await DELETE_user(req22, { params: user_param_2 });
    var { data, error } = await res22.json();
    expect(error).toBe(null);
    expect(data.user_id).toEqual(user_id_2);

    // check user removed from listing potential_buyers
    const req23 = new Request("http://localhost", {
      method: "GET",
    });
    const res23: NextResponse = await GET_listing(req23, { params: listing_param_1 });
    var { data, error } = await res23.json();
    expect(error).toBe(null);
    expect(data).toMatchObject({
      'selected_buyer': '',
      'potential_buyers': [user_id_4, user_id_5],
    });

    // check user's active listings no longer exist
    const req24 = new Request("http://localhost", {
      method: "GET",
    });
    const res24: NextResponse = await GET_listing(req24, { params: listing_param_3 });
    var { data, error } = await res24.json();
    expect(error).toBe("No listing exists for given id");

    // delete listing 1
    const req25 = new Request("http://localhost", {
      method: "DELETE",
      body: JSON.stringify({
        "user_id": user_id_1,
      })
    });
    const res25: NextResponse = await DELETE_listing(req25, { params: listing_param_1 });
    var { data, error } = await res25.json();
    expect(error).toBe(null);

    const req26 = new Request("http://localhost", {
      method: "GET",
    });
    const res26: NextResponse = await GET_listing(req26, { params: listing_param_1 });
    var { data, error } = await res26.json();
    expect(error).toBe("No listing exists for given id");

    // check image deleted from storage
    const imgRef = ref(storage, img_path);
    await expect(getDownloadURL(imgRef)).rejects.toThrow('storage/object-not-found');

    // check listing deleted from active_listings and interested_listings
    const res27: NextResponse = await GET_user(get_req, { params: user_param_1 });
    var { data, error } = await res27.json();
    expect(error).toBe(null);
    expect(data).toMatchObject({
      active_listings: [],
    })

    const res28: NextResponse = await GET_user(get_req, { params: user_param_4 });
    var { data, error } = await res28.json();
    expect(error).toBe(null);
    expect(data).toMatchObject({
      interested_listings: [],
    })

    const res29: NextResponse = await GET_user(get_req, { params: user_param_5 });
    var { data, error } = await res29.json();
    expect(error).toBe(null);
    expect(data).toMatchObject({
      interested_listings: [],
    })
  });
});
