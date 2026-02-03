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

async function testGeneration() {
    console.log("🤖 Listing Available Gemini Models (REST API)...");

    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.models) {
            console.log("✅ API Connection Successful! Found models:");
            const modelNames = data.models.map(m => m.name);
            console.log(modelNames.join('\n'));

            // Check for flash
            const hasFlash = modelNames.some(n => n.includes('flash'));
            console.log("Has Flash model:", hasFlash);
        } else {
            console.error("❌ Failed to list models:", JSON.stringify(data, null, 2));
        }

    } catch (error) {
        console.error("❌ Fetch Error:", error.message);
    }
}

testGeneration();
