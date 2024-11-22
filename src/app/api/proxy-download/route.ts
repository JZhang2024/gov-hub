import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fileUrl = searchParams.get('url');
    const noticeId = searchParams.get('noticeId');

    if (!fileUrl || !noticeId) {
      return new NextResponse('Missing required parameters', { status: 400 });
    }

    // Verify the contract exists and user has access
    const { data: contract, error: contractError } = await supabase
      .from('contracts')
      .select('notice_id')
      .eq('notice_id', noticeId)
      .single();

    if (contractError || !contract) {
      return new NextResponse('Contract not found or access denied', { status: 404 });
    }

    // Fetch the document from SAM.gov
    const response = await fetch(fileUrl, {
      headers: {
        'X-Api-Key': process.env.SAM_API_KEY!,
        'Accept': '*/*',
      },
    });

    if (!response.ok) {
      throw new Error(`SAM.gov API error: ${response.statusText}`);
    }

    // Get the original filename from Content-Disposition header if available
    const contentDisposition = response.headers.get('content-disposition');
    const fileName = contentDisposition
      ? contentDisposition.split('filename=')[1]?.replace(/["']/g, '')
      : 'document.pdf';

    // Get content type
    const contentType = response.headers.get('content-type') || 'application/octet-stream';

    // Stream the response
    const headers = new Headers();
    headers.set('Content-Type', contentType);
    headers.set('Content-Disposition', `attachment; filename="${fileName}"`);
    
    // Add CORS headers
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    return new NextResponse(response.body, {
      status: 200,
      headers,
    });

  } catch (error) {
    console.error('Download proxy error:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to download document' }), 
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  const headers = new Headers();
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  return new NextResponse(null, {
    status: 204,
    headers,
  });
}