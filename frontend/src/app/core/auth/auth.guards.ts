import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

// Guard chỉ để điều hướng cho tiện; quyền thật vẫn do API kiểm tra ([Authorize]).

/** Trang cần đăng nhập: chưa đăng nhập thì chuyển tới /login, đăng nhập xong quay lại trang cũ. */
export const authGuard: CanActivateFn = (_route, state) =>
  inject(AuthService).isLoggedIn() ||
  inject(Router).createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });

/** Trang quản trị: cần đăng nhập và có role Admin. */
export const adminGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.isLoggedIn()) {
    return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
  }
  return auth.isAdmin() || router.createUrlTree(['/']);
};

/** Trang Đăng nhập / Đăng ký: đã đăng nhập rồi thì về trang chủ. */
export const guestGuard: CanActivateFn = () =>
  !inject(AuthService).isLoggedIn() || inject(Router).createUrlTree(['/']);
