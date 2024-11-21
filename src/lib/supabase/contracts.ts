// lib/supabase/contracts.ts
import { createClient } from '@supabase/supabase-js';
import type { Contract } from '@/types/contracts';
import type { DatabaseContract } from '@/types/contracts';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export type ContractsResponse = {
  data: Contract[];
  count: number;
  error: Error | null;
};

export type ContractFilters = {
  search?: string;
  department?: string;
  setAside?: string;
  naicsCode?: string;
  active?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
};

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
    fullParentPathCode: '', // Add if you have this in your database
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
      streetAddress: perfAddr?.street_address || undefined,
      city: {
        code: perfAddr?.city_code || '0',
        name: perfAddr?.city || '',
      },
      state: {
        code: perfAddr?.state_code || '',
        name: perfAddr?.state || '',
      },
      zip: perfAddr?.zip || '',
      country: {
        code: perfAddr?.country_code || 'USA',
        name: perfAddr?.country || 'UNITED STATES',
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

export const getContracts = async (
  page: number = 1,
  pageSize: number = 10,
  filters?: ContractFilters
): Promise<ContractsResponse> => {
  try {
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
    if (filters?.search) {
      query = query.textSearch('search_vector', filters.search);
    }

    if (filters?.department) {
      query = query.eq('department', filters.department);
    }

    if (filters?.setAside) {
      query = query.eq('set_aside_code', filters.setAside);
    }

    if (filters?.naicsCode) {
      query = query.eq('naics_code', filters.naicsCode);
    }

    if (filters?.active !== undefined) {
      query = query.eq('active', filters.active);
    }

    if (filters?.dateRange) {
      query = query
        .gte('posted_date', filters.dateRange.start.toISOString())
        .lte('posted_date', filters.dateRange.end.toISOString());
    }

    // Apply pagination
    const start = (page - 1) * pageSize;
    query = query
      .order('posted_date', { ascending: false })
      .range(start, start + pageSize - 1);

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