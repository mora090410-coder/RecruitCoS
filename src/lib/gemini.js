import { GoogleGenerativeAI } from "@google/generative-ai";
import { sanitizeInput } from "./security";
import { withRetry, isRetryableError } from "./aiUtils";

let genAIInstance = null;
let genAIDisabledLogged = false;

const logGenAIDisabledOnce = () => {
  if (!import.meta.env.DEV) return;
  if (genAIDisabledLogged) return;
  genAIDisabledLogged = true;
  console.info('[DEV] Generative AI integration disabled via VITE_DISABLE_GENAI.');
};

const isGenAIDisabled = () => import.meta.env.VITE_DISABLE_GENAI === 'true';

// Safe initialization
export function getGenAI() {
  if (isGenAIDisabled()) {
    logGenAIDisabledOnce();
    return null;
  }
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
  if (isGenAIDisabled()) {
    logGenAIDisabledOnce();
    return { response: { text: () => '' } };
  }

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
  if (isGenAIDisabled()) {
    logGenAIDisabledOnce();
    return { options: [] };
  }
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
  const systemInstruction = `You are an elite Recruiting Chief of Staff. Use the following 'Playbook Rules' to guide every output:

1. Safety First (Foundation Phase): Strictly prohibit including personal emails/phones in drafts for 12U athletes.
2. The 30-Second Rule (Identification Phase): For Sophomores, prioritize captions that highlight short, high-discipline clips.
3. The 75% Rule: If an athlete's stats don't match Power-5 'Extra Elite' thresholds (e.g., Pitching < 60mph), pivot strategy toward the 'Hidden Gem' track—targeting D2, D3, and NAIA schools where their 3.5+ GPA provides a competitive edge.
4. September 1st Protocol: For Juniors, transition tone from 'Grind' to 'Proactive Outreach' and culture-fit analysis.

OUTPUT FORMAT:
Return ONLY a valid JSON object matching this schema:
${JSON.stringify(SOCIAL_POSTS_SCHEMA, null, 2)}

NCAA COMPLIANCE & TONE:
- Foundation Phase: Focus on gratitude, progress, training. NO "call to action" for coaches. Keep safety paramount.
- Identification/Evaluation Phase: Focus on uncommitted status and 30-second high-discipline highlights.
- Comparison Phase: Proactive outreach, "excited for the next level", culture-fit analysis.
- Commitment Phase: Decision-making, visits, thanking programs.
- NEVER mention dollar amounts or inducements.
- Keep tone humble yet elite.

STYLE GUIDELINES:
- Humble: Grateful, team-focused, mentioning coaches/teammates.
- Professional: Concise, factual, respectful.
- Hype: Energetic, determined, confident.
${safeVoice ? `- My Voice: Match this exact instruction: "${safeVoice}"` : ''}

PRIORITY TAGGING:
If Priority Tags are provided, you MUST include them prominently in the content of ALL 3 post options.

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
