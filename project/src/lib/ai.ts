import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GOOGLE_AI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

export interface AIResponse {
  text: string;
  error?: string;
}

export async function generateCode(prompt: string): Promise<AIResponse> {
  try {
    const result = await model.generateContent(`Generate code for the following: ${prompt}. 
    Return only the code without any explanations or markdown formatting.`);
    const response = result.response;
    return { text: response.text() };
  } catch (error) {
    console.error('Error generating code:', error);
    return { 
      text: '', 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}

export async function generateDesignSuggestions(prompt: string): Promise<AIResponse> {
  try {
    const result = await model.generateContent(`Generate design suggestions for: ${prompt}. 
    Provide specific CSS properties and values that would work well.`);
    const response = result.response;
    return { text: response.text() };
  } catch (error) {
    console.error('Error generating design suggestions:', error);
    return { 
      text: '', 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}

export async function generateContent(prompt: string): Promise<AIResponse> {
  try {
    const result = await model.generateContent(`Generate website content for: ${prompt}. 
    Provide well-structured, engaging content suitable for a website.`);
    const response = result.response;
    return { text: response.text() };
  } catch (error) {
    console.error('Error generating content:', error);
    return { 
      text: '', 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}

export async function optimizeLayout(currentLayout: string): Promise<AIResponse> {
  try {
    const result = await model.generateContent(`Optimize this website layout: ${currentLayout}. 
    Suggest improvements for better user experience, accessibility, and visual hierarchy.`);
    const response = result.response;
    return { text: response.text() };
  } catch (error) {
    console.error('Error optimizing layout:', error);
    return { 
      text: '', 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}

export async function convertNaturalLanguageToCode(prompt: string): Promise<AIResponse> {
  try {
    const result = await model.generateContent(`Convert this natural language description to HTML and CSS code: ${prompt}. 
    Return only the code without any explanations.`);
    const response = result.response;
    return { text: response.text() };
  } catch (error) {
    console.error('Error converting natural language to code:', error);
    return { 
      text: '', 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}

export async function suggestTemplates(requirements: string): Promise<AIResponse> {
  try {
    const result = await model.generateContent(`Based on these requirements: ${requirements}, 
    suggest 3-5 website templates that would be suitable. For each template, provide a name, 
    brief description, and key features.`);
    const response = result.response;
    return { text: response.text() };
  } catch (error) {
    console.error('Error suggesting templates:', error);
    return { 
      text: '', 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}