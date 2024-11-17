import { X } from 'lucide-react';
import { Contract } from '@/types/contracts';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ContractCardProps {
  contract: Contract;
  onClose: () => void;
}

const ContractCard = ({ contract, onClose }: ContractCardProps) => {
  return (
    <div className="p-6 bg-gradient-to-b from-blue-50 to-white border-t border-blue-100">
      <Card className="bg-white shadow-lg border-0">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl mb-2 text-blue-900">{contract.title}</CardTitle>
              <div className="text-sm text-gray-500 font-mono">ID: {contract.id}</div>
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-6 text-sm">
            <div className="p-4 bg-gray-50 rounded-lg">
              <dt className="text-gray-500 mb-1">Agency</dt>
              <dd className="font-medium text-gray-900">{contract.agency}</dd>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <dt className="text-gray-500 mb-1">Contract Value</dt>
              <dd className="font-medium text-gray-900">{contract.value}</dd>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <dt className="text-gray-500 mb-1">Type</dt>
              <dd className="font-medium text-gray-900">{contract.type}</dd>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <dt className="text-gray-500 mb-1">Set-Aside</dt>
              <dd className="font-medium text-gray-900">{contract.setAside}</dd>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <dt className="text-gray-500 mb-1">Posted Date</dt>
              <dd className="font-medium text-gray-900">{contract.posted}</dd>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <dt className="text-gray-500 mb-1">Deadline</dt>
              <dd className="font-medium text-red-600">{contract.deadline}</dd>
            </div>
            <div className="col-span-2 p-4 bg-gray-50 rounded-lg">
              <dt className="text-gray-500 mb-1">Description</dt>
              <dd className="font-medium text-gray-900">{contract.description}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContractCard;