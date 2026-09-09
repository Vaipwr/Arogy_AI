import { GoogleGenerativeAI } from "@google/generative-ai";
import { SkincareType } from "../components/SkincareApp";
import { StructuredResponse } from "./mockAiService";
import { SKINCARE_KNOWLEDGE_CONTEXT } from "../data/skincareKnowledge";

// Initialize the API using the Vite env variable
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "");

export const generateRealResponse = async (
  query: string,
  mode: SkincareType
): Promise<StructuredResponse> => {
  if (!import.meta.env.VITE_GEMINI_API_KEY) {
    throw new Error("API key is missing. Please add VITE_GEMINI_API_KEY to your .env.local file.");
  }

  // Use the gemini-2.5-flash model which is available on your account
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `
You are an expert Skincare Assistant. 
The user is asking a question related to their skincare.
  
User Question: "${query}"
Mode (Ayurvedic or Generic): "${mode}"
  
CONTEXT KNOWLEDGE BASE:
${SKINCARE_KNOWLEDGE_CONTEXT}
  
Based on the context and the user's question, provide a detailed skincare response.
You MUST return ONLY a valid JSON object with EXACTLY the following structure, and nothing else. Do not format as markdown. 
Ensure the JSON is strictly correctly formatted:
{
  "info": "A 2-3 sentence explanation or general advice",
  "products": ["Product 1", "Product 2", "Product 3"],
  "precautions": ["Precaution 1", "Precaution 2"],
  "plans": ["Morning routine step-by-step", "Evening routine step-by-step"],
  "tips": ["Tip 1", "Tip 2", "Tip 3"],
  "dietPlan": {
    "breakfast": "Breakfast recommendation",
    "lunch": "Lunch recommendation",
    "dinner": "Dinner recommendation",
    "snack": "Snack recommendation"
  }
}
`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // Clean up potential markdown code blocks returned by LLM
    const cleanText = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsedData = JSON.parse(cleanText) as StructuredResponse;
    
    // Validate output structure minimally to ensure the UI doesn't crash
    if (!parsedData.info || !Array.isArray(parsedData.products) || !Array.isArray(parsedData.precautions)) {
      throw new Error("Invalid output format from AI.");
    }
    
    return parsedData;
  } catch (error) {
    console.error("Error generating AI response:", error);
    throw error;
  }
};
