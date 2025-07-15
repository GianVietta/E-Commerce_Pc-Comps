import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class NotificationServiceService {
  private snackBar = inject(MatSnackBar);

  show(
    message: string,
    type: 'success' | 'error' | 'info' | 'warn' = 'info',
    duration: number = 3000
  ) {
    let panelClass = '';

    switch (type) {
      case 'success':
        panelClass = 'snackbar-success';
        break;
      case 'error':
        panelClass = 'snackbar-error';
        break;
      case 'warn':
        panelClass = 'snackbar-warn';
        break;
      default:
        panelClass = 'snackbar-info';
    }

    this.snackBar.open(message, 'Cerrar', {
      duration,
      panelClass: [panelClass],
    });
  }
}
