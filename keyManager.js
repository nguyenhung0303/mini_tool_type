import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const client = new MongoClient(process.env.MONGODB_URI);
let currentProvider = null;
let currentKey = null;
let providerKeys = {
    gemini: [],
    openai: []
};

export async function initKeyRotation(selectedProvider = null) {
    await client.connect();
    const db = client.db(process.env.DATABASE_NAME);
    const col = db.collection("key_ai");

    // Lấy tất cả keys từ DB
    const keys = await col.find({ active: true }).toArray();
    if (!keys.length) throw new Error("❌ Không có key nào trong collection 'key_ai'");

    // Phân loại keys theo provider
    providerKeys.gemini = keys.filter(k => k.provider === "gemini");
    providerKeys.openai = keys.filter(k => k.provider === "openai");

    console.log(`📊 Tìm thấy ${providerKeys.gemini.length} key Gemini và ${providerKeys.openai.length} key OpenAI`);

    // Xác định provider sẽ được sử dụng
    if (selectedProvider) {
        // Nếu có chỉ định provider cụ thể
        if (selectedProvider === "gemini" && providerKeys.gemini.length > 0) {
            currentProvider = "gemini";
        } else if (selectedProvider === "openai" && providerKeys.openai.length > 0) {
            currentProvider = "openai";
        } else {
            throw new Error(`❌ Không tìm thấy key nào cho provider ${selectedProvider}`);
        }
    } else {
        // Nếu không chỉ định, dùng provider đầu tiên có sẵn
        if (providerKeys.gemini.length > 0) {
            currentProvider = "gemini";
        } else if (providerKeys.openai.length > 0) {
            currentProvider = "openai";
        } else {
            throw new Error("❌ Không tìm thấy key nào cho Gemini hoặc OpenAI");
        }
    }

    console.log(`🔧 Sử dụng provider: ${currentProvider.toUpperCase()}`);
    let keyIndex = 0;

    const rotateKey = () => {
        const keys = providerKeys[currentProvider];
        currentKey = keys[keyIndex].key;
        console.log(`🔁 Đang dùng key ${currentProvider.toUpperCase()}: ${currentKey.slice(0, 10)}...`);
        keyIndex = (keyIndex + 1) % keys.length;
    };

    rotateKey(); // Gọi lần đầu tiên
    setInterval(rotateKey, 5000); // Luân chuyển key mỗi 5 giây
}

export function getProvider() {
    return currentProvider;
}

export function getCurrentKey() {
    return currentKey;
}

export function switchProvider(newProvider) {
    if (!providerKeys[newProvider] || providerKeys[newProvider].length === 0) {
        throw new Error(`❌ Không có key nào cho provider ${newProvider}`);
    }

    currentProvider = newProvider;
    console.log(`🔄 Đã chuyển sang provider: ${currentProvider.toUpperCase()}`);
    return true;
}