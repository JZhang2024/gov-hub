export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  id?: string;
  isStreaming?: boolean;
}

export type DocumentStatus = {
  status: 'processing' | 'completed' | 'error' | 'unsupported';
  processedCount?: number;
  documentCount?: number;
  message?: string;
};

export type DocumentStatuses = Record<string, DocumentStatus>;

export type DocumentProcessingResult = {
  url: string;
  summary: string | null;
  status: 'success' | 'unsupported' | 'error';
  message?: string;
};

export type DocumentSummary = {
  url: string;
  summary: string;
};

export interface ContractContext {
  title: string;
  id: string;
  solicitationNumber?: string;
  department?: string;
  type: string;
  postedDate: string;
  responseDeadline: string | null;
  setAside: {
    type: string | null;
    description: string | null;
  };
  naicsCode: string;
  status: string;
  amount?: string;
  placeOfPerformance: string;
  description?: string;
  documents?: DocumentSummary[];
}

export interface AIRequestBody {
  messages: AIMessage[];
  context: ContractContext[];
}

export interface StreamingMessageProps {
  content: string;
  isStreaming: boolean;
}

export const SYSTEM_PROMPT = `You are a friendly and knowledgeable AI assistant helping to analyze government contracts.
Adapt your response style to the question:
- For simple questions, give direct, conversational answers
- For complex analyses, provide clear structure while maintaining a natural tone
- Maintain context from previous questions to avoid repetition
- Acknowledge limitations naturally without being overly formal
Remember that you're having a conversation, not writing a report.`;

export const QUICK_QUESTIONS = [
  "Compare these contracts",
  "When are these due?",
  "Which ones are set-aside?",
  "Compare requirements",
  "Summarize the attached documents"
] as const;

// Helper to format contract context for LLM
export const formatContractContext = (contracts: ContractContext[]): string => {
  return contracts.map((contract, index) => `
Contract ${index + 1}: ${contract.title}
ID: ${contract.id}
Type: ${contract.type}
Department: ${contract.department || 'Not specified'}
Posted Date: ${contract.postedDate}
Response Deadline: ${contract.responseDeadline || 'Not specified'}
Set-aside: ${contract.setAside.description || 'None'}
NAICS Code: ${contract.naicsCode}
Status: ${contract.status}
Value: ${contract.amount || 'Not specified'}
Location: ${contract.placeOfPerformance}
${contract.description ? `Description: ${contract.description}` : ''}
${contract.documents?.length ? `\nAttached Documents:\n${contract.documents.map(doc => 
  `- ${doc.url}\n  Summary: ${doc.summary}`
).join('\n')}` : ''}
  `).join('\n\n');
};

// Helper to create initial system message with context
export const createSystemMessage = (contracts: ContractContext[]): AIMessage => ({
  role: 'system',
  content: `${SYSTEM_PROMPT}

You have access to the following contract details:

${formatContractContext(contracts)}
Remember: Limit your analysis and responses to ONLY the contract information provided above. Do not reference any contracts or their associated documents that were removed even if mentioned in previous messages.`
});