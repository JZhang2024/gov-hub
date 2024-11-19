// Main contract interface matching SAM.gov opportunities data structure
export interface Contract {
  // Core Identification
  noticeId: string;
  title: string;
  solicitationNumber?: string;
  
  // Organizational Hierarchy
  department: string;
  subTier: string;
  office: string;
  fullParentPathName?: string;
  fullParentPathCode?: string;
  organizationType: string;
  
  // Dates and Status
  postedDate: string;
  type: string;
  baseType: string;
  archiveType: string;
  archiveDate: string | null;
  active: "Yes" | "No";
  responseDeadLine: string | null;
  
  // Classification and Codes
  naicsCode: string;
  naicsCodes?: string[];
  classificationCode: string;
  
  // Set-Aside Information
  typeOfSetAsideDescription: string | null;
  typeOfSetAside: string | null;
  
  // Award Information
  award?: {
    date: string;
    number: string;
    amount: string;
    awardee: {
      name: string;
      location: {
        streetAddress: string;
        city: {
          code: string;
          name: string;
        };
        state: {
          code: string;
        };
        zip: string;
        country: {
          code: string;
        };
      };
      ueiSAM: string;
    };
  } | null;
  
  // Contact Information
  pointOfContact: Array<{
    fax: string | null;
    type: string;
    email: string;
    phone: string | null;
    title: string | null;
    fullName: string;
  }>;
  
  // Location Information
  officeAddress: {
    zipcode: string;
    city: string;
    countryCode: string;
    state: string;
  };
  
  placeOfPerformance: {
    streetAddress?: string;
    city: {
      code: string;
      name: string;
    };
    state: {
      code: string;
      name?: string;
    };
    zip: string;
    country: {
      code: string;
      name?: string;
    };
  };
  
  // Description and Links
  description: string;
  additionalInfoLink: string | null;
  uiLink: string;
  resourceLinks?: string[];
  
  // Related Links
  links: Array<{
    rel: string;
    href: string;
    hreflang: string | null;
    media: string | null;
    title: string | null;
    type: string | null;
    deprecation: string | null;
  }>;
}

// SAM.gov Opportunities API response types
export interface SAMApiResponse {
  totalRecords: number;
  limit: number;
  offset: number;
  opportunitiesData: Contract[];
  links: Array<{
    rel: string;
    href: string;
    hreflang: string | null;
    media: string | null;
    title: string | null;
    type: string | null;
    deprecation: string | null;
  }>;
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