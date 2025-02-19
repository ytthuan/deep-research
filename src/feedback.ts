import { z } from 'zod';
import { vertexModel } from './ai/aihub';
import { systemPrompt } from './prompt';
import { generateObject } from 'ai';
import { 
  FeedbackQuestion, 
  UserProfile, 
  ConversationHistory, 
  DomainContext 
} from '@/types/feedback';
import { 
  analyzeExistingKnowledge, 
  identifyKnowledgeGaps, 
  buildContext 
} from '@/utils/analysisUtils';

const feedbackSchema = z.object({
  questions: z.array(z.object({
    question: z.string(),
    category: z.enum(['clarification', 'technical', 'background', 'goals', 'constraints']),
    priority: z.number().min(1).max(5),
    purpose: z.string(),
    expectedInsight: z.string()
  }))
});

export async function generateFeedback({
  query,
  numQuestions = 3,
  context = '',
  previousQuestions = [],
}: {
  query: string;
  numQuestions?: number;
  context?: string;
  previousQuestions?: FeedbackQuestion[];
}): Promise<FeedbackQuestion[]> {
  const userFeedback = await generateObject({
    model: vertexModel,
    system: systemPrompt(),
    prompt: `Given the following query from the user, generate strategic follow-up questions.
    
Context Information:
${context}

Previous questions asked: ${previousQuestions.map(q => q.question).join('\n')}

Query: <query>${query}</query>

Requirements:
1. Return maximum ${numQuestions} questions
2. Each question should target a different aspect
3. Prioritize questions that:
   - Clarify ambiguous terms
   - Identify specific use cases
   - Understand technical constraints
   - Explore user's background knowledge
   - Determine success criteria

Make sure each question is unique and provides value beyond previous questions.`,
    schema: feedbackSchema,
  });

  return userFeedback.object.questions;
}

export async function generateAdaptiveFeedback({
  query,
  userProfile,
  conversationHistory,
  domainContext,
  maxQuestions = 3
}: {
  query: string;
  userProfile?: UserProfile;
  conversationHistory?: ConversationHistory;
  domainContext?: DomainContext;
  maxQuestions?: number;
}): Promise<FeedbackQuestion[]> {
  // Analyze existing knowledge and gaps
  const knownInfo = analyzeExistingKnowledge(conversationHistory);
  const gaps = identifyKnowledgeGaps(domainContext, knownInfo);
  
  // Generate context-aware questions
  const questions = await generateFeedback({
    query,
    numQuestions: maxQuestions,
    context: buildContext(userProfile, knownInfo, gaps),
    previousQuestions: conversationHistory?.questions
  });

  // Sort questions by priority and limit to maxQuestions
  return questions
    .sort((a, b) => b.priority - a.priority)
    .slice(0, maxQuestions);
}

// Optional: Progressive questioning implementation
export async function progressiveQuestioning(
  query: string,
  maxIterations = 3
): Promise<FeedbackQuestion[]> {
  let allQuestions: FeedbackQuestion[] = [];
  let iteration = 0;
  
  while (iteration < maxIterations) {
    const newQuestions = await generateFeedback({
      query,
      previousQuestions: allQuestions,
      context: `Iteration ${iteration + 1} of ${maxIterations}`
    });
    
    allQuestions = [...allQuestions, ...newQuestions];
    
    // Stop if we have enough high-quality questions
    if (hasEnoughQuality(allQuestions)) break;
    
    iteration++;
  }
  
  return allQuestions;
}

function hasEnoughQuality(questions: FeedbackQuestion[]): boolean {
  // Implement logic to determine if we have enough quality questions
  const highPriorityQuestions = questions.filter(q => q.priority >= 4);
  return highPriorityQuestions.length >= 3;
}

// Alternative version that uses direct model interaction without JSON structure