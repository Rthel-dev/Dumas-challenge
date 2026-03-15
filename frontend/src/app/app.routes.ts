import { Routes } from '@angular/router';
import { AuthComponent } from './auth/auth.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { TaskListComponent } from './dashboard/task-list/task-list.component';
import { TaskFormComponent } from './dashboard/task-form/task-form.component';
import { authGuard } from './core/guards/auth.guard';

/**
 * Definicion de rutas de la aplicacion.
 *
 * - `/auth` — Pagina de login/registro.
 * - `/dashboard` — Panel principal (protegido por {@link authGuard}).
 *   - `/dashboard` — Lista de tareas.
 *   - `/dashboard/new` — Formulario de creacion.
 *   - `/dashboard/edit/:id` — Formulario de edicion.
 * - Rutas no encontradas redirigen a `/auth`.
 */
export const routes: Routes = [
  { path: 'auth', component: AuthComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
    children: [
      { path: '', component: TaskListComponent },
      { path: 'new', component: TaskFormComponent },
      { path: 'edit/:id', component: TaskFormComponent },
    ],
  },
  { path: '', redirectTo: '/auth', pathMatch: 'full' },
  { path: '**', redirectTo: '/auth' },
];
