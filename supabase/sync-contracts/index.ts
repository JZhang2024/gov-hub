import { createClient } from '@supabase/supabase-js'
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { format, subDays } from 'date-fns'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseKey)

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get yesterday's date for the daily sync
    const yesterday = format(subDays(new Date(), 1), 'MM/dd/yyyy')
    const today = format(new Date(), 'MM/dd/yyyy')

    // Fetch from SAM.gov
    const samResponse = await fetch(
      `${Deno.env.get('SAM_API_URL')}?` +
      `postedFrom=${yesterday}&` +
      `postedTo=${today}&` +
      `limit=1000&` +
      `offset=0`,
      {
        headers: {
          'X-Api-Key': Deno.env.get('SAM_API_KEY')!,
          'Accept': 'application/json'
        }
      }
    )

    if (!samResponse.ok) {
      throw new Error(`SAM.gov API error: ${samResponse.statusText}`)
    }

    const samData = await samResponse.json()
    
    // Call our database function to sync the data
    const { data, error } = await supabase
      .rpc('sync_sam_contracts', {
        data: samData
      })

    if (error) throw error

    return new Response(
      JSON.stringify({
        success: true,
        message: data,
        count: samData.opportunitiesData?.length || 0
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})