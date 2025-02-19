export type QuestionCategory = 'clarification' | 'technical' | 'background' | 'goals' | 'constraints';

export interface FeedbackQuestion {
  question: string;
  category: QuestionCategory;
  priority: number;
  purpose: string;
  expectedInsight: string;
}

export interface UserProfile {
  expertiseLevel: 'beginner' | 'intermediate' | 'expert';
  domain: string[];
  previousInteractions: number;
}

export interface ConversationHistory {
  questions: FeedbackQuestion[];
  responses: string[];
  timestamp: Date;
}

export interface DomainContext {
  requiredKnowledge: string[];
  keyTerms: string[];
  commonMisconceptions: string[];
} 