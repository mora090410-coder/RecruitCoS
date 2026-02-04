import fs from 'fs';
import path from 'path';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 1. Manually load .env
try {
    const envPath = path.resolve(__dirname, '.env');
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf-8');
        envContent.split('\n').forEach(line => {
            const parts = line.split('=');
            if (parts.length >= 2) {
                const key = parts[0].trim();
                const value = parts.slice(1).join('=').trim();
                process.env[key] = value;
            }
        });
    }
} catch (e) {
    console.log("Could not load .env file");
}

if (!process.env.VITE_GEMINI_API_KEY) {
    console.error("❌ No VITE_GEMINI_API_KEY found in .env");
    process.exit(1);
}

// 2. Initialize Key
const API_KEY = process.env.VITE_GEMINI_API_KEY;

async function verifyGeminiAPI() {
    console.log("🤖 RecruitCoS Gemini API Verification (2026 Standards)");
    console.log("=".repeat(55));

    // Test v1 endpoint (Production)
    console.log("\n1. Checking v1 API endpoint for Gemini 3 Flash...");
    const v1Url = `https://generativelanguage.googleapis.com/v1/models?key=${API_KEY}`;

    try {
        const response = await fetch(v1Url);
        const data = await response.json();

        if (data.models) {
            console.log("   ✅ v1 API Connection Successful!");
            const flashModels = data.models
                .map(m => m.name)
                .filter(n => n.includes('flash') || n.includes('gemini-3'));
            console.log("   Flash/Gemini-3 models available:");
            flashModels.forEach(m => console.log(`      - ${m}`));
        } else {
            console.error("   ❌ v1 API Error:", JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.error("   ❌ v1 Fetch Error:", error.message);
    }

    // Test SDK initialization with Gemini 3 Flash
    console.log("\n2. Testing SDK with gemini-3-flash-preview...");
    try {
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel(
            { model: "gemini-3-flash-preview" },
            { apiVersion: "v1" }
        );
        const result = await model.generateContent("Respond with exactly: 'Gemini 3 Flash verified.'");
        console.log("   ✅ SDK Test:", result.response.text().trim());
    } catch (error) {
        console.error("   ❌ SDK Test Failed:", error.message);
    }

    console.log("\n" + "=".repeat(55));
    console.log("Verification complete.");
}

verifyGeminiAPI();
