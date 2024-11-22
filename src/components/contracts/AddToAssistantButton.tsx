import React from 'react';
import { Plus, Bot, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AddToAssistantButtonProps } from '@/types/contracts';

const AddToAssistantButton: React.FC<AddToAssistantButtonProps> = ({ 
  contractId,
  isAdded = false,
  onAdd,
  onRemove,
  disabled = false,
  className = ''
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // Prevent row expansion
    if (isAdded) {
      onRemove(contractId);
    } else {
      onAdd(contractId);
    }
  };

  return (
    <Button
      onClick={handleClick}
      variant="ghost"
      size="sm"
      disabled={disabled && !isAdded}
      className={`
        flex items-center gap-1.5 h-8
        ${isAdded ? 'text-green-600 hover:text-green-700 hover:bg-green-50' : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'}
        ${className}
      `}
    >
      {isAdded ? (
        <>
          <Check className="h-4 w-4" />
          Added to Assistant
        </>
      ) : (
        <>
          <Plus className="h-4 w-4" />
          <Bot className="h-4 w-4" />
          Add to Assistant
        </>
      )}
    </Button>
  );
};

export default AddToAssistantButton;