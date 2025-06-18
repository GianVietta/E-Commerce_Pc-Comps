import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef,MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements AfterViewInit {
  @ViewChild('signInDiv', { static: false })
  signInDiv!: ElementRef<HTMLDivElement>;

  constructor(private dialogRef: MatDialogRef<LoginComponent>){}

  ngAfterViewInit() {
    const mountWidget = () => {
      if (window.Clerk && this.signInDiv?.nativeElement) {
        window.Clerk.mountSignIn(this.signInDiv.nativeElement);
      }
    };

    if (window.Clerk && window.Clerk.loaded) {
      mountWidget();
    } else {
      window.Clerk?.addListener?.(mountWidget);
      setTimeout(mountWidget, 500);
    }
  }
  close(){
    this.dialogRef.close();
  }
}