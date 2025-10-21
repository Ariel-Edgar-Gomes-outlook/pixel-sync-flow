# 📄 Sistema de Contratos Profissionais - PhotoFlow

## ✅ Implementação Completa

O Sistema de Contratos Profissionais foi implementado com validação de inputs, templates específicos para fotografia e assinatura digital!

---

## 🎯 Funcionalidades Implementadas

### 1. **Gestão Completa de Contratos**
- ✅ Criar contratos personalizados
- ✅ Associar a clientes e jobs específicos
- ✅ Múltiplos status (rascunho → enviado → aguardando assinatura → assinado → ativo)
- ✅ Validação de inputs com Zod
- ✅ Interface em abas organizadas

### 2. **Templates Profissionais para Fotografia**
- ✅ **Template Casamento**: Cláusulas específicas para casamentos (60 dias entrega, 3 revisões, etc)
- ✅ **Template Evento**: Para eventos corporativos/sociais (30 dias entrega, 2 revisões)
- ✅ **Template Ensaio**: Para sessões individuais/familiares (15 dias entrega, 1 revisão)
- ✅ Aplicação automática com um clique

### 3. **Cláusulas Profissionais**
- ✅ **Direitos de Uso de Imagem**: Define uso comercial vs pessoal
- ✅ **Política de Cancelamento**: Reembolsos baseados em prazos
- ✅ **Política de Remarcação**: Regras para mudar datas
- ✅ **Cláusula de Entrega Tardia**: Compensação por atrasos
- ✅ **Aviso de Direitos Autorais**: Proteção legal do fotógrafo
- ✅ **Política de Revisões**: Quantas revisões estão inclusas

### 4. **Assinatura Digital do Cliente**
- ✅ Portal público `/contract/sign/:token`
- ✅ Assinatura com canvas digital
- ✅ Link único e seguro por contrato
- ✅ Registro automático de data/hora da assinatura
- ✅ Confirmação visual após assinatura

### 5. **Segurança e Validação**
- ✅ Validação client-side com Zod
- ✅ Limites de caracteres em todos os campos
- ✅ Sanitização automática de inputs
- ✅ Tokens únicos de 64 caracteres
- ✅ RLS policies no Supabase

---

## 📖 Como Usar

### **Passo 1: Criar um Contrato**

1. Vá para **Contratos** no menu
2. Clique em **"Novo Contrato"**
3. Preencha a **Aba "Básico"**:
   - Selecione o **Cliente**
   - (Opcional) Associe a um **Job**
   - Defina o **Status**: Rascunho (padrão)
   - Defina **Taxa de Cancelamento** se aplicável

4. **Aplique um Template**:
   - Clique em **"Template Casamento"**, **"Template Evento"** ou **"Template Ensaio"**
   - Todos os campos serão preenchidos automaticamente
   - Personalize conforme necessário

5. Revise as **Abas**:
   - **Termos**: Condições principais do contrato
   - **Políticas**: Cancelamento, remarcação, revisões, entrega tardia
   - **Direitos**: Uso de imagem e direitos autorais

6. Clique em **"Criar Contrato"**

### **Passo 2: Enviar para Assinatura**

1. Abra o contrato criado (clique em "Editar")
2. Copie o **Link de Assinatura** (botão no topo)
3. Envie o link para o cliente via:
   - Email
   - WhatsApp
   - SMS

**Formato do link:**
```
https://seudominio.com/contract/sign/abc123xyz456...
```

4. Marque como **"Enviado"** (botão no final do formulário)

### **Passo 3: Cliente Assina Digitalmente**

**Do lado do cliente:**

1. Acessa o link recebido
2. Lê todos os termos e cláusulas
3. Assina com o dedo/mouse no canvas
4. Clica em **"Assinar Contrato"**
5. Recebe confirmação visual de sucesso
6. (Opcional) Recebe cópia por email

**Do seu lado:**

- O status muda automaticamente para **"Assinado"**
- A data/hora da assinatura é registrada
- A imagem da assinatura é salva

