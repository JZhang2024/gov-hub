import { X } from 'lucide-react';
import { ContractCardProps } from '@/types/contracts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ContractCard = ({ contract, onClose }: ContractCardProps) => {
  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(Number(amount));
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    if (dateString.includes('T')) {
      // Handle ISO date with time
      return new Date(dateString).toLocaleString();
    }
    // Handle date only
    return new Date(dateString).toLocaleDateString();
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
            <div className="col-span-2 p-4 bg-gray-50 rounded-lg">
              <dt className="text-gray-500 mb-1">Department Path</dt>
              <dd className="font-medium text-gray-900">{contract.fullParentPathName}</dd>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <dt className="text-gray-500 mb-1">Contract Type</dt>
              <dd className="font-medium text-gray-900">{contract.type}</dd>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <dt className="text-gray-500 mb-1">Base Type</dt>
              <dd className="font-medium text-gray-900">{contract.baseType}</dd>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <dt className="text-gray-500 mb-1">Posted Date</dt>
              <dd className="font-medium text-gray-900">{formatDate(contract.postedDate)}</dd>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <dt className="text-gray-500 mb-1">Response Deadline</dt>
              <dd className="font-medium text-red-600">
                {contract.responseDeadLine ? formatDate(contract.responseDeadLine) : 'N/A'}
              </dd>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <dt className="text-gray-500 mb-1">Set-Aside</dt>
              <dd className="font-medium text-gray-900">{contract.typeOfSetAsideDescription || 'None'}</dd>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <dt className="text-gray-500 mb-1">Archive Info</dt>
              <dd className="font-medium text-gray-900">
                <div>Type: {contract.archiveType}</div>
                {contract.archiveDate && <div>Date: {formatDate(contract.archiveDate)}</div>}
              </dd>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <dt className="text-gray-500 mb-1">NAICS Code(s)</dt>
              <dd className="font-medium text-gray-900">
                {contract.naicsCodes?.join(', ') || contract.naicsCode}
              </dd>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <dt className="text-gray-500 mb-1">Classification Code</dt>
              <dd className="font-medium text-gray-900">{contract.classificationCode}</dd>
            </div>
            {contract.award && (
              <div className="col-span-2 p-4 bg-gray-50 rounded-lg">
                <dt className="text-gray-500 mb-1">Award Details</dt>
                <dd className="font-medium text-gray-900">
                  <div>Awardee: {contract.award.awardee.name}</div>
                  <div>Award #: {contract.award.number}</div>
                  <div>Date: {formatDate(contract.award.date)}</div>
                  <div>Amount: {formatCurrency(contract.award.amount)}</div>
                  <div>UEI: {contract.award.awardee.ueiSAM}</div>
                  <div className="mt-2">Location: {[
                    contract.award.awardee.location.streetAddress,
                    contract.award.awardee.location.city.name,
                    contract.award.awardee.location.state.code,
                    contract.award.awardee.location.zip
                  ].filter(Boolean).join(', ')}</div>
                </dd>
              </div>
            )}
            {contract.pointOfContact && contract.pointOfContact.length > 0 && (
              <div className="col-span-2 p-4 bg-gray-50 rounded-lg">
                <dt className="text-gray-500 mb-1">Points of Contact</dt>
                <dd className="font-medium text-gray-900 grid gap-4">
                  {contract.pointOfContact.map((poc, index) => (
                    <div key={index} className="border-t first:border-0 pt-4 first:pt-0">
                      <div className="font-semibold">{poc.type.charAt(0).toUpperCase() + poc.type.slice(1)} Contact</div>
                      <div>{poc.fullName}</div>
                      <div>{poc.title}</div>
                      <div>{poc.email}</div>
                      {poc.phone && <div>Phone: {poc.phone}</div>}
                      {poc.fax && <div>Fax: {poc.fax}</div>}
                    </div>
                  ))}
                </dd>
              </div>
            )}
            <div className="col-span-2 p-4 bg-gray-50 rounded-lg">
              <dt className="text-gray-500 mb-1">Place of Performance</dt>
              <dd className="font-medium text-gray-900">
                {contract.placeOfPerformance.streetAddress && (
                  <div>{contract.placeOfPerformance.streetAddress}</div>
                )}
                <div>
                  {contract.placeOfPerformance.city.name}, {contract.placeOfPerformance.state.code} {contract.placeOfPerformance.zip}
                </div>
                {contract.placeOfPerformance.country.name && (
                  <div>{contract.placeOfPerformance.country.name}</div>
                )}
              </dd>
            </div>
            {contract.resourceLinks && contract.resourceLinks.length > 0 && (
              <div className="col-span-2 p-4 bg-gray-50 rounded-lg">
                <dt className="text-gray-500 mb-1">Resource Links</dt>
                <dd className="font-medium text-gray-900">
                  <ul className="list-disc pl-4">
                    {contract.resourceLinks.map((link, index) => (
                      <li key={index}>
                        <a href={link} target="_blank" rel="noopener noreferrer" 
                           className="text-blue-600 hover:text-blue-800 underline">
                          Resource {index + 1}
                        </a>
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContractCard;