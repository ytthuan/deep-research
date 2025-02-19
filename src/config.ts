import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

// Validate required environment variables, change to firecrawl and remove all google search keys if you want to use it
const requiredEnvVars = [
//   'OPENAI_KEY',
//   'GEMINI_API_KEY',
  // 'FIRECRAWL_KEY',
  'JINA',
  'GOOGLE_SEARCH_API',
  'GOOGLE_CX',
  'GOOGLE_PROJECT_ID',
  'GOOGLE_LOCATION',
] as const;

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

// Export environment variables with types
export const env = {
  OPENAI_KEY: process.env.OPENAI_KEY || '',
  OPENAI_MODEL: process.env.OPENAI_MODEL || 'gpt-4o',
  OPENAI_ENDPOINT: process.env.OPENAI_ENDPOINT || 'https://api.openai.com/v1',
  GOOGLE_GENERATIVE_AI_API_KEY: process.env.GOOGLE_GENERATIVE_AI_API_KEY || '',
  GEMINI_MODEL: process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp',
  GOOGLE_SEARCH_API: process.env.GOOGLE_SEARCH_API || '',
  GOOGLE_CX: process.env.GOOGLE_CX || '',
  GOOGLE_PROJECT_ID: process.env.GOOGLE_PROJECT_ID || '',
  GOOGLE_LOCATION: process.env.GOOGLE_LOCATION || '',
  FIRECRAWL_KEY: process.env.FIRECRAWL_KEY || '',
  FIRECRAWL_BASE_URL: process.env.FIRECRAWL_BASE_URL || '',
  CONTEXT_SIZE: Number(process.env.CONTEXT_SIZE) || 128_000,
  AZURE_OPENAI_RESOURCE_NAME: process.env.AZURE_OPENAI_RESOURCE_NAME || '',
  AZURE_OPENAI_KEY: process.env.AZURE_OPENAI_KEY || '',
  AZURE_OPENAI_DEPLOYMENT: process.env.AZURE_OPENAI_DEPLOYMENT || '',
  JINA: process.env.JINA || '',
} as const; 
