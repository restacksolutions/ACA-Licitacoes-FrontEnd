export const environment = {
  production: false,
  supabaseUrl: 'https://gpoerydbnxvtlifmwtyb.supabase.co',
  supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdwb2VyeWRibnh2dGxpZm13dHliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxMTY1NDIsImV4cCI6MjA3MjY5MjU0Mn0.gbSwoeTmY5Myn0XwBGViYZVPVgRqIpsl5aouNffNsCs',
  bffUrl: '', // opcional
  // Configurações da API do backend
  apiBaseUrl: 'http://localhost:3000/api/v1', // URL direta para o backend
  apiTimeout: 30000
};

// Para compatibilidade com import.meta.env 
(globalThis as any).NG_APP_SUPABASE_URL = environment.supabaseUrl;
(globalThis as any).NG_APP_SUPABASE_ANON_KEY = environment.supabaseAnonKey;