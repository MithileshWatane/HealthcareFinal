import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { corsHeaders } from '../_shared/cors.ts'

interface BookingRequest {
    session_id: string
    doctor_id: string
    doctor_name: string
    specialty: string
    date: string // YYYY-MM-DD
    time: string // HH:MM
    patient_name: string
    patient_phone: string
    patient_email: string
}

Deno.serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const {
            session_id,
            doctor_id,
            doctor_name,
            specialty,
            date,
            time,
            patient_name,
            patient_phone,
            patient_email
        }: BookingRequest = await req.json()

        // Validate required fields
        if (!session_id || !doctor_id || !date || !time || !patient_name) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: 'Missing required fields'
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

        // First, check availability again to prevent double booking
        const { data: availabilityData, error: availabilityError } = await supabase
            .rpc('check_doctor_availability', {
                p_doctor_id: doctor_id,
                p_date: date,
                p_time: time
            })

        if (availabilityError) {
            console.error('Error checking availability:', availabilityError)
            return new Response(
                JSON.stringify({
                    success: false,
                    error: 'Failed to verify availability'
                }),
                {
                    status: 500,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                }
            )
        }

        if (!availabilityData.available) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: 'Time slot no longer available',
                    message: 'Sorry, this slot was just booked. Please choose another time.'
                }),
                {
                    status: 409,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                }
            )
        }

        // Create the booking
        const { data: bookingData, error: bookingError } = await supabase
            .rpc('create_voice_booking', {
                p_session_id: session_id,
                p_doctor_id: doctor_id,
                p_doctor_name: doctor_name,
                p_specialty: specialty,
                p_date: date,
                p_time: time,
                p_patient_name: patient_name,
                p_patient_phone: patient_phone,
                p_patient_email: patient_email
            })

        if (bookingError) {
            console.error('Error creating booking:', bookingError)
            return new Response(
                JSON.stringify({
                    success: false,
                    error: 'Failed to create booking',
                    details: bookingError.message
                }),
                {
                    status: 500,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                }
            )
        }

        // Return success response
        return new Response(
            JSON.stringify({
                success: true,
                appointment_id: bookingData.appointment_id,
                session_id: bookingData.session_id,
                message: `Great! Your appointment with ${doctor_name} is confirmed for ${date} at ${time}. You will receive a confirmation email shortly.`,
                booking_details: {
                    doctor: doctor_name,
                    specialty: specialty,
                    date: date,
                    time: time,
                    patient: patient_name,
                    email: patient_email,
                    phone: patient_phone
                }
            }),
            {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
        )

    } catch (error) {
        console.error('Error in book-appointment function:', error)
        return new Response(
            JSON.stringify({
                success: false,
                error: 'Internal server error',
                details: error.message
            }),
            {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
        )
    }
})