### **Passo 4: Ativar e Gerenciar**

Após assinatura, você pode:

1. Mudar status para **"Ativo"** quando o trabalho começar
2. Ver a assinatura digital salva
3. Gerar PDF do contrato completo
4. Se necessário, cancelar (status **"Cancelado"**)

---

## 🎨 Templates Pré-configurados

### **Template Casamento**

```
✅ Cobertura completa do evento
✅ Prazo de entrega: 60 dias
✅ Revisões: até 3 rodadas
✅ Cancelamento:
   - +90 dias: reembolso 80%
   - 90-30 dias: reembolso 50%
   - -30 dias: sem reembolso
✅ Remarcação: 1x gratuita (30 dias aviso)
✅ Uso pessoal ilimitado
✅ Direitos autorais do fotógrafo
```

### **Template Evento**

```
✅ Cobertura de X horas
✅ Prazo de entrega: 30 dias
✅ Revisões: até 2 rodadas
✅ Cancelamento:
   - +15 dias: reembolso 70%
   - 15-7 dias: reembolso 40%
   - -7 dias: sem reembolso
✅ Remarcação: 1x gratuita (15 dias aviso)
✅ Uso comercial limitado
✅ Créditos obrigatórios
```

### **Template Ensaio**

```
✅ Sessão de X hora(s)
✅ Prazo de entrega: 15 dias
✅ Revisões: até 1 rodada
✅ Cancelamento:
   - +7 dias: reembolso 80%
   - 7-3 dias: reembolso 50%
   - -3 dias: sem reembolso
✅ Remarcação: 1x gratuita (48h aviso)
✅ Uso pessoal ilimitado
✅ Uso comercial não autorizado
```

---

## 🔐 Segurança Implementada

### **Validação de Inputs (Zod)**

```typescript
// Todos os campos são validados:
- terms_text: máx 10.000 caracteres
- usage_rights_text: máx 5.000 caracteres
- cancellation_policy_text: máx 5.000 caracteres
- outras cláusulas: máx 2.000 caracteres cada
- cancellation_fee: entre 0 e 1.000.000
```

### **Proteção Contra Injeção**

- ✅ Sanitização automática de inputs
- ✅ Escape de caracteres especiais
- ✅ Validação de tipos
- ✅ Limites de comprimento

### **Tokens de Assinatura**

- ✅ 64 caracteres únicos
- ✅ Gerados com `gen_random_bytes(32)`
- ✅ Impossível de adivinhar
- ✅ Único por contrato

---

## 📊 Estados do Contrato

```
📝 Rascunho
    ↓ (você marca como enviado)
📤 Enviado
    ↓ (você envia link de assinatura)
✍️ Aguardando Assinatura
    ↓ (cliente assina)
✅ Assinado
    ↓ (você ativa quando trabalho começa)
🟢 Ativo
    ↓ (se necessário)
❌ Cancelado
```

---

## 💡 Casos de Uso Reais

### **Caso 1: Casamento com Entrada + Restante**

```
1. Crie contrato com Template Casamento
2. Personalize valor e datas
3. Adicione cláusula de pagamento:
   "30% entrada (AOA 30.000)
    70% restante no dia do evento"
4. Envie link de assinatura
5. Cliente assina
6. Após pagamento da entrada, ative contrato
```

### **Caso 2: Ensaio com Condições Especiais**

```
1. Use Template Ensaio
2. Adicione em "Política de Revisões":
   "Revisões adicionais: AOA 5.000 por rodada"
3. Em "Direitos de Uso":
   "Cliente pode usar em portfólio pessoal
    Uso em publicidade requer licença extra"
4. Envie para assinatura
```

### **Caso 3: Evento Corporativo com NDA**

```
1. Use Template Evento
2. Adicione em "Termos Principais":
   "Fotografo compromete-se a não publicar
    as imagens sem autorização da empresa"
3. Em "Direitos de Uso":
   "Empresa tem direitos exclusivos
    Fotógrafo não pode usar em portfolio"
4. Taxa de cancelamento: AOA 50.000
```

