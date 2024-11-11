import { Component } from '@angular/core';
import { CarouselModule } from 'primeng/carousel';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from "./shared/footer/footer.component";
import { HeaderComponent } from "./shared/header/header.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FooterComponent, CarouselModule, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'LocalPixelFactory';
}
