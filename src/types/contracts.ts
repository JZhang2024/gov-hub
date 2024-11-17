export interface Contract {
    id: string;
    title: string;
    agency: string;
    value: string;
    posted: string;
    deadline: string;
    status: 'Active' | 'Pending';
    type: string;
    setAside: string;
    description: string;
  }
  
  export interface PaginationProps {
    currentPage: number;
    totalPages: number;
    startIndex: number;
    endIndex: number;
    totalItems: number;
    onPageChange: (page: number) => void;
  }
  
  export interface ContractRowProps {
    contract: Contract;
    isExpanded: boolean;
    onToggle: () => void;
  }
  
  export interface SearchBarProps {
    onSearch: (query: string) => void;
    onFilter: () => void;
    onExport: () => void;
  }