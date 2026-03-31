import mongoose from "mongoose";
import { env } from "./env.js";

const cleanupLegacyPSWProfileIndexes = async () => {
  const collection = mongoose.connection.collection("pswprofiles");

  try {
    await collection.dropIndex("user_1");
    console.log("Dropped legacy pswprofiles index: user_1");
  } catch (error) {
    // Index may not exist in fresh environments.
    if (error?.codeName !== "IndexNotFound") {
      throw error;
    }
  }

  await collection.createIndex(
    { userId: 1 },
    { unique: true, name: "userId_1" },
  );
};

const cleanupLegacyPaymentIndexes = async () => {
  const collection = mongoose.connection.collection("payments");

  try {
    await collection.dropIndex("appointment_1");
    console.log("Dropped legacy payments index: appointment_1");
  } catch (error) {
    if (
      error?.codeName !== "IndexNotFound" &&
      error?.codeName !== "NamespaceNotFound"
    ) {
      throw error;
    }
  }
};

export const connectDatabase = async () => {
  try {
    await mongoose.connect(env.mongoUri);
    await cleanupLegacyPSWProfileIndexes();
    await cleanupLegacyPaymentIndexes();
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed", error);
    process.exit(1);
  }
};
