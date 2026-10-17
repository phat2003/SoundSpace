import { HttpClient, HttpContext, HttpContextToken } from '@angular/common/http';
import { computed, inject, Service, signal } from '@angular/core';
import { Router } from '@angular/router';
import { finalize, firstValueFrom, Observable, shareReplay, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthenticatedResult, CurrentUser, LoginRequest, RegisterRequest } from '../models/auth';

export const ADMIN_ROLE = 'Admin';

/** Đánh dấu request không được tự làm mới token khi gặp 401 (login, register, refresh, revoke). */
export const SKIP_TOKEN_REFRESH = new HttpContextToken(() => false);

const STORAGE_KEY = 'soundspace.auth';
// Tên claim do backend (System.IdentityModel.Tokens.Jwt) ghi vào token.
const ROLE_CLAIM = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';

/**
 * Quản lý phiên đăng nhập: gọi API auth, lưu cặp token vào localStorage
 * và cung cấp thông tin người dùng hiện tại dạng signal cho toàn app.
 */
@Service()
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly apiUrl = environment.apiUrl;
  private readonly skipRefresh = new HttpContext().set(SKIP_TOKEN_REFRESH, true);

  private readonly tokens = signal<AuthenticatedResult | null>(readStoredTokens());
  /** Request làm mới token đang chạy; dùng chung để nhiều request 401 cùng lúc chỉ làm mới một lần. */
  private refreshInFlight: Observable<AuthenticatedResult> | null = null;

  readonly currentUser = computed(() => {
    const tokens = this.tokens();
    return tokens ? decodeUser(tokens.token) : null;
  });
  readonly isLoggedIn = computed(() => this.currentUser() !== null);
  readonly isAdmin = computed(() => this.currentUser()?.roles.includes(ADMIN_ROLE) ?? false);

  readonly accessToken = () => this.tokens()?.token ?? null;

  readonly login = (request: LoginRequest) =>
    this.http
      .post<AuthenticatedResult>(`${this.apiUrl}/auth/login`, request, {
        context: this.skipRefresh,
      })
      .pipe(tap(this.saveTokens));

  readonly register = (request: RegisterRequest) =>
    this.http.post<void>(`${this.apiUrl}/auth/register`, request, { context: this.skipRefresh });

  /** Đổi access token (có thể đã hết hạn) + refresh token lấy cặp token mới. */
  readonly refresh = (): Observable<AuthenticatedResult> => {
    const tokens = this.tokens();
    if (!tokens) {
      throw new Error('Chưa đăng nhập nên không thể làm mới token.');
    }
    this.refreshInFlight ??= this.http
      .post<AuthenticatedResult>(
        `${this.apiUrl}/token/refresh`,
        { accessToken: tokens.token, refreshToken: tokens.refreshToken },
        { context: this.skipRefresh },
      )
      .pipe(
        tap(this.saveTokens),
        finalize(() => (this.refreshInFlight = null)),
        shareReplay(1),
      );
    return this.refreshInFlight;
  };

  /** Huỷ refresh token trên server (bỏ qua lỗi), xoá token ở trình duyệt rồi về trang đăng nhập. */
  readonly logout = async () => {
    if (this.tokens()) {
      try {
        await firstValueFrom(
          this.http.post<void>(`${this.apiUrl}/token/revoke`, null, { context: this.skipRefresh }),
        );
      } catch {
        // Access token hết hạn hoặc mất mạng: vẫn đăng xuất ở trình duyệt.
      }
    }
    this.clearSession();
    await this.router.navigate(['/login']);
  };

  readonly clearSession = () => {
    this.tokens.set(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // localStorage bị chặn (chế độ riêng tư...): chỉ cần xoá trong bộ nhớ.
    }
  };

  private readonly saveTokens = (tokens: AuthenticatedResult) => {
    this.tokens.set(tokens);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
    } catch {
      // Không lưu được thì phiên chỉ còn đến khi tải lại trang.
    }
  };
}

const readStoredTokens = (): AuthenticatedResult | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const tokens = raw ? (JSON.parse(raw) as AuthenticatedResult) : null;
    return tokens && decodeUser(tokens.token) ? tokens : null;
  } catch {
    return null;
  }
};

/** Đọc phần payload của JWT (base64url, UTF-8 để giữ đúng tên tiếng Việt). Token hỏng trả về null. */
const decodeUser = (token: string): CurrentUser | null => {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    const payload = JSON.parse(new TextDecoder().decode(bytes)) as Record<string, unknown>;
    const roles = payload[ROLE_CLAIM] ?? [];

    return {
      id: String(payload['id']),
      email: String(payload['email']),
      fullName: String(payload['fullName']),
      avatarUrl: typeof payload['avatar'] === 'string' ? payload['avatar'] : null,
      roles: Array.isArray(roles) ? roles.map(String) : [String(roles)],
    };
  } catch {
    return null;
  }
};
