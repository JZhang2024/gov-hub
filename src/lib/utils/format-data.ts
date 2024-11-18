import { Contract, SAMContractData} from '@/types/contracts';

export function formatContractData(samData: SAMContractData): Contract {
  return {
    id: samData.opportunityId,
    title: samData.title,
    agency: samData.agency.name,
    value: samData.contractValue 
      ? `$${samData.contractValue.amount.toLocaleString()}` 
      : 'Not Specified',
    posted: new Date(samData.postedDate).toISOString(),
    deadline: new Date(samData.responseDeadLine).toISOString(),
    status: 'Active', // You might want to determine this based on dates or other fields
    type: samData.type || samData.baseType,
    setAside: samData.setAside || 'None',
    description: samData.description
  };
}