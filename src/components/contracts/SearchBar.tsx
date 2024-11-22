import { Search, Filter, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SearchBarProps } from '@/types/contracts';

const SearchBar = ({ onSearch, onFilter, onExport, filterCount }: SearchBarProps) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-4 mb-8 flex flex-wrap gap-4 items-center">
      <div className="flex-1 min-w-[300px] relative">
        <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search contracts..."
          onChange={(e) => onSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
      </div>
      
      <Button
        variant={filterCount > 0 ? "default" : "outline"}
        onClick={onFilter}
        className="gap-2"
      >
        <Filter className="h-4 w-4" />
        Filters
        {filterCount > 0 && (
          <Badge variant="secondary" className="ml-1">
            {filterCount}
          </Badge>
        )}
      </Button>
      
      <Button
        onClick={onExport}
        className="gap-2"
      >
        <Download className="h-4 w-4" />
        Export
      </Button>
    </div>
  );
};

export default SearchBar;