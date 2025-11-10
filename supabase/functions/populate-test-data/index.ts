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

    console.log("Populating test data for user:", user.id);

    // 1. CLIENTES (30 clientes angolanos)
    const clientsData = [
      { name: 'Maria João Santos', email: 'maria.santos@gmail.com', phone: '+244 923 456 789', address: 'Rua Kwame Nkrumah, Maianga, Luanda', type: 'person', tags: ['casamento', 'vip'], notes: 'Cliente frequente, prefere sessões ao ar livre' },
      { name: 'João Pedro Neto', email: 'joao.neto@hotmail.com', phone: '+244 924 567 890', address: 'Bairro Talatona, Luanda', type: 'person', tags: ['formatura'], notes: 'Estudante universitário' },
      { name: 'Ana Paula Fernandes', email: 'ana.fernandes@yahoo.com', phone: '+244 925 678 901', address: 'Kilamba Kiaxi, Luanda', type: 'person', tags: ['maternidade'], notes: 'Grávida, sessão para 8 meses' },
      { name: 'Empresa Petrolífera Angola Lda', email: 'contacto@petroangola.co.ao', phone: '+244 222 123 456', address: 'Av. 4 de Fevereiro, Luanda', type: 'business', tags: ['corporativo', 'eventos'], notes: 'Cliente corporativo, eventos trimestrais' },
      { name: 'Carlos Manuel Costa', email: 'carlos.costa@gmail.com', phone: '+244 926 789 012', address: 'Viana, Luanda', type: 'person', tags: ['batizado'] },
      { name: 'Restaurante Sabores de Angola', email: 'info@saboresangola.ao', phone: '+244 222 234 567', address: 'Ilha de Luanda', type: 'business', tags: ['comercial'], notes: 'Fotos para menu e redes sociais' },
      { name: 'Isabel Maria Gonçalves', email: 'isabel.goncalves@gmail.com', phone: '+244 927 890 123', address: 'Maculusso, Luanda', type: 'person', tags: ['retrato'], notes: 'Profissional de marketing' },
      { name: 'Pedro Domingos Silva', email: 'pedro.silva@hotmail.com', phone: '+244 928 901 234', address: 'Cazenga, Luanda', type: 'person', tags: ['aniversário'] },
      { name: 'Hotel Trópico Luanda', email: 'reservas@tropicoluanda.ao', phone: '+244 222 345 678', address: 'Marginal de Luanda', type: 'business', tags: ['eventos', 'corporativo'], notes: 'Hotel 5 estrelas' },
      { name: 'Marta Sofia Rodrigues', email: 'marta.rodrigues@gmail.com', phone: '+244 929 012 345', address: 'Benfica, Luanda', type: 'person', tags: ['casamento'], notes: 'Noiva para Junho 2025' },
      { name: 'António José Pereira', email: 'antonio.pereira@gmail.com', phone: '+244 930 123 456', address: 'Rangel, Luanda', type: 'person', tags: ['formatura'] },
      { name: 'Loja Moda Angola', email: 'vendas@modaangola.ao', phone: '+244 222 456 789', address: 'Belas Shopping, Luanda', type: 'business', tags: ['produto', 'comercial'], notes: 'Fotos para e-commerce' },
      { name: 'Sandra Carla Miguel', email: 'sandra.miguel@yahoo.com', phone: '+244 931 234 567', address: 'Sambizanga, Luanda', type: 'person', tags: ['família'] },
      { name: 'Banco Comercial Angolano', email: 'marketing@bca.ao', phone: '+244 222 567 890', address: 'Av. Comandante Valódia, Luanda', type: 'business', tags: ['corporativo', 'institucional'], notes: 'Sessões corporativas e eventos' },
      { name: 'Fernanda Costa Lopes', email: 'fernanda.lopes@gmail.com', phone: '+244 932 345 678', address: 'Camama, Luanda', type: 'person', tags: ['batizado'], notes: 'Batizado em Março' },
      { name: 'Ricardo Manuel Soares', email: 'ricardo.soares@hotmail.com', phone: '+244 933 456 789', address: 'Viana Sul, Luanda', type: 'person', tags: ['retrato'] },
      { name: 'Academia Fitness Pro', email: 'info@fitnesspro.ao', phone: '+244 222 678 901', address: 'Talatona, Luanda', type: 'business', tags: ['comercial'], notes: 'Fotos para campanhas' },
      { name: 'Beatriz Paula Santos', email: 'beatriz.santos@gmail.com', phone: '+244 934 567 890', address: 'Cacuaco, Luanda', type: 'person', tags: ['aniversário'] },
      { name: 'Paulo Jorge Nunes', email: 'paulo.nunes@gmail.com', phone: '+244 935 678 901', address: 'Ingombota, Luanda', type: 'person', tags: ['corporativo'], notes: 'Executivo' },
      { name: 'Construtora Nova Era Lda', email: 'projetos@novaera.ao', phone: '+244 222 789 012', address: 'Zona Industrial Viana', type: 'business', tags: ['arquitectura', 'comercial'], notes: 'Fotos de obras e projectos' },
      { name: 'Cláudia Sofia Martins', email: 'claudia.martins@yahoo.com', phone: '+244 936 789 012', address: 'Calemba, Luanda', type: 'person', tags: ['família'] },
      { name: 'Miguel Ângelo Ferreira', email: 'miguel.ferreira@gmail.com', phone: '+244 937 890 123', address: 'Palanca, Luanda', type: 'person', tags: ['formatura'] },
      { name: 'Escola Internacional de Luanda', email: 'admissoes@eil.ao', phone: '+244 222 890 123', address: 'Talatona, Luanda', type: 'business', tags: ['eventos', 'institucional'], notes: 'Eventos escolares' },
      { name: 'Liliana Maria Costa', email: 'liliana.costa@gmail.com', phone: '+244 938 901 234', address: 'Belas, Luanda', type: 'person', tags: ['maternidade'] },
      { name: 'José Carlos Alves', email: 'jose.alves@hotmail.com', phone: '+244 939 012 345', address: 'Zango, Luanda', type: 'person', tags: ['retrato'] },
      { name: 'Agência de Viagens Mundo', email: 'reservas@agenciamundo.ao', phone: '+244 222 901 234', address: 'Av. Lenine, Luanda', type: 'business', tags: ['comercial'], notes: 'Fotos de destinos turísticos' },
      { name: 'Teresa Sofia Dias', email: 'teresa.dias@gmail.com', phone: '+244 940 123 456', address: 'Kilamba, Luanda', type: 'person', tags: ['aniversário', 'infantil'], notes: 'Mãe de 2 filhos' },
      { name: 'André Luís Gomes', email: 'andre.gomes@gmail.com', phone: '+244 941 234 567', address: 'Morro Bento, Luanda', type: 'person', tags: ['corporativo'] },
      { name: 'Clínica Médica Vida', email: 'agendamento@clinicavida.ao', phone: '+244 222 012 345', address: 'Maianga, Luanda', type: 'business', tags: ['institucional'], notes: 'Fotos da equipa e instalações' },
      { name: 'Patrícia Helena Silva', email: 'patricia.silva@yahoo.com', phone: '+244 942 345 678', address: 'Cazenga, Luanda', type: 'person', tags: ['casamento'], notes: 'Casamento em Dezembro' },
    ];

    const { data: clients, error: clientsError } = await supabaseClient
      .from("clients")
      .insert(clientsData.map(c => ({ ...c, created_by: user.id })))
      .select();

    if (clientsError) throw clientsError;

    // 2. RECURSOS (20 equipamentos)
    const resourcesData = [
      { name: 'Canon EOS R5', type: 'Câmera', status: 'available', location: 'Estúdio Principal', next_maintenance_date: '2025-03-15' },
      { name: 'Sony A7 IV', type: 'Câmera', status: 'available', location: 'Estúdio Principal', next_maintenance_date: '2025-04-20' },
      { name: 'Nikon Z6 II', type: 'Câmera', status: 'in_use', location: 'Em campo', next_maintenance_date: '2025-02-28' },
      { name: 'Lente Canon RF 24-70mm f/2.8', type: 'Lente', status: 'available', location: 'Estúdio Principal' },
      { name: 'Lente Sony FE 85mm f/1.4', type: 'Lente', status: 'available', location: 'Estúdio Principal' },
      { name: 'Lente Nikon Z 50mm f/1.8', type: 'Lente', status: 'in_use', location: 'Em campo' },
      { name: 'Godox SL-60W LED', type: 'Iluminação', status: 'available', location: 'Estúdio Principal', next_maintenance_date: '2025-06-01' },
      { name: 'Godox AD200 Pro Flash', type: 'Iluminação', status: 'available', location: 'Estúdio Secundário' },
      { name: 'Softbox 90x90cm', type: 'Modificador', status: 'available', location: 'Estúdio Principal' },
      { name: 'Reflector 5-em-1 110cm', type: 'Modificador', status: 'available', location: 'Estúdio Principal' },
      { name: 'Tripé Manfrotto 055', type: 'Suporte', status: 'available', location: 'Estúdio Principal' },
      { name: 'Monopé Manfrotto XPRO', type: 'Suporte', status: 'in_use', location: 'Em campo' },
      { name: 'DJI Mavic 3 Pro', type: 'Drone', status: 'available', location: 'Armazém', next_maintenance_date: '2025-05-10' },
      { name: 'DJI Mini 3 Pro', type: 'Drone', status: 'maintenance', location: 'Assistência Técnica', next_maintenance_date: '2025-02-15' },
      { name: 'Estabilizador DJI RS 3', type: 'Estabilizador', status: 'available', location: 'Estúdio Principal' },
      { name: 'Backdrop Branco 3x6m', type: 'Fundo', status: 'available', location: 'Estúdio Principal' },
      { name: 'Backdrop Cinza 3x6m', type: 'Fundo', status: 'available', location: 'Estúdio Principal' },
      { name: 'MacBook Pro 16"', type: 'Computador', status: 'available', location: 'Escritório' },
      { name: 'Monitor Calibrado 27"', type: 'Periférico', status: 'available', location: 'Escritório' },
      { name: 'Disco Externo 4TB', type: 'Armazenamento', status: 'available', location: 'Escritório' },
    ];

    await supabaseClient.from("resources").insert(resourcesData.map(r => ({ ...r, created_by: user.id })));

    // 3. LEADS - criar mais clientes para leads
    const leadClientsData = [
      { name: 'Sofia Helena Moreira', email: 'sofia.moreira@gmail.com', phone: '+244 943 456 789', type: 'person', notes: 'Interessada em ensaio pré-casamento' },
      { name: 'Luís Miguel Tavares', email: 'luis.tavares@gmail.com', phone: '+244 944 567 890', type: 'person', notes: 'Quer fotos corporativas LinkedIn' },
      { name: 'Supermercado Bom Preço', email: 'marketing@bompreco.ao', phone: '+244 222 123 789', type: 'business', notes: 'Interessado em fotos de produtos' },
      { name: 'Carla Manuela Rosa', email: 'carla.rosa@yahoo.com', phone: '+244 945 678 901', type: 'person', notes: 'Grávida, quer sessão maternidade' },
      { name: 'Bruno José Pinto', email: 'bruno.pinto@gmail.com', phone: '+244 946 789 012', type: 'person', notes: 'Batizado do filho em Abril' },
      { name: 'Academia de Música Melodia', email: 'info@academiamelodia.ao', phone: '+244 222 234 890', type: 'business', notes: 'Fotos para site e brochuras' },
      { name: 'Vera Lúcia Mendes', email: 'vera.mendes@gmail.com', phone: '+244 947 890 123', type: 'person', notes: 'Aniversário 30 anos' },
      { name: 'Rui Pedro Marques', email: 'rui.marques@hotmail.com', phone: '+244 948 901 234', type: 'person', notes: 'Fotos de família' },
      { name: 'Imobiliária Prime', email: 'vendas@imobiliariaprime.ao', phone: '+244 222 345 901', type: 'business', notes: 'Fotos de imóveis para venda' },
      { name: 'Diana Sofia Ribeiro', email: 'diana.ribeiro@gmail.com', phone: '+244 949 012 345', type: 'person', notes: 'Book profissional' },
      { name: 'Hugo Alexandre Lopes', email: 'hugo.lopes@gmail.com', phone: '+244 950 123 456', type: 'person', notes: 'Formatura MBA' },
      { name: 'Café & Companhia', email: 'gestao@cafecompanhia.ao', phone: '+244 222 456 012', type: 'business', notes: 'Fotos para Instagram' },
      { name: 'Inês Margarida Sousa', email: 'ines.sousa@yahoo.com', phone: '+244 951 234 567', type: 'person', notes: 'Ensaio individual' },
      { name: 'Rafael Eduardo Santos', email: 'rafael.santos@gmail.com', phone: '+244 952 345 678', type: 'person', notes: 'Fotos de empresa' },
      { name: 'Loja de Noivas Elegância', email: 'vendas@elegancia.ao', phone: '+244 222 567 123', type: 'business', notes: 'Parceria para fotos de vestidos' },
    ];

    const { data: leadClients } = await supabaseClient
      .from("clients")
      .insert(leadClientsData.map(c => ({ ...c, created_by: user.id })))
      .select();

    // Criar leads
    const sources = ['Instagram', 'WhatsApp', 'Indicação', 'Facebook', 'Website'];
    const statuses = ['new', 'contacted', 'proposal_sent', 'won', 'lost'];
    
    if (leadClients) {
      const leadsData = leadClients.map((client, idx) => ({
        client_id: client.id,
        status: statuses[idx % statuses.length],
        source: sources[idx % sources.length],
        probability: 50 + Math.floor(Math.random() * 50),
        notes: 'Lead gerado automaticamente para teste'
      }));
      
      await supabaseClient.from("leads").insert(leadsData);
    }

    // 4. JOBS (40 trabalhos)
    if (clients && clients.length >= 30) {
      const jobTypes = ['Casamento', 'Corporativo', 'Evento', 'Retrato', 'Produto', 'Maternidade', 'Batizado', 'Formatura', 'Arquitectura', 'Moda'];
      const jobTitles = [
        'Casamento Maria & João', 'Ensaio Maternidade Ana', 'Sessão Corporativa BCA', 'Batizado Bebé Miguel',
        'Formatura ISPTEC 2025', 'Book Profissional Modelo', 'Fotos Produto Moda Angola', 'Evento Empresarial Petrolífera',
        'Aniversário 30 Anos Sofia', 'Sessão Família Costa', 'Baptizado Lucas', 'Retrato Executivo LinkedIn',
        'Casamento Ana & Pedro', 'Ensaio Gestante Beatriz', 'Fotos Corporativas Tropico Hotel', 'Evento Conferência',
        'Book Fashion Week', 'Produto E-commerce Loja', 'Formatura MBA 2025', 'Sessão Newborn',
        'Casamento Civil Isabel', 'Retrato Profissional', 'Fotos Menu Restaurante', 'Evento Escola EIL', 'Arquitectura Nova Era',
        'Ensaio Casal Noivos', 'Fotos Imóveis Prime', 'Evento Inauguração', 'Book Fitness Academia', 'Retrato Corporativo',
        'Casamento Destino Mussulo', 'Sessão Kids Aniversário', 'Fotos Produto Café', 'Evento Lançamento', 'Arquitectura Hotel',
        'Book Teen 15 Anos', 'Ensaio Pré-Wedding', 'Corporativo Banco', 'Festa Empresa', 'Produto Joalheria'
      ];
      const locations = ['Ilha de Luanda', 'Fortaleza de São Miguel', 'Marginal de Luanda', 'Talatona', 'Kilamba', 'Belas Shopping', 'Mussulo', 'Estúdio Principal', 'Hotel Trópico', 'Praia do Cabo Ledo'];
      
      const jobsData = clients.slice(0, 40).map((client, idx) => {
        const daysOffset = idx - 10; // Alguns jobs no passado (completados), alguns no futuro
        const startDate = new Date(Date.now() + daysOffset * 24 * 60 * 60 * 1000);
        const endDate = new Date(startDate.getTime() + (3 + Math.floor(Math.random() * 5)) * 60 * 60 * 1000); // 3-8 horas depois
        
        let status;
        if (daysOffset < -15) {
          status = 'completed';
        } else if (daysOffset < -5) {
          status = 'in_progress';
        } else if (daysOffset < 0) {
          status = 'confirmed';
        } else {
          status = 'scheduled';
        }
        
        return {
          created_by: user.id,
          client_id: client.id,
          title: jobTitles[idx],
          type: jobTypes[idx % jobTypes.length],
          status: status,
          start_datetime: startDate.toISOString(),
          end_datetime: endDate.toISOString(),
          location: locations[idx % locations.length],
          description: `Job de ${jobTypes[idx % jobTypes.length].toLowerCase()} criado para demonstração do sistema.`,
          estimated_revenue: 150000 + Math.floor(Math.random() * 850000),
          estimated_cost: 50000 + Math.floor(Math.random() * 200000),
          estimated_hours: 3 + Math.floor(Math.random() * 5),
          tags: idx % 2 === 0 ? ['premium', 'prioritário'] : ['standard']
        };
      });

      const { data: jobs } = await supabaseClient.from("jobs").insert(jobsData).select();

      // 5. ORÇAMENTOS (20 quotes)
      if (clients.length >= 20) {
        const quotesData = clients.slice(0, 20).map((client, idx) => {
          const subtotal = 200000 + Math.floor(Math.random() * 300000);
          const tax = subtotal * 0.14;
          return {
            created_by: user.id,
            client_id: client.id,
            status: ['draft', 'sent', 'accepted', 'rejected'][idx % 4],
            items: [
              { description: 'Sessão Fotográfica', quantity: 1, price: subtotal, category: 'Fotografia' },
              { description: 'Edição e Tratamento', quantity: 1, price: 50000, category: 'Pós-Produção' }
            ],
            tax: tax,
            discount: 0,
            total: subtotal + tax + 50000,
            validity_date: new Date(Date.now() + idx * 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            currency: 'AOA'
          };
        });

        await supabaseClient.from("quotes").insert(quotesData);
      }

      // 6. FATURAS (20 invoices) - SEM FATURAS VENCIDAS
      if (clients.length >= 20) {
        const invoicesData = clients.slice(0, 20).map((client, idx) => {
          const issueDate = new Date(Date.now() - idx * 3 * 24 * 60 * 60 * 1000);
          const dueDate = new Date(issueDate.getTime() + (30 + idx * 5) * 24 * 60 * 60 * 1000); // 30-125 dias após emissão
          const subtotal = 250000 + Math.floor(Math.random() * 500000);
          const taxAmount = Math.floor(subtotal * 0.14);
          const total = subtotal + taxAmount;
          
          // Definir status baseado em lógica consistente
          let status, amountPaid, paidDate;
          if (idx % 4 === 0) {
            status = 'paid';
            amountPaid = total;
            paidDate = new Date(issueDate.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          } else if (idx % 4 === 1) {
            status = 'partial';
            amountPaid = Math.floor(total * 0.5);
            paidDate = null;
          } else {
            status = 'issued';
            amountPaid = 0;
            paidDate = null;
          }
          
          return {
            user_id: user.id,
            client_id: client.id,
            invoice_number: `FT${String(idx + 1).padStart(4, '0')}/2025`,
            issue_date: issueDate.toISOString().split('T')[0],
            due_date: dueDate.toISOString().split('T')[0],
            paid_date: paidDate,
            items: [
              { description: 'Sessão Fotográfica Completa', quantity: 1, unit_price: subtotal * 0.7, total: subtotal * 0.7 },
              { description: 'Edição e Pós-Produção', quantity: 1, unit_price: subtotal * 0.3, total: subtotal * 0.3 }
            ],
            subtotal: subtotal,
            tax_rate: 14,
            tax_amount: taxAmount,
            total: total,
            amount_paid: amountPaid,
            status: status,
            currency: 'AOA',
            is_proforma: idx % 10 === 0,
            notes: idx % 3 === 0 ? 'Pagamento via transferência bancária' : null,
            payment_instructions: 'IBAN: AO06 0000 0000 0000 0000 0000 1 - BIC: BAIPAOLU'
          };
        });

        await supabaseClient.from("invoices").insert(invoicesData);
      }

      // 7. PAGAMENTOS (30 payments) - SEM PAGAMENTOS VENCIDOS
      if (clients.length >= 30) {
        const paymentsData = clients.slice(0, 30).map((client, idx) => {
          const dueDate = new Date(Date.now() + (5 + idx * 7) * 24 * 60 * 60 * 1000); // Todos no futuro: 5-208 dias
          const amount = 100000 + Math.floor(Math.random() * 400000);
          
          // Status baseado em lógica consistente
          let status, paidAt;
          if (idx % 3 === 0) {
            status = 'paid';
            paidAt = new Date(Date.now() - (idx + 1) * 2 * 24 * 60 * 60 * 1000).toISOString();
          } else {
            status = 'pending';
            paidAt = null;
          }
          
          return {
            created_by: user.id,
            client_id: client.id,
            type: ['deposit', 'installment', 'final'][idx % 3],
            amount: amount,
            status: status,
            method: ['Transferência Bancária', 'Dinheiro', 'Multicaixa', 'Cheque'][idx % 4],
            due_date: dueDate.toISOString().split('T')[0],
            paid_at: paidAt,
            currency: 'AOA',
            notes: status === 'paid' ? 'Pagamento recebido e confirmado' : 'Aguardando pagamento'
          };
        });

        await supabaseClient.from("payments").insert(paymentsData);
      }

      // 8. CONTRATOS (12 contratos)
      if (jobs && jobs.length >= 12) {
        const contractsData = jobs.slice(0, 12).map((job, idx) => ({
          client_id: job.client_id,
          job_id: job.id,
          status: ['draft', 'sent', 'signed'][idx % 3],
          terms_text: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS FOTOGRÁFICOS

1. DO OBJETO
O presente contrato tem por objeto a prestação de serviços fotográficos conforme especificado.

2. DAS OBRIGAÇÕES DO CONTRATANTE
- Efetuar o pagamento conforme acordado
- Fornecer informações necessárias para o trabalho
- Estar presente nos horários agendados

3. DAS OBRIGAÇÕES DO CONTRATADO
- Realizar o trabalho com qualidade profissional
- Entregar as fotos no prazo acordado
- Manter sigilo sobre informações do cliente`,
          cancellation_fee: 50000 + Math.floor(Math.random() * 150000),
          cancellation_policy_text: 'Em caso de cancelamento com menos de 7 dias de antecedência, será cobrada taxa de cancelamento.',
          issued_at: new Date(Date.now() - idx * 10 * 24 * 60 * 60 * 1000).toISOString()
        }));

        await supabaseClient.from("contracts").insert(contractsData);
      }

      // 9. CHECKLISTS (10 checklists)
      if (jobs && jobs.length >= 10) {
        const checklistsData = jobs.slice(0, 10).map((job, idx) => ({
          job_id: job.id,
          type: ['Pré-Sessão', 'Durante Sessão', 'Pós-Produção'][idx % 3],
          items: [
            { task: 'Confirmar horário com cliente', completed: true },
            { task: 'Carregar equipamentos', completed: true },
            { task: 'Verificar baterias', completed: false },
            { task: 'Fazer backup das fotos', completed: false },
            { task: 'Editar fotos seleccionadas', completed: false }
          ],
          estimated_time: 2 + Math.floor(Math.random() * 6)
        }));

        await supabaseClient.from("checklists").insert(checklistsData);
      }

      // 10. GALERIAS (8 galerias)
      if (jobs) {
        const completedJobs = jobs.filter(j => j.status === 'completed' || j.status === 'in_progress').slice(0, 8);
        if (completedJobs.length > 0) {
          const galleriesData = completedJobs.map((job, idx) => ({
            job_id: job.id,
            name: `Galeria ${idx + 1}`,
            status: idx % 2 === 0 ? 'active' : 'archived',
            password_protected: idx % 3 === 0,
            allow_selection: true,
            expiration_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
            access_instructions: 'Use o link recebido por email para aceder à galeria. Selecione suas fotos favoritas.'
          }));

          await supabaseClient.from("client_galleries").insert(galleriesData);
        }
      }

      // 11. TIME ENTRIES (30 registros)
      if (jobs && jobs.length >= 15) {
        const timeEntriesData = [];
        const descriptions = ['Sessão fotográfica', 'Edição e tratamento', 'Reunião com cliente', 'Pós-produção avançada', 'Preparação de equipamento'];
        
        jobs.slice(0, 15).forEach((job, idx) => {
          timeEntriesData.push({
            user_id: user.id,
            job_id: job.id,
            entry_date: new Date(Date.now() - idx * 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            hours: 2 + Math.floor(Math.random() * 6),
            description: descriptions[idx % descriptions.length]
          });
          timeEntriesData.push({
            user_id: user.id,
            job_id: job.id,
            entry_date: new Date(Date.now() - (idx * 3 + 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            hours: 1 + Math.floor(Math.random() * 4),
            description: 'Backup e organização de arquivos'
          });
        });

        await supabaseClient.from("time_entries").insert(timeEntriesData);
      }
    }

    // 12. MEMBROS DA EQUIPA (8 membros)
    const teamMembersData = [
      { name: 'Fernando Costa', email: 'fernando@argomfotos.ao', phone: '+244 923 111 222', type: 'photographer', notes: 'Especialista em casamentos' },
      { name: 'Gabriela Lima', email: 'gabriela@argomfotos.ao', phone: '+244 924 222 333', type: 'editor', notes: 'Adobe Lightroom e Photoshop' },
      { name: 'Tiago Mendes', email: 'tiago@argomfotos.ao', phone: '+244 925 333 444', type: 'assistant', notes: 'Assistente de produção' },
      { name: 'Catarina Silva', email: 'catarina@argomfotos.ao', phone: '+244 926 444 555', type: 'makeup_artist', notes: 'Make-up profissional' },
      { name: 'Daniel Rocha', email: 'daniel@argomfotos.ao', phone: '+244 927 555 666', type: 'drone_operator', notes: 'Certificado INAVIC' },
      { name: 'Mariana Lopes', email: 'mariana@argomfotos.ao', phone: '+244 928 666 777', type: 'designer', notes: 'Design gráfico e álbuns' },
      { name: 'André Carvalho', email: 'andre@argomfotos.ao', phone: '+244 929 777 888', type: 'videographer', notes: 'Cinegrafista' },
      { name: 'Paula Fernandes', email: 'paula@argomfotos.ao', phone: '+244 930 888 999', type: 'coordinator', notes: 'Gestão de eventos' },
    ];

    await supabaseClient.from("team_members").insert(teamMembersData.map(t => ({ ...t, created_by: user.id })));

    // 13. TEMPLATES
    const quoteTemplatesData = [
      {
        name: 'Casamento Completo',
        job_type: 'Casamento',
        items: [
          { description: 'Cobertura fotográfica 8h', quantity: 1, price: 500000, category: 'Fotografia' },
          { description: 'Álbum 30x30cm 40 páginas', quantity: 1, price: 200000, category: 'Produto' }
        ],
        tax: 98000,
        discount: 0,
        currency: 'AOA',
        notes: 'Pacote completo casamento'
      },
      {
        name: 'Ensaio Maternidade',
        job_type: 'Retrato',
        items: [
          { description: 'Sessão 2h estúdio', quantity: 1, price: 150000, category: 'Fotografia' },
          { description: '20 fotos editadas', quantity: 20, price: 2000, category: 'Digital' }
        ],
        tax: 26600,
        discount: 0,
        currency: 'AOA'
      },
      {
        name: 'Cobertura Corporativa',
        job_type: 'Corporativo',
        items: [
          { description: 'Cobertura evento 4h', quantity: 1, price: 300000, category: 'Fotografia' }
        ],
        tax: 56000,
        discount: 0,
        currency: 'AOA',
        notes: 'Entrega em 48h'
      }
    ];

    await supabaseClient.from("quote_templates").insert(quoteTemplatesData.map(t => ({ ...t, created_by: user.id })));

    const checklistTemplatesData = [
      {
        name: 'Checklist Casamento',
        job_type: 'Casamento',
        items: [
          { task: 'Confirmar horários com noivos', completed: false },
          { task: 'Verificar local cerimónia', completed: false },
          { task: 'Preparar 3 cartões memória', completed: false }
        ],
        estimated_time: 8
      },
      {
        name: 'Checklist Corporativo',
        job_type: 'Corporativo',
        items: [
          { task: 'Confirmar dress code', completed: false },
          { task: 'Preparar iluminação portátil', completed: false }
        ],
        estimated_time: 4
      }
    ];

    await supabaseClient.from("checklist_templates").insert(checklistTemplatesData.map(t => ({ ...t, created_by: user.id })));

    const contractTemplatesData = [
      {
        name: 'Contrato Casamento Standard',
        terms_text: 'CONTRATO DE SERVIÇOS FOTOGRÁFICOS - CASAMENTO\n\nCLÁUSULA PRIMEIRA - DO OBJETO\nContratação de serviços de fotografia para evento de casamento.',
        cancellation_fee: 100000,
        clauses: { uso_imagens: 'O contratado poderá usar imagens para portfolio' }
      },
      {
        name: 'Contrato Corporativo',
        terms_text: 'CONTRATO DE PRESTAÇÃO DE SERVIÇOS FOTOGRÁFICOS CORPORATIVOS\n\nCLÁUSULA PRIMEIRA - SERVIÇOS\nCobertura fotográfica de evento corporativo conforme briefing.',
        cancellation_fee: 75000,
        clauses: { confidencialidade: 'Compromisso de confidencialidade' }
      }
    ];

    await supabaseClient.from("contract_templates").insert(contractTemplatesData.map(t => ({ ...t, created_by: user.id })));

    return new Response(
      JSON.stringify({
        success: true,
        message: "Base de dados populada com sucesso!",
        summary: {
          clients: 45,
          jobs: 40,
          resources: 20,
          leads: 15,
          quotes: 20,
          invoices: 20,
          payments: 30,
          contracts: 12,
          checklists: 10,
          galleries: 8,
          team_members: 8,
          time_entries: 30,
          quote_templates: 3,
          checklist_templates: 2,
          contract_templates: 2
        }
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error populating test data:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to populate data" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});