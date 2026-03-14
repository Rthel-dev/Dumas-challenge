import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { Router } from '@angular/router';
import { EMPTY, of } from 'rxjs';
import { TaskFormComponent } from './task-form.component';
import { TaskService } from '../../core/services/task.service';

describe('TaskFormComponent', () => {
  let component: TaskFormComponent;
  let mockTaskService: { create: jasmine.Spy };
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    mockTaskService = { create: jasmine.createSpy().and.returnValue(EMPTY) };
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [TaskFormComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: TaskService, useValue: mockTaskService },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(TaskFormComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('taskForm has title, dueDate and completed controls', () => {
    expect(component.taskForm.get('title')).toBeTruthy();
    expect(component.taskForm.get('dueDate')).toBeTruthy();
    expect(component.taskForm.get('completed')).toBeTruthy();
  });

  it('form is invalid when title is empty', () => {
    expect(component.taskForm.valid).toBeFalse();
  });

  it('form is valid when only title has a value (dueDate is optional)', () => {
    component.taskForm.patchValue({ title: 'New Task' });
    expect(component.taskForm.valid).toBeTrue();
  });

  it('onSubmit() with invalid form sets submitted but does not call taskService.create', () => {
    component.onSubmit();
    expect(component.submitted()).toBeTrue();
    expect(mockTaskService.create).not.toHaveBeenCalled();
  });

  it('onSubmit() with only title sends request without dueDate', () => {
    mockTaskService.create.and.returnValue(of({ id: '1', title: 'Task', dueDate: null, completed: false }));
    component.taskForm.patchValue({ title: 'Task' });
    component.onSubmit();
    expect(mockTaskService.create).toHaveBeenCalledWith({ title: 'Task' });
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('onSubmit() converts NgbDateStruct to ISO string in request', () => {
    mockTaskService.create.and.returnValue(of({ id: '1', title: 'Task', dueDate: '2026-04-01', completed: false }));
    component.taskForm.patchValue({
      title: 'Task',
      dueDate: { year: 2026, month: 4, day: 1 },
    });
    component.onSubmit();
    expect(mockTaskService.create).toHaveBeenCalledWith({ title: 'Task', dueDate: '2026-04-01' });
  });

  it('onSubmit() includes completed when checked', () => {
    mockTaskService.create.and.returnValue(of({ id: '1', title: 'Task', dueDate: null, completed: true }));
    component.taskForm.patchValue({ title: 'Task', completed: true });
    component.onSubmit();
    expect(mockTaskService.create).toHaveBeenCalledWith({ title: 'Task', completed: true });
  });

  it('onCancel() navigates to /dashboard', () => {
    component.onCancel();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
  });
});
