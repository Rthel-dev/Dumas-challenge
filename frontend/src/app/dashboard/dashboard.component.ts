import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faSearch,
  faBell,
  faCog,
  faPlus,
  faTasks,
  faCheckCircle,
  faSignOutAlt,
} from '@fortawesome/free-solid-svg-icons';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../core/services/auth.service';
import { UserStoreService } from '../core/services/user-store.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterOutlet, RouterLink, FontAwesomeModule, NgbTooltipModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
/**
 * Componente contenedor del panel principal (layout con sidebar y header).
 * Muestra el nombre del usuario y provee navegacion y logout.
 */
export class DashboardComponent {
  // Icons
  faSearch = faSearch;
  faBell = faBell;
  faCog = faCog;
  faPlus = faPlus;
  faTasks = faTasks;
  faCheckCircle = faCheckCircle;
  faSignOutAlt = faSignOutAlt;

  // User profile
  private userStore = inject(UserStoreService);
  currentUser = this.userStore.currentUser;

  constructor(public authService: AuthService) {}
}
