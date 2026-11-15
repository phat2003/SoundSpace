import { Component, computed, inject, input, linkedSignal, output } from '@angular/core';
import { NgOptimizedImage, NgTemplateOutlet } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter, map } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';

interface NavItem {
  path: string;
  label: string;
  icon: string;
  exact?: boolean;
}

interface AdminNavItem {
  path: string;
  label: string;
  exact?: boolean;
}

@Component({
  selector: 'app-sidebar',
  imports: [NgOptimizedImage, NgTemplateOutlet, RouterLink, RouterLinkActive],
  host: {
    class:
      'fixed left-0 top-0 bottom-24 z-50 flex w-64 flex-col bg-surface-container-low pt-6 pb-8 transition-transform duration-300 lg:translate-x-0',
    '[class.-translate-x-full]': '!open()',
    '[class.translate-x-0]': 'open()',
  },
  template: `
    <a routerLink="/" class="mb-8 flex items-center gap-3 px-8" (click)="navigate.emit()">
      <img ngSrc="logo-mark.png" width="32" height="32" alt="" class="rounded-lg" priority />
      <span class="font-headline-md tracking-tight text-primary">SoundSpace</span>
    </a>

    <nav aria-label="Điều hướng chính" class="flex-1 space-y-1 overflow-y-auto px-4">
      @for (item of mainItems; track item.path) {
        <ng-container
          [ngTemplateOutlet]="navLink"
          [ngTemplateOutletContext]="{ $implicit: item }"
        />
      }

      <!-- Nhóm Quản trị (chỉ Admin thấy), menu con theo mẫu Stitch "Tổng quan quản trị" -->
      @if (auth.isAdmin()) {
        <div>
          <button
            type="button"
            [attr.aria-expanded]="adminExpanded()"
            aria-controls="admin-subnav"
            class="flex w-full items-center justify-between rounded-xl px-4 py-3 transition-all hover:bg-surface-container-high hover:text-on-surface focus-visible:outline-2 focus-visible:outline-secondary"
            [class]="inAdmin() ? 'text-on-surface' : 'text-on-surface-variant'"
            (click)="adminExpanded.set(!adminExpanded())"
          >
            <span class="flex items-center">
              <span
                class="material-symbols-outlined mr-3"
                [class.text-primary]="inAdmin()"
                aria-hidden="true"
                >admin_panel_settings</span
              >
              Quản trị
            </span>
            <span
              class="material-symbols-outlined text-sm! transition-transform"
              [class.rotate-180]="adminExpanded()"
              aria-hidden="true"
              >expand_more</span
            >
          </button>
          <div id="admin-subnav" class="space-y-1 py-1 pr-2 pl-8" [hidden]="!adminExpanded()">
            @for (item of adminItems; track item.path) {
              <a
                [routerLink]="item.path"
                routerLinkActive="bg-primary-container font-semibold text-on-primary-container hover:bg-primary-container hover:text-on-primary-container"
                [routerLinkActiveOptions]="{ exact: item.exact ?? false }"
                ariaCurrentWhenActive="page"
                class="block rounded-lg px-3 py-2 text-body-sm text-on-surface-variant transition-all hover:bg-surface-container-high hover:text-on-surface focus-visible:outline-2 focus-visible:outline-secondary"
                (click)="navigate.emit()"
              >
                {{ item.label }}
              </a>
            }
          </div>
        </div>
      }

      @for (item of accountItems; track item.path) {
        <ng-container
          [ngTemplateOutlet]="navLink"
          [ngTemplateOutletContext]="{ $implicit: item }"
        />
      }
    </nav>

    <ng-template #navLink let-item>
      <a
        [routerLink]="item.path"
        routerLinkActive="bg-primary-container font-semibold text-on-primary-container hover:bg-primary-container hover:text-on-primary-container"
        [routerLinkActiveOptions]="{ exact: item.exact ?? false }"
        ariaCurrentWhenActive="page"
        class="flex items-center rounded-xl px-4 py-3 text-on-surface-variant transition-all hover:bg-surface-container-high hover:text-on-surface focus-visible:outline-2 focus-visible:outline-secondary"
        (click)="navigate.emit()"
      >
        <span class="material-symbols-outlined mr-3" aria-hidden="true">{{ item.icon }}</span>
        {{ item.label }}
      </a>
    </ng-template>
  `,
})
export class Sidebar {
  readonly open = input(false);
  readonly navigate = output<void>();

  private readonly router = inject(Router);
  protected readonly auth = inject(AuthService);

  // Mục Quản trị nằm giữa hai nhóm này.
  protected readonly mainItems: NavItem[] = [
    { path: '/', label: 'Khám phá', icon: 'explore', exact: true },
    { path: '/genres', label: 'Khám phá thể loại', icon: 'category' },
    { path: '/now-playing', label: 'Trình phát nhạc', icon: 'play_circle' },
    { path: '/library', label: 'Thư viện', icon: 'library_music' },
    { path: '/favorites', label: 'Yêu thích', icon: 'favorite' },
  ];
  protected readonly accountItems: NavItem[] = [
    { path: '/profile', label: 'Hồ sơ', icon: 'account_circle' },
    { path: '/settings', label: 'Cài đặt', icon: 'settings' },
  ];

  // Menu con chỉ gồm các mục trong MVP (bỏ "Kiểm duyệt nghệ sĩ", "Doanh thu & Bản quyền" của mẫu).
  protected readonly adminItems: AdminNavItem[] = [
    { path: '/admin', label: 'Tổng quan', exact: true },
    { path: '/admin/genres', label: 'Thể loại' },
    { path: '/admin/artists', label: 'Nghệ sĩ' },
    { path: '/admin/albums', label: 'Album' },
    { path: '/admin/songs', label: 'Bài hát' },
    { path: '/admin/users', label: 'Người dùng' },
  ];

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );
  protected readonly inAdmin = computed(() => this.currentUrl().startsWith('/admin'));
  // Tự mở menu con khi vào trang quản trị (và đóng khi rời đi); người dùng vẫn bấm để đóng / mở được.
  protected readonly adminExpanded = linkedSignal(() => this.inAdmin());
}
