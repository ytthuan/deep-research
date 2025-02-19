import { ConversationHistory, DomainContext, UserProfile } from '@/types/feedback';

export function analyzeExistingKnowledge(history: ConversationHistory | undefined) {
  if (!history) return new Set<string>();
  
  const knownInfo = new Set<string>();
  history.responses.forEach(response => {
    // Simple keyword extraction - could be improved with NLP
    const keywords = response.toLowerCase().match(/\b\w+\b/g) || [];
    keywords.forEach(keyword => knownInfo.add(keyword));
  });
  
  return knownInfo;
}

export function identifyKnowledgeGaps(
  context: DomainContext | undefined,
  knownInfo: Set<string>
) {
  if (!context) return new Set<string>();
  
  const gaps = new Set<string>();
  context.requiredKnowledge.forEach(item => {
    if (!knownInfo.has(item.toLowerCase())) {
      gaps.add(item);
    }
  });
  
  return gaps;
}

export function buildContext(
  userProfile?: UserProfile,
  knownInfo?: Set<string>,
  gaps?: Set<string>
): string {
  const contextParts = [];
  
  if (userProfile) {
    contextParts.push(`User Expertise: ${userProfile.expertiseLevel}`);
    contextParts.push(`Domain: ${userProfile.domain.join(', ')}`);
  }
  
  if (knownInfo?.size) {
    contextParts.push(`Known Information: ${Array.from(knownInfo).join(', ')}`);
  }
  
  if (gaps?.size) {
    contextParts.push(`Knowledge Gaps: ${Array.from(gaps).join(', ')}`);
  }
  
  return contextParts.join('\n');
} 