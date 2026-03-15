import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { EMPTY, of } from 'rxjs';
import { TaskFormComponent } from './task-form.component';
import { TaskService } from '../../core/services/task.service';

describe('TaskFormComponent', () => {
  let component: TaskFormComponent;
  let mockTaskService: { create: jasmine.Spy; getById: jasmine.Spy; update: jasmine.Spy };
  let mockRouter: jasmine.SpyObj<Router>;

  function setup(routeId: string | null = null) {
    mockTaskService = {
      create: jasmine.createSpy().and.returnValue(EMPTY),
      getById: jasmine.createSpy().and.returnValue(EMPTY),
      update: jasmine.createSpy().and.returnValue(EMPTY),
    };
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    const mockActivatedRoute = {
      snapshot: { paramMap: { get: (_key: string) => routeId } },
    };

    TestBed.configureTestingModule({
      imports: [TaskFormComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: TaskService, useValue: mockTaskService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(TaskFormComponent);
    component = fixture.componentInstance;
  }

  describe('create mode', () => {
    beforeEach(() => setup(null));

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('isEditMode is false when no route id', () => {
      component.ngOnInit();
      expect(component.isEditMode()).toBeFalse();
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

  describe('edit mode', () => {
    beforeEach(() => setup('task-123'));

    it('isEditMode is true when route has id', () => {
      component.ngOnInit();
      expect(component.isEditMode()).toBeTrue();
    });

    it('loads task data on init', () => {
      const task = { id: 'task-123', title: 'Existing Task', dueDate: '2026-05-15T12:00:00.000Z', completed: true, userId: 'u1', createdAt: '', updatedAt: '' };
      mockTaskService.getById.and.returnValue(of(task));
      component.ngOnInit();
      expect(mockTaskService.getById).toHaveBeenCalledWith('task-123');
      expect(component.taskForm.value.title).toBe('Existing Task');
      expect(component.taskForm.value.completed).toBeTrue();
      expect(component.taskForm.value.dueDate).toEqual({ year: 2026, month: 5, day: 15 });
    });

    it('loads task with null dueDate', () => {
      const task = { id: 'task-123', title: 'No Date Task', dueDate: null, completed: false, userId: 'u1', createdAt: '', updatedAt: '' };
      mockTaskService.getById.and.returnValue(of(task));
      component.ngOnInit();
      expect(component.taskForm.value.dueDate).toBeNull();
    });

    it('onSubmit() calls taskService.update instead of create', () => {
      mockTaskService.getById.and.returnValue(of({ id: 'task-123', title: 'Old', dueDate: null, completed: false, userId: 'u1', createdAt: '', updatedAt: '' }));
      mockTaskService.update.and.returnValue(of({ id: 'task-123', title: 'Updated', dueDate: null, completed: false }));
      component.ngOnInit();
      component.taskForm.patchValue({ title: 'Updated' });
      component.onSubmit();
      expect(mockTaskService.update).toHaveBeenCalledWith('task-123', { title: 'Updated', completed: false });
      expect(mockTaskService.create).not.toHaveBeenCalled();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
    });

    it('onSubmit() in edit mode includes dueDate when set', () => {
      mockTaskService.getById.and.returnValue(of({ id: 'task-123', title: 'Task', dueDate: null, completed: false, userId: 'u1', createdAt: '', updatedAt: '' }));
      mockTaskService.update.and.returnValue(of({ id: 'task-123', title: 'Task', dueDate: '2026-06-01', completed: true }));
      component.ngOnInit();
      component.taskForm.patchValue({
        title: 'Task',
        dueDate: { year: 2026, month: 6, day: 1 },
        completed: true,
      });
      component.onSubmit();
      expect(mockTaskService.update).toHaveBeenCalledWith('task-123', { title: 'Task', dueDate: '2026-06-01', completed: true });
    });
  });
});
