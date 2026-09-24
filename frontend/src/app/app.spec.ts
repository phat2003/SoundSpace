import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { App } from './app';
import { routes } from './app.routes';

describe('App', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes)],
    });
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the shell layout with sidebar, header and player bar', async () => {
    const harness = await RouterTestingHarness.create('/');
    const root = harness.fixture.nativeElement as HTMLElement;

    expect(root.querySelector('app-sidebar nav')?.textContent).toContain('Khám phá');
    expect(root.querySelector('#global-search')).toBeTruthy();
    expect(root.querySelector('app-player-bar')?.textContent).toContain('Neon Horizon');
  });

  it('marks the current page as active in the sidebar', async () => {
    const harness = await RouterTestingHarness.create('/library');
    const root = harness.fixture.nativeElement as HTMLElement;
    const active = root.querySelector('app-sidebar a[aria-current="page"]');

    expect(active?.textContent).toContain('Thư viện');
  });
});
