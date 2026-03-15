import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { faCheckCircle, faClock, faChartLine, faEllipsisV, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { faPenToSquare, faTrashCan } from '@fortawesome/free-regular-svg-icons';
import { TaskService } from '../../core/services/task.service';
import { UserStoreService } from '../../core/services/user-store.service';
import { Task } from '../../core/models/task.models';

/** Filtro de pestanas para la lista de tareas. */
export type TabFilter = 'all' | 'pending' | 'completed';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [DatePipe, FormsModule, FontAwesomeModule, NgbDropdownModule],
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.scss',
})
/**
 * Componente que muestra la lista de tareas con filtrado, busqueda y paginacion.
 * Permite marcar tareas como completadas, editarlas y eliminarlas.
 */
export class TaskListComponent implements OnInit {
  // Icons
  faCheckCircle = faCheckCircle;
  faClock = faClock;
  faChartLine = faChartLine;
  faEllipsisV = faEllipsisV;
  faChevronDown = faChevronDown;
  faPenToSquare = faPenToSquare;
  faTrashCan = faTrashCan;

  // State
  tasks = signal<Task[]>([]);
  activeTab = signal<TabFilter>('all');
  searchQuery = signal('');
  currentPage = signal(1);
  pageSize = 8;

  /** Tareas filtradas por pestana activa y termino de busqueda. */
  filteredTasks = computed(() => {
    let result = this.tasks();
    const query = this.searchQuery().toLowerCase();
    if (query) {
      result = result.filter((t) => t.title.toLowerCase().includes(query));
    }
    switch (this.activeTab()) {
      case 'pending':
        return result.filter((t) => !t.completed);
      case 'completed':
        return result.filter((t) => t.completed);
      default:
        return result;
    }
  });

  /** Subconjunto de tareas filtradas para la pagina actual. */
  paginatedTasks = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredTasks().slice(start, start + this.pageSize);
  });

  /** Numero total de paginas segun las tareas filtradas. */
  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredTasks().length / this.pageSize)),
  );

  /** Cantidad total de tareas del usuario. */
  totalTasks = computed(() => this.tasks().length);
  /** Cantidad de tareas completadas. */
  completedCount = computed(() => this.tasks().filter((t) => t.completed).length);
  /** Cantidad de tareas pendientes. */
  pendingCount = computed(() => this.tasks().filter((t) => !t.completed).length);
  /** Porcentaje de tareas completadas (0-100). */
  completionRate = computed(() => {
    const total = this.totalTasks();
    return total === 0 ? 0 : Math.round((this.completedCount() / total) * 100);
  });

  // User profile
  private userStore = inject(UserStoreService);
  currentUser = this.userStore.currentUser;

  private taskService = inject(TaskService);
  private router = inject(Router);

  ngOnInit(): void {
    this.loadTasks();
  }

  /** Recarga la lista completa de tareas desde el servidor. */
  loadTasks(): void {
    this.taskService.getAll().subscribe({
      next: (tasks) => this.tasks.set(tasks),
    });
  }

  /**
   * Cambia el filtro de pestana activo y reinicia la paginacion.
   * @param tab - Filtro a aplicar.
   */
  setTab(tab: TabFilter): void {
    this.activeTab.set(tab);
    this.currentPage.set(1);
  }

  /**
   * Actualiza el termino de busqueda y reinicia la paginacion.
   * @param query - Texto de busqueda.
   */
  onSearch(query: string): void {
    this.searchQuery.set(query);
    this.currentPage.set(1);
  }

  /**
   * Alterna el estado de completado de una tarea en el servidor
   * y actualiza la lista local.
   * @param task - Tarea a alternar.
   */
  toggleComplete(task: Task): void {
    this.taskService.update(task.id, { completed: !task.completed }).subscribe({
      next: (updated) => {
        this.tasks.update((tasks) =>
          tasks.map((t) => (t.id === updated.id ? updated : t)),
        );
      },
    });
  }

  /**
   * Navega al formulario de edicion de la tarea.
   * @param task - Tarea a editar.
   */
  editTask(task: Task): void {
    this.router.navigate(['/dashboard/edit', task.id]);
  }

  /**
   * Elimina una tarea del servidor y la remueve de la lista local.
   * @param task - Tarea a eliminar.
   */
  deleteTask(task: Task): void {
    this.taskService.delete(task.id).subscribe({
      next: () => {
        this.tasks.update((tasks) => tasks.filter((t) => t.id !== task.id));
      },
    });
  }

  /** Retrocede una pagina en la paginacion. */
  prevPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update((p) => p - 1);
    }
  }

  /** Avanza una pagina en la paginacion. */
  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update((p) => p + 1);
    }
  }
}
