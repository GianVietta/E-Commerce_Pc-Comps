export interface Review {
  id?: number;
  product_id: string;
  clerk_user_id: string;
  rating: number;
  title?: string;
  content?: string;
  is_verified_purchase?: number; // 1 o 0
  created_at?: string;
  updated_at?: string;
  // Vienen de un JOIN del back
  name?: string;
  last_name?: string;
}
