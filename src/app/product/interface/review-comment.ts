export interface ReviewComment {
  id?: number;
  review_id: number;
  clerk_user_id: string;
  content: string;
  created_at?: string;
  updated_at?: string;
  // Estos dos los meto por un JOIN en el back
  name?: string;
  last_name?: string;
}
