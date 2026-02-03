import { GoogleGenerativeAI } from "@google/generative-ai";
import { sanitizeInput } from "./security";

let genAIInstance = null;

// Safe initialization
export function getGenAI() {
  if (genAIInstance) return genAIInstance;

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    console.error("Gemini API Key missing! Check your .env file.");
    return null;
  }

  genAIInstance = new GoogleGenerativeAI(apiKey);
  return genAIInstance;
}

// Helper for Exponential Backoff
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export async function callGeminiWithRetry(model, prompt, retries = 3, delay = 2000) {
  try {
    return await model.generateContent(prompt);
  } catch (error) {
    const isRateLimit = error.message?.includes('429') || error.status === 429;
    if (retries > 0 && isRateLimit) {
      if (import.meta.env.DEV) console.warn(`Hit 429 rate limit. Retrying in ${delay}ms...`);
      await wait(delay);
      return callGeminiWithRetry(model, prompt, retries - 1, delay * 2);
    }
    throw error;
  }
}

export async function generateSocialPosts(eventData, coaches = [], voiceProfile = "") {
  const genAI = getGenAI();
  if (!genAI) throw new Error("Gemini AI not initialized");

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: { responseMimeType: "application/json" }
  });

  // Sanitized Inputs
  const safeTitle = sanitizeInput(eventData.title);
  const safeDescription = sanitizeInput(eventData.description);
  const safeEventType = sanitizeInput(eventData.event_type);
  const safeDate = sanitizeInput(eventData.date);
  const safeVoice = sanitizeInput(voiceProfile);

  const prompt = `
    You are a social media expert for high school athletes. 
    based on the following event, generate 3 distinct social media post options (Twitter/X style).
    
    Event Type: ${safeEventType}
    Headline: ${safeTitle}
    Details: ${safeDescription}
    Date: ${safeDate}
    
    Coaches to Tag: ${coaches.map(c => {
    const handle = c.twitter_handle || 'no_handle';
    return `${sanitizeInput(c.name)} (${handle.startsWith('@') ? handle : '@' + handle})`;
  }).join(', ') || "None"}

    ${safeVoice ? `
    CRITICAL TONE INSTRUCTION:
    The user has a specific voice preference: "${safeVoice}".
    Ensure EXACTLY ONE of the options matches this specific instruction perfectly. Label that option as "My Voice".
    The other two options should provide variety (e.g. Hype, Humble, or Professional) but usually distinct from the user's specific instruction to offer choice.
    ` : ''}

    Return the response as a valid JSON object with the following structure:
    {
      "options": [
        { "style": "${safeVoice ? "My Voice" : "Hype"}", "content": "..." },
        { "style": "Humble", "content": "..." },
        { "style": "Professional", "content": "..." }
      ]
    }
    
    Style Guidelines (if not overriding with "My Voice"):
    - Humble: Grateful, team-focused, mentioning coaches/teammates.
    - Professional: Concise, factual, respectful.
    - Hype/Grind: Energetic, determined, confident.
    
    CRITICAL INSTRUCTION:
    You HAVE been provided with "Coaches to Tag". You MUST output the exact Twitter handles provided in that list in the post content.
    - Example: If the list contains "@CoachSark", the output text MUST include "@CoachSark".
    - Do NOT just write their name. Use the handle.
    - Include these tags in ALL 3 options if possible.
  `;

  if (import.meta.env.DEV) {
    console.log("Generating social posts...");
  }

  try {
    const result = await callGeminiWithRetry(model, prompt);
    const text = result.response.text();
    return JSON.parse(text);
  } catch (error) {
    if (import.meta.env.DEV) console.error("Gemini Error:", error);
    throw new Error("Failed to generate posts");
  }
}
