import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const client = new MongoClient(process.env.MONGODB_URI);
const dbName = process.env.DATABASE_NAME;
const collectionName = process.env.COLLECTION_NAME;

export async function processProducts(callback) {
  try {
    await client.connect();
    const db = client.db(dbName);
    const col = db.collection(collectionName);

    const cursor = col.find({ type: { $exists: false }, title: { $exists: true } });

    for await (const doc of cursor) {
      await callback(doc, col);
    }

    console.log("✅ Done processing.");
  } finally {
    await client.close();
  }
}
