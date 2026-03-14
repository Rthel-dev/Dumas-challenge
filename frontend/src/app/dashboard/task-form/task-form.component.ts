import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faLightbulb } from '@fortawesome/free-solid-svg-icons';
import { NgbDatepickerModule, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { TaskService } from '../../core/services/task.service';
import { CreateTaskRequest } from '../../core/models/task.models';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [ReactiveFormsModule, FontAwesomeModule, NgbDatepickerModule],
  templateUrl: './task-form.component.html',
  styleUrl: './task-form.component.scss',
})
export class TaskFormComponent {
  faLightbulb = faLightbulb;

  private fb = inject(FormBuilder);
  private taskService = inject(TaskService);
  private router = inject(Router);

  submitted = signal(false);

  taskForm = this.fb.group({
    title: ['', [Validators.required]],
    dueDate: [null as NgbDateStruct | null],
    completed: [false],
  });

  onSubmit(): void {
    this.submitted.set(true);
    if (this.taskForm.invalid) return;

    const { title, dueDate, completed } = this.taskForm.value;
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

  onCancel(): void {
    this.router.navigate(['/dashboard']);
  }

  private formatDate(date: NgbDateStruct): string {
    const y = date.year;
    const m = String(date.month).padStart(2, '0');
    const d = String(date.day).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}
