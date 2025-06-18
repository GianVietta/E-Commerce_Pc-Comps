import { CommonModule } from '@angular/common';
import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements AfterViewInit {
  @ViewChild('signUpDiv', { static: false })
  signUpDiv!: ElementRef<HTMLDivElement>;

  ngAfterViewInit() {
    const mountWidget = () => {
      if (window.Clerk && this.signUpDiv?.nativeElement) {
        window.Clerk.mountSignIn(this.signUpDiv.nativeElement);
      }
    };

    if (window.Clerk && window.Clerk.loaded) {
      mountWidget();
    } else {
      window.Clerk?.addListener?.(mountWidget);
      setTimeout(mountWidget, 500);
    }
  }
}
