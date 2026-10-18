import { Component, input } from '@angular/core';
import { Track } from '../../core/models/track';

/** Một dòng bài hát: dòng phụ (`meta`) do trang cha quyết định, ví dụ thời lượng hoặc lúc nghe. */
export interface SongRow {
  track: Track;
  meta: string;
}

/** Danh sách bài hát dạng dòng (ảnh bìa, tên • nghệ sĩ, dòng phụ) theo mẫu Stitch "Hồ sơ". */
@Component({
  selector: 'app-song-list',
  template: `
    @if (rows().length) {
      <ul class="space-y-2">
        @for (row of rows(); track row.track.id + $index) {
          <li class="flex items-center gap-4 rounded-xl p-2">
            <div
              class="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-linear-to-br from-inverse-primary to-secondary-container"
            >
              @if (row.track.coverUrl) {
                <img [src]="row.track.coverUrl" alt="" class="h-full w-full object-cover" />
              } @else {
                <span class="material-symbols-outlined text-on-primary-fixed" aria-hidden="true"
                  >music_note</span
                >
              }
            </div>
            <div class="min-w-0">
              <p class="truncate">
                <span class="font-headline-sm text-on-surface">{{ row.track.title }}</span>
                <span class="text-body-sm text-outline"> • {{ row.track.artist }}</span>
              </p>
              <p class="truncate text-body-sm text-outline">{{ row.meta }}</p>
            </div>
          </li>
        }
      </ul>
    } @else {
      <p class="px-2 py-6 text-center text-body-md text-outline">{{ emptyText() }}</p>
    }
  `,
})
export class SongList {
  readonly rows = input.required<SongRow[]>();
  readonly emptyText = input('Chưa có bài hát nào.');
}
