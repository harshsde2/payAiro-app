// Types for the FastAPI FAQ API (user-facing).

export interface FaqItem {
  id: number;
  question: string;
  answer: string;
  category: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FaqListResponse {
  success: boolean;
  message: string;
  data: FaqItem[];
}
