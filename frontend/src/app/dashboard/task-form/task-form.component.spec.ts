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

  it('taskForm is defined with title and dueDate controls', () => {
    expect(component.taskForm).toBeDefined();
    expect(component.taskForm.get('title')).toBeTruthy();
    expect(component.taskForm.get('dueDate')).toBeTruthy();
  });

  it('form is invalid when empty', () => {
    expect(component.taskForm.valid).toBeFalse();
  });

  it('form is valid when title and dueDate are set', () => {
    component.taskForm.setValue({ title: 'New Task', dueDate: '2026-04-01' });
    expect(component.taskForm.valid).toBeTrue();
  });

  it('onSubmit() with invalid form does not call taskService.create', () => {
    component.onSubmit();
    expect(mockTaskService.create).not.toHaveBeenCalled();
  });

  it('onSubmit() with valid form calls taskService.create and navigates to /dashboard', () => {
    mockTaskService.create.and.returnValue(of({ id: '1', title: 'New Task', dueDate: '2026-04-01', completed: false }));
    component.taskForm.setValue({ title: 'New Task', dueDate: '2026-04-01' });
    component.onSubmit();
    expect(mockTaskService.create).toHaveBeenCalledWith({ title: 'New Task', dueDate: '2026-04-01' });
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('onCancel() navigates to /dashboard', () => {
    component.onCancel();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
  });
});
