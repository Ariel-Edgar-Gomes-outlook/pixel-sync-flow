export interface CalendarIntegration {
  id: string;
  user_id: string;
  provider: string;
  access_token: string | null;
  refresh_token: string | null;
  token_expires_at: string | null;
  calendar_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
