import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Contract, ContractContext } from '@/types/contracts';

const MAX_CONTEXT_CONTRACTS = 5;

interface AssistantState {
  // State
  contextContracts: Contract[];
  messages: {
    role: 'assistant' | 'user';
    content: string;
  }[];
  isLoading: boolean;
  isPanelOpen: boolean;

  // Computed
  hasReachedLimit: boolean;
  
  // Actions
  addContract: (contract: Contract) => void;
  removeContract: (contractId: string) => void;
  clearContext: () => void;
  addMessage: (message: { role: 'assistant' | 'user'; content: string }) => void;
  clearMessages: () => void;
  setIsLoading: (loading: boolean) => void;
  togglePanel: () => void;
  setIsPanelOpen: (open: boolean) => void;
}

export const useAssistantStore = create<AssistantState>()(
  persist(
    (set, get) => ({
      // Initial state
      contextContracts: [],
      messages: [{
        role: 'assistant',
        content: 'Hello! I can help you analyze contracts. Add contracts to the context by clicking the "Add to Assistant" button on any contract.'
      }],
      isLoading: false,
      isPanelOpen: false,

      // Computed properties
      get hasReachedLimit() {
        return get().contextContracts.length >= MAX_CONTEXT_CONTRACTS;
      },

      // Actions
      addContract: (contract) => set((state) => {
        if (state.contextContracts.length >= MAX_CONTEXT_CONTRACTS) {
          console.warn('Maximum context limit reached');
          return state;
        }
        
        // Check if contract is already in context
        if (state.contextContracts.some(c => c.noticeId === contract.noticeId)) {
          return state;
        }

        return {
          contextContracts: [...state.contextContracts, contract],
          messages: [
            ...state.messages,
            {
              role: 'assistant',
              content: `Added "${contract.title}" to the context. You can now ask questions about this contract.`
            }
          ]
        };
      }),

      removeContract: (contractId) => set((state) => ({
        contextContracts: state.contextContracts.filter(c => c.noticeId !== contractId),
        messages: [
          ...state.messages,
          {
            role: 'assistant',
            content: `Removed contract ${contractId} from the context.`
          }
        ]
      })),

      clearContext: () => set((state) => ({
        contextContracts: [],
        messages: [
          ...state.messages,
          {
            role: 'assistant',
            content: 'Cleared all contracts from the context.'
          }
        ]
      })),

      addMessage: (message) => set((state) => ({
        messages: [...state.messages, message]
      })),

      clearMessages: () => set((state) => ({
        messages: [{
          role: 'assistant',
          content: 'Hello! I can help you analyze contracts. Add contracts to the context by clicking the "Add to Assistant" button on any contract.'
        }]
      })),

      setIsLoading: (loading) => set({ isLoading: loading }),

      togglePanel: () => set((state) => ({ 
        isPanelOpen: !state.isPanelOpen 
      })),

      setIsPanelOpen: (open) => set({ isPanelOpen: open }),
    }),
    {
      name: 'assistant-storage',
      partialize: (state) => ({
        contextContracts: state.contextContracts,
        messages: state.messages
      })
    }
  )
);

// Helper hook for checking if a contract is in context
export const useIsContractInContext = (contractId: string) => {
  return useAssistantStore(
    (state) => state.contextContracts.some(c => c.noticeId === contractId)
  );
};

// Helper hook for getting the remaining context slots
export const useRemainingContextSlots = () => {
  return useAssistantStore(
    (state) => MAX_CONTEXT_CONTRACTS - state.contextContracts.length
  );
};

export const MAX_CONTRACTS = MAX_CONTEXT_CONTRACTS;