import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { DashboardComponent } from './dashboard.component';
import { AuthService } from '../core/services/auth.service';

describe('DashboardComponent', () => {
  let mockAuthService: { logout: jasmine.Spy };

  beforeEach(async () => {
    mockAuthService = { logout: jasmine.createSpy() };

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(DashboardComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('click on logout button calls authService.logout', () => {
    const fixture = TestBed.createComponent(DashboardComponent);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button');
    button?.click();
    expect(mockAuthService.logout).toHaveBeenCalled();
  });
});
