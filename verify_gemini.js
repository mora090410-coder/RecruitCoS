/**
 * Gemini 3 API Verification (2026 Standards)
 * Tests v1beta endpoint availability and model access
 * 
 * Usage: node verify_gemini.js
 */
import "dotenv/config";
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.VITE_GEMINI_API_KEY;

console.log("\n=== Gemini 3 API Verification (2026 Standards) ===\n");

if (!API_KEY) {
    console.error("❌ CRITICAL: VITE_GEMINI_API_KEY not found");
    console.log("   Add VITE_GEMINI_API_KEY=your_key to your .env file");
    process.exit(1);
}

console.log("✅ API Key detected (", API_KEY.length, "chars)\n");

// Test 1: v1beta API endpoint
console.log("1. Testing v1beta API endpoint...");
const v1betaUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

try {
    const response = await fetch(v1betaUrl);
    const data = await response.json();

    if (data.models) {
        console.log("   ✅ v1beta API Connection Successful!");
        const gemini3Models = data.models
            .map(m => m.name)
            .filter(n => n.includes('gemini-3') || n.includes('flash'));
        console.log("   Gemini 3/Flash models available:");
        gemini3Models.slice(0, 8).forEach(m => console.log(`      - ${m}`));
        if (gemini3Models.length > 8) console.log(`      ... and ${gemini3Models.length - 8} more`);
    } else {
        console.error("   ❌ v1beta API Error:", JSON.stringify(data, null, 2));
    }
} catch (error) {
    console.error("   ❌ v1beta Fetch Error:", error.message);
}

// Test 2: SDK with gemini-3-flash + systemInstruction
console.log("\n2. Testing SDK with gemini-3-flash...");
try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({
        model: "gemini-3-flash-preview",
        systemInstruction: "You are a verification bot. Respond concisely.",
        generationConfig: {
            responseMimeType: "application/json",
            temperature: 1.0
        }
    }, { apiVersion: "v1beta" });

    const result = await model.generateContent('Return JSON: {"verified": true, "model": "gemini-3-flash"}');
    const text = result.response.text().trim();
    console.log("   ✅ SDK Test Response:", text);

    // Validate JSON
    const parsed = JSON.parse(text);
    if (parsed.verified) {
        console.log("   ✅ JSON validation passed!");
    }
} catch (error) {
    console.error("   ❌ SDK Test Failed:", error.message);
}

console.log("\n=== Verification Complete ===\n");
