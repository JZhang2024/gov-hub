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
  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(Number(amount));
  };

  return (
    <div className="p-6 bg-gradient-to-b from-blue-50 to-white border-t border-blue-100">
      <Card className="bg-white shadow-lg border-0">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl mb-2 text-blue-900">{contract.title}</CardTitle>
              <div className="text-sm text-gray-500 font-mono">Notice ID: {contract.noticeId}</div>
              {contract.solicitationNumber && (
                <div className="text-sm text-gray-500">Solicitation #: {contract.solicitationNumber}</div>
              )}
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
              <dt className="text-gray-500 mb-1">Department</dt>
              <dd className="font-medium text-gray-900">{contract.department}</dd>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <dt className="text-gray-500 mb-1">Sub-Tier</dt>
              <dd className="font-medium text-gray-900">{contract.subTier}</dd>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <dt className="text-gray-500 mb-1">Office</dt>
              <dd className="font-medium text-gray-900">{contract.office}</dd>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <dt className="text-gray-500 mb-1">Contract Value</dt>
              <dd className="font-medium text-gray-900">
                {contract.award ? formatCurrency(contract.award.amount) : 'Not Awarded'}
              </dd>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <dt className="text-gray-500 mb-1">Type</dt>
              <dd className="font-medium text-gray-900">{contract.type}</dd>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <dt className="text-gray-500 mb-1">Set-Aside</dt>
              <dd className="font-medium text-gray-900">{contract.typeOfSetAsideDescription || 'None'}</dd>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <dt className="text-gray-500 mb-1">Posted Date</dt>
              <dd className="font-medium text-gray-900">{contract.postedDate}</dd>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <dt className="text-gray-500 mb-1">Response Deadline</dt>
              <dd className="font-medium text-red-600">{contract.responseDeadLine || 'N/A'}</dd>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <dt className="text-gray-500 mb-1">NAICS Code</dt>
              <dd className="font-medium text-gray-900">{contract.naicsCode}</dd>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <dt className="text-gray-500 mb-1">Classification Code</dt>
              <dd className="font-medium text-gray-900">{contract.classificationCode}</dd>
            </div>
            {contract.award && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <dt className="text-gray-500 mb-1">Award Details</dt>
                <dd className="font-medium text-gray-900">
                  <div>Awardee: {contract.award.awardee.name}</div>
                  <div>Award #: {contract.award.number}</div>
                  <div>Date: {contract.award.date}</div>
                </dd>
              </div>
            )}
            {contract.pointOfContact && contract.pointOfContact.length > 0 && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <dt className="text-gray-500 mb-1">Point of Contact</dt>
                <dd className="font-medium text-gray-900">
                  <div>{contract.pointOfContact[0].fullName}</div>
                  <div>{contract.pointOfContact[0].title}</div>
                  <div>{contract.pointOfContact[0].email}</div>
                  <div>{contract.pointOfContact[0].phone}</div>
                </dd>
              </div>
            )}
            <div className="col-span-2 p-4 bg-gray-50 rounded-lg">
              <dt className="text-gray-500 mb-1">Description</dt>
              <dd className="font-medium text-gray-900">{contract.description}</dd>
            </div>
            <div className="col-span-2 p-4 bg-gray-50 rounded-lg">
              <dt className="text-gray-500 mb-1">Place of Performance</dt>
              <dd className="font-medium text-gray-900">
                <div>{contract.placeOfPerformance.streetAddress}</div>
                <div>
                  {contract.placeOfPerformance.city.name}, {contract.placeOfPerformance.state.code} {contract.placeOfPerformance.zip}
                </div>
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContractCard;