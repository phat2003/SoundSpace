import { Component, input } from '@angular/core';

/** Temporary content for pages that have not been built yet. */
@Component({
  selector: 'app-page-placeholder',
  host: {
    class:
      'mx-auto flex w-full max-w-7xl flex-col gap-space-md px-space-md py-space-xl sm:px-space-lg',
  },
  template: `
    <h1 class="font-headline-lg text-on-surface">{{ title() }}</h1>
    <div
      class="flex flex-col items-center gap-3 rounded-2xl border border-outline-variant/20 bg-surface-container-low/60 px-6 py-16 text-center backdrop-blur-xl"
    >
      <span class="material-symbols-outlined text-5xl! text-primary" aria-hidden="true">{{
        icon()
      }}</span>
      <p class="text-body-lg text-on-surface-variant">{{ description() }}</p>
    </div>
  `,
})
export class PagePlaceholder {
  readonly title = input.required<string>();
  readonly icon = input('construction');
  readonly description = input('Trang này đang được xây dựng.');
}
