import React, { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Bot, User, Loader2, FileText, X, Book } from 'lucide-react';

interface Contract {
  noticeId: string;
  title: string;
  solicitationNumber?: string;
  fullParentPathName?: string;
  type: string;
  postedDate: string;
  responseDeadLine: string | null;
  typeOfSetAside: string | null;
  typeOfSetAsideDescription: string | null;
  naicsCode: string;
  active: string;
  award?: {
    amount: string;
  } | null;
  placeOfPerformance: {
    city: {
      name: string;
    };
    state: {
      code: string;
    };
  };
}

interface Message {
  role: 'assistant' | 'user';
  content: string;
}

interface ContractContext {
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
}

const MAX_CONTEXT_CONTRACTS = 5;

const ContractAssistant = () => {
  const [contextContracts, setContextContracts] = useState<Contract[]>([]);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I can help you analyze contracts. Add contracts to the context by clicking the "Add to Assistant" button on any contract.'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const createContractContext = useCallback((contract: Contract): ContractContext => {
    return {
      title: contract.title,
      id: contract.noticeId,
      solicitationNumber: contract.solicitationNumber,
      department: contract.fullParentPathName,
      type: contract.type,
      postedDate: contract.postedDate,
      responseDeadline: contract.responseDeadLine,
      setAside: {
        type: contract.typeOfSetAside,
        description: contract.typeOfSetAsideDescription
      },
      naicsCode: contract.naicsCode,
      status: contract.active === 'Yes' ? 'Active' : 'Inactive',
      amount: contract.award?.amount,
      placeOfPerformance: `${contract.placeOfPerformance.city.name}, ${contract.placeOfPerformance.state.code}`
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || contextContracts.length === 0) return;

    setMessages(prev => [...prev, { role: 'user', content: input }]);
    setInput('');
    setIsLoading(true);

    try {
      // In production, this would be an API call to your LLM endpoint
      const contractContexts = contextContracts.map(createContractContext);
      console.log('Sending to LLM:', { contexts: contractContexts, userQuestion: input });

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const response = simulateResponse(input, contractContexts);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I apologize, but I encountered an error processing your question. Please try again."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const simulateResponse = (question: string, contexts: ContractContext[]): string => {
    const q = question.toLowerCase();
    
    if (contexts.length === 0) {
      return "Please add some contracts to the context first so I can help analyze them.";
    }

    if (q.includes('compare') || q.includes('difference')) {
      return `Comparing ${contexts.length} contracts:\n\n` +
             contexts.map(c => 
               `${c.title}:\n` +
               `• Posted: ${formatDate(c.postedDate)}\n` +
               `• Type: ${c.type}\n` +
               `• Set-aside: ${c.setAside.description || 'None'}\n`
             ).join('\n');
    }
    
    if (q.includes('deadline')) {
      return contexts.map(c => 
        `${c.title}: Due ${formatDate(c.responseDeadline)}`
      ).join('\n');
    }

    return `I can help analyze these contracts. Would you like me to compare them, check deadlines, or analyze specific aspects?`;
  };

  const quickQuestions = [
    "Compare these contracts",
    "When are these due?",
    "Which ones are set-aside?",
    "Compare requirements"
  ];

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsPanelOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition-colors z-50"
      >
        <Bot className="h-6 w-6" />
      </button>

      {/* Sliding Panel */}
      <div 
        className={`fixed right-0 top-0 bottom-0 w-96 bg-white shadow-lg transform transition-transform duration-200 ease-in-out z-50 ${
          isPanelOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-4 border-b flex items-center justify-between bg-gradient-to-r from-blue-50 to-white">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-blue-600" />
              <h2 className="font-semibold">Contract Assistant</h2>
            </div>
            <button 
              onClick={() => setIsPanelOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Context Display */}
          <div className="p-4 bg-blue-50 border-b">
            <div className="flex items-center gap-2 mb-2 text-sm text-blue-700">
              <Book className="h-4 w-4" />
              <span>Current Context</span>
              <span className="bg-blue-100 px-2 py-0.5 rounded-full">
                {contextContracts.length}/{MAX_CONTEXT_CONTRACTS} max
              </span>
            </div>
            <div className="space-y-2">
              {contextContracts.map((contract) => (
                <div 
                  key={contract.noticeId}
                  className="flex items-center justify-between bg-white p-2 rounded-lg shadow-sm"
                >
                  <div className="text-sm truncate">
                    <div className="font-medium">{contract.title}</div>
                    <div className="text-gray-500">Posted: {formatDate(contract.postedDate)}</div>
                  </div>
                  <button
                    onClick={() => setContextContracts(prev => 
                      prev.filter(c => c.noticeId !== contract.noticeId)
                    )}
                    className="p-1 hover:bg-red-50 rounded-full text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {contextContracts.length === 0 && (
                <div className="text-sm text-gray-500 bg-white p-3 rounded-lg">
                  No contracts added. Click "Add to Assistant" on any contract to analyze it.
                </div>
              )}
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${
                  message.role === 'assistant' ? 'justify-start' : 'justify-end'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-blue-600" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-xl p-3 ${
                    message.role === 'assistant'
                      ? 'bg-white border shadow-sm'
                      : 'bg-blue-600 text-white'
                  }`}
                >
                  <pre className="whitespace-pre-wrap font-sans">{message.content}</pre>
                </div>
                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-blue-600" />
                </div>
                <div className="max-w-[80%] rounded-xl p-3 bg-white border shadow-sm">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              </div>
            )}
          </div>

          {/* Quick Questions */}
          <div className="p-4 border-t bg-gray-50">
            <div className="text-sm text-gray-500 mb-2">Quick Questions:</div>
            <div className="flex flex-wrap gap-2">
              {quickQuestions.map((question) => (
                <button
                  key={question}
                  onClick={() => {
                    setInput(question);
                    document.getElementById('qa-input')?.focus();
                  }}
                  className="px-3 py-1 rounded-full bg-white border hover:bg-blue-50 text-sm transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>

          {/* Input Area */}
          <div className="p-4 border-t">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <div className="flex-1 relative">
                <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  id="qa-input"
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={contextContracts.length === 0 ? "Add contracts to begin..." : "Ask about these contracts..."}
                  disabled={contextContracts.length === 0}
                  className="w-full pl-11 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              </div>
              <button
                type="submit"
                disabled={!input.trim() || isLoading || contextContracts.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                Send
                <Bot className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContractAssistant;