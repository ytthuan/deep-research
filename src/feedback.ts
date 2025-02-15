import { z } from 'zod';
import { vertexModel } from './ai/aihub';
import { systemPrompt } from './prompt';
import { generateObject } from 'ai';

export async function generateFeedback({
  query,
  numQuestions = 3,
}: {
  query: string;
  numQuestions?: number;
}) {
  // Use the flash-thinking model for analytical feedback
  const userFeedback = await generateObject({
    model: vertexModel,
    system: systemPrompt(),
    prompt: `Given the following query from the user, ask some follow up questions to clarify the research direction. Return a maximum of ${numQuestions} questions, but feel free to return less if the original query is clear: <query>${query}</query>`,
    schema: z.object({
      questions: z
        .array(z.string())
        .describe(
          `Follow up questions to clarify the research direction, max of ${numQuestions}`,
        ),
    }),
  });

  return userFeedback.object.questions.slice(0, numQuestions);

}

// Alternative version that uses direct model interaction without JSON structure