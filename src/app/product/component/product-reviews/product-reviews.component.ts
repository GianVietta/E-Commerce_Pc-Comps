import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSelectModule } from '@angular/material/select';

import { ProductReviewService } from '../../service/product-review.service';
import { ReviewCommentsService } from '../../service/review-comments.service';
import { Review } from '../../interface/review';
import { ReviewComment } from '../../interface/review-comment';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { NotificationServiceService } from '../../../notification/notification-service.service';

@Component({
  selector: 'app-product-reviews',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatDividerModule,
    MatExpansionModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatProgressBarModule,
  ],
  templateUrl: './product-reviews.component.html',
  styleUrl: './product-reviews.component.css',
})
export class ProductReviewsComponent implements OnInit {
  @Input() productId!: string;

  reviews: Review[] = [];
  comments: { [reviewId: number]: ReviewComment[] } = {};
  loading = false;
  promedio: number = 0;
  cantidad: number = 0;

  userId: string | undefined;

  userReview?: Review; // Review del usuario actual (si existe)
  reviewForm!: FormGroup;
  editingReview: boolean = false;
  commentForms: { [reviewId: number]: FormGroup } = {};
  starsCount: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  starsPercent: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  hoverRating = 0;

  reviewService = inject(ProductReviewService);
  commentService = inject(ReviewCommentsService);
  fb = inject(FormBuilder);
  ns = inject(NotificationServiceService);

  ngOnInit(): void {
    this.reviewForm = this.fb.group({
      rating: [
        null,
        [Validators.required, Validators.min(1), Validators.max(5)],
      ],
      title: [''],
      content: [''],
    });
    this.loadReviews();
  }

