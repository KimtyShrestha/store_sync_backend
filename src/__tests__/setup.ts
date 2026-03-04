import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongo: MongoMemoryServer;
process.env.NODE_ENV = "test";

export const connectTestDB = async () => {
  mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();
  await mongoose.connect(uri);
};

export async function closeTestDB() {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
};

