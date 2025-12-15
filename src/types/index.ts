import { ObjectId } from "mongodb";

export interface GroceryItem {
  _id: ObjectId;
  name: string;
  expiryDate?: Date | null;
  done: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface GroceryItemInput {
  name: string;
  expiryDate?: string;
}
