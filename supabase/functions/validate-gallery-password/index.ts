import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import * as bcrypt from 'https://deno.land/x/bcrypt@v0.4.1/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { shareToken, password } = await req.json();

    if (!shareToken || !password) {
      return new Response(
        JSON.stringify({ valid: false, error: 'Missing shareToken or password' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch gallery with service role key to access password_hash
    const { data: gallery, error } = await supabase
      .from('client_galleries')
      .select('password_hash, password_protected')
      .eq('share_token', shareToken)
      .eq('status', 'active')
      .single();

    if (error || !gallery) {
      console.error('Gallery not found:', error);
      return new Response(
        JSON.stringify({ valid: false, error: 'Gallery not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!gallery.password_protected || !gallery.password_hash) {
      return new Response(
        JSON.stringify({ valid: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate password using bcrypt
    const isValid = await bcrypt.compare(password, gallery.password_hash);

    console.log('Password validation attempt for gallery:', shareToken, 'Result:', isValid);

    return new Response(
      JSON.stringify({ valid: isValid }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error validating password:', error);
    return new Response(
      JSON.stringify({ valid: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
