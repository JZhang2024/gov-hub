import { Contract } from '@/types/contracts';
import { ContractContext, DocumentSummary, DocumentProcessingResult } from '@/types/assistant-types';
import { summarizeDocuments } from '@/lib/utils/document-summary';
import { useAssistantStore } from '@/lib/stores/assistant-store';

export async function createContractContext(contract: Contract): Promise<ContractContext> {
  const { setDocumentStatus } = useAssistantStore.getState();
  let documentSummaries: DocumentSummary[] = [];
  
  if (contract.resourceLinks?.length) {
    const documents = contract.resourceLinks.map(url => ({
      url,
      noticeId: contract.noticeId
    }));

    try {
      const results = await summarizeDocuments(
        documents,
        (processedCount, result) => {
          // Update processing status for each document
          const status = result.status === 'success' ? 'processing' : result.status;
          setDocumentStatus(contract.noticeId, {
            status,
            processedCount,
            documentCount: documents.length,
            message: result.message
          });
        }
      );
      
      // Process results
      const successful = results.filter(r => r.status === 'success');
      const unsupported = results.filter(r => r.status === 'unsupported');
      const errors = results.filter(r => r.status === 'error');

      // Determine final status
      if (successful.length === 0) {
        const finalStatus = unsupported.length > errors.length ? 'unsupported' : 'error';
        const message = unsupported.length > 0 
          ? 'Document types not yet supported for AI analysis'
          : 'Failed to process documents';
          
        setDocumentStatus(contract.noticeId, {
          status: finalStatus,
          documentCount: documents.length,
          message
        });
      } else {
        setDocumentStatus(contract.noticeId, {
          status: 'completed',
          documentCount: successful.length,
          message: unsupported.length > 0 
            ? `Processed ${successful.length} documents. Some document types not supported.`
            : undefined
        });
      }

      // Extract summaries from successful results
      documentSummaries = results
        .filter((result): result is DocumentProcessingResult & { summary: string } => 
          result.status === 'success' && result.summary !== null
        )
        .map(({ url, summary }) => ({
          url,
          summary
        }));

    } catch (error) {
      setDocumentStatus(contract.noticeId, {
        status: 'error',
        documentCount: documents.length,
        message: error instanceof Error ? error.message : 'Failed to process documents'
      });
    }
  }

  return {
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
    placeOfPerformance: `${contract.placeOfPerformance.city.name}, ${contract.placeOfPerformance.state.code}`,
    documents: documentSummaries.length > 0 ? documentSummaries : undefined
  };
}