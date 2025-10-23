import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  contractId: string;
  type: 'signature_request' | 'signed_copy';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { contractId, type }: EmailRequest = await req.json();

    // Fetch contract with related data
    const { data: contract, error: contractError } = await supabase
      .from('contracts')
      .select(`
        *,
        clients (name, email),
        jobs (title, start_datetime)
      `)
      .eq('id', contractId)
      .single();

    if (contractError || !contract) {
      throw new Error('Contract not found');
    }

    const origin = req.headers.get('origin') || 'https://vcrsuvzsqivcamzlvluz.supabase.co';
    const resendApiKey = Deno.env.get('RESEND_API_KEY');

    if (type === 'signature_request') {
      const signatureUrl = `${origin}/contract/sign/${contract.signature_token}`;
      
      // Create notification
      await supabase.from('notifications').insert({
        recipient_id: user.id,
        type: 'contract_sent',
        payload: {
          contract_id: contractId,
          client_name: contract.clients.name,
          message: `Contrato enviado para ${contract.clients.name}`,
        },
      });

      if (resendApiKey) {
        // Send email via Resend
        const emailHtml = `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #3b82f6; color: white; padding: 20px; text-align: center; }
                .content { padding: 30px; background: #f9fafb; }
                .button { display: inline-block; padding: 12px 30px; background: #3b82f6; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>Assinatura de Contrato</h1>
                </div>
                <div class="content">
                  <p>Olá <strong>${contract.clients.name}</strong>,</p>
                  <p>Você recebeu um contrato para assinatura digital.</p>
                  
                  <p><strong>Detalhes do Contrato:</strong></p>
                  <ul>
                    <li>Serviço: ${contract.jobs?.title || 'Não especificado'}</li>
                    <li>Data de Emissão: ${new Date(contract.issued_at).toLocaleDateString('pt-AO')}</li>
                  </ul>
                  
                  <p>Para revisar e assinar o contrato digitalmente, clique no botão abaixo:</p>
                  
                  <div style="text-align: center;">
                    <a href="${signatureUrl}" class="button">Assinar Contrato Agora</a>
                  </div>
                  
                  <p style="font-size: 14px; color: #666;">
                    Ou copie e cole este link no seu navegador:<br>
                    <a href="${signatureUrl}">${signatureUrl}</a>
                  </p>
                  
                  <p>Se você tiver alguma dúvida sobre este contrato, entre em contato conosco.</p>
                </div>
                <div class="footer">
                  <p>Este é um email automático. Por favor, não responda.</p>
                </div>
              </div>
            </body>
          </html>
        `;

        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Contratos <onboarding@resend.dev>',
            to: [contract.clients.email],
            subject: 'Contrato para Assinatura Digital',
            html: emailHtml,
          }),
        });

        if (!emailResponse.ok) {
          console.error('Failed to send email:', await emailResponse.text());
        }
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          signatureUrl,
          emailSent: !!resendApiKey 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else if (type === 'signed_copy') {
      // Create notification for professional
      await supabase.from('notifications').insert({
        recipient_id: user.id,
        type: 'contract_signed',
        payload: {
          contract_id: contractId,
          client_name: contract.clients.name,
          message: `Contrato assinado por ${contract.clients.name}`,
        },
      });

      if (resendApiKey && contract.pdf_url) {
        const emailHtml = `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #10b981; color: white; padding: 20px; text-align: center; }
                .content { padding: 30px; background: #f9fafb; }
                .button { display: inline-block; padding: 12px 30px; background: #10b981; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>✓ Contrato Assinado</h1>
                </div>
                <div class="content">
                  <p>Olá <strong>${contract.clients.name}</strong>,</p>
                  <p>Obrigado por assinar o contrato digitalmente!</p>
                  
                  <p><strong>Detalhes do Contrato:</strong></p>
                  <ul>
                    <li>Serviço: ${contract.jobs?.title || 'Não especificado'}</li>
                    <li>Data de Assinatura: ${new Date(contract.signed_at).toLocaleDateString('pt-AO')}</li>
                  </ul>
                  
                  <p>Uma cópia do contrato assinado está disponível para download:</p>
                  
                  <div style="text-align: center;">
                    <a href="${contract.pdf_url}" class="button">Baixar Contrato Assinado</a>
                  </div>
                  
                  <p><strong>Próximos Passos:</strong></p>
                  <ul>
                    <li>Guarde uma cópia do contrato para seus registros</li>
                    <li>Aguarde contato sobre os próximos passos do serviço</li>
                  </ul>
                  
                  <p>Obrigado por confiar em nossos serviços!</p>
                </div>
                <div class="footer">
                  <p>Este é um email automático. Por favor, não responda.</p>
                </div>
              </div>
            </body>
          </html>
        `;

        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Contratos <onboarding@resend.dev>',
            to: [contract.clients.email],
            subject: '✓ Seu Contrato Foi Assinado',
            html: emailHtml,
          }),
        });

        if (!emailResponse.ok) {
          console.error('Failed to send email:', await emailResponse.text());
        }
      }

      return new Response(
        JSON.stringify({ 
          success: true,
          emailSent: !!resendApiKey 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    throw new Error('Invalid email type');

  } catch (error: any) {
    console.error('Error in send-contract-email:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
