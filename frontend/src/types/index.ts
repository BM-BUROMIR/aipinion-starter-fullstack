export interface User {
  sub: string;
  display_name: string;
  user_type: string;
  apps: Record<string, string[]>;
}

export interface Example {
  id: string;
  title: string;
  description: string;
  created_at: string;
}

export interface HealthResponse {
  status: string;
}
