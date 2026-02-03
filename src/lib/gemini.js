import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export async function generateSocialPosts(eventData, coaches = [], voiceProfile = "") {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: { responseMimeType: "application/json" }
  });

  const prompt = `
    You are a social media expert for high school athletes. 
    based on the following event, generate 3 distinct social media post options (Twitter/X style).
    
    Event Type: ${eventData.event_type}
    Headline: ${eventData.title}
    Details: ${eventData.description}
    Date: ${eventData.date}
    
    Coaches to Tag: ${coaches.map(c => {
    const handle = c.twitter_handle || 'no_handle';
    return `${c.name} (${handle.startsWith('@') ? handle : '@' + handle})`;
  }).join(', ') || "None"}

    ${voiceProfile ? `
    CRITICAL TONE INSTRUCTION:
    The user has a specific voice preference: "${voiceProfile}".
    Ensure EXACTLY ONE of the options matches this specific instruction perfectly. Label that option as "My Voice".
    The other two options should provide variety (e.g. Hype, Humble, or Professional) but usually distinct from the user's specific instruction to offer choice.
    ` : ''}

    Return the response as a valid JSON object with the following structure:
    {
      "options": [
        { "style": "${voiceProfile ? "My Voice" : "Hype"}", "content": "..." },
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

  console.log("Generating with coaches:", coaches); // Debug log

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Error:", error);
    throw new Error("Failed to generate posts");
  }
}
