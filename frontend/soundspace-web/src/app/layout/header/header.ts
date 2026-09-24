import { Component, inject, output } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  host: {
    class:
      'fixed top-0 right-0 left-0 z-40 flex h-16 items-center gap-space-md bg-surface/80 px-space-md backdrop-blur-xl sm:px-space-lg lg:left-64',
  },
  template: `
    <button
      type="button"
      class="rounded-full p-2 text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface lg:hidden"
      aria-label="Mở menu"
      (click)="menuToggle.emit()"
    >
      <span class="material-symbols-outlined" aria-hidden="true">menu</span>
    </button>

    <form role="search" class="relative w-full max-w-96" (submit)="search($event, query.value)">
      <label for="global-search" class="sr-only">Tìm kiếm</label>
      <span
        class="material-symbols-outlined pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-outline"
        aria-hidden="true"
        >search</span
      >
      <input
        #query
        id="global-search"
        type="search"
        placeholder="Tìm bài hát, nghệ sĩ, album..."
        class="w-full rounded-xl bg-surface-container-low py-2 pr-4 pl-10 text-on-surface placeholder:text-outline focus:ring-2 focus:ring-secondary focus:outline-none"
      />
    </form>

    <a
      routerLink="/login"
      class="ml-auto flex shrink-0 items-center gap-2 rounded-full bg-primary px-4 py-2 font-label-md text-on-primary transition-transform hover:scale-105"
    >
      <span class="material-symbols-outlined text-[20px]" aria-hidden="true">login</span>
      <span class="hidden sm:inline">Đăng nhập</span>
    </a>
  `,
})
export class Header {
  readonly menuToggle = output<void>();

  private readonly router = inject(Router);

  protected search(event: Event, query: string): void {
    event.preventDefault();
    const q = query.trim();
    this.router.navigate(['/search'], { queryParams: q ? { q } : {} });
  }
}
