import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService, SKIP_TOKEN_REFRESH } from './auth.service';

const withToken = (req: HttpRequest<unknown>, token: string) =>
  req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });

/**
 * Gắn access token vào mọi request gửi tới API của SoundSpace.
 * Gặp 401 thì làm mới token một lần rồi gửi lại request; làm mới thất bại thì đăng xuất và về trang đăng nhập.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(environment.apiUrl)) {
    return next(req);
  }

  const auth = inject(AuthService);
  const router = inject(Router);
  const token = auth.accessToken();

  return next(token ? withToken(req, token) : req).pipe(
    catchError((error: unknown) => {
      const canRefresh =
        error instanceof HttpErrorResponse &&
        error.status === 401 &&
        !req.context.get(SKIP_TOKEN_REFRESH) &&
        auth.isLoggedIn();
      if (!canRefresh) {
        return throwError(() => error);
      }

      return auth.refresh().pipe(
        switchMap((tokens) => next(withToken(req, tokens.token))),
        catchError((refreshError: unknown) => {
          // Chỉ đăng xuất khi server từ chối phiên (401); mất mạng thì giữ phiên để thử lại sau.
          if (refreshError instanceof HttpErrorResponse && refreshError.status === 401) {
            auth.clearSession();
            void router.navigate(['/login'], { queryParams: { returnUrl: router.url } });
          }
          return throwError(() => error);
        }),
      );
    }),
  );
};
