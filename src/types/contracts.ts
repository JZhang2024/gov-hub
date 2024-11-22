export interface Contract {
  // Core Identification
  noticeId: string;
  title: string;
  solicitationNumber?: string;
  
  // Organizational Hierarchy
  department?: string;
  subTier?: string;
  office?: string;
  fullParentPathName?: string;
  fullParentPathCode?: string;
  organizationType: string;
  
  // Dates and Status
  postedDate: string;
  type: ContractType;
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

  status?: ContractStatus;
  
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

// Database types
export type DatabaseContract = {
  id: number;
  notice_id: string;
  title: string;
  solicitation_number: string | null;
  department: string | null;
  sub_tier: string | null;
  office: string | null;
  posted_date: string;
  type: ContractType;
  base_type: string;
  archive_type: string;
  archive_date: string | null;
  set_aside_description: string | null;
  set_aside_code: string | null;
  response_deadline: string | null;
  naics_code: string;
  classification_code: string;
  active: boolean;
  description: string | null;
  organization_type: string;
  ui_link: string;
  award: {
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
  resource_links: string[] | null;
  created_at: string;
  updated_at: string;
  last_sync_at: string;
  contract_addresses: DatabaseAddress[];
  contract_contacts: DatabaseContact[];
  search_vector: unknown;
};

export type DatabaseAddress = {
  id: number;
  contract_id: number;
  address_type: 'office' | 'performance';
  street_address: string | null;
  city: string | null;
  city_code: string | null;
  state: string | null;
  state_code: string | null;
  zip: string | null;
  country: string | null;
  country_code: string | null;
  created_at: string;
};

export type DatabaseContact = {
  id: number;
  contract_id: number;
  contact_type: string;
  full_name: string | null;
  title: string | null;
  email: string | null;
  phone: string | null;
  fax: string | null;
  created_at: string;
};

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
  filterCount: number;
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

// Response Types
export interface ContractsResponse {
  data: Contract[];
  count: number;
  error: Error | null;
}

export interface ContractResponse {
  data: Contract | null;
  error: Error | null;
}

export interface AnalyticsResponse {
  data: ContractAnalytics | null;
  error: Error | null;
}

// Query Parameters
export type ContractQueryParams = {
  search?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: SearchFilters;
};

// Enum Types
export type ContractStatus = 
  | 'Active' 
  | 'Archived' 
  | 'Awarded';

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
  | 'SBA'   // Total Small Business Set-Aside
  | 'SBP'   // Partial Small Business Set-Aside
  | '8A'    // 8(a) Set-Aside
  | '8AN'   // 8(a) Sole Source
  | 'HZC'   // HUBZone Set-Aside
  | 'HZS'   // HUBZone Sole Source
  | 'SDVOSBC'  // Service-Disabled Veteran-Owned Small Business Set-Aside
  | 'SDVOSBS'  // Service-Disabled Veteran-Owned Small Business Sole Source
  | 'WOSB'     // Women-Owned Small Business Program Set-Aside
  | 'WOSBSS'   // Women-Owned Small Business Program Sole Source
  | 'EDWOSB'   // Economically Disadvantaged WOSB Program Set-Aside
  | 'EDWOSBSS' // Economically Disadvantaged WOSB Program Sole Source
  | 'LAS'      // Local Area Set-Aside
  | 'IEE'      // Indian Economic Enterprise Set-Aside
  | 'ISBEE'    // Indian Small Business Economic Enterprise Set-Aside
  | 'BICiv'    // Buy Indian Set-Aside
  | 'VSA'      // Veteran-Owned Small Business Set-Aside
  | 'VSS';     // Veteran-Owned Small Business Sole Source

export type SortOption = 
  | 'relevance'
  | 'dateDesc'
  | 'dateAsc'
  | 'valueDesc'
  | 'valueAsc';

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

// Event Types
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

export interface AddToAssistantButtonProps {
  /** The unique identifier of the contract */
  contractId: string;
  /** Whether the contract is currently added to the assistant's context */
  isAdded?: boolean;
  /** Callback function when adding a contract to context */
  onAdd: (contractId: string) => void;
  /** Callback function when removing a contract from context */
  onRemove: (contractId: string) => void;
  /** Whether the button should be disabled (e.g., when max contracts reached) */
  disabled?: boolean;
  /** Additional CSS classes to apply to the button */
  className?: string;
}

export interface Message {
  role: 'assistant' | 'user';
  content: string;
}

export interface ContractContext {
  title: string;
  id: string;
  solicitationNumber?: string;
  department?: string;
  type: string;
  postedDate: string;
  responseDeadline: string | null;
  setAside: {
    type: string | null;
    description: string | null;
  };
  naicsCode: string;
  status: string;
  amount?: string;
  placeOfPerformance: string;
}

export interface ContractDetailProps {
  contract: Contract;
  onClose: () => void;
}

export interface FilterDialogProps {
  open: boolean;
  onClose: () => void;
  initialFilters: SearchFilters;
  onApplyFilters: (filters: SearchFilters) => void;
  isLoading?: boolean;
}

export interface SetAsideOption {
  code: SetAsideType;
  label: string;
}