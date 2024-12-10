import { useState, useRef } from 'react';
import { Bot, User, FileText, X, Book, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAssistantStore, MAX_CONTRACTS } from '@/lib/stores/assistant-store';
import { formatDate } from '@/lib/utils/format-data';
import { 
  AIRequestBody,
  QUICK_QUESTIONS,
  AIMessage
} from '@/types/assistant-types';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { TooltipProvider } from "@/components/ui/tooltip";
import { StreamingMessage } from './StreamingMessage';
import { createContractContext } from '@/lib/utils/contract-context';
import DocumentProcessingStatus from './DocumentProcessingStatus';

export default function ContractAssistant() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const {
    contextContracts,
    messages,
    isLoading,
    isPanelOpen,
    removeContract,
    addMessage,
    updateMessage,
    setIsLoading,
    togglePanel,
    setIsPanelOpen,
    documentStatus
  } = useAssistantStore();
  
  const [input, setInput] = useState('');
  const [isContextExpanded, setIsContextExpanded] = useState(true);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async (content: string) => {
    if (!content.trim() || contextContracts.length === 0) return;
    
    const userMessage: AIMessage = { role: 'user', content: content.trim() };
    setInput('');
    setIsLoading(true);

    try {
      const contractContextPromises = contextContracts.map(createContractContext);
      const contractContexts = await Promise.all(contractContextPromises);

      // Add user message first
      addMessage(userMessage);
      scrollToBottom();

      // Create temporary message for streaming
      const tempMessageId = Date.now().toString();
      addMessage({ 
        role: 'assistant', 
        content: '', 
        id: tempMessageId,
        isStreaming: true 
      });

      const requestBody: AIRequestBody = {
        messages: [...messages, userMessage],
        context: contractContexts
      };

      const response = await fetch('/api/contract-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      let accumulatedContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            if (data === '[DONE]') {
              // Update final message and remove streaming flag
              updateMessage(tempMessageId, accumulatedContent, false);
              scrollToBottom();
              break;
            }

            try {
              const { content } = JSON.parse(data);
              accumulatedContent += content;
              // Update streaming message with accumulated content
              updateMessage(tempMessageId, accumulatedContent, true);
            } catch (e) {
              console.error('Error parsing SSE data:', e);
            }
          }
        }
      }

    } catch (error) {
      console.error('Error in handleSend:', error);
      addMessage({
        role: 'assistant',
        content: "I apologize, but I encountered an error processing your question. Please try again."
      });
      scrollToBottom();
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(input);
    }
  };

  return (
    <TooltipProvider>
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
        className={`fixed right-0 top-0 bottom-0 w-96 bg-white shadow-lg transform transition-transform duration-200 ease-in-out z-40 ${
          isPanelOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <style jsx global>{`
          body {
            transition: padding-right 0.2s ease-in-out;
            padding-right: ${isPanelOpen ? '384px' : '0'} !important;
          }
        `}</style>
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

          {/* Collapsible Context Display */}
          <Collapsible
            open={isContextExpanded}
            onOpenChange={setIsContextExpanded}
            className="bg-blue-50 border-b"
          >
            <CollapsibleTrigger asChild>
              <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-blue-100/50 transition-colors">
                <div className="flex items-center gap-2 text-sm text-blue-700">
                  <Book className="h-4 w-4" />
                  <span>Current Context</span>
                  <span className="bg-blue-100 px-2 py-0.5 rounded-full">
                    {contextContracts.length}/{MAX_CONTRACTS}
                  </span>
                </div>
                <ChevronDown className={`h-4 w-4 text-blue-700 transition-transform ${isContextExpanded ? 'rotate-180' : ''}`} />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="p-4 pt-0 space-y-2">
                {contextContracts.map((contract) => (
                  <div 
                    key={contract.noticeId}
                    className="flex items-center justify-between bg-white p-2 rounded-lg shadow-sm"
                  >
                    <div className="text-sm truncate">
                      <div className="font-medium">{contract.title}</div>
                      <div className="text-gray-500">Posted: {formatDate(contract.postedDate)}</div>
                      {contract.resourceLinks && contract.resourceLinks.length > 0 && documentStatus[contract.noticeId] && (
                        <div className="text-xs mt-1">
                          <DocumentProcessingStatus {...documentStatus[contract.noticeId]} />
                        </div>
                      )}
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
                    No contracts added. Click &quot;Add to Assistant&quot; on any contract to analyze it.
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={message.id || index}
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
                      ? 'bg-white border shadow-sm prose prose-sm'
                      : 'bg-blue-600 text-white'
                  }`}
                >
                  {message.role === 'assistant' ? (
                    <StreamingMessage 
                      content={message.content} 
                      isStreaming={message.isStreaming || false} 
                    />
                  ) : (
                    <div className="whitespace-pre-wrap font-sans">
                      {message.content}
                    </div>
                  )}
                </div>
                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          <div className="p-4 border-t bg-gray-50">
            <div className="text-sm text-gray-500 mb-2">Quick Questions:</div>
            <div className="flex flex-wrap gap-2">
              {QUICK_QUESTIONS.map((question) => (
                <Button
                  key={question}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (contextContracts.length > 0) {
                      handleSend(question);
                    }
                  }}
                  disabled={contextContracts.length === 0}
                  className="text-sm"
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>

          {/* Input Area */}
          <div className="p-4 border-t">
            <form onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }} className="flex gap-2">
              <div className="flex-1 relative">
                <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  id="qa-input"
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
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
    </TooltipProvider>
  );
}