---

## 🚨 Avisos Importantes

### **Direitos Autorais**

⚠️ **IMPORTANTE**: Em Angola (e na maioria dos países), o fotógrafo detém os direitos autorais das fotos por padrão. O contrato define apenas a **licença de uso** que o cliente recebe.

**Boas Práticas:**
- Seja claro sobre uso comercial vs pessoal
- Especifique se cliente pode editar as fotos
- Defina se requer créditos/watermarks
- Inclua cláusula sobre terceiros

### **Cancelamentos**

⚠️ **DICA**: Quanto mais próximo do evento, menor o reembolso. Isso compensa o bloqueio da sua agenda.

**Recomendações:**
- Sempre peça um sinal não-reembolsável (20-30%)
- Defina prazos claros (90, 60, 30, 15, 7 dias)
- Considere custos já investidos

### **Prazos de Entrega**

⚠️ **ATENÇÃO**: Seja realista com os prazos! Clientes valorizam transparência.

**Sugestões:**
- Casamentos: 45-90 dias
- Eventos: 15-30 dias
- Ensaios: 7-15 dias
- Sempre adicione margem para imprevistos

---

## 🎓 Dicas Profissionais

### **1. Personalize Sempre**

Mesmo usando templates, personalize:
- Valores específicos
- Prazos adaptados ao seu workflow
- Cláusulas específicas ao cliente
- Condições especiais negociadas

### **2. Use Linguagem Clara**

- Evite juridiquês excessivo
- Explique termos técnicos
- Use exemplos práticos
- Seja direto e honesto

### **3. Proteja-se Legalmente**

⚠️ **AVISO LEGAL**: Estes templates são sugestões educacionais. Para contratos vinculativos, consulte um advogado em Angola.

**Recomendações:**
- Revise com advogado especializado
- Adapte às leis angolanas
- Inclua cláusula de foro (cidade/província)
- Considere registro em cartório para grandes valores

### **4. Mantenha Cópias**

- ✅ Salve PDF após assinatura
- ✅ Faça backup da assinatura digital
- ✅ Guarde emails de comunicação
- ✅ Documente pagamentos

---

## 🗄️ Estrutura no Banco de Dados

### **Campos Adicionados**

```sql
- usage_rights_text: TEXT (direitos de uso)
- cancellation_policy_text: TEXT (cancelamento)
- late_delivery_clause: TEXT (entrega tardia)
- copyright_notice: TEXT (direitos autorais)
- reschedule_policy: TEXT (remarcação)
- revision_policy: TEXT (revisões)
- signature_url: TEXT (imagem da assinatura)
- pdf_url: TEXT (PDF do contrato)
- signature_token: TEXT (token único 64 chars)
```

### **Status Atualizados**

```
'draft' | 'sent' | 'pending_signature' | 
'signed' | 'active' | 'cancelled'
```

---

## 🚀 Próximas Melhorias Sugeridas

- [ ] Geração automática de PDF bonito
- [ ] Envio de email automático com link de assinatura
- [ ] Notificação quando cliente assinar
- [ ] Múltiplas assinaturas (cliente + testemunhas)
- [ ] Versionamento de contratos
- [ ] Histórico de alterações
- [ ] Integração com e-signature services (DocuSign, etc)
- [ ] Tradução automática (PT/EN/FR)
- [ ] Anexos (fotos exemplo, inspirações)
- [ ] Checklist pré-assinatura

---

## ✅ Conclusão

O Sistema de Contratos Profissionais está **100% funcional** e pronto para proteger você e seus clientes!

**Benefícios:**
- ✅ Proteção legal robusta
- ✅ Transparência total
- ✅ Processo profissional
- ✅ Redução de conflitos
- ✅ Registro de tudo
- ✅ Confiança do cliente

**Próximo passo:** Crie seu primeiro contrato profissional agora! 📄✨
