import { ChevronDown, ChevronRight } from 'lucide-react';
import { ContractRowProps } from '@/types/contracts';
import ContractCard from './ContractCard';

const ContractRow = ({ contract, isExpanded, onToggle }: ContractRowProps) => {
  return (
    <div className="border-b last:border-b-0 transition-all">
      <div 
        className="grid grid-cols-12 gap-4 p-4 hover:bg-blue-50 cursor-pointer items-center transition-colors"
        onClick={onToggle}
      >
        <div className="col-span-5">
          <div className="flex items-start gap-2">
            {isExpanded ? 
              <ChevronDown className="h-5 w-5 mt-0.5 flex-shrink-0 text-blue-500" /> : 
              <ChevronRight className="h-5 w-5 mt-0.5 flex-shrink-0 text-gray-400" />
            }
            <div>
              <div className="font-medium text-gray-900 line-clamp-1 hover:text-blue-600 transition-colors">
                {contract.title}
              </div>
              <div className="text-sm text-gray-500 font-mono">{contract.id}</div>
            </div>
          </div>
        </div>
        <div className="col-span-2 text-sm">{contract.agency}</div>
        <div className="col-span-2 text-sm font-medium">{contract.value}</div>
        <div className="col-span-2 text-sm text-red-600 font-medium">{contract.deadline}</div>
        <div className="col-span-1">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            contract.status === 'Active' 
              ? 'bg-green-100 text-green-700 ring-1 ring-green-200' 
              : 'bg-yellow-100 text-yellow-700 ring-1 ring-yellow-200'
          }`}>
            {contract.status}
          </span>
        </div>
      </div>

      {isExpanded && <ContractCard contract={contract} onClose={onToggle} />}
    </div>
  );
};

export default ContractRow;