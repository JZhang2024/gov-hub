import { createClient } from '@/lib/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { ExportFormat } from '@/types/contracts';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

// Helper to convert JSON data to CSV using PapaParse
function jsonToCSV(data: Record<string, any>[]): string {
  return Papa.unparse(data, {
    quotes: true,
    header: true,
    newline: '\n',
    skipEmptyLines: true
  });
}

// Helper to convert JSON data to Excel
function jsonToExcel(data: Record<string, any>[]): Buffer {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Contracts');
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
}

// Helper to process the raw export data
function processExportData(rawData: any[]): Record<string, any>[] {
  return rawData.map(item => {
    const data = item.data;
    return {
      // Basic info
      ...(data.basic && {
        'Notice ID': item.noticeId,
        'Title': data.basic.title,
        'Solicitation Number': data.basic.solicitationNumber,
        'Type': data.basic.type,
        'Status': data.basic.active ? 'Active' : 'Inactive',
        'Department': data.basic.department,
        'Sub-Tier': data.basic.subTier,
        'Office': data.basic.office
      }),
      
      // Dates
      ...(data.dates && {
        'Posted Date': data.dates.postedDate ? 
          new Date(data.dates.postedDate).toLocaleDateString() : '',
        'Response Deadline': data.dates.responseDeadline ? 
          new Date(data.dates.responseDeadline).toLocaleDateString() : '',
        'Archive Date': data.dates.archiveDate ? 
          new Date(data.dates.archiveDate).toLocaleDateString() : '',
      }),
      
      // Set-aside
      ...(data.setAside && {
        'Set-Aside Type': data.setAside.type,
        'Set-Aside Description': data.setAside.description,
      }),
      
      // Award
      ...(data.award && {
        'Award Date': data.award.date ? 
          new Date(data.award.date).toLocaleDateString() : '',
        'Award Amount': data.award.amount ? 
          new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
          }).format(Number(data.award.amount)) : '',
        'Awardee Name': data.award.awardee?.name || '',
        'Awardee UEI': data.award.awardee?.ueiSAM || '',
      }),
      
      // Primary contact (first contact only for flat format)
      ...(data.contacts?.[0] && {
        'Primary Contact Name': data.contacts[0].name || '',
        'Primary Contact Email': data.contacts[0].email || '',
        'Primary Contact Phone': data.contacts[0].phone || '',
      }),
      
      // Addresses
      ...(data.addresses?.performance && {
        'Performance Location': [
          data.addresses.performance.city,
          data.addresses.performance.state
        ].filter(Boolean).join(', '),
        'Performance Address': data.addresses.performance.address || '',
        'Performance ZIP': data.addresses.performance.zip || ''
      }),
      
      ...(data.addresses?.office && {
        'Office Location': [
          data.addresses.office.city,
          data.addresses.office.state
        ].filter(Boolean).join(', '),
        'Office ZIP': data.addresses.office.zip || ''
      }),
      
      // Links
      ...(data.links && {
        'SAM.gov URL': data.links.uiLink || '',
        'Resource Links': Array.isArray(data.links.resourceLinks) ? 
          data.links.resourceLinks.join('\n') : data.links.resourceLinks || '',
      }),
    };
  });
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get request body
    const body = await req.json();
    const { 
      filters,
      selectedFields,
      format,
      scope,
      page,
      pageSize
    } = body;

    console.log('Export request:', {
      filters,
      selectedFields,
      format,
      scope,
      page,
      pageSize
    });

    // Prepare the parameters for the RPC call
    const rpcParams = {
      filters,
      selected_fields: {
        basic: selectedFields.basic || false,
        contacts: selectedFields.contacts || false,
        addresses: selectedFields.addresses || false,
        awards: selectedFields.awards || false,
        set_aside: selectedFields.setAside || false,
        dates: selectedFields.dates || false,
        links: selectedFields.links || false
      },
      export_scope: scope,
      page_number: page || 1,
      page_size: pageSize || 25
    };

    console.log('RPC params:', rpcParams);

    // Call the database function
    const { data: exportResult, error } = await supabase
      .rpc('export_contracts', rpcParams);

    if (error) {
      console.error('Database export error:', {
        error,
        params: rpcParams
      });
      throw error;
    }

    // Debug log the export result
    console.log('Export result first record:', exportResult?.data?.[0]);

    // Ensure we have data to process
    if (!exportResult?.data) {
      throw new Error('No data received from export function');
    }

    // Process the data
    const processedData = processExportData(exportResult.data);

    // Convert to requested format and set appropriate headers
    const timestamp = new Date().toISOString().split('T')[0];
    let exportData: Buffer | string;
    let contentType: string;
    let filename: string;

    switch (format as ExportFormat) {
      case 'csv':
        exportData = jsonToCSV(processedData);
        contentType = 'text/csv';
        filename = `contracts-export-${timestamp}.csv`;
        break;
      
      case 'excel':
        exportData = jsonToExcel(processedData);
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        filename = `contracts-export-${timestamp}.xlsx`;
        break;
      
      case 'json':
      default:
        exportData = JSON.stringify(processedData, null, 2);
        contentType = 'application/json';
        filename = `contracts-export-${timestamp}.json`;
        break;
    }

    // Return the file with appropriate headers
    return new NextResponse(exportData, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename=${filename}`,
        'Cache-Control': 'no-cache',
      },
    });

  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to export contracts',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}