import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { corsHeaders } from '../_shared/cors.ts'

interface AvailabilityRequest {
  doctor_id: string
  date: string // YYYY-MM-DD
  time: string // HH:MM
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { doctor_id, date, time }: AvailabilityRequest = await req.json()

    // Validate inputs
    if (!doctor_id || !date || !time) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields: doctor_id, date, time',
          available: false
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Call the RPC function
    const { data, error } = await supabase
      .rpc('check_doctor_availability', {
        p_doctor_id: doctor_id,
        p_date: date,
        p_time: time
      })

    if (error) {
      console.error('Error checking availability:', error)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to check availability',
          available: false,
          details: error.message
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Return availability result
    return new Response(
      JSON.stringify({
        available: data.available,
        doctor_id: data.doctor_id,
        date: data.date,
        time: data.time,
        message: data.available 
          ? 'This slot is available for booking!' 
          : 'Sorry, this time slot is already booked. Please try another time.'
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error in check-availability function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        available: false,
        details: error.message
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
