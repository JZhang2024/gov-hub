import React from 'react';
import { Plus, Bot, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AddToAssistantButtonProps {
  /** The unique identifier of the contract */
  contractId: string;
  /** Whether the contract is currently added to the assistant's context */
  isAdded?: boolean;
  /** Callback function when adding a contract to context */
  onAdd: (contractId: string) => void;
  /** Callback function when removing a contract from context */
  onRemove: (contractId: string) => void;
  /** Whether the button should be disabled (e.g., when max contracts reached) */
  disabled?: boolean;
  /** Additional CSS classes to apply to the button */
  className?: string;
}

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