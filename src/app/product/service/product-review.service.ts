import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { Observable } from 'rxjs';
import { Review } from '../interface/review';

@Injectable({
  providedIn: 'root',
})
export class ProductReviewService {
  private http = inject(HttpClient);
  private urlBase = environment.urlReviews;

  getReviewsByProduct(productId: string): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.urlBase}?product_id=${productId}`);
  }

  createReview(
    reviewData: Review
  ): Observable<{ success: boolean; id?: number; error?: string }> {
    return this.http.post<{ success: boolean; id?: number; error?: string }>(
      this.urlBase,
      reviewData
    );
  }

  updateReview(
    id: number,
    reviewData: Review
  ): Observable<{ success: boolean; error?: string }> {
    return this.http.put<{ success: boolean; error?: string }>(
      `${this.urlBase}?id=${id}`,
      reviewData
    );
  }

  deleteReview(
    id: number,
    data: { clerk_user_id: string }
  ): Observable<{ success: boolean; error?: string }> {
    return this.http.request<{ success: boolean; error?: string }>(
      'DELETE',
      `${this.urlBase}?id=${id}`,
      { body: data }
    );
  }

  deleteReviewAsAdmin(
    id: number
  ): Observable<{ success: boolean; error?: string }> {
    return this.http.request<{ success: boolean; error?: string }>(
      'DELETE',
      `${this.urlBase}?id=${id}&admin=1` // Mandá un flag especial
    );
  }
}
