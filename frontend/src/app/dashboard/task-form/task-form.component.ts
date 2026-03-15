import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faLightbulb } from '@fortawesome/free-solid-svg-icons';
import { NgbDatepickerModule, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { TaskService } from '../../core/services/task.service';
import { CreateTaskRequest, UpdateTaskRequest } from '../../core/models/task.models';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [ReactiveFormsModule, FontAwesomeModule, NgbDatepickerModule],
  templateUrl: './task-form.component.html',
  styleUrl: './task-form.component.scss',
})
export class TaskFormComponent implements OnInit {
  faLightbulb = faLightbulb;

  private fb = inject(FormBuilder);
  private taskService = inject(TaskService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  submitted = signal(false);
  isEditMode = signal(false);
  private taskId = signal<string | null>(null);

  taskForm = this.fb.group({
    title: ['', [Validators.required]],
    dueDate: [null as NgbDateStruct | null],
    completed: [false],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.taskId.set(id);
      this.taskService.getById(id).subscribe({
        next: (task) => {
          this.taskForm.patchValue({
            title: task.title,
            dueDate: task.dueDate ? this.parseDate(task.dueDate) : null,
            completed: task.completed,
          });
        },
      });
    }
  }

  onSubmit(): void {
    this.submitted.set(true);
    if (this.taskForm.invalid) return;

    const { title, dueDate, completed } = this.taskForm.value;

    if (this.isEditMode()) {
      const request: UpdateTaskRequest = { title: title! };
      if (dueDate) {
        request.dueDate = this.formatDate(dueDate);
      }
      request.completed = completed ?? false;

      this.taskService.update(this.taskId()!, request).subscribe({
        next: () => this.router.navigate(['/dashboard']),
      });
    } else {
      const request: CreateTaskRequest = { title: title! };
      if (dueDate) {
        request.dueDate = this.formatDate(dueDate);
      }
      if (completed) {
        request.completed = completed;
      }

      this.taskService.create(request).subscribe({
        next: () => this.router.navigate(['/dashboard']),
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/dashboard']);
  }

  private formatDate(date: NgbDateStruct): string {
    const y = date.year;
    const m = String(date.month).padStart(2, '0');
    const d = String(date.day).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  private parseDate(dateStr: string): NgbDateStruct {
    const date = new Date(dateStr);
    return {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
    };
  }
}
