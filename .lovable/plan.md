## !Análise do backup enviado

O ficheiro `db_cluster-05-12-2025@05-28-49.backup.gz` é um **cluster dump apenas de schema** (não contém dados de utilizadores nem registos das tabelas — apenas a estrutura). Já o descompactei e inspecionei.

Conteúdo identificado no schema `public`:

- **30 tabelas**: `admin_users`, `audit_logs`, `business_settings`, `calendar_integrations`, `checklist_templates`, `checklists`, `client_galleries`, `clients`, `contract_templates`, `contracts`, `deliverables`, `gallery_photos`, `improvement_suggestions`, `invoices`, `job_resources`, `job_team_members`, `jobs`, `leads`, `notification_settings`, `notifications`, `payment_plans`, `payment_reminders`, `payments`, `profiles`, `quote_templates`, `quotes`, `resources`, `team_members`, `time_entries`, `user_preferences`, `user_roles`
- **8 enums**: `app_role`, `contract_status`, `job_status`, `lead_status`, `notification_priority`, `notification_type`, `payment_status`, `quote_status`
- **12 funções**: `has_role`, `is_admin`, `handle_new_user`, `update_updated_at_column`, `create_default_notification_settings`, `create_system_notification`, `handle_notifications_updated_at`, `send_notification_email_trigger`, `sync_payment_to_invoice_and_quote`, `check_resource_availability`, `log_audit`, `user_has_active_subscription`
- **Triggers, índices, políticas RLS** completas
- **4 buckets de Storage**: `receipts`, `contracts`, `deliverables`, `pdfs` (privados) com respetivas políticas

## O que vou fazer

1. **Extrair do backup** todo o SQL relativo ao schema `public` (tipos, tabelas, funções, triggers, índices, RLS, GRANTs) e adaptá-lo para o novo projeto Supabase `jspsuwpboewyffxrnzpj`.
2. **Submeter uma única migração** que cria, por esta ordem:
  - Enums
  - Funções utilitárias (`has_role`, `update_updated_at_column`, etc.)
  - Tabelas com `GRANT` adequados a `authenticated` / `service_role`
  - Triggers e índices
  - Políticas RLS (idênticas ao original)
3. **Criar os 4 buckets de Storage** (`receipts`, `contracts`, `deliverables`, `pdfs`) com as políticas de acesso originais.
4. **Verificar** após a migração que todas as tabelas estão acessíveis e que o linter Supabase não reporta erros críticos.

## O que NÃO está incluído (e porquê)

- **Dados das tabelas** — o dump não contém registos (`INSERT`/`COPY`) das tabelas `public`. Só restauro a estrutura. Se tiveres um dump de dados separado (`.sql` com `COPY` ou `.csv`), envia para eu importar a seguir.
- **Utilizadores `auth.users**` — não estão no backup; terão de registar-se novamente (ou enviares um dump específico de `auth`).
- **Ficheiros de Storage** — os buckets serão recriados vazios; os ficheiros físicos não vêm no dump SQL.
- **Secrets de Edge Functions** — `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` e `RESEND_API_KEY` já estão configurados no novo projeto, por isso ficam intactos.

## Detalhes técnicos

- A migração será feita via `supabase--migration` num único bloco transacional, respeitando a ordem `CREATE TABLE → GRANT → ENABLE RLS → CREATE POLICY` exigida pelo PostgREST.
- Referências `auth.users(id)` são mantidas (apenas FK, sem alterar o schema `auth`).
- Sequências, defaults (`gen_random_uuid()`, `now()`) e `ON DELETE CASCADE` preservados tal como no original.

Confirma para eu avançar com a migração.