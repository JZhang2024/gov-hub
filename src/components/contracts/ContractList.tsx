'use client';

import { useState, useEffect } from 'react';
import { ArrowDownWideNarrow } from 'lucide-react';
import ContractHeader from './ContractHeader';
import SearchBar from './SearchBar';
import ContractRow from './ContractRow';
import PaginationControls from './PaginationControls';
import FilterDialog from './FilterDialog';
import { getContracts } from '@/lib/supabase/contracts';
import type { Contract, SearchFilters } from '@/types/contracts';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const ITEMS_PER_PAGE = 25;

export default function ContractList() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});

  useEffect(() => {
    const fetchContracts = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const { data, count, error } = await getContracts(currentPage, ITEMS_PER_PAGE, {
          search: searchQuery || undefined,
          sortOrder,
          filters,
        });
        
        if (error) throw error;
        
        setContracts(data);
        setTotalItems(count);
      } catch (err) {
        setError((err as Error).message);
        setContracts([]);
        setTotalItems(0);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(fetchContracts, searchQuery ? 300 : 0);
    return () => clearTimeout(timer);
  }, [currentPage, searchQuery, sortOrder, filters]);

  const handlePageChange = (page: number) => {
    setExpandedId(null);
    setCurrentPage(page);
    document.getElementById('contract-list-top')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
    setExpandedId(null);
  };

  const handleSortChange = () => {
    const newOrder = sortOrder === 'desc' ? 'asc' : 'desc';
    setSortOrder(newOrder);
    setCurrentPage(1);
    setExpandedId(null);
  };

  const handleFilter = () => {
    setShowFilters(true);
  };

  const handleApplyFilters = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
    setExpandedId(null);
  };

  const handleClearFilters = () => {
    setFilters({});
    setCurrentPage(1);
    setExpandedId(null);
  };

  const handleExport = () => {
    // TODO: Implement export
    console.log('Export clicked');
  };

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalItems);

  // Helper to format filter badge text
  const getFilterCount = () => {
    let count = 0;
    if (filters.type?.length) count += filters.type.length;
    if (filters.setAside?.length) count += filters.setAside.length;
    if (filters.status?.length) count += filters.status.length;
    if (filters.dateRange?.start || filters.dateRange?.end) count += 1;
    if (filters.valueRange?.min || filters.valueRange?.max) count += 1;
    return count;
  };

  const filterCount = getFilterCount();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-8">
      <ContractHeader />
      
      <SearchBar 
        onSearch={handleSearch}
        onFilter={handleFilter}
        onExport={handleExport}
        filterCount={filterCount}
      />

      <Card id="contract-list-top" className="overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-white p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-r-transparent"></div>
                  Loading contracts...
                </div>
              ) : error ? (
                <span className="text-red-600">Error: {error}</span>
              ) : (
                <div className="space-y-1">
                  <div className="font-medium">
                    Showing {startIndex + 1}-{endIndex} of {totalItems} opportunities
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    {searchQuery && (
                      <div>
                        Search: "{searchQuery}"
                      </div>
                    )}
                    {filterCount > 0 && (
                      <div className="flex items-center gap-2">
                        <span>•</span>
                        <Button
                          variant="link"
                          size="sm"
                          className="h-auto p-0 text-xs"
                          onClick={handleClearFilters}
                        >
                          Clear {filterCount} filter{filterCount !== 1 ? 's' : ''}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {!error && contracts.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Sort by date:</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSortChange}
                  className="gap-2"
                  disabled={isLoading}
                >
                  <ArrowDownWideNarrow className={`h-4 w-4 transition-transform ${
                    sortOrder === 'asc' ? 'rotate-180' : ''
                  }`} />
                  {sortOrder === 'desc' ? 'Newest first' : 'Oldest first'}
                </Button>
              </div>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <div className="mt-4 text-gray-500">Loading contracts...</div>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <div className="text-red-500 font-medium mb-2">Unable to load contracts</div>
            <div className="text-sm text-gray-500">{error}</div>
          </div>
        ) : contracts.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-gray-500 font-medium mb-2">No contracts found</div>
            {(searchQuery || filterCount > 0) && (
              <div className="text-sm text-gray-500">
                Try adjusting your search terms or filters
              </div>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {contracts.map((contract) => (
              <ContractRow
                key={contract.noticeId}
                contract={contract}
                isExpanded={expandedId === contract.noticeId}
                onToggle={() => setExpandedId(
                  expandedId === contract.noticeId ? null : contract.noticeId
                )}
              />
            ))}
          </div>
        )}

        {!isLoading && !error && contracts.length > 0 && (
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            startIndex={startIndex}
            endIndex={endIndex}
            totalItems={totalItems}
            onPageChange={handlePageChange}
          />
        )}
      </Card>

      <FilterDialog 
        open={showFilters}
        onClose={() => setShowFilters(false)}
        initialFilters={filters}
        onApplyFilters={handleApplyFilters}
        isLoading={isLoading}
      />
    </div>
  );
}