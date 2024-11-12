import { Component, ViewEncapsulation } from '@angular/core';
import { SalesComponent } from "../../component/sales/sales.component";

@Component({
  selector: 'app-sales-page',
  standalone: true,
  imports: [SalesComponent],
  templateUrl: './sales-page.component.html',
  styleUrl: './sales-page.component.css',
  encapsulation: ViewEncapsulation.Emulated
})
export class SalesPageComponent {

}
