import { GoogleGenerativeAI } from '@google/generative-ai';
import { SkincareType } from '../components/SkincareApp';
import { ChatUserProfile } from '../components/ChatInterface';

export interface AIStructuredResponse {
    info: string;
    products: string[];
    precautions: string[];
    plans: string[];
    tips: string[];
    dietPlan?: {
        breakfast: string;
        lunch: string;
        dinner: string;
        snack: string;
    };
}

export const generateGeminiResponse = async (
    apiKey: string,
    query: string,
    mode: SkincareType,
    userProfile: ChatUserProfile | null
): Promise<AIStructuredResponse> => {
    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        const userContext = userProfile
            ? `User Profile: Skin Type: ${userProfile.skinType}, Concerns: ${userProfile.concerns.join(', ')}.`
            : 'User Profile: Unknown.';

        const systemPrompt = `
      You are an expert AI Skincare Consultant specializing in ${mode === 'ayurvedic' ? 'Ayurvedic and holistic' : 'modern dermatological and scientific'} treatments.
      
      User Query: "${query}"
      ${userContext}
      
      Task: Provide a detailed, structured skincare plan based on the user's query and the selected mode (${mode}).
      
      Response Format:
      You MUST return ONLY a valid JSON object with the following fields:
      - info: A concise summary of the condition and the ${mode} approach to treating it.
      - products: An array of strings listing recommended ${mode === 'ayurvedic' ? 'herbs, oils, and natural remedies' : 'products and active ingredients'}.
      - precautions: An array of strings listing safety warnings, contraindications, or things to avoid.
      - plans: An array of strings outlining a simple morning and evening routine.
      - tips: An array of strings giving lifestyle or usage tips.
      - dietPlan: AN OBJECT with fields: breakfast, lunch, dinner, snack. Provide specific food recommendations tailored to their skin condition.
      
      Do not include markdown code blocks or any other text. Return ONLY the JSON object.
    `;

        const result = await model.generateContent(systemPrompt);
        const response = await result.response;
        const text = response.text();

        // Clean up potential markdown code blocks if the model includes them despite instructions
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

        return JSON.parse(cleanText) as AIStructuredResponse;
    } catch (error) {
        console.error('Error calling Gemini API:', error);
        throw new Error('Failed to generate response. Please check your API key and try again.');
    }
};
