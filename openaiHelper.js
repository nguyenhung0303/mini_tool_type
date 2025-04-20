import { GoogleGenerativeAI } from "@google/generative-ai";
import { getCurrentKey } from "./keyManager.js";

export async function isTshirt(title) {
  const prompt = `
  Based on the following product title, determine whether the product is a T-shirt. 
  - If the title contains keywords such as "T-Shirt", "Tee", "Shirt" or implies a T-shirt, return "YES".
  - If the title does not mention a T-shirt or implies a different product (such as hoodie, sweatshirt, etc.), return "NO".
  - Return only "YES" or "NO", without any explanation.
  
  Product title: "${title}"
  `;

  try {
    const key = getCurrentKey();
    if (!key) throw new Error("Không có key Gemini nào đang được dùng");

    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);

    const reply = result.response.text().trim().toUpperCase();
    console.log(`Gemini response: ${reply}`);

    return reply === "YES";
  } catch (err) {
    console.error("Gemini error:", err.message);
    return false;
  }
}
