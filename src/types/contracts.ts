
// Main contract interface matching SAM.gov data structure
export interface Contract {
  id: string;
  title: string;
  agency: string;
  value: string;
  posted: string;       // ISO date string
  deadline: string;     // ISO date string
  status: ContractStatus;
  type: ContractType;
  setAside: SetAsideType;
  description: string;
  naicsCode?: string;
  location?: string;
  activeDate?: string;  // ISO date string
  archiveDate?: string; // ISO date string
  awardDate?: string;   // ISO date string
}

// SAM.gov API response types
export interface SAMApiResponse {
  totalRecords: number;
  page: number;
  opportunitiesData: SAMContractData[];
}

export interface SAMContractData {
  opportunityId: string;
  title: string;
  agency: {
    name: string;
    agencyId: string;
    subtier: {
      name: string;
      subtierCode: string;
    };
  };
  baseType: string;
  type: ContractType;
  setAside: SetAsideType;
  responseDeadLine: string;
  postedDate: string;
  modifiedDate?: string;
  contractValue?: {
    amount: number;
    currency: string;
    type: 'Base' | 'Option' | 'Total';
  };
  description: string;
  placeOfPerformance?: {
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
  naicsCode?: string;
  classificationCode?: string;
  active: boolean;
  archived: boolean;
  cancelled: boolean;
  award?: {
    date: string;
    amount: number;
    recipient: string;
  };
}

// Component Props Types
export interface ContractRowProps {
  contract: Contract;
  isExpanded: boolean;
  onToggle: () => void;
}

export interface ContractCardProps {
  contract: Contract;
  onClose: () => void;
}

export interface SearchBarProps {
  onSearch: (query: string) => void;
  onFilter: () => void;
  onExport: () => void;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

// Search and Filter Types
export interface SearchFilters {
  setAside?: SetAsideType[];
  type?: ContractType[];
  status?: ContractStatus[];
  agency?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  valueRange?: {
    min?: number;
    max?: number;
  };
}

export interface SearchQuery {
  query: string;
  filters: SearchFilters;
  sort: SortOption;
  page: number;
  limit: number;
}

// User Related Types
export interface SavedSearch {
  id: string;
  userId: string;
  name: string;
  query: SearchQuery;
  createdAt: string;
  lastRun?: string;
}

export interface UserPreferences {
  userId: string;
  emailNotifications: boolean;
  defaultFilters: SearchFilters;
  savedSearches: SavedSearch[];
  createdAt: string;
  updatedAt: string;
}

// Enum Types
export type ContractStatus = 
  | 'Active' 
  | 'Pending' 
  | 'Archived' 
  | 'Awarded' 
  | 'Cancelled';

export type ContractType = 
  | 'Solicitation'
  | 'Award Notice'
  | 'Justification'
  | 'Intent to Bundle'
  | 'Pre-Solicitation'
  | 'Combined Synopsis/Solicitation'
  | 'Sale of Surplus Property'
  | 'Fair Opportunity / Limited Sources Justification'
  | 'Foreign Government Standard'
  | 'Special Notice'
  | 'Sources Sought';

export type SetAsideType = 
  | 'Small Business'
  | '8(a)'
  | 'HUBZone'
  | 'Service-Disabled Veteran-Owned Small Business'
  | 'Women-Owned Small Business'
  | 'Economically Disadvantaged Women-Owned Small Business'
  | 'Multiple Small Business Categories'
  | 'None';

export type SortOption = 
  | 'relevance'
  | 'dateDesc'
  | 'dateAsc'
  | 'valueDesc'
  | 'valueAsc';

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  metadata?: {
    page: number;
    totalPages: number;
    totalItems: number;
  };
}

// Analytics Types
export interface ContractAnalytics {
  totalContracts: number;
  totalValue: number;
  byAgency: {
    agency: string;
    count: number;
    value: number;
  }[];
  byType: {
    type: ContractType;
    count: number;
  }[];
  bySetAside: {
    setAside: SetAsideType;
    count: number;
  }[];
  timeline: {
    date: string;
    count: number;
    value: number;
  }[];
}

// Event Types for Real-time Updates
export interface ContractEvent {
  type: 'created' | 'updated' | 'deleted';
  contract: Contract;
  timestamp: string;
}

export interface UserEvent {
  type: 'saveSearch' | 'runSearch' | 'viewContract';
  userId: string;
  data: any;
  timestamp: string;
}