import { Component, input } from '@angular/core';
import { FollowedArtist } from './profile-mock';

const compactNumber = new Intl.NumberFormat('vi-VN', { notation: 'compact' });

/** Danh sách nghệ sĩ đang theo dõi (ảnh tròn, tên, số người theo dõi) theo mẫu Stitch "Hồ sơ". */
@Component({
  selector: 'app-artist-list',
  template: `
    @if (artists().length) {
      <ul class="space-y-2">
        @for (artist of artists(); track artist.id) {
          <li class="flex items-center gap-3 rounded-xl p-2">
            <div
              class="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-container-high"
            >
              @if (artist.avatarUrl) {
                <img [src]="artist.avatarUrl" alt="" class="h-full w-full object-cover" />
              } @else {
                <span class="material-symbols-outlined text-outline" aria-hidden="true"
                  >person</span
                >
              }
            </div>
            <div class="min-w-0">
              <p class="truncate font-headline-sm text-on-surface">{{ artist.name }}</p>
              <p class="text-body-sm text-outline">
                {{ formatFollowers(artist.followerCount) }} người theo dõi
              </p>
            </div>
          </li>
        }
      </ul>
    } @else {
      <p class="px-2 py-6 text-center text-body-md text-outline">Bạn chưa theo dõi nghệ sĩ nào.</p>
    }
  `,
})
export class ArtistList {
  readonly artists = input.required<FollowedArtist[]>();

  /** 1400000 -> "1,4 Tr" */
  protected readonly formatFollowers = (count: number) => compactNumber.format(count);
}
