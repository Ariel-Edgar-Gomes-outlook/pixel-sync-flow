import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface QuoteEmailRequest {
  quoteId: string;
  type: 'send' | 'accepted' | 'rejected';
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        auth: {
          persistSession: false,
        },
      }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Authorization header missing");
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    const { quoteId, type }: QuoteEmailRequest = await req.json();

    // Fetch quote with client data
    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .select(`
        *,
        clients (
          id,
          name,
          email,
          phone
        )
      `)
      .eq('id', quoteId)
      .single();

    if (quoteError || !quote) {
      throw new Error('Quote not found');
    }

    const client = quote.clients;
    if (!client?.email) {
      throw new Error('Client email not found');
    }

    // Generate review URL (use quote ID directly for simplicity)
    const origin = req.headers.get('origin') || 'https://vcrsuvzsqivcamzlvluz.supabase.co';
    const reviewUrl = `${origin}/quote/review/${quote.id}`;

    let subject = '';
    let htmlContent = '';

    if (type === 'send') {
      subject = `Orçamento para aprovação - ${quote.clients.name}`;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Novo Orçamento</h2>
          <p>Olá ${client.name},</p>
          <p>Segue o orçamento solicitado para sua análise:</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Resumo do Orçamento</h3>
            <p><strong>Número:</strong> ORC-${quote.id.substring(0, 8).toUpperCase()}</p>
            <p><strong>Total:</strong> ${Number(quote.total).toFixed(2)} ${quote.currency || 'AOA'}</p>
            ${quote.validity_date ? `<p><strong>Válido até:</strong> ${new Date(quote.validity_date).toLocaleDateString('pt-AO')}</p>` : ''}
          </div>

          <div style="margin: 30px 0;">
            <a href="${reviewUrl}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Ver Orçamento Completo
            </a>
          </div>

          ${quote.pdf_link ? `<p>Também pode <a href="${quote.pdf_link}">descarregar o PDF</a>.</p>` : ''}

          <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
            Se tiver alguma dúvida, não hesite em contactar-nos.
          </p>
        </div>
      `;
    } else if (type === 'accepted') {
      subject = `Orçamento Aceite - Obrigado!`;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #16a34a;">Orçamento Aceite ✓</h2>
          <p>Olá ${client.name},</p>
          <p>Obrigado por aceitar o nosso orçamento!</p>
          
          <div style="background: #dcfce7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a;">
            <h3 style="margin-top: 0; color: #16a34a;">Confirmado</h3>
            <p><strong>Orçamento:</strong> ORC-${quote.id.substring(0, 8).toUpperCase()}</p>
            <p><strong>Valor:</strong> ${Number(quote.total).toFixed(2)} ${quote.currency || 'AOA'}</p>
          </div>

          <h3>Próximos Passos:</h3>
          <ol>
            <li>Receberá o contrato para assinatura em breve</li>
            <li>Após assinatura, agendaremos o início dos trabalhos</li>
            <li>Manteremos contacto regular sobre o progresso</li>
          </ol>

          ${quote.pdf_link ? `<p>PDF do orçamento: <a href="${quote.pdf_link}">Descarregar</a></p>` : ''}

          <p style="margin-top: 30px;">
            Estamos ansiosos para trabalhar consigo!
          </p>
        </div>
      `;
    } else if (type === 'rejected') {
      subject = `Feedback sobre o orçamento`;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Orçamento Rejeitado</h2>
          <p>Olá ${client.name},</p>
          <p>Recebemos a sua decisão de não avançar com o orçamento proposto.</p>
          
          <div style="background: #fee2e2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
            <p><strong>Orçamento:</strong> ORC-${quote.id.substring(0, 8).toUpperCase()}</p>
          </div>

          <p>Gostaríamos de perceber melhor as suas necessidades. Pode responder a este email com:</p>
          <ul>
            <li>Feedback sobre o orçamento apresentado</li>
            <li>Sugestões de ajustes</li>
            <li>Outras dúvidas ou questões</li>
          </ul>

          <p style="margin-top: 30px;">
            Obrigado pelo seu tempo e consideração.
          </p>
        </div>
      `;
    }

    // Try to send via Resend if API key is available
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    if (resendApiKey) {
      const resendResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Orçamentos <onboarding@resend.dev>',
          to: [client.email],
          subject: subject,
          html: htmlContent,
        }),
      });

      if (!resendResponse.ok) {
        console.error('Resend API error:', await resendResponse.text());
        throw new Error('Failed to send email via Resend');
      }

      console.log('Email sent successfully via Resend');
    } else {
      console.log('RESEND_API_KEY not set, skipping email send');
    }

    // Create internal notification
    const notificationType = type === 'send' ? 'quote_sent' : 
                            type === 'accepted' ? 'quote_accepted' : 
                            'quote_rejected';
    
    const notificationMessage = type === 'send' ? `Orçamento enviado para ${client.name}` :
                               type === 'accepted' ? `Orçamento aceite por ${client.name}` :
                               `Orçamento rejeitado por ${client.name}`;

    await supabase.from('notifications').insert({
      user_id: user.id,
      type: notificationType,
      title: notificationMessage,
      message: `Orçamento ORC-${quote.id.substring(0, 8).toUpperCase()} - ${Number(quote.total).toFixed(2)} ${quote.currency || 'AOA'}`,
      link: `/quotes`,
      read: false,
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: resendApiKey ? 'Email sent successfully' : 'Notification created (email not configured)',
        reviewUrl: reviewUrl,
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error("Error in send-quote-email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
