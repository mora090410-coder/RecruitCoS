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

async function listModels() {
    try {
        const modelResponse = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Just to test init
        // Actually SDK doesn't have listModels on the instance directly usually, it's on the class or via model query
        // Wait, the SDK has a ModelManager or we can just try to generate content to test
        // But the error message suggested listModels.
        // The SDK documentation says request "models" endpoint manually or use correct method if available.
        // Actually the SDK *does* not expose listModels easily in v0.1.
        // Let's use the REST API for listModels or just try a simple generation with a fallback model.

        console.log("Testing gemini-1.5-flash generation...");
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const result = await model.generateContent("Hello");
            console.log("Success with gemini-1.5-flash:", result.response.text());
        } catch (e) {
            console.error("Failed with gemini-1.5-flash:", e.message);
        }

        console.log("\nTesting gemini-pro generation...");
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });
            const result = await model.generateContent("Hello");
            console.log("Success with gemini-pro:", result.response.text());
        } catch (e) {
            console.error("Failed with gemini-pro:", e.message);
        }

        console.log("\nTesting gemini-2.0-flash generation (if avail)...");
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
            const result = await model.generateContent("Hello");
            console.log("Success with gemini-2.0-flash:", result.response.text());
        } catch (e) {
            console.error("Failed with gemini-2.0-flash:", e.message);
        }

    } catch (error) {
        console.error("Error:", error);
    }
}

listModels();
