import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Router } from '@angular/router';
import { faCheckCircle, faClock, faChartLine, faEllipsisV, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { faPenToSquare, faTrashCan } from '@fortawesome/free-regular-svg-icons';
import { TaskService } from '../../core/services/task.service';
import { UserStoreService } from '../../core/services/user-store.service';
import { Task } from '../../core/models/task.models';

export type TabFilter = 'all' | 'pending' | 'completed';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [DatePipe, FormsModule, FontAwesomeModule],
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.scss',
})
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
  pageSize = 10;

  // Computed
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

  paginatedTasks = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredTasks().slice(start, start + this.pageSize);
  });

  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredTasks().length / this.pageSize)),
  );

  totalTasks = computed(() => this.tasks().length);
  completedCount = computed(() => this.tasks().filter((t) => t.completed).length);
  pendingCount = computed(() => this.tasks().filter((t) => !t.completed).length);
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

  loadTasks(): void {
    this.taskService.getAll().subscribe({
      next: (tasks) => this.tasks.set(tasks),
    });
  }

  setTab(tab: TabFilter): void {
    this.activeTab.set(tab);
    this.currentPage.set(1);
  }

  onSearch(query: string): void {
    this.searchQuery.set(query);
    this.currentPage.set(1);
  }

  toggleComplete(task: Task): void {
    this.taskService.update(task.id, { completed: !task.completed }).subscribe({
      next: (updated) => {
        this.tasks.update((tasks) =>
          tasks.map((t) => (t.id === updated.id ? updated : t)),
        );
      },
    });
  }

  editTask(task: Task): void {
    this.router.navigate(['/dashboard/edit', task.id]);
  }

  deleteTask(task: Task): void {
    this.taskService.delete(task.id).subscribe({
      next: () => {
        this.tasks.update((tasks) => tasks.filter((t) => t.id !== task.id));
      },
    });
  }

  prevPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update((p) => p - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update((p) => p + 1);
    }
  }
}
