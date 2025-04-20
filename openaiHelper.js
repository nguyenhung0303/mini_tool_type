import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import { getCurrentKey, getProvider } from "./keyManager.js";

export async function isTshirt(title) {
  const prompt = `
  Based on the following product title, determine whether the product is a T-shirt. 
  - If the title contains keywords such as "T-Shirt", "Tee", "Shirt" or implies a T-shirt, return "YES".
  - If the title does not mention a T-shirt or implies a different product (such as hoodie, sweatshirt, etc.), return "NO".
  - Return only "YES" or "NO", without any explanation.
  
  Product title: "${title}"
  `;

  const provider = getProvider();

  try {
    if (provider === "gemini") {
      return await classifyWithGemini(prompt, title);
    } else if (provider === "openai") {
      return await classifyWithOpenAI(prompt, title);
    } else {
      throw new Error(`❌ Provider không hợp lệ: ${provider}`);
    }
  } catch (err) {
    console.error(`${provider.toUpperCase()} error:`, err.message);
    return false;
  }
}

async function classifyWithGemini(prompt, title) {
  const key = getCurrentKey();
  if (!key) throw new Error("❌ Không có key Gemini nào đang được dùng");

  const genAI = new GoogleGenerativeAI(key);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContent(prompt);

  const reply = result.response.text().trim().toUpperCase();
  console.log(`Gemini response for "${title}": ${reply}`);

  return reply === "YES";
}

async function classifyWithOpenAI(prompt, title) {
  const key = getCurrentKey();
  if (!key) throw new Error("❌ Không có key OpenAI nào đang được dùng");

  const openai = new OpenAI({ apiKey: key });
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
    max_tokens: 10
  });

  const reply = response.choices[0].message.content.trim().toUpperCase();
  console.log(`OpenAI response for "${title}": ${reply}`);

  return reply === "YES";
}