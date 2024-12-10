import { createClient } from '@/lib/utils/supabase/client';
import type { 
  Contract, 
  SearchFilters, 
  ContractStatus,
  ContractType, 
  SetAsideType,
  ContractAnalytics,
  ContractQueryParams,
  ContractsResponse,
  ContractResponse,
  AnalyticsResponse,
  DatabaseContract,
  RPCResponse,
  RPCContact,
} from '@/types/contracts';

// Create Supabase client
const supabase = createClient();

// Helper function to determine contract status
const determineContractStatus = (contract: DatabaseContract): ContractStatus => {
  if (contract.award) {
    return 'Awarded';
  }
  
  return contract.active ? 'Active' : 'Archived';
};

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
    status: determineContractStatus(contract),
    award: contract.award,
    description: contract.description || '',
    organizationType: contract.organization_type,
    additionalInfoLink: null,
    uiLink: contract.ui_link,
    resourceLinks: contract.resource_links || [],

    officeAddress: officeAddr ? {
      zipcode: officeAddr.zip || '',
      city: officeAddr.city || '',
      countryCode: officeAddr.country_code || 'USA',
      state: officeAddr.state || '',
    } : {
      zipcode: '',
      city: '',
      countryCode: 'USA',
      state: '',
    },

    placeOfPerformance: {
      streetAddress: perfAddr?.street_address || undefined,
      city: {
        code: perfAddr?.city_code || '0',
        name: perfAddr?.city || '',
      },
      state: {
        code: perfAddr?.state_code || '',
        name: perfAddr?.state || undefined,
      },
      zip: perfAddr?.zip || '',
      country: {
        code: perfAddr?.country_code || 'USA',
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
    const statusConditions = status.map(s => {
      switch (s) {
        case 'Active':
          return 'active.is.true';
        case 'Archived':
          return 'active.is.false';
        case 'Awarded':
          return 'award.not.is.null';
        default:
          return null;
      }
    }).filter(Boolean);

    if (statusConditions.length > 0) {
      const filterString = statusConditions.join(',');
      console.log('Filter string:', filterString); // Debug log
      query = query.or(filterString);
    }
  }

  // Date range filter
  if (dateRange?.start || dateRange?.end) {
    if (dateRange.start) {
      query = query.gte('posted_date', new Date(dateRange.start).toISOString());
    }
    if (dateRange.end) {
      query = query.lte('posted_date', new Date(dateRange.end).toISOString());
    }
  }

  // Value range filter
  if (valueRange?.min || valueRange?.max) {
    query = query.not('award', 'is', null);
    
    if (valueRange.min) {
      query = query.gte('award->>amount', valueRange.min);
    }
    if (valueRange.max) {
      query = query.lte('award->>amount', valueRange.max);
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
    if (params?.search) {
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('export_contracts', {
          filters: {
            search: params.search,
            ...(params.filters || {}),
          },
          selected_fields: {
            basic: true,
            contacts: true,
            addresses: true,
            awards: true,
            set_aside: true,
            dates: true,
            links: true
          },
          export_scope: 'current',
          page_number: page,
          page_size: pageSize
        });

      if (rpcError) throw rpcError;

      // Transform the data with proper typing
      const transformedData = (rpcData?.data || []).map((item: RPCResponse) => {
        // Extract the full contract data from the RPC result
        const contractData = {
          ...item.data.basic,
          notice_id: item.noticeId,
          posted_date: item.data.dates?.postedDate,
          response_deadline: item.data.dates?.responseDeadline,
          archive_date: item.data.dates?.archiveDate,
          set_aside_code: item.data.setAside?.type,
          set_aside_description: item.data.setAside?.description,
          award: item.data.award,
          contract_addresses: [] as any[], // Type will be enforced by transformDatabaseContract
          contract_contacts: [] as any[],
          ui_link: item.data.links?.uiLink,
          resource_links: item.data.links?.resourceLinks,
        };

        // Add addresses if present
        if (item.data.addresses) {
          if (item.data.addresses.performance) {
            contractData.contract_addresses.push({
              address_type: 'performance',
              ...item.data.addresses.performance
            });
          }
          if (item.data.addresses.office) {
            contractData.contract_addresses.push({
              address_type: 'office',
              ...item.data.addresses.office
            });
          }
        }

        // Add contacts if present
        if (item.data.contacts) {
          contractData.contract_contacts = item.data.contacts.map((contact: RPCContact) => ({
            contact_type: contact.type,
            full_name: contact.name,
            email: contact.email,
            phone: contact.phone
          }));
        }

        return transformDatabaseContract(contractData as DatabaseContract);
      });

      return {
        data: transformedData,
        count: rpcData?.totalCount || 0,
        error: null,
      };
    }
    
    // If not searching, use the regular query with filters
    let query = supabase
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
      `, { count: 'exact' });

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

    console.log('Final query config:', query.toString());

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