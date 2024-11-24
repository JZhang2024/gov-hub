import React from 'react';
import { Plus, Bot, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AddToAssistantButtonProps } from '@/types/contracts';
import { useAssistantStore, useIsContractInContext } from '@/lib/stores/assistant-store';

const AddToAssistantButton: React.FC<AddToAssistantButtonProps> = ({ 
  contract,
  disabled = false,
  className = ''
}) => {
  const isInContext = useIsContractInContext(contract.noticeId);
  const { addContract, removeContract } = useAssistantStore();
  
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // Prevent row expansion
    
    if (isInContext) {
      removeContract(contract.noticeId);
    } else {
      addContract(contract);
    }
  };

  return (
    <Button
      onClick={handleClick}
      variant="ghost"
      size="sm"
      disabled={disabled && !isInContext}
      className={`
        flex items-center gap-1.5 h-8
        ${isInContext ? 'text-green-600 hover:text-green-700 hover:bg-green-50' : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'}
        ${className}
      `}
    >
      {isInContext ? (
        <>
          <Check className="h-4 w-4" />
          Added to AI Context
        </>
      ) : (
        <>
          <Plus className="h-4 w-4" />
          <Bot className="h-4 w-4" />
          Add to AI Context
        </>
      )}
    </Button>
  );
};

export default AddToAssistantButton;