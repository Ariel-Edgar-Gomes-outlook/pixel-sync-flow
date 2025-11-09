import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.1';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationEmailRequest {
  recipientEmail: string;
  recipientName?: string;
  notificationType: string;
  payload: any;
}

const getEmailContent = (type: string, payload: any) => {
  const templates: Record<string, { subject: string; html: (data: any) => string }> = {
    job_reminder: {
      subject: "🔔 Lembrete: Trabalho Próximo",
      html: (data) => `
        <h1>Lembrete de Trabalho</h1>
        <p>Olá! Você tem um trabalho próximo:</p>
        <div style="background: #f4f4f4; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h2 style="margin-top: 0;">${data.title || 'Trabalho'}</h2>
          <p><strong>Data:</strong> ${data.date ? new Date(data.date).toLocaleDateString('pt-BR') : 'Data não especificada'}</p>
          ${data.description ? `<p><strong>Descrição:</strong> ${data.description}</p>` : ''}
        </div>
        <p>Acesse o sistema para mais detalhes.</p>
      `
    },
    lead_follow_up: {
      subject: "📞 Lembrete: Follow-up de Lead",
      html: (data) => `
        <h1>Lembrete de Follow-up</h1>
        <p>É hora de fazer follow-up com o lead:</p>
        <div style="background: #f4f4f4; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h2 style="margin-top: 0;">${data.client_name || 'Lead'}</h2>
          ${data.email ? `<p><strong>Email:</strong> ${data.email}</p>` : ''}
          ${data.phone ? `<p><strong>Telefone:</strong> ${data.phone}</p>` : ''}
          <p><strong>Último contato:</strong> ${data.last_contact ? new Date(data.last_contact).toLocaleDateString('pt-BR') : 'Há mais de 3 dias'}</p>
        </div>
        <p>Acesse o sistema para entrar em contato.</p>
      `
    },
    payment_overdue: {
      subject: "⚠️ Pagamento Pendente",
      html: (data) => `
        <h1>Pagamento Pendente</h1>
        <p>Há um pagamento pendente que precisa de atenção:</p>
        <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
          <h2 style="margin-top: 0;">Valor: R$ ${data.amount || '0,00'}</h2>
          <p><strong>Vencimento:</strong> ${data.due_date ? new Date(data.due_date).toLocaleDateString('pt-BR') : 'Data não especificada'}</p>
          ${data.client_name ? `<p><strong>Cliente:</strong> ${data.client_name}</p>` : ''}
          <p><strong>Status:</strong> Pendente há ${data.days_overdue || '7+'} dias</p>
        </div>
        <p>Acesse o sistema para gerenciar este pagamento.</p>
      `
    },
    maintenance_reminder: {
      subject: "🔧 Lembrete: Manutenção de Recurso",
      html: (data) => `
        <h1>Lembrete de Manutenção</h1>
        <p>Um recurso precisa de manutenção em breve:</p>
        <div style="background: #f4f4f4; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h2 style="margin-top: 0;">${data.name || 'Recurso'}</h2>
          <p><strong>Data da manutenção:</strong> ${data.maintenance_date ? new Date(data.maintenance_date).toLocaleDateString('pt-BR') : 'Em breve'}</p>
          ${data.description ? `<p><strong>Detalhes:</strong> ${data.description}</p>` : ''}
        </div>
        <p>Acesse o sistema para planejar a manutenção.</p>
      `
    },
    new_lead: {
      subject: "🎯 Novo Lead Recebido",
      html: (data) => `
        <h1>Novo Lead!</h1>
        <p>Você recebeu um novo lead:</p>
        <div style="background: #d4edda; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
          <h2 style="margin-top: 0;">${data.client_name || 'Novo Lead'}</h2>
          ${data.email ? `<p><strong>Email:</strong> ${data.email}</p>` : ''}
          ${data.phone ? `<p><strong>Telefone:</strong> ${data.phone}</p>` : ''}
          ${data.source ? `<p><strong>Origem:</strong> ${data.source}</p>` : ''}
        </div>
        <p>Acesse o sistema para responder rapidamente.</p>
      `
    },
    job_completed: {
      subject: "✅ Trabalho Concluído",
      html: (data) => `
        <h1>Trabalho Concluído!</h1>
        <p>Um trabalho foi marcado como concluído:</p>
        <div style="background: #d4edda; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
          <h2 style="margin-top: 0;">${data.title || 'Trabalho'}</h2>
          ${data.client_name ? `<p><strong>Cliente:</strong> ${data.client_name}</p>` : ''}
          <p><strong>Data de conclusão:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
        </div>
        <p>Acesse o sistema para verificar os detalhes.</p>
      `
    }
  };

  const template = templates[type] || {
    subject: "🔔 Nova Notificação",
    html: (data) => `
      <h1>Nova Notificação</h1>
      <p>Você tem uma nova notificação no sistema:</p>
      <div style="background: #f4f4f4; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p>${JSON.stringify(data)}</p>
      </div>
      <p>Acesse o sistema para mais informações.</p>
    `
  };

  return template;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify the user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { recipientEmail, recipientName, notificationType, payload }: NotificationEmailRequest = await req.json();

    console.log('📧 Sending notification email:', {
      recipientEmail,
      notificationType,
      payload
    });

    const { subject, html } = getEmailContent(notificationType, payload);

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY not configured');
    }

    const VERIFIED_EMAIL = 'oficialargomtech@gmail.com'; // Email verificado no Resend
    let targetEmail = recipientEmail;
    let isTestMode = false;

    const emailBody = {
      from: "Sistema de Gestão <onboarding@resend.dev>",
      to: [targetEmail],
      subject: subject,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            h1 {
              color: #2563eb;
              border-bottom: 2px solid #2563eb;
              padding-bottom: 10px;
            }
            h2 {
              color: #1e40af;
            }
            .test-mode-banner {
              background: #fef3c7;
              border: 2px solid #f59e0b;
              border-radius: 8px;
              padding: 15px;
              margin-bottom: 20px;
              color: #92400e;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              font-size: 12px;
              color: #6b7280;
              text-align: center;
            }
          </style>
        </head>
        <body>
          ${html(payload)}
          <div class="footer">
            <p>Esta é uma notificação automática do seu sistema de gestão.</p>
            <p>Por favor, não responda a este email.</p>
          </div>
        </body>
        </html>
      `,
    };

    // Try sending to the actual recipient first
    let resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailBody),
    });

    // If failed with 403 (test mode), retry with verified email
    if (!resendResponse.ok && resendResponse.status === 403) {
      console.log(`⚠️ Resend test mode detected. Redirecting email to verified address: ${VERIFIED_EMAIL}`);
      console.log(`📧 Original recipient: ${recipientEmail}`);
      
      isTestMode = true;
      targetEmail = VERIFIED_EMAIL;

      // Add test mode banner to email
      emailBody.to = [VERIFIED_EMAIL];
      emailBody.html = emailBody.html.replace(
        '<body>',
        `<body>
          <div class="test-mode-banner">
            <strong>⚠️ MODO DE TESTE DO RESEND</strong><br>
            Este email seria enviado para: <strong>${recipientEmail}</strong> (${recipientName || 'Destinatário'})<br>
            <small>Para enviar para todos os destinatários, verifique um domínio em <a href="https://resend.com/domains">resend.com/domains</a></small>
          </div>`
      );

      // Retry with verified email
      resendResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailBody),
      });
    }

    if (!resendResponse.ok) {
      const errorText = await resendResponse.text();
      console.error('❌ Resend API error:', errorText);
      throw new Error(`Failed to send email: ${errorText}`);
    }

    const emailData = await resendResponse.json();
    console.log(`✅ Email sent successfully to ${targetEmail}:`, emailData);
    
    if (isTestMode) {
      console.log(`📝 Note: Email redirected due to Resend test mode. Original recipient was ${recipientEmail}`);
    }

    return new Response(JSON.stringify({ 
      success: true,
      emailId: emailData.id,
      testMode: isTestMode,
      targetEmail: targetEmail,
      originalRecipient: recipientEmail
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("❌ Error in send-notification-email function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: error.message === 'Unauthorized' ? 401 : 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
