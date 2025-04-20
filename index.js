import { isTshirt } from "./openaiHelper.js";
import { processProducts } from "./mongoHelper.js";
import { initKeyRotation } from "./keyManager.js";

console.log("🔍 Starting AI TSHIRT classifier...");


const args = process.argv.slice(2);
const selectedProvider = args.find(arg => arg.startsWith("--provider="))?.split("=")[1];

// Khởi tạo với provider đã chọn
await initKeyRotation(selectedProvider);

await processProducts(async (doc, col) => {
  const is = await isTshirt(doc.title);
  const newType = is ? "TSHIRT" : "OTHER";

  await col.updateOne({ _id: doc._id }, { $set: { type: newType } });
  console.log(`✔ Updated "${doc.title}" -> ${newType}`);
});


console.log("✅ Classification completed!");
process.exit(0);