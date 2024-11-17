import { Search, Filter, Download } from 'lucide-react';
import { SearchBarProps } from '@/types/contracts';

const SearchBar = ({ onSearch, onFilter, onExport }: SearchBarProps) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8 flex flex-wrap gap-4 items-center border border-gray-100">
      <div className="flex-1 min-w-[300px] relative">
        <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search contracts..."
          onChange={(e) => onSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
      </div>
      
      <button 
        onClick={onFilter}
        className="flex items-center gap-2 px-6 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <Filter className="h-5 w-5 text-gray-500" />
        Filters
      </button>
      
      <button 
        onClick={onExport}
        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
      >
        <Download className="h-5 w-5" />
        Export
      </button>
    </div>
  );
};

export default SearchBar;