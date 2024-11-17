'use client';

import { useState, useMemo } from 'react';
import ContractHeader from './ContractHeader';
import SearchBar from './SearchBar';
import ContractRow from './ContractRow';
import Pagination from './Pagination';
import { generateMockContracts } from '@/lib/mock-data';

const ContractList = () => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  
  const contracts = useMemo(() => generateMockContracts(30), []);

  const filteredContracts = useMemo(() => {
    return contracts.filter(contract => 
      contract.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contract.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contract.agency.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [contracts, searchQuery]);

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredContracts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentContracts = filteredContracts.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setExpandedId(null);
    setCurrentPage(page);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
    setExpandedId(null);
  };

  const handleFilter = () => {
    console.log('Filter clicked');
    // Implement filter functionality
  };

  const handleExport = () => {
    console.log('Export clicked');
    // Implement export functionality
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-8">
      <ContractHeader />
      
      <SearchBar 
        onSearch={handleSearch}
        onFilter={handleFilter}
        onExport={handleExport}
      />

      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-12 gap-4 p-4 bg-gradient-to-r from-gray-50 to-white border-b text-sm font-medium text-gray-600">
          <div className="col-span-5 pl-2">Contract Details</div>
          <div className="col-span-2">Agency</div>
          <div className="col-span-2">Value</div>
          <div className="col-span-2">Deadline</div>
          <div className="col-span-1">Status</div>
        </div>

        {currentContracts.map((contract) => (
          <ContractRow
            key={contract.id}
            contract={contract}
            isExpanded={expandedId === contract.id}
            onToggle={() => setExpandedId(expandedId === contract.id ? null : contract.id)}
          />
        ))}

        {currentContracts.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No contracts found matching your search criteria
          </div>
        )}

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          startIndex={startIndex}
          endIndex={endIndex}
          totalItems={filteredContracts.length}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default ContractList