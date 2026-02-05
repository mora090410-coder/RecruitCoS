import { GoogleGenerativeAI } from "@google/generative-ai";
import { sanitizeInput } from "./security";
import { withRetry, isRetryableError } from "./aiUtils";

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

/**
 * Calls Gemini API with robust retry logic for 503/429/5xx errors.
 * Uses exponential backoff: 1s, 2s, 4s delays.
 * 
 * @param {Object} model - Gemini model instance
 * @param {string} prompt - The prompt to send
 * @param {Object} options - Retry options
 * @param {number} options.maxRetries - Max retries (1-5, default: 3)
 * @param {Function} options.onRetry - Callback when retrying
 * @returns {Promise<Object>} Gemini response
 */
export async function callGeminiWithRetry(model, prompt, options = {}) {
  const { maxRetries = 3, onRetry = null } = options;

  return withRetry(
    async () => {
      const result = await model.generateContent(prompt);

      // Check for blocked responses (2026 safety filter handling)
      const response = result.response;
      if (response.promptFeedback?.blockReason) {
        const reason = response.promptFeedback.blockReason;
        if (import.meta.env.DEV) console.warn("Response blocked:", reason);

        // Handle BlockedReason.OTHER gracefully
        if (reason === "OTHER" || reason === "BLOCKED_REASON_UNSPECIFIED") {
          throw new Error(`Content filtered: ${reason}. Please try rephrasing.`);
        }
        throw new Error(`Content blocked: ${reason}`);
      }

      return result;
    },
    { maxRetries, baseDelay: 1000, onRetry }
  );
}

// JSON Schema for Social Posts (2026 Gemini 3 Standards)
const SOCIAL_POSTS_SCHEMA = {
  type: "object",
  properties: {
    options: {
      type: "array",
      items: {
        type: "object",
        properties: {
          style: { type: "string", description: "Post style: Hype, Humble, Professional, or My Voice" },
          content: { type: "string", description: "The social media post content (280 chars max)" }
        },
        required: ["style", "content"]
      },
      minItems: 3,
      maxItems: 3
    }
  },
  required: ["options"]
};

