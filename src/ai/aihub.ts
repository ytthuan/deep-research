import { google } from '@ai-sdk/google';
import { env } from '../config';
import { createVertex } from '@ai-sdk/google-vertex';
import { createOpenAI, type OpenAIProviderSettings } from '@ai-sdk/openai';
import { createAzure } from '@ai-sdk/azure';

interface CustomOpenAIProviderSettings extends OpenAIProviderSettings {
  baseURL?: string;
}
// Using vercel ai sdk, @ai-sdk/openai, @ai-sdk/google-vertex, @ai-sdk/google, @ai-sdk/azure
// AI hub providers
// OpenAI or OpenAI-compatible provider
const openai = createOpenAI({
  apiKey: process.env.OPENAI_KEY!,
  baseURL: process.env.OPENAI_ENDPOINT || 'https://api.openai.com/v1',
} as CustomOpenAIProviderSettings);

const customModel = process.env.OPENAI_MODEL || 'o3-mini';

export const o3MiniModel = openai(customModel, {
  reasoningEffort: customModel.startsWith('o') ? 'medium' : undefined,
  structuredOutputs: true,
});

// Azure provider
const azure = createAzure({
  apiKey: env.AZURE_OPENAI_KEY!,
  resourceName: env.AZURE_OPENAI_RESOURCE_NAME!,
});

export const azureModel = azure(env.AZURE_OPENAI_DEPLOYMENT);

// Google Vertex AI provider

const vertex = createVertex({
  project: env.GOOGLE_PROJECT_ID, // optional
  location: env.GOOGLE_LOCATION, // optional
});  

export const vertexModel = vertex('gemini-2.0-pro-exp-02-05',{
    
  safetySettings: [
    { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
    { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
    { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
    { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
    { category: 'HARM_CATEGORY_CIVIC_INTEGRITY', threshold: 'BLOCK_ONLY_HIGH' },
  ]
});



export const geminiFlashModel = google(env.GEMINI_MODEL || 'gemini-2.0-flash-exp',   
    {
      safetySettings: [
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
        { category: 'HARM_CATEGORY_CIVIC_INTEGRITY', threshold: 'BLOCK_ONLY_HIGH' },
      ]
    }
  );
  
