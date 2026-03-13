import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faLightbulb } from '@fortawesome/free-solid-svg-icons';
import { TaskService } from '../../core/services/task.service';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [ReactiveFormsModule, FontAwesomeModule],
  templateUrl: './task-form.component.html',
  styleUrl: './task-form.component.scss',
})
export class TaskFormComponent {
  faLightbulb = faLightbulb;

  private fb = inject(FormBuilder);
  private taskService = inject(TaskService);
  private router = inject(Router);

  taskForm = this.fb.group({
    title: ['', [Validators.required]],
    dueDate: ['', [Validators.required]],
  });

  onSubmit(): void {
    if (this.taskForm.invalid) return;

    const { title, dueDate } = this.taskForm.value;
    this.taskService.create({ title: title!, dueDate: dueDate! }).subscribe({
      next: () => this.router.navigate(['/dashboard']),
    });
  }

  onCancel(): void {
    this.router.navigate(['/dashboard']);
  }
}
