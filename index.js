import { isTshirt } from "./openaiHelper.js";
import { processProducts } from "./mongoHelper.js";
import { initKeyRotation } from "./keyManager.js";

console.log("🔍 Starting AI TSHIRT classifier...");
await initKeyRotation(); // Bắt đầu luân phiên key

await processProducts(async (doc, col) => {
  const is = await isTshirt(doc.title);
  const newType = is ? "TSHIRT" : "OTHER";

  await col.updateOne({ _id: doc._id }, { $set: { type: newType } });
  console.log(`✔ Updated "${doc.title}" -> ${newType}`);
});