export async function generateSocialPosts(eventData, coaches = [], voiceProfile = "", phase = "Discovery", priorityTags = []) {
  const genAI = getGenAI();
  if (!genAI) throw new Error("Gemini AI not initialized");

  // Sanitized Inputs
  const safeTitle = sanitizeInput(eventData.title);
  const safeDescription = sanitizeInput(eventData.description);
  const safeEventType = sanitizeInput(eventData.event_type);
  const safeDate = sanitizeInput(eventData.date);
  const safeVoice = sanitizeInput(voiceProfile);
  const safePhase = sanitizeInput(phase);

  const formatCoach = (c) => {
    const handle = c.twitter_handle || 'no_handle';
    return `${sanitizeInput(c.name)} (${handle.startsWith('@') ? handle : '@' + handle})`;
  };

  const coachTags = coaches.map(formatCoach).join(', ') || "None";
  const priorityTagStrings = priorityTags.map(formatCoach).join(', ') || "None";

  // 2026 Gemini 3 Standards: systemInstruction with JSON schema
  const systemInstruction = `You are a social media expert for high school athletes.

OUTPUT FORMAT:
Return ONLY a valid JSON object matching this schema:
${JSON.stringify(SOCIAL_POSTS_SCHEMA, null, 2)}

NCAA COMPLIANCE RULES:
1. Discovery/Foundation phase: Focus on gratitude, progress, training. NO "call to action" for coaches.
2. Exposure phase: Proactive language, "excited for the next level", "open to conversations".
3. Commitment phase: Decision-making, visits, thanking programs.
4. NEVER mention dollar amounts or inducements.
5. Keep tone humble yet confident.

STYLE GUIDELINES:
- Humble: Grateful, team-focused, mentioning coaches/teammates.
- Professional: Concise, factual, respectful.
- Hype: Energetic, determined, confident.
${safeVoice ? `- My Voice: Match this exact instruction: "${safeVoice}"` : ''}

PRIORITY TAGGING:
If Priority Tags are provided, you MUST include them prominently in the content of ALL 3 post options. These are coaches from the athlete's target schools who are attending this regional event.

CRITICAL: Include exact Twitter handles from "Coaches to Tag" and "Priority Tags" in ALL 3 options.`;

  const model = genAI.getGenerativeModel({
    model: "gemini-3-flash-preview",
    systemInstruction,
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 1.0
    }
  }, { apiVersion: "v1beta" });

  // Context first, then instruction (2026 long-context optimization)
  const prompt = `CONTEXT (Event Data):
- Phase: ${safePhase}
- Event Type: ${safeEventType}
- Headline: ${safeTitle}
- Details: ${safeDescription}
- Date: ${safeDate}
- Coaches to Tag: ${coachTags}
- Priority Tags (MUST INCLUDE): ${priorityTagStrings}

INSTRUCTION:
Generate 3 distinct social media post options for this event. Each post should be Twitter/X style (max 280 characters). Include all coach handles in each post.`;

  if (import.meta.env.DEV) {
    console.log("Generating social posts for phase:", safePhase);
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

// JSON Schema for Recruiting Insight (2026 Gemini 3 Standards)
const RECRUITING_INSIGHT_SCHEMA = {
  type: "object",
  properties: {
    insight: { type: "string", description: "Concise 1-2 sentence tactical advice" },
    isTractionShift: { type: "boolean", description: "True if athlete has better traction at target level than reach level" },
    recommendation: { type: "string", enum: ["Lean In", "Stay Course", "Broaden Search"] }
  },
  required: ["insight", "isTractionShift", "recommendation"]
};

/**
 * getRecruitingInsight
 * Generates strategic advice based on relationship traction across divisions.
 * 
 * @param {string} phase - The athlete's current phase (Discovery, Exposure, etc.)
 * @param {Object} signalData - Count of High Signal schools per division { D1: count, D2: count, D3: count }
 */
export async function getRecruitingInsight(phase, signalData) {
  const genAI = getGenAI();
  if (!genAI) throw new Error("Gemini AI not initialized");

  const safePhase = sanitizeInput(phase);

  // 2026 Gemini 3 Standards: systemInstruction with JSON schema
  const systemInstruction = `You are an elite recruiting advisor (Chief of Staff) for a high school athlete.

OUTPUT FORMAT:
Return ONLY a valid JSON object matching this schema:
${JSON.stringify(RECRUITING_INSIGHT_SCHEMA, null, 2)}

ANALYSIS LOGIC:
1. PHASE SPECIFIC MISSIONS:
   - If phase is 'Exposure': You MUST mention that "Coaches from your Target schools are attending the PGF Showcase this weekend" and recommend a "Pre-Event" post to get on their radar.
2. TRACTION ANALYSIS:
   - A "Traction Shift" occurs if athlete has 0 traction at D1 (Reach) but 2+ traction at D2/D3 (Target).
   - If traction shift: Encourage leaning into where they are wanted, keep reach goals as secondary.
   - If no shift: Provide "Keep Grinding" message focusing on daily habits and signal building.

STYLE:
Be professional, motivating, and straight-talking. No fluff.`;

  const model = genAI.getGenerativeModel({
    model: "gemini-3-flash-preview",
    systemInstruction,
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 1.0
    }
  }, { apiVersion: "v1beta" });

  // Context first, then instruction (2026 long-context optimization)
  const prompt = `CONTEXT (Traction Data):
- Athlete Phase: ${safePhase}
- D1 High Signal Schools: ${signalData.D1 || 0}
- D2 High Signal Schools: ${signalData.D2 || 0}
- D3 High Signal Schools: ${signalData.D3 || 0}

INSTRUCTION:
Analyze the traction distribution and provide strategic advice for this athlete.`;

  try {
    const result = await callGeminiWithRetry(model, prompt);
    const text = result.response.text().trim();
    // Handle potential markdown backticks in response
    const jsonString = text.replace(/^```json\n?|\n?```$/g, '');
    return JSON.parse(jsonString);
  } catch (error) {
    if (import.meta.env.DEV) console.error("Gemini Insight Error:", error);
    return {
      insight: "Your signal is steady. Stay focused on your development goals.",
      isTractionShift: false,
      recommendation: "Stay Course"
    };
  }
}
