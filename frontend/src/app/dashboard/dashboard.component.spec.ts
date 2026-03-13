import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import { DashboardComponent } from './dashboard.component';
import { AuthService } from '../core/services/auth.service';
import { UserStoreService } from '../core/services/user-store.service';
import { TaskService } from '../core/services/task.service';
import { EMPTY } from 'rxjs';

describe('DashboardComponent', () => {
  let mockAuthService: { logout: jasmine.Spy };
  let mockUserStore: { currentUser: ReturnType<typeof signal>; loadProfile: jasmine.Spy; clear: jasmine.Spy };
  let mockTaskService: { getAll: jasmine.Spy };

  beforeEach(async () => {
    mockAuthService = { logout: jasmine.createSpy() };
    mockUserStore = {
      currentUser: signal(null),
      loadProfile: jasmine.createSpy(),
      clear: jasmine.createSpy(),
    };
    mockTaskService = { getAll: jasmine.createSpy().and.returnValue(EMPTY) };

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: AuthService, useValue: mockAuthService },
        { provide: UserStoreService, useValue: mockUserStore },
        { provide: TaskService, useValue: mockTaskService },
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(DashboardComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('currentUser reads from userStore signal', () => {
    const fixture = TestBed.createComponent(DashboardComponent);
    expect(fixture.componentInstance.currentUser()).toBeNull();
  });
});