  loadReviews() {
    this.loading = true;
    this.reviewService.getReviewsByProduct(this.productId).subscribe({
      next: (reviews) => {
        this.reviews = reviews;
        this.promedio = reviews.length
          ? +(
              reviews.map((r) => r.rating).reduce((a, b) => a + b, 0) /
              reviews.length
            ).toFixed(1)
          : 0;
        const count: { [key: number]: number } = {
          1: 0,
          2: 0,
          3: 0,
          4: 0,
          5: 0,
        };
        reviews.forEach((r) => count[r.rating]++);
        this.starsCount = count;
        this.cantidad = reviews.length;
        const clerk_user_id = window.Clerk?.user?.id;
        this.userReview = reviews.find(
          (r) => r.clerk_user_id === clerk_user_id
        );
        this.starsPercent = {
          1: this.cantidad ? Math.round((count[1] / this.cantidad) * 100) : 0,
          2: this.cantidad ? Math.round((count[2] / this.cantidad) * 100) : 0,
          3: this.cantidad ? Math.round((count[3] / this.cantidad) * 100) : 0,
          4: this.cantidad ? Math.round((count[4] / this.cantidad) * 100) : 0,
          5: this.cantidad ? Math.round((count[5] / this.cantidad) * 100) : 0,
        };
        // Traer comentarios de cada review (en producción: usar paginado)
        for (let review of reviews) {
          this.loadComments(review.id!);
        }
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  loadComments(reviewId: number) {
    this.commentService.getCommentsByReview(reviewId).subscribe({
      next: (comments) => {
        this.comments[reviewId] = comments;
        // Inicializar form de comentario si no existe
        if (!this.commentForms[reviewId]) {
          this.commentForms[reviewId] = this.fb.group({
            content: ['', Validators.required],
          });
        }
      },
    });
  }

  setRating(star: number) {
    this.reviewForm.patchValue({ rating: star });
  }
  onCommentSubmit(reviewId: number) {
    const form = this.commentForms[reviewId];
    if (form.invalid) return;

    const clerk_user_id = window.Clerk?.user?.id;

    if (!clerk_user_id) {
      this.ns.show('Debes estar logueado para comentar.', 'warn');
      return;
    }
    const commentData = {
      review_id: reviewId,
      clerk_user_id,
      content: form.value.content,
    };

    this.commentService.createComment(commentData).subscribe({
      next: (res) => {
        if (res.success) {
          this.ns.show('Comentario enviado.', 'success');
          form.reset();
          this.loadComments(reviewId);
        } else {
          this.ns.show(res.error || 'Error al comentar.', 'error');
        }
      },
      error: (e) => {
        this.ns.show('Error al enviar comentario.', 'error');
      },
    });
  }

  isEligibleToReview(): boolean {
    // Para ver si esta logueado
    const clerk_user_id = window.Clerk?.user?.id;
    return !!clerk_user_id;
  }

  onReviewSubmit() {
    if (this.reviewForm.invalid) return;
    const clerk_user_id = window.Clerk?.user?.id;
    if (!clerk_user_id) {
      this.ns.show('Debes estar logueado para opinar.', 'warn');
      return;
    }

    const reviewData: Review = {
      product_id: this.productId,
      clerk_user_id,
      rating: this.reviewForm.value.rating,
      title: '', // No lo uso lo dejo vacio
      content: this.reviewForm.value.content,
    };

    this.reviewService.createReview(reviewData).subscribe({
      next: (res) => {
        if (res.success) {
          this.ns.show('¡Gracias por tu opinión!', 'success');
          this.reviewForm.reset();
          this.loadReviews();
        } else {
          this.ns.show(res.error || 'Error al enviar review.', 'error');
        }
      },
      error: () => {
        this.ns.show('Error al enviar review.', 'error');
      },
    });
  }

  get isLoggedIn(): boolean {
    return !!window.Clerk?.user?.id;
  }

  isAdmin(): boolean {
    return !!window.Clerk?.user?.publicMetadata?.['isAdmin'];
  }

  isAdminReview(clerk_user_id: string): boolean {
    return clerk_user_id === window.Clerk?.user?.id && this.isAdmin();
  }

  editMyReview() {
    if (!this.userReview) return;
    this.editingReview = true;
    this.reviewForm.patchValue({
      rating: this.userReview.rating,
      content: this.userReview.content,
      title: this.userReview.title || '',
    });
  }

  onEditReviewSubmit() {
    if (this.reviewForm.invalid || !this.userReview) return;
    const clerk_user_id = window.Clerk?.user?.id;
    if (clerk_user_id) {
      this.reviewService
        .updateReview(this.userReview.id!, {
          ...this.userReview,
          clerk_user_id,
          rating: this.reviewForm.value.rating,
          content: this.reviewForm.value.content,
          title: '', // no uso titulo
        })
        .subscribe({
          next: (res) => {
            if (res.success) {
              this.ns.show('¡Review actualizada!', 'success');
              this.editingReview = false;
              this.reviewForm.reset();
              this.loadReviews();
            } else {
              this.ns.show(res.error || 'Error al actualizar.', 'error');
            }
          },
          error: () => {
            this.ns.show('Error al actualizar review.', 'error');
          },
        });
    } else {
      console.log('Error no se encontro el usuario.');
    }
  }

  cancelEdit() {
    this.editingReview = false;
    this.reviewForm.reset();
  }

  deleteMyReview() {
    if (!this.userReview) return;
    const confirmDelete = confirm('¿Seguro que deseas eliminar tu opinión?');
    if (!confirmDelete) return;
    const clerk_user_id = window.Clerk?.user?.id;
    if (clerk_user_id) {
      this.reviewService
        .deleteReview(this.userReview.id!, { clerk_user_id })
        .subscribe({
          next: (res) => {
            if (res.success) {
              this.ns.show('Review eliminada.', 'success');
              this.userReview = undefined;
              this.loadReviews();
            } else {
              this.ns.show(res.error || 'Error al eliminar.', 'error');
            }
          },
          error: () => {
            this.ns.show('Error al eliminar review.', 'error');
          },
        });
    } else {
      console.log('Error no se encuentra el usuario.');
    }
  }

  deleteReviewAsAdmin(review: Review) {
    if (!confirm('¿Eliminar esta opinión?')) return;
    this.reviewService.deleteReviewAsAdmin(review.id!).subscribe({
      next: (res) => {
        if (res.success) {
          this.ns.show('Opinión eliminada.', 'success');
          this.loadReviews();
        }
      },
    });
  }

  deleteCommentAsAdmin(comment: ReviewComment) {
    if (!confirm('¿Eliminar este comentario?')) return;
    this.commentService.deleteCommentAsAdmin(comment.id!).subscribe({
      next: (res) => {
        if (res.success) {
          this.ns.show('Comentario eliminado.', 'success');
          // Recargá los comentarios de la review correspondiente
          this.loadComments(comment.review_id);
        }
      },
    });
  }
}
