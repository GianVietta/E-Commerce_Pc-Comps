import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { Observable } from 'rxjs';
import { ReviewComment } from '../interface/review-comment';

@Injectable({
  providedIn: 'root',
})
export class ReviewCommentsService {
  private http = inject(HttpClient);
  private urlBase = environment.urlRevComments;

  getCommentsByReview(reviewId: number): Observable<ReviewComment[]> {
    return this.http.get<ReviewComment[]>(
      `${this.urlBase}?review_id=${reviewId}`
    );
  }

  createComment(
    commentData: any
  ): Observable<{ success: boolean; id?: number; error?: string }> {
    return this.http.post<{ success: boolean; id?: number; error?: string }>(
      this.urlBase,
      commentData
    );
  }

  deleteComment(
    id: number,
    data: { clerk_user_id: string }
  ): Observable<{ success: boolean; error?: string }> {
    return this.http.request<{ success: boolean; error?: string }>(
      'DELETE',
      `${this.urlBase}?id=${id}`,
      {
        body: data,
      }
    );
  }

  deleteCommentAsAdmin(
    id: number
  ): Observable<{ success: boolean; error?: string }> {
    return this.http.request<{ success: boolean; error?: string }>(
      'DELETE',
      `${this.urlBase}?id=${id}&admin=1`
    );
  }
}
