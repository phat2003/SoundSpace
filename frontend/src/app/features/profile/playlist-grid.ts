import { Component, input } from '@angular/core';
import { PlaylistSummary } from './profile-mock';

/** 11520 -> "3 giờ 12 phút", 2700 -> "45 phút" */
const formatTotalDuration = (totalSec: number) => {
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  return hours ? `${hours} giờ ${String(minutes).padStart(2, '0')} phút` : `${minutes} phút`;
};

/** Lưới thẻ playlist (ảnh bìa, tên, số bài, tổng thời lượng) theo mẫu Stitch "Hồ sơ". */
@Component({
  selector: 'app-playlist-grid',
  template: `
    @if (playlists().length) {
      <ul class="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
        @for (playlist of playlists(); track playlist.id) {
          <li class="rounded-2xl bg-surface-container-low p-3 sm:p-4">
            <div
              class="mb-4 flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl bg-linear-to-br from-inverse-primary to-secondary-container shadow-lg"
            >
              @if (playlist.coverUrl) {
                <img [src]="playlist.coverUrl" alt="" class="h-full w-full object-cover" />
              } @else {
                <span
                  class="material-symbols-outlined text-5xl! text-on-primary-fixed"
                  aria-hidden="true"
                  >queue_music</span
                >
              }
            </div>
            <h3 class="truncate font-headline-sm text-on-surface">{{ playlist.name }}</h3>
            <p class="mt-1 text-body-sm text-outline">
              {{ playlist.songCount }} bài hát • {{ formatTotalDuration(playlist.totalSec) }}
            </p>
          </li>
        }
      </ul>
    } @else {
      <p
        class="rounded-2xl bg-surface-container-low px-6 py-10 text-center text-body-md text-outline"
      >
        Bạn chưa tạo playlist nào.
      </p>
    }
  `,
})
export class PlaylistGrid {
  readonly playlists = input.required<PlaylistSummary[]>();

  protected readonly formatTotalDuration = formatTotalDuration;
}
