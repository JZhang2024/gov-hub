import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Contract } from '@/types/contracts';
import type { AIMessage, DocumentStatus } from '@/types/assistant-types';
import { createContractContext } from '@/lib/utils/contract-context';

const MAX_CONTEXT_CONTRACTS = 5;
const MAX_MESSAGE_HISTORY = 50;

interface AssistantState {
  contextContracts: Contract[];
  messages: AIMessage[];
  isLoading: boolean;
  isPanelOpen: boolean;
  hasReachedLimit: boolean;
  documentStatus: Record<string, DocumentStatus>;
  
  addContract: (contract: Contract) => void;
  removeContract: (contractId: string) => void;
  clearContext: () => void;
  addMessage: (message: AIMessage) => void;
  clearMessages: () => void;
  setIsLoading: (loading: boolean) => void;
  togglePanel: () => void;
  setIsPanelOpen: (open: boolean) => void;
  setDocumentStatus: (contractId: string, status: DocumentStatus) => void;
}

// Custom storage object that uses window.sessionStorage
const customStorage = {
  getItem: (name: string): string | null => {
    if (typeof window === 'undefined') return null;
    try {
      return window.sessionStorage.getItem(name);
    } catch (e) {
      console.error('Error reading from sessionStorage:', e);
      return null;
    }
  },
  
  setItem: (name: string, value: string): void => {
    if (typeof window === 'undefined') return;
    try {
      window.sessionStorage.setItem(name, value);
    } catch (e) {
      console.error('Error writing to sessionStorage:', e);
    }
  },

  removeItem: (name: string): void => {
    if (typeof window === 'undefined') return;
    try {
      window.sessionStorage.removeItem(name);
    } catch (e) {
      console.error('Error removing from sessionStorage:', e);
    }
  }
};

export const useAssistantStore = create<AssistantState>()(
  persist(
    (set, get) => ({
      contextContracts: [],
      messages: [{
        role: 'assistant',
        content: 'Hello! I can help you analyze contracts. Add contracts to the context by clicking the "Add to Assistant" button on any contract.'
      }],
      isLoading: false,
      isPanelOpen: false,
      hasReachedLimit: false,
      documentStatus: {},

      addContract: async (contract) => {
        const { contextContracts, documentStatus } = get();
        
        if (contextContracts.length >= MAX_CONTEXT_CONTRACTS) {
          console.warn('Maximum context limit reached');
          return;
        }
        
        if (contextContracts.some(c => c.noticeId === contract.noticeId)) {
          // If we already have stored status for this contract, don't reset it
          if (documentStatus[contract.noticeId]) {
            return;
          }
        }

        // First update state with new contract
        set((state) => ({
          contextContracts: [...state.contextContracts, contract],
          messages: [
            ...state.messages,
            {
              role: 'assistant',
              content: `Added "${contract.title}" to the context. ${
                contract.resourceLinks?.length 
                  ? 'Processing attached documents...' 
                  : 'You can now ask questions about this contract.'
              }`
            }
          ],
          hasReachedLimit: state.contextContracts.length + 1 >= MAX_CONTEXT_CONTRACTS,
          documentStatus: contract.resourceLinks?.length ? {
            ...state.documentStatus,
            [contract.noticeId]: {
              status: 'processing',
              documentCount: contract.resourceLinks.length,
              processedCount: 0
            }
          } : state.documentStatus
        }));

        // Then start document processing if needed
        if (contract.resourceLinks?.length) {
          try {
            await createContractContext(contract);
          } catch (error) {
            console.error('Error processing contract documents:', error);
            set((state) => ({
              documentStatus: {
                ...state.documentStatus,
                [contract.noticeId]: {
                  status: 'error',
                  documentCount: contract.resourceLinks?.length || 0,
                  message: error instanceof Error ? error.message : 'Unknown error'
                }
              }
            }));
          }
        }
      },

      removeContract: (contractId) => set((state) => {
        const { documentStatus, ...stateRest } = state;
        const { ...remainingStatus } = documentStatus;
        
        // Find the contract title before removing it
        const contract = state.contextContracts.find(c => c.noticeId === contractId);
        const title = contract?.title || contractId;
        
        return {
          ...stateRest,
          contextContracts: state.contextContracts.filter(c => c.noticeId !== contractId),
          messages: [
            ...state.messages,
            {
              role: 'assistant',
              content: `Removed "${title}" from the context.`
            }
          ],
          hasReachedLimit: false,
          documentStatus: remainingStatus
        };
      }),

      setDocumentStatus: (contractId, status) => set((state) => ({
        documentStatus: {
          ...state.documentStatus,
          [contractId]: status
        }
      })),

      clearContext: () => set({
        contextContracts: [],
        messages: [{
          role: 'assistant',
          content: 'Cleared all contracts from the context.'
        }],
        hasReachedLimit: false,
        documentStatus: {}
      }),

      addMessage: (message) => set((state) => {
        const messages = [...state.messages, message];
        if (messages.length > MAX_MESSAGE_HISTORY) {
          return {
            messages: [
              messages[0],
              ...messages.slice(-MAX_MESSAGE_HISTORY + 1)
            ]
          };
        }
        return { messages };
      }),

      clearMessages: () => set({
        messages: [{
          role: 'assistant',
          content: 'Hello! I can help you analyze contracts. Add contracts to the context by clicking the "Add to Assistant" button on any contract.'
        }]
      }),

      setIsLoading: (loading) => set({ isLoading: loading }),
      togglePanel: () => set((state) => ({ isPanelOpen: !state.isPanelOpen })),
      setIsPanelOpen: (open) => set({ isPanelOpen: open })
    }),
    {
      name: 'contract-assistant-storage',
      storage: createJSONStorage(() => customStorage),
      partialize: (state) => ({
        contextContracts: state.contextContracts,
        messages: state.messages,
        isPanelOpen: state.isPanelOpen,
        documentStatus: state.documentStatus
      }),
      version: 1
    }
  )
);

// Helper hooks
export const useIsContractInContext = (contractId: string) => {
  return useAssistantStore(
    (state) => state.contextContracts.some(c => c.noticeId === contractId)
  );
};

export const useRemainingContextSlots = () => {
  return useAssistantStore(
    (state) => MAX_CONTEXT_CONTRACTS - state.contextContracts.length
  );
};

export const MAX_CONTRACTS = MAX_CONTEXT_CONTRACTS;