import { createClient } from '@supabase/supabase-js';
import type { 
  Contract, 
  SearchFilters, 
  ContractStatus,
  ContractType, 
  SetAsideType,
  ContractAnalytics 
} from '@/types/contracts';

// Database types
type DatabaseContract = {
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

type DatabaseAddress = {
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

type DatabaseContact = {
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

// Response types
export type ContractsResponse = {
  data: Contract[];
  count: number;
  error: Error | null;
};

export type ContractResponse = {
  data: Contract | null;
  error: Error | null;
};

export type AnalyticsResponse = {
  data: ContractAnalytics | null;
  error: Error | null;
};

// Query parameters type
export type ContractQueryParams = {
  search?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: SearchFilters;
};

// Create Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Transform database contract to frontend contract type
// Transform database contract to frontend contract type
const transformDatabaseContract = (contract: DatabaseContract): Contract => {
    const officeAddr = contract.contract_addresses.find(
      addr => addr.address_type === 'office'
    );
    
    const perfAddr = contract.contract_addresses.find(
      addr => addr.address_type === 'performance'
    );
  
    return {
      noticeId: contract.notice_id,
      title: contract.title,
      solicitationNumber: contract.solicitation_number || undefined,
      fullParentPathName: [contract.department, contract.sub_tier, contract.office]
        .filter(Boolean)
        .join('.'),
      fullParentPathCode: [contract.department, contract.sub_tier, contract.office]
        .filter(Boolean)
        .join('.'),
      postedDate: contract.posted_date,
      type: contract.type,
      baseType: contract.base_type,
      archiveType: contract.archive_type,
      archiveDate: contract.archive_date || null,
      typeOfSetAsideDescription: contract.set_aside_description || null,
      typeOfSetAside: contract.set_aside_code || null,
      responseDeadLine: contract.response_deadline || null,
      naicsCode: contract.naics_code,
      naicsCodes: [contract.naics_code],
      classificationCode: contract.classification_code,
      active: contract.active ? 'Yes' : 'No',
      award: contract.award,
      description: contract.description || '',
      organizationType: contract.organization_type,
      additionalInfoLink: null,
      uiLink: contract.ui_link,
      resourceLinks: contract.resource_links || [],
  
      officeAddress: {
        zipcode: officeAddr?.zip || '',
        city: officeAddr?.city || '',
        countryCode: officeAddr?.country_code || 'USA',
        state: officeAddr?.state || '',
      },
  
      placeOfPerformance: {
        // Convert null to undefined for optional streetAddress
        streetAddress: perfAddr?.street_address || undefined,
        city: {
          code: perfAddr?.city_code || '0',
          name: perfAddr?.city || '',
        },
        state: {
          code: perfAddr?.state_code || '',
          // Convert null to undefined for optional name
          name: perfAddr?.state || undefined,
        },
        zip: perfAddr?.zip || '',
        country: {
          code: perfAddr?.country_code || 'USA',
          // Convert null to undefined for optional name
          name: perfAddr?.country || undefined,
        },
      },
  
      pointOfContact: contract.contract_contacts.map(contact => ({
        type: contact.contact_type,
        fullName: contact.full_name || '',
        title: contact.title || null,
        email: contact.email || '',
        phone: contact.phone || null,
        fax: contact.fax || null,
      })),
  
      links: [{
        rel: 'self',
        href: contract.ui_link,
        hreflang: null,
        media: null,
        title: null,
        type: null,
        deprecation: null,
      }],
    };
  };

// Helper function to build filter query
const applyFilters = (query: any, filters: SearchFilters) => {
    const { type, setAside, status, dateRange, valueRange } = filters;
  
    // Contract type filter
    if (type?.length) {
      query = query.in('type', type);
    }
  
    // Set-aside filter
    if (setAside?.length) {
      query = query.in('set_aside_code', setAside);
    }
  
    // Status filter
    if (status?.length) {
      // Build an array of OR conditions
      const statusFilters = [];
      
      if (status.includes('Active')) {
        statusFilters.push('active.eq.true,award.is.null');
      }
      if (status.includes('Awarded')) {
        statusFilters.push('award.not.is.null');
      }
      if (status.includes('Archived')) {
        statusFilters.push('archive_date.not.is.null');
      }
      if (status.includes('Pending')) {
        statusFilters.push('active.eq.true,award.is.null,archive_date.is.null');
      }
      if (status.includes('Cancelled')) {
        statusFilters.push('active.eq.false');
      }
  
      if (statusFilters.length > 0) {
        query = query.or(statusFilters.join(','));
      }
    }
  
    // Date range filter
    if (dateRange?.start || dateRange?.end) {
      if (dateRange.start) {
        query = query.gte('posted_date', dateRange.start);
      }
      if (dateRange.end) {
        query = query.lte('posted_date', dateRange.end);
      }
    }
  
    // Value range filter (only for awarded contracts)
    if (valueRange?.min || valueRange?.max) {
      query = query.not('award', 'is', null);
      
      if (valueRange.min) {
        query = query.gte('award->amount', valueRange.min);
      }
      if (valueRange.max) {
        query = query.lte('award->amount', valueRange.max);
      }
    }
  
    return query;
  };
  

// Main fetch function
export const getContracts = async (
    page: number = 1,
    pageSize: number = 10,
    params?: ContractQueryParams
  ): Promise<ContractsResponse> => {
    try {
      let query = supabase
        .from('contracts')
        .select(`
          *,
          contract_addresses!inner (
            id,
            contract_id,
            address_type,
            street_address,
            city,
            city_code,
            state,
            state_code,
            zip,
            country,
            country_code,
            created_at
          ),
          contract_contacts!inner (
            id,
            contract_id,
            contact_type,
            full_name,
            title,
            email,
            phone,
            fax,
            created_at
          )
        `, { count: 'exact' });
  
      // Apply text search
      if (params?.search) {
        query = query.textSearch('search_vector', params.search);
      }
  
      // Apply filters
      if (params?.filters) {
        query = applyFilters(query, params.filters);
      }
  
      // Apply sorting - default to newest first
      query = query.order('posted_date', {
        ascending: params?.sortOrder === 'asc'
      });
  
      // Apply pagination
      const start = (page - 1) * pageSize;
      query = query.range(start, start + pageSize - 1);
  
      console.log('Final query:', query); // For debugging
  
      const { data, error, count } = await query;
  
      if (error) throw error;
  
      // Transform the data to match our Contract type
      const transformedData = (data as DatabaseContract[]).map(transformDatabaseContract);
  
      return {
        data: transformedData,
        count: count || 0,
        error: null,
      };
    } catch (error) {
      console.error('Error fetching contracts:', error);
      return {
        data: [],
        count: 0,
        error: error as Error,
      };
    }
  };

// Fetch single contract by ID
export const getContract = async (noticeId: string): Promise<ContractResponse> => {
  try {
    const { data, error } = await supabase
      .from('contracts')
      .select(`
        *,
        contract_addresses (
          id,
          contract_id,
          address_type,
          street_address,
          city,
          city_code,
          state,
          state_code,
          zip,
          country,
          country_code,
          created_at
        ),
        contract_contacts (
          id,
          contract_id,
          contact_type,
          full_name,
          title,
          email,
          phone,
          fax,
          created_at
        )
      `)
      .eq('notice_id', noticeId)
      .single();

    if (error) throw error;

    return {
      data: data ? transformDatabaseContract(data as DatabaseContract) : null,
      error: null,
    };
  } catch (error) {
    console.error('Error fetching contract:', error);
    return {
      data: null,
      error: error as Error,
    };
  }
};

// Get analytics
export const getContractAnalytics = async (
  filters?: SearchFilters
): Promise<AnalyticsResponse> => {
  try {
    let query = supabase.from('contracts').select(`
      id,
      type,
      set_aside_code,
      department,
      posted_date,
      award
    `);

    if (filters) {
      query = applyFilters(query, filters);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Process the data into analytics
    const analytics: ContractAnalytics = {
      totalContracts: data.length,
      totalValue: data.reduce((sum, contract) => {
        return sum + (contract.award ? Number(contract.award.amount) || 0 : 0);
      }, 0),
      byAgency: Object.entries(
        data.reduce((acc, contract) => {
          const dept = contract.department || 'Unknown';
          if (!acc[dept]) acc[dept] = { count: 0, value: 0 };
          acc[dept].count++;
          if (contract.award) {
            acc[dept].value += Number(contract.award.amount) || 0;
          }
          return acc;
        }, {} as Record<string, { count: number; value: number }>)
      ).map(([agency, stats]) => ({
        agency,
        count: stats.count,
        value: stats.value,
      })),
      byType: Object.entries(
        data.reduce((acc, contract) => {
          const type = contract.type as ContractType;
          if (!acc[type]) acc[type] = 0;
          acc[type]++;
          return acc;
        }, {} as Record<ContractType, number>)
      ).map(([type, count]) => ({
        type: type as ContractType,
        count,
      })),
      bySetAside: Object.entries(
        data.reduce((acc, contract) => {
          const setAside = contract.set_aside_code as SetAsideType || 'None';
          if (!acc[setAside]) acc[setAside] = 0;
          acc[setAside]++;
          return acc;
        }, {} as Record<SetAsideType, number>)
      ).map(([setAside, count]) => ({
        setAside: setAside as SetAsideType,
        count,
      })),
      timeline: Object.entries(
        data.reduce((acc, contract) => {
          const date = contract.posted_date.split('T')[0];
          if (!acc[date]) acc[date] = { count: 0, value: 0 };
          acc[date].count++;
          if (contract.award) {
            acc[date].value += Number(contract.award.amount) || 0;
          }
          return acc;
        }, {} as Record<string, { count: number; value: number }>)
      ).map(([date, stats]) => ({
        date,
        count: stats.count,
        value: stats.value,
      })).sort((a, b) => a.date.localeCompare(b.date)),
    };

    return {
      data: analytics,
      error: null,
    };
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return {
      data: null,
      error: error as Error,
    };
  }
};