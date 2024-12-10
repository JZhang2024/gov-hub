import { Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { StreamingMessageProps } from '@/types/assistant-types';

export const StreamingMessage = ({ content, isStreaming }: StreamingMessageProps) => {
  return (
    <div className="prose prose-sm max-w-none">
      <ReactMarkdown className="whitespace-pre-wrap font-sans">
        {content}
      </ReactMarkdown>
      {isStreaming && (
        <div className="inline-flex items-center gap-2 mt-2 text-blue-600">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Thinking...</span>
        </div>
      )}
    </div>
  );
};