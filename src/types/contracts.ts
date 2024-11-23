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
  isExporting?: boolean;
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
  contract: Contract;
  disabled?: boolean;
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

export type ExportFormat = 'csv' | 'excel' | 'json';

export interface ExportFields {
  basic: boolean;
  contacts: boolean;
  addresses: boolean;
  awards: boolean;
  setAside: boolean;
  dates: boolean;
  links: boolean;
}

export interface ExportOptions {
  format: ExportFormat;
  scope: 'current' | 'all';
  fields: ExportFields;
}

export interface ExportRequest {
  searchQuery?: string;
  filters?: SearchFilters;
  selectedFields: ExportFields;
  format: ExportFormat;
  scope: 'current' | 'all';
  page?: number;
  pageSize?: number;
}

export interface ExportResponse {
  success: boolean;
  error?: string;
  data?: {
    url: string;
    filename: string;
    format: ExportFormat;
    timestamp: string;
  };
}

export interface ExportDialogProps {
  open: boolean;
  onClose: () => void;
  contracts: Contract[];
  totalCount: number;
  currentFilters?: SearchFilters;
  currentPage?: number;
  pageSize?: number;
}

// Add these constants for export format options
export const EXPORT_FORMAT_OPTIONS: Array<{
  value: ExportFormat;
  label: string;
  description: string;
  icon: string; // You could import specific icons for each format
}> = [
  {
    value: 'csv',
    label: 'CSV',
    description: 'Comma-separated values, ideal for spreadsheet software',
    icon: 'FileText'
  },
  {
    value: 'excel',
    label: 'Excel',
    description: 'Microsoft Excel format with formatting preserved',
    icon: 'Table'
  },
  {
    value: 'json',
    label: 'JSON',
    description: 'Structured data format, ideal for developers',
    icon: 'Braces'
  }
];

// Add export field definitions
export const EXPORT_FIELD_OPTIONS: Array<{
  id: keyof ExportFields;
  label: string;
  description: string;
}> = [
  {
    id: 'basic',
    label: 'Basic Information',
    description: 'Contract ID, title, type, and status'
  },
  {
    id: 'contacts',
    label: 'Contact Information',
    description: 'Names, emails, and phone numbers of contact persons'
  },
  {
    id: 'addresses',
    label: 'Address Information',
    description: 'Office and performance locations'
  },
  {
    id: 'awards',
    label: 'Award Details',
    description: 'Award amounts, dates, and recipient information'
  },
  {
    id: 'setAside',
    label: 'Set-Aside Information',
    description: 'Set-aside types and descriptions'
  },
  {
    id: 'dates',
    label: 'Important Dates',
    description: 'Posted, deadline, and archive dates'
  },
  {
    id: 'links',
    label: 'Links & Resources',
    description: 'SAM.gov URLs and related document links'
  }
];

// Default export field selection
export const DEFAULT_EXPORT_FIELDS: ExportFields = {
  basic: true,
  contacts: true,
  addresses: true,
  awards: true,
  setAside: true,
  dates: true,
  links: false
};

// Example of exported data structure for each format
export interface ExportedBasicFields {
  noticeId: string;
  title: string;
  solicitationNumber?: string;
  type: string;
  status: string;
}

export interface ExportedDateFields {
  postedDate: string;
  responseDeadline?: string;
  archiveDate?: string;
}

export interface ExportedSetAsideFields {
  setAsideType?: string;
  setAsideDescription?: string;
}

export interface ExportedAwardFields {
  awardDate?: string;
  awardAmount?: string;
  awardeeName?: string;
  awardeeUEI?: string;
  awardeeLocation?: string;
}

export interface ExportedContactFields {
  primaryContactName?: string;
  primaryContactEmail?: string;
  primaryContactPhone?: string;
  secondaryContacts?: Array<{
    name: string;
    email: string;
    phone?: string;
  }>;
}

export interface ExportedAddressFields {
  officeLocation?: {
    city: string;
    state: string;
    zip: string;
  };
  performanceLocation?: {
    city: string;
    state: string;
    zip: string;
  };
}

export interface ExportedLinkFields {
  samGovUrl: string;
  resourceLinks?: string[];
}

// Complete exported contract structure
export interface ExportedContract {
  basic?: ExportedBasicFields;
  dates?: ExportedDateFields;
  setAside?: ExportedSetAsideFields;
  award?: ExportedAwardFields;
  contacts?: ExportedContactFields;
  addresses?: ExportedAddressFields;
  links?: ExportedLinkFields;
}

// Error types for export functionality
export type ExportErrorType = 
  | 'FORMAT_ERROR' 
  | 'NETWORK_ERROR' 
  | 'PERMISSION_ERROR' 
  | 'TIMEOUT_ERROR' 
  | 'SIZE_LIMIT_ERROR';

export interface ExportErrorDetails {
  code: ExportErrorType;
  message: string;
  details?: any;
}

export interface ExportContractsOptions {
  searchQuery?: string;
  filters?: SearchFilters;
  selectedFields: ExportFields;
  format: ExportFormat;
  scope: 'current' | 'all';
  page?: number;
  pageSize?: number;
}