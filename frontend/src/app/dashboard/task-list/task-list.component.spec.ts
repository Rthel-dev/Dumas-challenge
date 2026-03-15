import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import { Router } from '@angular/router';
import { EMPTY, of } from 'rxjs';
import { TaskListComponent } from './task-list.component';
import { TaskService } from '../../core/services/task.service';
import { UserStoreService } from '../../core/services/user-store.service';

describe('TaskListComponent', () => {
  let component: TaskListComponent;
  let fixture: ComponentFixture<TaskListComponent>;
  let mockTaskService: { getAll: jasmine.Spy; update: jasmine.Spy; delete: jasmine.Spy };
  let mockUserStore: { currentUser: ReturnType<typeof signal>; loadProfile: jasmine.Spy; clear: jasmine.Spy };
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    mockTaskService = {
      getAll: jasmine.createSpy().and.returnValue(EMPTY),
      update: jasmine.createSpy().and.returnValue(EMPTY),
      delete: jasmine.createSpy().and.returnValue(EMPTY),
    };
    mockUserStore = {
      currentUser: signal({ id: '1', fullName: 'Test User', email: 'test@example.com' }),
      loadProfile: jasmine.createSpy(),
      clear: jasmine.createSpy(),
    };
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [TaskListComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: TaskService, useValue: mockTaskService },
        { provide: UserStoreService, useValue: mockUserStore },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads tasks on init', () => {
    component.ngOnInit();
    expect(mockTaskService.getAll).toHaveBeenCalled();
  });

  it('currentUser reads from userStore signal', () => {
    expect(component.currentUser()?.fullName).toBe('Test User');
  });

  it('setTab changes activeTab and resets page', () => {
    component.currentPage.set(3);
    component.setTab('completed');
    expect(component.activeTab()).toBe('completed');
    expect(component.currentPage()).toBe(1);
  });

  it('onSearch sets searchQuery and resets page', () => {
    component.currentPage.set(2);
    component.onSearch('test');
    expect(component.searchQuery()).toBe('test');
    expect(component.currentPage()).toBe(1);
  });

  it('filteredTasks filters by search query', () => {
    component.tasks.set([
      { id: '1', title: 'Build app', dueDate: '2026-04-01', completed: false, userId: 'u1', createdAt: '', updatedAt: '' },
      { id: '2', title: 'Write docs', dueDate: '2026-04-02', completed: false, userId: 'u1', createdAt: '', updatedAt: '' },
    ]);
    component.searchQuery.set('build');
    expect(component.filteredTasks().length).toBe(1);
    expect(component.filteredTasks()[0].title).toBe('Build app');
  });

  it('filteredTasks filters by tab', () => {
    component.tasks.set([
      { id: '1', title: 'Task A', dueDate: '2026-04-01', completed: false, userId: 'u1', createdAt: '', updatedAt: '' },
      { id: '2', title: 'Task B', dueDate: '2026-04-02', completed: true, userId: 'u1', createdAt: '', updatedAt: '' },
    ]);
    component.activeTab.set('completed');
    expect(component.filteredTasks().length).toBe(1);
    expect(component.filteredTasks()[0].id).toBe('2');
  });

  it('toggleComplete calls taskService.update', () => {
    const task = { id: '1', title: 'Task', dueDate: '2026-04-01', completed: false, userId: 'u1', createdAt: '', updatedAt: '' };
    mockTaskService.update.and.returnValue(of({ ...task, completed: true }));
    component.tasks.set([task]);
    component.toggleComplete(task);
    expect(mockTaskService.update).toHaveBeenCalledWith('1', { completed: true });
  });

  it('deleteTask calls taskService.delete and removes task from list', () => {
    const task = { id: '1', title: 'Task', dueDate: '2026-04-01', completed: false, userId: 'u1', createdAt: '', updatedAt: '' };
    mockTaskService.delete.and.returnValue(of(undefined));
    component.tasks.set([task]);
    component.deleteTask(task);
    expect(mockTaskService.delete).toHaveBeenCalledWith('1');
    expect(component.tasks().length).toBe(0);
  });

  it('editTask navigates to /dashboard/edit/:id', () => {
    const task = { id: 'abc-123', title: 'Task', dueDate: '2026-04-01', completed: false, userId: 'u1', createdAt: '', updatedAt: '' };
    component.editTask(task);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard/edit', 'abc-123']);
  });

  it('computed stats are correct', () => {
    component.tasks.set([
      { id: '1', title: 'A', dueDate: '2026-04-01', completed: true, userId: 'u1', createdAt: '', updatedAt: '' },
      { id: '2', title: 'B', dueDate: '2026-04-02', completed: false, userId: 'u1', createdAt: '', updatedAt: '' },
      { id: '3', title: 'C', dueDate: '2026-04-03', completed: true, userId: 'u1', createdAt: '', updatedAt: '' },
    ]);
    expect(component.totalTasks()).toBe(3);
    expect(component.completedCount()).toBe(2);
    expect(component.pendingCount()).toBe(1);
    expect(component.completionRate()).toBe(67);
  });

  describe('dueDate rendering in DOM', () => {
    function getDateCell(): string {
      fixture.detectChanges();
      const row = fixture.nativeElement.querySelector('tbody tr');
      const cells = row?.querySelectorAll('td');
      return cells?.[2]?.textContent?.trim() ?? '';
    }

    it('renders local-midnight-as-UTC date correctly', () => {
      // Simulate a date stored as local midnight converted to UTC (as formatDate does)
      const localMidnightUtc = new Date(2026, 3, 1).toISOString();
      component.tasks.set([
        { id: '1', title: 'Task', dueDate: localMidnightUtc, completed: false, userId: 'u1', createdAt: '', updatedAt: '' },
      ]);
      expect(getDateCell()).toBe('01 Apr 2026');
    });

    it('renders empty when dueDate is null', () => {
      component.tasks.set([
        { id: '1', title: 'Task', dueDate: null, completed: false, userId: 'u1', createdAt: '', updatedAt: '' },
      ]);
      expect(getDateCell()).toBe('');
    });
  });
});
