import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { 
  Clock, 
  Users, 
  FileText, 
  Award,
  FileJson,
  Building2,
  Download,
  ExternalLink,
  Mail,
  Phone
} from 'lucide-react';
import { Contract } from '@/types/contracts';
import { formatCurrency, formatDate } from '@/lib/utils/format-data';

interface ContractDetailProps {
  contract: Contract;
  onClose: () => void;
}

const ContractDetails = ({ contract, onClose }: ContractDetailProps) => {
  const [tab, setTab] = useState("overview");

  // Helper to format contact info display
  const formatContact = (poc: Contract['pointOfContact'][0]) => (
    <div className="space-y-1">
      <div className="font-medium">{poc.fullName}</div>
      {poc.title && <div className="text-gray-600">{poc.title}</div>}
      <div className="flex items-center gap-4">
        {poc.email && (
          <a href={`mailto:${poc.email}`} className="text-blue-600 hover:text-blue-700 flex items-center gap-1">
            <Mail className="h-4 w-4" />
            <span>Email</span>
          </a>
        )}
        {poc.phone && (
          <a href={`tel:${poc.phone}`} className="text-blue-600 hover:text-blue-700 flex items-center gap-1">
            <Phone className="h-4 w-4" />
            <span>Call</span>
          </a>
        )}
      </div>
    </div>
  );

  return (
    <div className="border-t">
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full border-b rounded-none">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="p-4 grid grid-cols-2 gap-4">
            <Card className="p-4 bg-gray-50">
              <div className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-600">
                <Clock className="h-4 w-4" />
                Key Dates
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Posted:</span>
                  <span className="font-medium">{formatDate(contract.postedDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Response Due:</span>
                  <span className="font-medium text-red-600">
                    {formatDate(contract.responseDeadLine || '')}
                  </span>
                </div>
                {contract.archiveDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Archive Date:</span>
                    <span className="font-medium">{formatDate(contract.archiveDate)}</span>
                  </div>
                )}
              </div>
            </Card>

            <Card className="p-4 bg-gray-50">
              <div className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-600">
                <Users className="h-4 w-4" />
                Set-Aside
              </div>
              <div className="space-y-2 text-sm">
                {contract.typeOfSetAsideDescription ? (
                  <>
                    <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
                      {contract.typeOfSetAside}
                    </Badge>
                    <div className="text-gray-600 mt-2">
                      {contract.typeOfSetAsideDescription}
                    </div>
                  </>
                ) : (
                  <div className="text-gray-600">No set-aside specified</div>
                )}
              </div>
            </Card>

            {contract.pointOfContact.length > 0 && (
              <Card className="p-4 bg-gray-50">
                <div className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-600">
                  <FileText className="h-4 w-4" />
                  Primary Contact
                </div>
                <div className="text-sm">
                  {formatContact(contract.pointOfContact[0])}
                </div>
              </Card>
            )}

            <Card className="p-4 bg-gray-50">
              <div className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-600">
                <Award className="h-4 w-4" />
                Classification
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">NAICS:</span>
                  <span className="font-medium">{contract.naicsCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Classification Code:</span>
                  <span className="font-medium">{contract.classificationCode}</span>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="details">
          <div className="p-4 space-y-6">
            <div>
              <h4 className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
                <FileJson className="h-4 w-4" />
                Contract Information
              </h4>
              <Card className="p-4 bg-gray-50">
                <dl className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-gray-600">Notice ID</dt>
                    <dd className="font-medium">{contract.noticeId}</dd>
                  </div>
                  {contract.solicitationNumber && (
                    <div>
                      <dt className="text-gray-600">Solicitation Number</dt>
                      <dd className="font-medium">{contract.solicitationNumber}</dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-gray-600">Type</dt>
                    <dd className="font-medium">{contract.type}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-600">Base Type</dt>
                    <dd className="font-medium">{contract.baseType}</dd>
                  </div>
                </dl>
              </Card>
            </div>

            {contract.award && (
              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  Award Information
                </h4>
                <Card className="p-4 bg-gray-50">
                  <dl className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <dt className="text-gray-600">Awardee</dt>
                      <dd className="font-medium">{contract.award.awardee.name}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-600">Award Date</dt>
                      <dd className="font-medium">{formatDate(contract.award.date)}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-600">Award Amount</dt>
                      <dd className="font-medium">{formatCurrency(contract.award.amount)}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-600">UEI</dt>
                      <dd className="font-medium">{contract.award.awardee.ueiSAM}</dd>
                    </div>
                  </dl>
                </Card>
              </div>
            )}

            <div>
              <h4 className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Location Information
              </h4>
              <Card className="p-4 bg-gray-50">
                <dl className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-gray-600">Office Address</dt>
                    <dd className="font-medium space-y-1">
                      <div>{contract.officeAddress.city}</div>
                      <div>{contract.officeAddress.state}, {contract.officeAddress.zipcode}</div>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-600">Place of Performance</dt>
                    <dd className="font-medium space-y-1">
                      <div>{contract.placeOfPerformance.city.name}</div>
                      <div>
                        {contract.placeOfPerformance.state.code}, {contract.placeOfPerformance.zip}
                      </div>
                    </dd>
                  </div>
                </dl>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="documents">
          <div className="p-4 space-y-4">
            {contract.resourceLinks && contract.resourceLinks.length > 0 ? (
              <Card className="divide-y">
                {contract.resourceLinks.map((link, index) => (
                  <div key={index} className="flex items-center justify-between p-4 hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <div>
                        <div className="font-medium">Resource {index + 1}</div>
                        <div className="text-sm text-gray-500">
                          Added {formatDate(contract.postedDate)}
                        </div>
                      </div>
                    </div>
                    <a 
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer" 
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Download className="h-5 w-5" />
                    </a>
                  </div>
                ))}
              </Card>
            ) : (
              <div className="text-center text-gray-500 py-8">
                No documents available
              </div>
            )}

            <div className="mt-4">
              <a 
                href={contract.uiLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                View on SAM.gov
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContractDetails;