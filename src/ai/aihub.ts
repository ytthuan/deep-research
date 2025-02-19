import { google } from '@ai-sdk/google';
import { env } from '../config';
import { createVertex } from '@ai-sdk/google-vertex';
import { createOpenAI, type OpenAIProviderSettings } from '@ai-sdk/openai';
import { createAzure } from '@ai-sdk/azure';
import { getEncoding } from 'js-tiktoken';
import { RecursiveCharacterTextSplitter } from '../utils/text-splitter';

interface CustomOpenAIProviderSettings extends OpenAIProviderSettings {
  baseURL?: string;
}

// AI hub providers
// OpenAI or OpenAI-compatible provider
const openai = createOpenAI({
  apiKey: process.env.OPENAI_KEY!,
  baseURL: process.env.OPENAI_ENDPOINT || 'https://api.openai.com/v1',
} as CustomOpenAIProviderSettings);

const customModel = process.env.OPENAI_MODEL || 'gpt-4o';

export const o1MiniModel = openai(customModel, {
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
  project: env.GOOGLE_PROJECT_ID,
  location: env.GOOGLE_LOCATION,
});  

export const vertexModel = vertex('gemini-2.0-pro-exp-02-05', {
  safetySettings: [
    { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
    { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
    { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
    { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
    { category: 'HARM_CATEGORY_CIVIC_INTEGRITY', threshold: 'BLOCK_ONLY_HIGH' },
  ]
});

// Gemini Flash model
export const geminiFlashModel = google(env.GEMINI_MODEL || 'gemini-2.0-flash-exp', {
  safetySettings: [
    { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
    { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
    { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
    { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
    { category: 'HARM_CATEGORY_CIVIC_INTEGRITY', threshold: 'BLOCK_ONLY_HIGH' },
  ]
});

// Token handling utilities
const MinChunkSize = 140;
const encoder = getEncoding('o200k_base');

export function trimPrompt(
  prompt: string,
  contextSize = Number(process.env.CONTEXT_SIZE) || 128_000,
) {
  if (!prompt) {
    return '';
  }

  const length = encoder.encode(prompt).length;
  if (length <= contextSize) {
    return prompt;
  }

  const overflowTokens = length - contextSize;
  const chunkSize = prompt.length - overflowTokens * 3;
  if (chunkSize < MinChunkSize) {
    return prompt.slice(0, MinChunkSize);
  }

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize,
    chunkOverlap: 0,
  });
  const trimmedPrompt = splitter.splitText(prompt)[0] ?? '';

  if (trimmedPrompt.length === prompt.length) {
    return trimPrompt(prompt.slice(0, chunkSize), contextSize);
  }

  return trimPrompt(trimmedPrompt, contextSize);
}
