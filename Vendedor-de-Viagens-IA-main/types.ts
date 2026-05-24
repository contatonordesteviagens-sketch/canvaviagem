
export interface GeneratedOption {
  content: string;
  technique: string;
  rationale: string;
  methodology: string;
  source: string;
  psychologyTip: string;
  branches?: {
    positive: string;
    negative: string;
  };
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  options?: GeneratedOption[];
  timestamp: number;
  error?: boolean;
}

export interface ChatSession {
  id: string;
  user_id?: string;
  title: string;
  messages: Message[];
  lastModified: number;
  user_email?: string; // Para o admin ver quem é o dono da conversa
}

export interface UserProfile {
  id: string;
  full_name?: string;
  agency_name?: string;
  phone?: string;
  email?: string;
  created_at?: string;
}

export type AppView = 'chat' | 'library' | 'settings' | 'admin' | 'help';

export interface AdminStats {
  totalUsers: number;
  totalChats: number;
  activeToday: number;
  mostCopiedTechnique: string;
  recentQueries: {
    user: string;
    text: string;
    time: number;
  }[];
}
