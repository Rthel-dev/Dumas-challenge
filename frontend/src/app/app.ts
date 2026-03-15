import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/** Componente raiz de la aplicacion. Renderiza el `<router-outlet>`. */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('frontend');
}
