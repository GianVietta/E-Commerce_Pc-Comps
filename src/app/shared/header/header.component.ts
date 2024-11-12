import { Component, inject, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { RouterLink } from '@angular/router';
import { LoginComponent } from '../../auth/component/login/login.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  encapsulation: ViewEncapsulation.Emulated
})
export class HeaderComponent {
  readonly dialog = inject(MatDialog);

  login(){
    const dialogRef = this.dialog.open(LoginComponent, {
      disableClose : true ,
      autoFocus: true,
      closeOnNavigation : false,
      position: {top: '50px'},
      width : '1000px',
      data : {
        tipo: 'LOGIN'
      }
    });
    
    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }
}
