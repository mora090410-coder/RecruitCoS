/**
 * Gemini 3 Flash Diagnostics (2026 Standards)
 * Tests: v1beta endpoint, systemInstruction, JSON schema, temperature 1.0
 * 
 * Usage: node scripts/test-gemini.js
 */
import "dotenv/config";
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.VITE_GEMINI_API_KEY;

console.log("\n=== Gemini 3 Flash Diagnostics (2026 Standards) ===\n");

if (!API_KEY) {
    console.error("❌ CRITICAL: VITE_GEMINI_API_KEY is missing from .env");
    process.exit(1);
}

console.log("✅ API Key loaded (length:", API_KEY.length, ")\n");

const genAI = new GoogleGenerativeAI(API_KEY);

// Test 1: Basic v1beta Connection
console.log("1. Testing v1beta endpoint with gemini-3-flash...");
try {
    const model = genAI.getGenerativeModel(
        { model: "gemini-3-flash-preview" },
        { apiVersion: "v1beta" }
    );
    const result = await model.generateContent("Say 'Gemini 3 Flash online' in exactly 5 words.");
    console.log("   ✅ SUCCESS:", result.response.text().trim());
} catch (e) {
    console.error("   ❌ FAILED:", e.message);
}

// Test 2: systemInstruction with JSON Schema
console.log("\n2. Testing systemInstruction + JSON schema...");
try {
    const testSchema = {
        type: "object",
        properties: {
            status: { type: "string" },
            message: { type: "string" }
        },
        required: ["status", "message"]
    };

    const model = genAI.getGenerativeModel({
        model: "gemini-3-flash",
        systemInstruction: `You are a test assistant.
OUTPUT FORMAT: Return ONLY valid JSON matching this schema:
${JSON.stringify(testSchema, null, 2)}`,
        generationConfig: {
            responseMimeType: "application/json",
            temperature: 1.0
        }
    }, { apiVersion: "v1beta" });

    const result = await model.generateContent("Return status 'ok' and message 'Gemini 3 verified'.");
    const json = JSON.parse(result.response.text());
    console.log("   ✅ JSON Parse Success:", JSON.stringify(json));
} catch (e) {
    console.error("   ❌ JSON Test FAILED:", e.message);
}

// Test 3: BlockedReason handling simulation
console.log("\n3. Testing blocked response handling...");
try {
    const model = genAI.getGenerativeModel(
        { model: "gemini-3-flash-preview" },
        { apiVersion: "v1beta" }
    );
    const result = await model.generateContent("What is the capital of France?");
    const response = result.response;

    if (response.promptFeedback?.blockReason) {
        console.log("   ⚠️ Response was blocked:", response.promptFeedback.blockReason);
    } else {
        console.log("   ✅ Response not blocked:", response.text().substring(0, 50) + "...");
    }
} catch (e) {
    console.error("   ❌ Block Test Error:", e.message);
}

console.log("\n=== Diagnostics Complete ===\n");
