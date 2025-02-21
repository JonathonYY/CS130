import { User } from "../../types";
import { Timestamp } from "firebase/firestore";

// TODO: mock input -> output behavior for add, update, delete

export const addUser = jest.fn(() => {
  console.log("adding user");
});

export const getUser = jest.fn((user_id: string) => {
  console.log("getting user");
  const user: User = {
    "first": "test_first",
    "last": "test_last",
    "email_address": "test@g.ucla.edu",
    "phone_number": "123-456-7890",
    "active_listings": [],
    "interested_listings": [],
    "completed_sales": 0,
    "completed_purchases": 0,
    "cum_buyer_rating": 0,
    "cum_seller_rating": 0,
    "last_reported": Timestamp.fromMillis(0),
    "pfp": "/some/path/to/img",
  };
  user.id = user_id;

  return user;
});

export const updateUser = jest.fn((user_id, data) => {
  console.log("updating user");
});

export const deleteUser = jest.fn(() => {
  console.log("deleting user");
});
