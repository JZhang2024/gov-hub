import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Contract } from '@/types/contracts';
import type { AIMessage } from '@/types/assistant-types';
import { createContractContext } from '@/lib/utils/contract-context';

const MAX_CONTEXT_CONTRACTS = 5;
const MAX_MESSAGE_HISTORY = 50;

interface DocumentStatus {
  status: 'processing' | 'completed' | 'error';
  documentCount?: number;
  processedCount?: number;
}

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
      const item = window.sessionStorage.getItem(name);
      return item;
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
        set((state) => {
          if (state.contextContracts.length >= MAX_CONTEXT_CONTRACTS) {
            console.warn('Maximum context limit reached');
            return state;
          }
          
          if (state.contextContracts.some(c => c.noticeId === contract.noticeId)) {
            return state;
          }

          // Initialize document processing status
          if (contract.resourceLinks?.length) {
            const status: DocumentStatus = {
              status: 'processing',
              documentCount: contract.resourceLinks.length,
              processedCount: 0
            };
            state.documentStatus[contract.noticeId] = status;
          }

          // Start document processing
          createContractContext(contract).then(() => {
            set((state) => ({
              documentStatus: {
                ...state.documentStatus,
                [contract.noticeId]: {
                  status: 'completed',
                  documentCount: contract.resourceLinks?.length || 0,
                  processedCount: contract.resourceLinks?.length || 0
                }
              }
            }));
          }).catch((error) => {
            console.error('Error processing contract documents:', error);
            set((state) => ({
              documentStatus: {
                ...state.documentStatus,
                [contract.noticeId]: {
                  status: 'error',
                  documentCount: contract.resourceLinks?.length || 0,
                  processedCount: 0
                }
              }
            }));
          });

          return {
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
            hasReachedLimit: state.contextContracts.length + 1 >= MAX_CONTEXT_CONTRACTS
          };
        });
      },

      removeContract: (contractId) => set((state) => ({
        contextContracts: state.contextContracts.filter(c => c.noticeId !== contractId),
        messages: [
          ...state.messages,
          {
            role: 'assistant',
            content: `Removed contract ${contractId} from the context.`
          }
        ],
        hasReachedLimit: false,
        
      })),

      setDocumentStatus: (contractId, status) => set((state) => ({
        documentStatus: {
          ...state.documentStatus,
          [contractId]: status
        }
      })),

      clearContext: () => set((state) => ({
        contextContracts: [],
        messages: [
          ...state.messages,
          {
            role: 'assistant',
            content: 'Cleared all contracts from the context.'
          }
        ],
        hasReachedLimit: false
      })),

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

      togglePanel: () => set((state) => ({ 
        isPanelOpen: !state.isPanelOpen 
      })),

      setIsPanelOpen: (open) => set({ isPanelOpen: open }),
    }),
    {
      name: 'contract-assistant-storage',
      storage: createJSONStorage(() => customStorage),
      partialize: (state) => ({
        contextContracts: state.contextContracts,
        messages: state.messages,
        isPanelOpen: state.isPanelOpen
      }),
      // Added version key to handle storage schema updates
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