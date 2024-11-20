import { serve } from "https://deno.land/std@0.171.0/http/server.ts";
import { createClient } from 'npm:@supabase/supabase-js'
import { format, subMonths } from 'npm:date-fns';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: { persistSession: false },
      }
    );

    // Get date range: x months ago to today
    const today = new Date();
    const xMonthsAgo = subMonths(today, 6);
    const startDate = format(xMonthsAgo, 'MM/dd/yyyy');
    const endDate = format(today, 'MM/dd/yyyy');

    // Log the URL we're about to call
    const samUrl = `${Deno.env.get('SAM_API_URL')}?` +
      `postedFrom=${startDate}&` +
      `postedTo=${endDate}&` +
      `limit=1000&` +
      `offset=0`;
    
    console.log('Calling SAM.gov API:', {
      url: samUrl,
      dates: { startDate, endDate },
      apiKeyExists: !!Deno.env.get('SAM_API_KEY')
    });

    const samResponse = await fetch(samUrl, {
      headers: {
        'X-Api-Key': Deno.env.get('SAM_API_KEY')!,
        'Accept': 'application/json',
      }
    });

    console.log('SAM.gov response status:', {
      status: samResponse.status,
      statusText: samResponse.statusText
    });

    if (!samResponse.ok) {
      const errorText = await samResponse.text();
      console.error('SAM.gov error response:', errorText);
      throw new Error(`SAM.gov API error: ${samResponse.statusText} - ${errorText}`);
    }

    const samData = await samResponse.json();

    console.log('SAM.gov response:', {
      totalRecords: samData.totalRecords,
      pageSize: samData.opportunitiesData?.length,
      dateRange: { startDate, endDate }
    });

    // If there are more than 1000 records, log a warning
    if (samData.totalRecords > 1000) {
      console.warn(`Found ${samData.totalRecords} total records, but can only process 1000 per run. Consider implementing pagination.`);
    }

    const { data, error } = await supabase.rpc('sync_sam_contracts', {
      data: samData,
    });

    if (error) {
      console.error('Supabase RPC error:', error);
      throw error;
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: data,
        count: samData.opportunitiesData?.length || 0,
        totalRecords: samData.totalRecords,
        dateRange: {
          from: startDate,
          to: endDate
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Full error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: (error as Error).message,
        stack: (error as Error).stack
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});