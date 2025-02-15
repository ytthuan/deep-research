<<<<<<< Updated upstream
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
  
=======
<<<<<<<< Updated upstream:src/utils/token-trimmer.ts

import { getEncoding } from 'js-tiktoken';
import { RecursiveCharacterTextSplitter } from './text-splitter';    
========
import { getEncoding } from 'js-tiktoken';
import { RecursiveCharacterTextSplitter } from './text-splitter';
import { geminiFlashModel } from '../libs/gemini';
// import { o3MiniModel } from '../libs/openai-config';


// Gemini model types

// export async function geminiModel(prompt: string) {
//   return await geminiFlashModel(prompt);
// }

// export async function generateWithO3Mini(prompt: string) {
//   return await o3MiniModel(prompt);
// }

>>>>>>>> Stashed changes:src/ai/aihub.ts
const MinChunkSize = 140;
const encoder = getEncoding('o200k_base');

// trim prompt to maximum context size
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
  // on average it's 3 characters per token, so multiply by 3 to get a rough estimate of the number of characters
  const chunkSize = prompt.length - overflowTokens * 3;
  if (chunkSize < MinChunkSize) {
    return prompt.slice(0, MinChunkSize);
  }

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize,
    chunkOverlap: 0,
  });
  const trimmedPrompt = splitter.splitText(prompt)[0] ?? '';

  // last catch, there's a chance that the trimmed prompt is same length as the original prompt, due to how tokens are split & innerworkings of the splitter, handle this case by just doing a hard cut
  if (trimmedPrompt.length === prompt.length) {
    return trimPrompt(prompt.slice(0, chunkSize), contextSize);
  }

  // recursively trim until the prompt is within the context size
  return trimPrompt(trimmedPrompt, contextSize);
<<<<<<<< Updated upstream:src/utils/token-trimmer.ts
}
========
} 
>>>>>>>> Stashed changes:src/ai/aihub.ts
>>>>>>> Stashed changes
