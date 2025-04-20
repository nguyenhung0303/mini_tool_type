// keyManager.js
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const client = new MongoClient(process.env.MONGODB_URI);
let currentKey = null;

export async function initKeyRotation() {
    await client.connect();
    const db = client.db(process.env.DATABASE_NAME);
    const col = db.collection("key_ai");

    const keys = await col.find({}).toArray();
    if (!keys.length) throw new Error("❌ Không có key nào trong collection 'keyAi'");

    let index = 0;

    const rotate = () => {
        currentKey = keys[index].key;
        console.log("🔁 Đang dùng key Gemini:", currentKey.slice(0, 10) + "...");
        index = (index + 1) % keys.length;
    };

    rotate(); // Gọi lần đầu tiên
    setInterval(rotate, 5000); // Gọi mỗi 20s
}

export function getCurrentKey() {
    return currentKey;
}
