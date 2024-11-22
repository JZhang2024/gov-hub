import React, { useState } from 'react';
import { Bot, User, Loader2, FileText, X, Book } from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAssistantStore, MAX_CONTRACTS } from '@/lib/stores/assistant-store';
import { formatDate } from '@/lib/utils/format-data';

const quickQuestions = [
  "Compare these contracts",
  "When are these due?",
  "Which ones are set-aside?",
  "Compare requirements"
];

export default function ContractAssistant() {
  const {
    contextContracts,
    messages,
    isLoading,
    isPanelOpen,
    removeContract,
    addMessage,
    setIsLoading,
    togglePanel,
    setIsPanelOpen
  } = useAssistantStore();
  
  const [input, setInput] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || contextContracts.length === 0) return;

    // Add user message
    addMessage({ role: 'user', content: input });
    setInput('');
    setIsLoading(true);

    try {
      // Create context objects for each contract
      const contractContexts = contextContracts.map(contract => ({
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
      }));

      // In production, this would be an API call to your AI endpoint
      // For now, we'll simulate a response
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const response = simulateResponse(input, contractContexts);
      addMessage({ role: 'assistant', content: response });
    } catch (error) {
      addMessage({
        role: 'assistant',
        content: "I apologize, but I encountered an error processing your question. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const simulateResponse = (question: string, contexts: any[]): string => {
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
    
    if (q.includes('deadline') || q.includes('due')) {
      return contexts.map(c => 
        `${c.title}: Due ${formatDate(c.responseDeadline)}`
      ).join('\n');
    }

    if (q.includes('set-aside') || q.includes('setaside')) {
      return contexts.map(c => 
        `${c.title}: ${c.setAside.description || 'No set-aside'}`
      ).join('\n');
    }

    if (q.includes('requirement')) {
      return "I can analyze the requirements for these contracts. Would you like me to compare specific aspects like technical requirements, qualifications, or delivery terms?";
    }

    return `I can help analyze these contracts. Would you like me to:\n\n` +
           `• Compare their basic details\n` +
           `• Check deadlines and important dates\n` +
           `• Analyze set-aside requirements\n` +
           `• Look at specific requirements`;
  };

  return (
    <>
      {/* Floating Button */}
      <Button
        onClick={togglePanel}
        className="fixed bottom-6 right-6 bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition-colors z-50"
        size="icon"
      >
        <Bot className="h-6 w-6" />
      </Button>

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
            <Button 
              variant="ghost"
              size="icon"
              onClick={() => setIsPanelOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Context Display */}
          <div className="p-4 bg-blue-50 border-b">
            <div className="flex items-center gap-2 mb-2 text-sm text-blue-700">
              <Book className="h-4 w-4" />
              <span>Current Context</span>
              <span className="bg-blue-100 px-2 py-0.5 rounded-full">
                {contextContracts.length}/{MAX_CONTRACTS} max
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
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeContract(contract.noticeId)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
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
                <Button
                  key={question}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setInput(question);
                    document.getElementById('qa-input')?.focus();
                  }}
                  className="text-sm"
                >
                  {question}
                </Button>
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
              <Button
                type="submit"
                disabled={!input.trim() || isLoading || contextContracts.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                Send
                <Bot className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}