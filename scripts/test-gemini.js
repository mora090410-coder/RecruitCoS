import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Load .env from project root manually
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, "../.env");
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            const value = match[2].trim().replace(/^["'](.*)["']$/, '$1');
            process.env[key] = value;
        }
    });
}

const apiKey = process.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
    console.error("No VITE_GEMINI_API_KEY found in .env");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function testGeminiModels() {
    console.log("=".repeat(50));
    console.log("RecruitCoS Gemini API Diagnostic (2026 Standards)");
    console.log("=".repeat(50));

    // Primary: Gemini 3 Flash (Production)
    console.log("\n1. Testing gemini-3-flash-preview (PRODUCTION)...");
    try {
        const model = genAI.getGenerativeModel(
            { model: "gemini-3-flash-preview" },
            { apiVersion: "v1" }
        );
        const result = await model.generateContent("Say 'Gemini 3 Flash is online' in exactly 5 words.");
        console.log("   ✅ SUCCESS:", result.response.text().trim());
    } catch (e) {
        console.error("   ❌ FAILED:", e.message);
    }

    // Fallback: Gemini 2.0 Flash (Legacy)
    console.log("\n2. Testing gemini-2.0-flash (LEGACY FALLBACK)...");
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await model.generateContent("Hello");
        console.log("   ✅ Available:", result.response.text().substring(0, 50));
    } catch (e) {
        console.error("   ⚠️  Unavailable (expected):", e.message.substring(0, 60));
    }

    // JSON Response Test (Critical for Chief of Staff logic)
    console.log("\n3. Testing JSON response format (Chief of Staff)...");
    try {
        const model = genAI.getGenerativeModel(
            {
                model: "gemini-3-flash-preview",
                generationConfig: { responseMimeType: "application/json" }
            },
            { apiVersion: "v1" }
        );
        const result = await model.generateContent('Return a JSON object with keys "status" and "message". Status should be "ok".');
        const json = JSON.parse(result.response.text());
        console.log("   ✅ JSON Parse Success:", JSON.stringify(json));
    } catch (e) {
        console.error("   ❌ JSON FAILED:", e.message);
    }

    console.log("\n" + "=".repeat(50));
    console.log("Diagnostic complete.");
}

testGeminiModels();
