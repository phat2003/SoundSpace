import { afterNextRender, Component, ElementRef, input, output, viewChild } from '@angular/core';

/**
 * Hộp thoại xác nhận (ví dụ trước khi xoá), dùng thẻ <dialog> gốc của trình duyệt nên tự giữ focus bên trong
 * và đóng được bằng phím Esc. Trang cha hiện bằng @if và gỡ đi khi nhận confirmed / cancelled.
 */
@Component({
  selector: 'app-confirm-dialog',
  template: `
    <dialog
      #dialog
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-message"
      class="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl bg-surface-container p-6 text-on-surface shadow-2xl backdrop:bg-black/60 backdrop:backdrop-blur-sm"
      (cancel)="onEscape($event)"
    >
      <div class="flex items-start gap-4">
        <span
          class="material-symbols-outlined flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-error/10 text-error"
          aria-hidden="true"
          >warning</span
        >
        <div class="min-w-0">
          <h2 id="confirm-dialog-title" class="font-headline-md">{{ title() }}</h2>
          <p id="confirm-dialog-message" class="mt-2 text-body-md text-on-surface-variant">
            {{ message() }}
          </p>
        </div>
      </div>

      @if (errorMessage()) {
        <p
          role="alert"
          class="mt-4 rounded-xl border border-error/30 bg-error-container/30 px-4 py-3 text-body-md text-on-error-container"
        >
          {{ errorMessage() }}
        </p>
      }

      <div class="mt-6 flex justify-end gap-3">
        <button
          type="button"
          [disabled]="busy()"
          class="rounded-xl bg-surface-container-high px-4 py-2.5 font-label-md text-on-surface transition-colors hover:bg-surface-bright focus-visible:outline-2 focus-visible:outline-secondary disabled:opacity-50"
          (click)="cancelled.emit()"
        >
          Huỷ
        </button>
        <button
          type="button"
          [disabled]="busy()"
          class="rounded-xl bg-error px-4 py-2.5 font-label-md text-on-error transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary disabled:opacity-50"
          (click)="confirmed.emit()"
        >
          {{ busy() ? 'Đang xử lý...' : confirmLabel() }}
        </button>
      </div>
    </dialog>
  `,
})
export class ConfirmDialog {
  readonly title = input.required<string>();
  readonly message = input.required<string>();
  readonly confirmLabel = input('Xác nhận');
  /** Đang gọi API: khoá các nút và không cho đóng bằng Esc. */
  readonly busy = input(false);
  readonly errorMessage = input<string | null>(null);
  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  constructor() {
    afterNextRender(() => this.dialog().nativeElement.showModal());
  }

  // Esc: để trang cha tự gỡ hộp thoại thay vì trình duyệt tự đóng.
  protected readonly onEscape = (event: Event) => {
    event.preventDefault();
    if (!this.busy()) {
      this.cancelled.emit();
    }
  };
}
