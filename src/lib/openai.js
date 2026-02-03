import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true // For MVP we are calling client-side (Note: move to Edge Function for Prod)
});

export async function generateSocialPosts(eventData) {
    const prompt = `
    You are a social media expert for high school athletes. 
    based on the following event, generate 3 distinct social media post options (Twitter/X style).
    
    Event Type: ${eventData.event_type}
    Headline: ${eventData.title}
    Details: ${eventData.description}
    Date: ${eventData.date}

    Return the response as a valid JSON object with the following structure:
    {
      "options": [
        { "style": "Hype", "content": "..." },
        { "style": "Humble", "content": "..." },
        { "style": "Grind", "content": "..." }
      ]
    }
    
    Style Guidelines:
    1. Hype: Emoji-heavy, confident, stats-focused.
    2. Humble: Grateful, team-focused, mentioning coaches/teammates.
    3. Grind: Work ethic focused, "back to work" mentality.
  `;

    try {
        const completion = await openai.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "gpt-4-turbo-preview",
            response_format: { type: "json_object" },
        });

        return JSON.parse(completion.choices[0].message.content);
    } catch (error) {
        console.error("OpenAI Error:", error);
        throw new Error("Failed to generate posts");
    }
}
