import AddToAssistantButton from '../assistant/AddToAssistantButton';
import { ChevronRight, Building2, DollarSign, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ContractRowProps } from '@/types/contracts';
import { formatCurrency, getStatusInfo } from '@/lib/utils/format-data';
import ContractDetails from './ContractDetails';

const ContractRow = ({ contract, isExpanded, onToggle }: ContractRowProps) => {
  // Parse department hierarchy from fullParentPathName
  const departments = contract.fullParentPathName?.split('.') || [];
  const mainDept = departments[0] || 'Unknown Department';
  const subDept = departments[1] || '';

  // Format award amount if available
  const awardAmount = contract.award?.amount;
  
  const status = getStatusInfo(contract);

  return (
    <div className="border-b last:border-b-0 transition-all">
      <div 
        className="p-4 hover:bg-blue-50 cursor-pointer transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-medium">{contract.title}</h3>
              <Badge variant="outline" className={status.className}>
                {status.label}
              </Badge>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                <div className="truncate">
                  <span className="font-medium">{mainDept}</span>
                  {subDept && (
                    <>
                      <ChevronRight className="inline h-3 w-3 mx-1" />
                      <span>{subDept}</span>
                    </>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                <span>{awardAmount ? formatCurrency(awardAmount) : 'No Value Specified'}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>
                  {contract.placeOfPerformance.city.name}, {contract.placeOfPerformance.state.code}
                </span>
              </div>
            </div>
          </div>
          <AddToAssistantButton
            contract={contract}  // Pass the full contract object
            disabled={false}
          />
        </div>
      </div>

      {isExpanded && <ContractDetails contract={contract} onClose={onToggle} />}
    </div>
  );
};

export default ContractRow;