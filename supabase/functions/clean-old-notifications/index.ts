import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * FASE 5: Edge function para limpeza automática de notificações antigas
 * - Deleta notificações lidas com mais de 30 dias
 * - Executa via cron job diário
 */
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🧹 Starting notification cleanup...');

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Calculate date 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    console.log(`📅 Deleting read notifications older than ${thirtyDaysAgo.toISOString()}`);

    // Delete old read notifications
    const { data, error } = await supabaseClient
      .from('notifications')
      .delete()
      .eq('read', true)
      .lt('created_at', thirtyDaysAgo.toISOString())
      .select('id');

    if (error) {
      console.error('❌ Error deleting notifications:', error);
      throw error;
    }

    const deletedCount = data?.length || 0;
    console.log(`✅ Deleted ${deletedCount} old notifications`);

    return new Response(
      JSON.stringify({
        success: true,
        deleted: deletedCount,
        cutoff_date: thirtyDaysAgo.toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('❌ Notification cleanup error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
