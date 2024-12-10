import { AlertCircle, CheckCircle2, FileQuestion, Loader2 } from 'lucide-react';
import { DocumentStatus } from '@/types/assistant-types';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export default function DocumentProcessingStatus({ 
  status,
  processedCount,
  documentCount,
  message
}: DocumentStatus) {
  const content = (() => {
    switch (status) {
      case 'processing':
        return (
          <span className="text-blue-600 flex items-center gap-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            Processing documents {processedCount && documentCount ? 
              `(${processedCount} of ${documentCount})` : 
              '...'}
          </span>
        );
        
      case 'completed':
        return (
          <span className="text-green-600 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Documents processed {documentCount ? `(${documentCount})` : ''}
          </span>
        );
        
      case 'error':
        return (
          <span className="text-red-600 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Document processing failed
          </span>
        );
        
      case 'unsupported':
        return (
          <span className="text-amber-600 flex items-center gap-1">
            <FileQuestion className="h-3 w-3" />
            Unsupported document type
          </span>
        );
    }
  })();

  // If there's a message, wrap in tooltip
  if (message) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          {content}
        </TooltipTrigger>
        <TooltipContent>
          <p>{message}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return content;
}