import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { AuthService } from '../core/services/auth.service';
import { UserStoreService } from '../core/services/user-store.service';

describe('DashboardComponent', () => {
  let mockAuthService: { logout: jasmine.Spy };
  let mockUserStore: { currentUser: ReturnType<typeof signal>; loadProfile: jasmine.Spy; clear: jasmine.Spy };

  beforeEach(async () => {
    mockAuthService = { logout: jasmine.createSpy() };
    mockUserStore = {
      currentUser: signal(null),
      loadProfile: jasmine.createSpy(),
      clear: jasmine.createSpy(),
    };

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        { provide: AuthService, useValue: mockAuthService },
        { provide: UserStoreService, useValue: mockUserStore },
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
