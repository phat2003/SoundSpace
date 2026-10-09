import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

/**
 * Khung chung của trang Đăng nhập / Đăng ký theo mẫu Stitch:
 * bên trái là phần giới thiệu (ẩn trên màn hình nhỏ), bên phải là 2 tab và form (ng-content).
 * Mỗi tab là một route riêng (/login, /register) nên có thể gửi link thẳng tới trang Đăng ký.
 */
@Component({
  selector: 'app-auth-card',
  imports: [RouterLink, RouterLinkActive],
  host: {
    class:
      'flex min-h-[calc(100vh-10rem)] w-full items-center justify-center p-space-md sm:p-space-lg',
  },
  template: `
    <div
      class="relative grid w-full max-w-5xl overflow-hidden rounded-3xl bg-surface-container-low/80 shadow-[0_0_50px_rgba(208,188,255,0.08)] backdrop-blur-2xl lg:grid-cols-2"
    >
      <!-- Phần giới thiệu -->
      <div
        class="relative hidden flex-col justify-between overflow-hidden bg-surface-container-lowest p-12 lg:flex"
      >
        <!-- Ánh sáng tím / cyan thay cho ảnh nền của mẫu -->
        <div
          class="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-primary/20 blur-3xl"
        ></div>
        <div
          class="pointer-events-none absolute -right-24 -bottom-24 h-96 w-96 rounded-full bg-secondary/15 blur-3xl"
        ></div>

        <div class="relative">
          <div class="mb-6 flex items-center gap-3">
            <div
              class="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/20 text-primary shadow-[0_0_15px_rgba(208,188,255,0.3)]"
            >
              <span class="material-symbols-outlined" aria-hidden="true">headphones</span>
            </div>
            <span class="font-headline-md tracking-wider text-on-surface">SOUNDSPACE</span>
          </div>
          <p class="mb-4 font-display-lg-mobile text-on-surface">
            Trải nghiệm âm nhạc không giới hạn.
          </p>
          <p class="max-w-sm text-body-lg text-on-surface-variant">
            Hòa mình vào không gian âm thanh sống động, kết nối nghệ sĩ và người yêu nhạc theo cách
            hoàn toàn mới.
          </p>
        </div>

        <!-- Sóng âm trang trí -->
        <div class="relative flex h-24 items-end gap-1.5" aria-hidden="true">
          @for (height of waveHeights; track $index) {
            <span
              class="w-2 rounded-full bg-linear-to-t from-primary/60 to-secondary/60"
              [style.height.%]="height"
            ></span>
          }
        </div>
      </div>

      <!-- Phần form -->
      <div class="relative flex flex-col justify-center p-8 lg:p-12">
        <div
          class="pointer-events-none absolute top-0 right-0 h-64 w-64 rounded-full bg-primary/10 blur-3xl"
        ></div>
        <div
          class="pointer-events-none absolute bottom-0 left-0 h-64 w-64 rounded-full bg-secondary/10 blur-3xl"
        ></div>

        <nav
          aria-label="Chọn đăng nhập hoặc đăng ký"
          class="relative mb-8 flex rounded-2xl bg-surface-container p-1"
        >
          @for (tab of tabs; track tab.path) {
            <a
              [routerLink]="tab.path"
              routerLinkActive="bg-primary text-on-primary! shadow-[0_0_20px_rgba(208,188,255,0.3)]"
              ariaCurrentWhenActive="page"
              class="flex-1 rounded-xl py-3 text-center font-headline-sm text-on-surface-variant transition-all hover:text-on-surface focus-visible:outline-2 focus-visible:outline-secondary"
              >{{ tab.label }}</a
            >
          }
        </nav>

        <div class="relative space-y-6">
          <ng-content />
        </div>
      </div>
    </div>
  `,
})
export class AuthCard {
  protected readonly tabs = [
    { path: '/login', label: 'Đăng nhập' },
    { path: '/register', label: 'Đăng ký' },
  ];

  protected readonly waveHeights = [
    30, 55, 80, 45, 95, 65, 40, 75, 100, 60, 35, 70, 90, 50, 25, 60, 85, 45, 30, 55,
  ];
}
