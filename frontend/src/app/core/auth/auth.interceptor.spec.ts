import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from './auth.service';

/** Tạo JWT giả (chỉ cần phần payload đọc được, không cần chữ ký đúng). */
const fakeJwt = (name: string) => {
  const payload = btoa(JSON.stringify({ id: '1', email: 'a@b.c', fullName: name }));
  return `header.${payload}.signature`;
};

describe('authInterceptor', () => {
  const api = environment.apiUrl;
  let http: HttpClient;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    localStorage.setItem(
      'soundspace.auth',
      JSON.stringify({ token: fakeJwt('old'), refreshToken: 'refresh-old' }),
    );
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });
    http = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
    localStorage.clear();
  });

  it('gắn access token vào request tới API, không gắn cho địa chỉ khác', () => {
    http.get(`${api}/profile`).subscribe();
    http.get('https://example.com/data').subscribe();

    expect(httpTesting.expectOne(`${api}/profile`).request.headers.get('Authorization')).toBe(
      `Bearer ${fakeJwt('old')}`,
    );
    expect(
      httpTesting.expectOne('https://example.com/data').request.headers.has('Authorization'),
    ).toBe(false);
  });

  it('gặp 401 thì làm mới token một lần cho nhiều request rồi gửi lại', () => {
    const results: unknown[] = [];
    http.get(`${api}/profile`).subscribe((body) => results.push(body));
    http.get(`${api}/admin/user/paging`).subscribe((body) => results.push(body));

    httpTesting.expectOne(`${api}/profile`).flush('', { status: 401, statusText: 'Unauthorized' });
    httpTesting
      .expectOne(`${api}/admin/user/paging`)
      .flush('', { status: 401, statusText: 'Unauthorized' });

    const refresh = httpTesting.expectOne(`${api}/token/refresh`);
    expect(refresh.request.body).toEqual({
      accessToken: fakeJwt('old'),
      refreshToken: 'refresh-old',
    });
    refresh.flush({ token: fakeJwt('new'), refreshToken: 'refresh-new' });

    const retries = httpTesting.match(
      (req) => req.headers.get('Authorization') === `Bearer ${fakeJwt('new')}`,
    );
    expect(retries.length).toBe(2);
    retries.forEach((req) => req.flush({ ok: true }));

    expect(results.length).toBe(2);
    expect(TestBed.inject(AuthService).currentUser()?.fullName).toBe('new');
  });

  it('làm mới thất bại (401) thì xoá phiên và chuyển về trang đăng nhập', () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    let failed = false;
    http.get(`${api}/profile`).subscribe({ error: () => (failed = true) });

    httpTesting.expectOne(`${api}/profile`).flush('', { status: 401, statusText: 'Unauthorized' });
    httpTesting
      .expectOne(`${api}/token/refresh`)
      .flush('Phiên đăng nhập đã hết hạn.', { status: 401, statusText: 'Unauthorized' });

    expect(failed).toBe(true);
    expect(TestBed.inject(AuthService).isLoggedIn()).toBe(false);
    expect(localStorage.getItem('soundspace.auth')).toBeNull();
    expect(navigate).toHaveBeenCalledWith(['/login'], expect.anything());
  });
});
