import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from '../header/header';
import { PlayerBar } from '../player-bar/player-bar';
import { Sidebar } from '../sidebar/sidebar';

/** Main layout: sidebar + header + page content + player bar fixed at the bottom. */
@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, Header, PlayerBar, Sidebar],
  template: `
    <app-sidebar [open]="sidebarOpen()" (navigate)="sidebarOpen.set(false)" />

    @if (sidebarOpen()) {
      <div
        class="fixed inset-0 z-40 bg-black/60 lg:hidden"
        aria-hidden="true"
        (click)="sidebarOpen.set(false)"
      ></div>
    }

    <div class="lg:pl-64">
      <app-header (menuToggle)="sidebarOpen.set(true)" />
      <main class="relative min-h-screen pt-16 pb-24">
        <router-outlet />
      </main>
    </div>

    <app-player-bar />
  `,
})
export class Shell {
  protected readonly sidebarOpen = signal(false);
}
