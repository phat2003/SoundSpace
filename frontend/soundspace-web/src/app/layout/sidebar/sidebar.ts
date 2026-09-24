import { Component, input, output } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface NavItem {
  path: string;
  label: string;
  icon: string;
  exact?: boolean;
}

@Component({
  selector: 'app-sidebar',
  imports: [NgOptimizedImage, RouterLink, RouterLinkActive],
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
      @for (item of navItems; track item.path) {
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
      }
    </nav>
  `,
})
export class Sidebar {
  readonly open = input(false);
  readonly navigate = output<void>();

  protected readonly navItems: NavItem[] = [
    { path: '/', label: 'Khám phá', icon: 'explore', exact: true },
    { path: '/genres', label: 'Khám phá thể loại', icon: 'category' },
    { path: '/now-playing', label: 'Trình phát nhạc', icon: 'play_circle' },
    { path: '/library', label: 'Thư viện', icon: 'library_music' },
    { path: '/favorites', label: 'Yêu thích', icon: 'favorite' },
    // Will be shown only to admins once login + roles exist.
    { path: '/admin', label: 'Quản trị', icon: 'admin_panel_settings' },
    { path: '/settings', label: 'Cài đặt', icon: 'settings' },
  ];
}
