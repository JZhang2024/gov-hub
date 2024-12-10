import { Contract } from '@/types/contracts';
import { ContractContext, DocumentSummary } from '@/types/assistant-types';
import { summarizeDocuments } from '@/lib/utils/document-summary';

export async function createContractContext(contract: Contract): Promise<ContractContext> {
  let documentSummaries: DocumentSummary[] = [];
  
  if (contract.resourceLinks?.length) {
    const documents = contract.resourceLinks.map(url => ({
      url,
      noticeId: contract.noticeId
    }));

    const summaries = await summarizeDocuments(documents);
    
    documentSummaries = summaries
      .filter(result => result.summary !== null)
      .map(({ url, summary }) => ({
        url,
        summary: summary!
      }));
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
    documents: documentSummaries.length ? documentSummaries : undefined
  };
}