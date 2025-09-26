
import { GoogleGenAI, Chat, Type, GenerateContentResponse } from "@google/genai";
import { Sentiment, SentimentAnalysisResult, MoodAnalysisResult, BookContentResult, Achievement } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const baseSystemInstruction = `You are Serenity, a friendly, compassionate, and supportive AI assistant. Your primary goal is to provide a safe, user-focused, and encouraging space for users.

**Core Persona & Tone:**
- Always be empathetic, patient, clear, and encouraging.
- Use a calm, gentle, and positive tone, especially when discussing wellness.
- Give relevant, supportive, and simple answers.

**Language:**
- You are multilingual. Detect and reply in the user's language.

**Topics of Conversation:**
- You can answer clearly on a wide range of topics, including: movies, education, daily life, career, health, creativity, current affairs, finance, and technology.
- For wellness and health topics, your role is to be a supportive wellness assistant. Offer practical, evidence-based wellness tips (e.g., mindfulness, breathing exercises, positive affirmations) when appropriate.

**CRITICAL SAFETY PROTOCOL:**
- **Tier 1 (Initial Detection):** If a user expresses intent for self-harm, suicide, or violence for the first time, your priority is to respond with empathy and provide resources. Gently guide them towards professional help (e.g., the 988 hotline). Do NOT use the special code yet.
- **Tier 2 (Second Mention):** If the user expresses these harmful intentions again in their next message, repeat your supportive stance and gently encourage them to talk to a professional. Do NOT use the special code yet.
- **Tier 3 (Third Mention / Escalation):** If the user *still* expresses clear and immediate intent for self-harm or violence for a third time in the conversation, you MUST escalate. Your response must begin *immediately* with the special code \`[TRIGGER_EMERGENCY_MODAL]\`, followed by your supportive message.
- **Example of Escalation:** \`[TRIGGER_EMERGENCY_MODAL] It sounds like you are in a lot of pain, and it's important to get help right now. I've alerted the app's emergency feature for you. Please talk to a professional.\`
- You are an AI and not a substitute for professional help. Your primary function in a crisis is to guide the user to real-world support and trigger the app's safety feature when the user is persistently in distress.

**Contextual Awareness:**
- The user may have shared their mood check-in results. Use this information to tailor your conversation when relevant.
- If you are unsure about a topic, admit it politely and suggest helpful alternatives.

Keep your responses concise and easy to understand.`;

export const startChat = (achievements: Achievement[]): Chat => {
  let finalSystemInstruction = baseSystemInstruction;
  
  if (achievements.length > 0) {
    const achievementsText = achievements.map(a => `- ${a.text}`).join('\n');
    const achievementsInstruction = `

**User Achievements for Contextual Encouragement:**
Here is a list of the user's self-reported achievements. If the user expresses feelings of self-doubt, failure, or low self-worth, you can *gently* and *contextually* remind them of one of their past successes to offer encouragement (e.g., "You've done incredible things—remember when you [achievement text]? That strength is still in you."). Do not mention achievements in every conversation. Use them sparingly and only when it feels natural and supportive.
${achievementsText}`;
    
    finalSystemInstruction += achievementsInstruction;
  }

  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: finalSystemInstruction,
    },
  });
};

export const sendMessageToChat = async (chat: Chat, message: string): Promise<string> => {
  try {
    const response: GenerateContentResponse = await chat.sendMessage({ message });
    return response.text;
  } catch (error) {
    console.error("Error sending message to Gemini:", error);
    return "I'm having a little trouble connecting right now. Please try again in a moment.";
  }
};

export const analyzeMood = async (checkin: {
  feeling: number;
  activities: string[];
  triggers: string[];
  notes: string;
}): Promise<MoodAnalysisResult | null> => {
  try {
    const prompt = `You are a wellness assistant. Based on the user's mood check-in, analyze their overall state. Provide a concise, descriptive name for their mood (e.g., "Peacefully Productive", "Slightly Overwhelmed", "Joyfully Social") and a numerical score from 1 to 10, where 1 is very low and 10 is excellent.
Consider all inputs:
- Initial feeling score (1-10): ${checkin.feeling}
- Recent activities: ${checkin.activities.join(', ') || 'None'}
- Potential triggers: ${checkin.triggers.join(', ') || 'None'}
- Notes: "${checkin.notes || 'No notes provided.'}"
Return only the JSON object.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            moodName: {
              type: Type.STRING,
              description: "A concise, descriptive name for the user's mood."
            },
            moodScore: {
              type: Type.NUMBER,
              description: "A numerical score from 1 to 10 representing the mood."
            }
          },
          required: ["moodName", "moodScore"],
        }
      },
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as MoodAnalysisResult;

  } catch (error) {
    console.error("Error analyzing mood:", error);
    return null;
  }
};

export const analyzeSentiment = async (text: string): Promise<SentimentAnalysisResult | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Analyze the sentiment of the following journal entry and provide a one-sentence summary of the user's likely feelings. Categorize the sentiment as 'Positive', 'Negative', or 'Neutral'. Entry: "${text}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sentiment: {
              type: Type.STRING,
              enum: [Sentiment.Positive, Sentiment.Negative, Sentiment.Neutral],
              description: 'The overall sentiment of the text.'
            },
            summary: {
              type: Type.STRING,
              description: "A one-sentence summary of the user's feelings."
            }
          },
          required: ["sentiment", "summary"],
        }
      },
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as SentimentAnalysisResult;

  } catch (error) {
    console.error("Error analyzing sentiment:", error);
    return null;
  }
};

export const generateBookContent = async (title: string, author: string, language: string): Promise<BookContentResult | null> => {
  try {
    const prompt = `Generate a detailed, multi-part summary in ${language} for the book "${title}" by ${author}. The goal is to simulate reading the book's key ideas. Structure the response as an array of 3-4 chapters. Each chapter should have a title and several paragraphs of content, capturing the essence of that part of the book. The content should be well-written and engaging, as if it's from a detailed book summary.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: {
                type: Type.STRING,
                description: `The title of the chapter, in ${language}.`
              },
              content: {
                type: Type.STRING,
                description: `The detailed content of the chapter, several paragraphs long, in ${language}.`
              }
            },
            required: ["title", "content"]
          }
        }
      },
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as BookContentResult;

  } catch (error) {
    console.error(`Error generating content for "${title}":`, error);
    return null;
  }
};
