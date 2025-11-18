import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if user has admin role
    const { data: isAdmin } = await supabaseClient.rpc('has_role', {
      _user_id: user.id,
      _role: 'admin'
    });

    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Clearing test data for admin user:", user.id);

    let deletedCount = 0;

    // Get all jobs IDs for this user
    const { data: userJobs } = await supabaseClient
      .from("jobs")
      .select("id")
      .eq("created_by", user.id);
    
    const jobIds = userJobs?.map(j => j.id) || [];

    // Get all client IDs for this user
    const { data: userClients } = await supabaseClient
      .from("clients")
      .select("id")
      .eq("created_by", user.id);
    
    const clientIds = userClients?.map(c => c.id) || [];

    // Get all quote IDs for this user
    const { data: userQuotes } = await supabaseClient
      .from("quotes")
      .select("id")
      .eq("created_by", user.id);
    
    const quoteIds = userQuotes?.map(q => q.id) || [];

    // Get all payment IDs for this user
    const { data: userPayments } = await supabaseClient
      .from("payments")
      .select("id")
      .eq("created_by", user.id);
    
    const paymentIds = userPayments?.map(p => p.id) || [];

    // 1. Delete time entries
    if (userJobs && userJobs.length > 0) {
      await supabaseClient
        .from("time_entries")
        .delete()
        .eq("user_id", user.id);
      console.log("✅ Time entries deleted");
      deletedCount++;
    }

    // 2. Delete gallery photos and galleries
    if (jobIds.length > 0) {
      const { data: galleries } = await supabaseClient
        .from("client_galleries")
        .select("id")
        .in("job_id", jobIds);

      if (galleries && galleries.length > 0) {
        const galleryIds = galleries.map(g => g.id);
        await supabaseClient
          .from("gallery_photos")
          .delete()
          .in("gallery_id", galleryIds);
        console.log("✅ Gallery photos deleted");
        deletedCount++;
      }

      await supabaseClient
        .from("client_galleries")
        .delete()
        .in("job_id", jobIds);
      console.log("✅ Client galleries deleted");
      deletedCount++;
    }

    // 3. Delete checklists
    if (jobIds.length > 0) {
      await supabaseClient
        .from("checklists")
        .delete()
        .in("job_id", jobIds);
      console.log("✅ Checklists deleted");
      deletedCount++;
    }

    // 4. Delete deliverables
    if (jobIds.length > 0) {
      await supabaseClient
        .from("deliverables")
        .delete()
        .in("job_id", jobIds);
      console.log("✅ Deliverables deleted");
      deletedCount++;
    }

    // 5. Delete job resources
    if (jobIds.length > 0) {
      await supabaseClient
        .from("job_resources")
        .delete()
        .in("job_id", jobIds);
      console.log("✅ Job resources deleted");
      deletedCount++;
    }

    // 6. Delete job team members
    if (jobIds.length > 0) {
      await supabaseClient
        .from("job_team_members")
        .delete()
        .in("job_id", jobIds);
      console.log("✅ Job team members deleted");
      deletedCount++;
    }

    // 7. Delete contracts
    if (clientIds.length > 0) {
      await supabaseClient
        .from("contracts")
        .delete()
        .in("client_id", clientIds);
      console.log("✅ Contracts deleted");
      deletedCount++;
    }

    // 8. Delete payment reminders
    if (paymentIds.length > 0) {
      await supabaseClient
        .from("payment_reminders")
        .delete()
        .in("payment_id", paymentIds);
      console.log("✅ Payment reminders deleted");
      deletedCount++;
    }

    // 9. Delete payment plans
    if (quoteIds.length > 0) {
      await supabaseClient
        .from("payment_plans")
        .delete()
        .in("quote_id", quoteIds);
      console.log("✅ Payment plans deleted");
      deletedCount++;
    }

    // 10. Delete payments
    await supabaseClient
      .from("payments")
      .delete()
      .eq("created_by", user.id);
    console.log("✅ Payments deleted");
    deletedCount++;

    // 11. Delete invoices
    await supabaseClient
      .from("invoices")
      .delete()
      .eq("user_id", user.id);
    console.log("✅ Invoices deleted");
    deletedCount++;

    // 12. Delete quotes
    await supabaseClient
      .from("quotes")
      .delete()
      .eq("created_by", user.id);
    console.log("✅ Quotes deleted");
    deletedCount++;

    // 13. Delete leads
    if (clientIds.length > 0) {
      await supabaseClient
        .from("leads")
        .delete()
        .in("client_id", clientIds);
      console.log("✅ Leads deleted");
      deletedCount++;
    }

    // 14. Delete jobs
    await supabaseClient
      .from("jobs")
      .delete()
      .eq("created_by", user.id);
    console.log("✅ Jobs deleted");
    deletedCount++;

    // 15. Delete clients
    await supabaseClient
      .from("clients")
      .delete()
      .eq("created_by", user.id);
    console.log("✅ Clients deleted");
    deletedCount++;

    // 16. Delete resources
    await supabaseClient
      .from("resources")
      .delete()
      .eq("created_by", user.id);
    console.log("✅ Resources deleted");
    deletedCount++;

    // 17. Delete team members
    await supabaseClient
      .from("team_members")
      .delete()
      .eq("created_by", user.id);
    console.log("✅ Team members deleted");
    deletedCount++;

    // 18. Delete templates
    await supabaseClient
      .from("quote_templates")
      .delete()
      .eq("created_by", user.id);
    console.log("✅ Quote templates deleted");
    deletedCount++;

    await supabaseClient
      .from("checklist_templates")
      .delete()
      .eq("created_by", user.id);
    console.log("✅ Checklist templates deleted");
    deletedCount++;

    await supabaseClient
      .from("contract_templates")
      .delete()
      .eq("created_by", user.id);
    console.log("✅ Contract templates deleted");
    deletedCount++;

    console.log(`🎉 Successfully deleted ${deletedCount} categories of data`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Todos os dados de teste foram eliminados com sucesso!",
        deletedCategories: deletedCount
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    console.error("Error clearing test data:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to clear data";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
